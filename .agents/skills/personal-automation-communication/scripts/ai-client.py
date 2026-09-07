#!/usr/bin/env python3
"""Small, fail-closed client for the personal automation action center."""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, "Redirect refused", headers, fp)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    read = sub.add_parser("get", help="Read current action state")
    read.add_argument("--source")
    write = sub.add_parser("post", help="Submit one operation from JSON file or stdin")
    write.add_argument("file", help="Path to JSON, or - for stdin")
    args = parser.parse_args()
    secret = os.environ.get("NAHTNAM_AI_TOKEN")
    if not secret:
        parser.exit(2, "NAHTNAM_AI_TOKEN is not configured.\n")
    endpoint = "https://www.nahtnam.com/api/ai"
    data = None
    if args.command == "get":
        if args.source:
            endpoint += "?" + urllib.parse.urlencode({"source": args.source})
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
