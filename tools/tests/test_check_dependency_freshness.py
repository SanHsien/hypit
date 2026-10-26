"""Properties of tools/check_dependency_freshness.py that a green report depends on.

No test here touches the network: registry and GitHub calls are replaced.
"""

from __future__ import annotations

import unittest

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


if __name__ == "__main__":
    unittest.main()
