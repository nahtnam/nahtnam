"""Credential and transport boundary checks; never uses real runtime secrets."""

import contextlib
import importlib.util
import io
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import urllib.request


spec = importlib.util.spec_from_file_location(
    "ai_client", Path(__file__).with_name("ai-client.py")
)
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)


class ClientCredentialTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.home = Path(temporary.name)
        self.runtime = self.home / ".config" / "nahtnam" / "automation.env"
        self.runtime.parent.mkdir(parents=True)
        environment = patch.dict(os.environ, {}, clear=True)
        home = patch.object(client.Path, "home", return_value=self.home)
        environment.start()
        home.start()
        self.addCleanup(environment.stop)
        self.addCleanup(home.stop)

    def write_runtime(self, contents):
        self.runtime.write_text(contents, encoding="utf-8")
        self.runtime.chmod(0o600)

    def test_environment_precedes_file(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=from-file\n")
        self.runtime.chmod(0o644)
        with patch.dict(os.environ, {"NAHTNAM_AI_TOKEN": "from-environment"}):
            self.assertEqual(client.load_token(), "from-environment")

    def test_empty_or_injected_environment_fails_without_fallback(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=from-file\n")
        for value in ("", "token\nX-Header: injected", "token with spaces"):
            with self.subTest(value=value):
                with patch.dict(os.environ, {"NAHTNAM_AI_TOKEN": value}):
                    with self.assertRaises(client.CredentialError):
                        client.load_token()

    def test_reads_only_requested_key_without_expansion(self):
        self.write_runtime(
            "# Private runtime configuration\n\n"
            "YNAB_ACCESS_TOKEN=$(this-is-never-executed)\n"
            "NAHTNAM_AI_TOKEN = 'example-token='\n"
        )
        self.assertEqual(client.load_token(), "example-token=")
        self.assertNotIn("YNAB_ACCESS_TOKEN", os.environ)

    def test_missing_file_and_key_fail(self):
        with self.assertRaises(client.CredentialError):
            client.load_token()
        self.write_runtime("YNAB_ACCESS_TOKEN=unrelated\n")
        with self.assertRaisesRegex(client.CredentialError, "not configured"):
            client.load_token()

    def test_duplicate_or_malformed_assignments_fail(self):
        for contents in (
            "NAHTNAM_AI_TOKEN=first\nNAHTNAM_AI_TOKEN=second\n",
            "NAHTNAM_AI_TOKEN\n",
            "NAHTNAM_AI_TOKEN=\n",
            'NAHTNAM_AI_TOKEN="unterminated\n',
            "NAHTNAM_AI_TOKEN=$(never-execute)\n",
        ):
            with self.subTest(contents=contents):
                self.write_runtime(contents)
                with self.assertRaises(client.CredentialError):
                    client.load_token()

    def test_insecure_file_permissions_fail(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=example-token\n")
        for mode in (0o644, 0o660, 0o400):
            with self.subTest(mode=mode):
                self.runtime.chmod(mode)
                with self.assertRaisesRegex(client.CredentialError, "mode 600"):
                    client.load_token()

    def test_other_owner_fails(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=example-token\n")
        with patch.object(client.os, "getuid", return_value=os.getuid() + 1):
            with self.assertRaisesRegex(client.CredentialError, "owned regular file"):
                client.load_token()

    def test_symlink_file_fails(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=example-token\n")
        target = self.runtime.with_suffix(".private")
        self.runtime.rename(target)
        self.runtime.symlink_to(target)
        with self.assertRaises(client.CredentialError):
            client.load_token()

    def test_symlink_directory_fails(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=example-token\n")
        target = self.runtime.parent.with_name("private-runtime")
        self.runtime.parent.rename(target)
        self.runtime.parent.symlink_to(target, target_is_directory=True)
        with self.assertRaises(client.CredentialError):
            client.load_token()

    def test_fifo_fails_without_blocking(self):
        os.mkfifo(self.runtime, 0o600)
        with self.assertRaisesRegex(client.CredentialError, "regular file"):
            client.load_token()

    def test_oversized_file_fails(self):
        self.write_runtime("#" * 65537 + "\nNAHTNAM_AI_TOKEN=example-token\n")
        with self.assertRaisesRegex(client.CredentialError, "64 KB"):
            client.load_token()

    def test_credential_failure_never_opens_transport_or_echoes_value(self):
        self.write_runtime("NAHTNAM_AI_TOKEN=private-value-with spaces\n")
        errors = io.StringIO()
        with patch.object(client.sys, "argv", ["ai-client.py", "get"]):
            with patch.object(client.urllib.request, "build_opener") as opener:
                with contextlib.redirect_stderr(errors):
                    with self.assertRaises(SystemExit) as failure:
                        client.main()
        self.assertEqual(failure.exception.code, 2)
        opener.assert_not_called()
        self.assertNotIn("private-value", errors.getvalue())

    def test_redirects_remain_refused(self):
        request = urllib.request.Request("https://www.nahtnam.com/api/ai")
        with self.assertRaises(urllib.error.HTTPError):
            client.NoRedirects().redirect_request(
                request, None, 302, "Found", {}, "https://other.example/"
            )


if __name__ == "__main__":
    unittest.main()
