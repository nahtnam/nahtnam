#!/usr/bin/env python3
"""Small, fail-closed client for the personal automation action center."""

import argparse
import json
import os
from pathlib import Path
import re
import stat
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, "Redirect refused", headers, fp)


class CredentialError(ValueError):
    pass


def validate_token(value):
    if not re.fullmatch(r"[A-Za-z0-9._~+/-]+=*", value):
        raise CredentialError("NAHTNAM_AI_TOKEN must be a nonempty bearer token.")
    return value


def load_token():
    name = "NAHTNAM_AI_TOKEN"
    if name in os.environ:
        return validate_token(os.environ[name])

    # Open every component without following symlinks; inspect the opened file
    # before reading it so a path replacement cannot bypass the permission check.
    directory_flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    try:
        directory = os.open(Path.home(), directory_flags)
        try:
            for component in (".config", "nahtnam"):
                child = os.open(component, directory_flags, dir_fd=directory)
                os.close(directory)
                directory = child
            descriptor = os.open(
                "automation.env", os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK,
                dir_fd=directory,
            )
        finally:
            os.close(directory)
        with os.fdopen(descriptor, "rb") as stream:
            metadata = os.fstat(stream.fileno())
            if (not stat.S_ISREG(metadata.st_mode)
                    or metadata.st_uid != os.getuid()
                    or stat.S_IMODE(metadata.st_mode) != 0o600):
                raise CredentialError("automation.env must be an owned regular file with mode 600.")
            contents = stream.read(65537)
        if len(contents) > 65536:
            raise CredentialError("automation.env exceeds the 64 KB limit.")
        contents = contents.decode("utf-8")
    except (OSError, UnicodeError):
        raise CredentialError("Cannot read the private ~/.config/nahtnam/automation.env file.") from None

    token = None
    for line in contents.splitlines():
        key, separator, value = line.partition("=")
        if key.strip() != name:
            continue
        if not separator or token is not None:
            raise CredentialError("automation.env must contain exactly one NAHTNAM_AI_TOKEN assignment.")
        value = value.strip()
        if len(value) >= 2 and value[0] in "\"'" and value[-1] == value[0]:
            value = value[1:-1]
        token = validate_token(value)
    if token is None:
        raise CredentialError("NAHTNAM_AI_TOKEN is not configured.")
    return token


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    read = sub.add_parser("get", help="Read current action state")
    read.add_argument("--source")
    read.add_argument("--reply-cursor", help="Continue this run's pending-reply traversal")
    write = sub.add_parser("post", help="Submit one operation from JSON file or stdin")
    write.add_argument("file", help="Path to JSON, or - for stdin")
    args = parser.parse_args()
    try:
        secret = load_token()
    except CredentialError as error:
        parser.exit(2, str(error) + "\n")
    endpoint = "https://www.nahtnam.com/api/ai"
    data = None
    if args.command == "get":
        parameters = {}
        if args.source:
            parameters["source"] = args.source
        if args.reply_cursor:
            parameters["replyCursor"] = args.reply_cursor
        if parameters:
            endpoint += "?" + urllib.parse.urlencode(parameters)
    else:
        try:
            if args.file == "-":
                payload = json.load(sys.stdin)
            else:
                with open(args.file, encoding="utf-8") as stream:
                    payload = json.load(stream)
            data = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        except (OSError, ValueError):
            parser.exit(2, "Input must be a readable JSON object.\n")
        if not isinstance(payload, dict) or len(data) > 128000:
            parser.exit(2, "Expected one JSON operation under 128 KB.\n")
    request = urllib.request.Request(endpoint, data=data, headers={
        "Authorization": "Bearer " + secret,
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    try:
        with urllib.request.build_opener(NoRedirects).open(request, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        parser.exit(1, "Action center returned HTTP %s. Do not change retry keys.\n" % error.code)
    except (urllib.error.URLError, TimeoutError, ValueError):
        parser.exit(1, "No confirmed response. Inspect state before retrying; keep the same key.\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
