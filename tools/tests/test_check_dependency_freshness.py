"""Properties of tools/check_dependency_freshness.py that a green report depends on.

No test here touches the network: registry and GitHub calls are replaced.
"""

from __future__ import annotations

import http.client
import unittest
from unittest import mock

import _paths  # noqa: F401  (puts tools/ on sys.path)
import check_dependency_freshness as freshness

SHA_STARTING_WITH_DIGIT = "3d3c42e5aac5ba805825da76410c181273ba90b1"


class WorkflowActionFloorTests(unittest.TestCase):
    def action(self, line: str) -> dict[str, str]:
        packages = freshness.parse_workflow_actions(line + "\n", "ci.yml")
        self.assertEqual(len(packages), 1)
        return packages[0]

    def test_a_pinned_sha_without_a_version_comment_has_no_floor(self) -> None:
        # The leading digits of a commit SHA are not a release number. Read as one, a pin to
        # `3d3c42e...` claims the floor `3` and is reported "REVIEW UPDATE" against any newer
        # major, while a SHA that starts with a letter is correctly "NO FLOOR".
        package = self.action(f"      - uses: actions/checkout@{SHA_STARTING_WITH_DIGIT}")
        self.assertEqual(package["minimum"], "")

    def test_a_pinned_sha_takes_its_floor_from_the_trailing_version_comment(self) -> None:
        package = self.action(
            f"      - uses: actions/checkout@{SHA_STARTING_WITH_DIGIT} # v7.0.1"
        )
        self.assertEqual(package["minimum"], "7.0.1")

    def test_a_floating_tag_takes_its_floor_from_the_ref(self) -> None:
        self.assertEqual(self.action("      - uses: actions/checkout@v6")["minimum"], "6")

    def test_a_branch_ref_has_no_floor(self) -> None:
        self.assertEqual(self.action("      - uses: owner/repo@main")["minimum"], "")

    def test_a_quoted_uses_value_is_read_like_an_unquoted_one(self) -> None:
        # YAML allows `uses: "owner/repo@v6"`. A pattern that only knows the bare form drops the
        # line without a trace, so that Action never appears in the report at all.
        for line in (
            '      - uses: "actions/checkout@v6"',
            "      - uses: 'actions/checkout@v6'",
            f'      - uses: "actions/checkout@{SHA_STARTING_WITH_DIGIT}" # v7.0.1',
        ):
            with self.subTest(line=line):
                package = self.action(line)
                self.assertEqual(package["name"], "actions/checkout")
                self.assertEqual(package["minimum"], "7.0.1" if "7.0.1" in line else "6")


class RepositoryWorkflowTests(unittest.TestCase):
    def test_every_action_pinned_in_this_repository_has_a_floor_the_check_can_compare(self) -> None:
        # A pin the check reads as "NO FLOOR" is invisible to the monthly freshness report: it can
        # fall any number of majors behind and the report stays green. Every `uses:` in
        # .github/workflows must say which release it is (`@SHA # vX.Y.Z`) or carry an explicit
        # `# freshness-hold:` reason.
        blind = [
            f"{row['name']} ({row['source']}): {row['requirement']}"
            for row in freshness.load_workflow_actions(freshness.REPO_ROOT)
            if not row["minimum"] and not row["hold"]
        ]
        self.assertEqual(blind, [], "Action pins the freshness check cannot compare")


class RegistryResponseTests(unittest.TestCase):
    def test_a_response_cut_off_mid_body_reads_as_unavailable_not_as_a_crash(self) -> None:
        # `response.read()` raises IncompleteRead, an HTTPException that is not an OSError. The
        # lookup must come back as None ("CHECK FAILED" in the report) like every other
        # transport failure, so the report is still written.
        response = mock.MagicMock()
        response.__enter__.return_value = response
        response.read.side_effect = http.client.IncompleteRead(b"{", 100)
        with mock.patch.object(freshness.urllib.request, "urlopen", return_value=response):
            self.assertIsNone(freshness._get_json("https://registry.example.invalid/pkg"))

    def test_a_connection_error_reads_as_unavailable(self) -> None:
        with mock.patch.object(
            freshness.urllib.request, "urlopen", side_effect=ConnectionResetError()
        ):
            self.assertIsNone(freshness._get_json("https://registry.example.invalid/pkg"))


if __name__ == "__main__":
    unittest.main()
