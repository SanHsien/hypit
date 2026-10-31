"""Properties of tools/check_dependency_freshness.py that a green report depends on.

No test here touches the network: registry and GitHub calls are replaced.
"""

from __future__ import annotations

import http.client
import json
import tempfile
import unittest
from pathlib import Path
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


class NpmWorkspaceManifestTests(unittest.TestCase):
    def test_parse_pnpm_workspace_packages(self) -> None:
        yaml_content = (
            "# Workspace configuration\n"
            "packages:\n"
            "  - 'packages/*'\n"
            '  - "services/*"\n'
            "  - examples/*/packages/* # inline comment\n"
            "\n"
            "overrides:\n"
            "  - ignored/*\n"
        )
        patterns = freshness.parse_pnpm_workspace_packages(yaml_content)
        self.assertEqual(patterns, ["packages/*", "services/*", "examples/*/packages/*"])

    def test_find_npm_manifests_with_workspace_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "pnpm-workspace.yaml").write_text("packages:\n  - packages/*\n", encoding="utf-8")
            (root / "package.json").write_text("{}", encoding="utf-8")
            pkg_a = root / "packages" / "pkg-a"
            pkg_a.mkdir(parents=True)
            (pkg_a / "package.json").write_text("{}", encoding="utf-8")

            manifests = freshness.find_npm_manifests(root)
            self.assertEqual(manifests, [root / "package.json", pkg_a / "package.json"])

    def test_find_npm_manifests_without_workspace_file_falls_back_to_packages(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "package.json").write_text("{}", encoding="utf-8")
            pkg_a = root / "packages" / "pkg-a"
            pkg_a.mkdir(parents=True)
            (pkg_a / "package.json").write_text("{}", encoding="utf-8")

            manifests = freshness.find_npm_manifests(root)
            self.assertEqual(manifests, [root / "package.json", pkg_a / "package.json"])

    def test_a_negated_pattern_excludes_its_manifests_instead_of_being_read_as_a_literal_glob(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "pnpm-workspace.yaml").write_text(
                "packages:\n  - packages/*\n  - '!packages/skipped'\n", encoding="utf-8"
            )
            (root / "package.json").write_text("{}", encoding="utf-8")
            for name in ("kept", "skipped"):
                (root / "packages" / name).mkdir(parents=True)
                (root / "packages" / name / "package.json").write_text("{}", encoding="utf-8")

            manifests = freshness.find_npm_manifests(root)
            self.assertEqual(manifests, [root / "package.json", root / "packages" / "kept" / "package.json"])

    def test_a_workspace_file_with_no_readable_patterns_raises_instead_of_scanning_only_the_root(self) -> None:
        unreadable = (
            "packages:\n",  # empty block
            "packages:\n  # only a comment\n",
            "packages: {}\n",  # not a list
            "overrides:\n  foo: 1\n",  # no packages key at all
            "packages:\n  - '!packages/skipped'\n",  # only exclusions: nothing is included
            "packages: [packages/*,\n  services/*]\n",  # flow list across lines
        )
        for text in unreadable:
            with self.subTest(text=text), tempfile.TemporaryDirectory() as tmp_dir:
                root = Path(tmp_dir)
                (root / "pnpm-workspace.yaml").write_text(text, encoding="utf-8")
                (root / "package.json").write_text("{}", encoding="utf-8")
                with self.assertRaises(freshness.DependencyCheckError):
                    freshness.find_npm_manifests(root)

    def test_packages_key_with_a_trailing_comment_or_a_flow_list_is_still_read(self) -> None:
        self.assertEqual(
            freshness.parse_pnpm_workspace_packages("packages:  # the workspace\n  - packages/*\n"),
            ["packages/*"],
        )
        self.assertEqual(
            freshness.parse_pnpm_workspace_packages("packages: [packages/*, 'services/*']\n"),
            ["packages/*", "services/*"],
        )

    def test_find_npm_manifests_missing_manifest_raises_error(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            with self.assertRaises(freshness.DependencyCheckError):
                freshness.find_npm_manifests(root)

    def test_load_npm_collects_declarations_across_workspaces(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "pnpm-workspace.yaml").write_text("packages:\n  - packages/*\n", encoding="utf-8")
            (root / "package.json").write_text(
                json.dumps({"devDependencies": {"typescript": "^5.9.0"}}),
                encoding="utf-8",
            )
            pkg_a = root / "packages" / "pkg-a"
            pkg_a.mkdir(parents=True)
            (pkg_a / "package.json").write_text(
                json.dumps({
                    "dependencies": {
                        "lodash": "4.17.21",
                        "internal-pkg": "workspace:*",
                        "local-file": "file:../sibling",
                    }
                }),
                encoding="utf-8",
            )

            packages = freshness.load_npm(root)
            names = {p["name"]: p for p in packages}
            self.assertIn("typescript", names)
            self.assertIn("lodash", names)
            self.assertNotIn("internal-pkg", names)
            self.assertNotIn("local-file", names)
            self.assertEqual(names["lodash"]["source"], "packages/pkg-a/package.json")

    def test_repository_load_npm_covers_packages_directory(self) -> None:
        packages = freshness.load_npm(freshness.REPO_ROOT)
        names = {p["name"] for p in packages}
        self.assertIn("@hyperframes/engine", names)
        self.assertIn("@aws-sdk/client-s3", names)
        self.assertIn("typescript", names)
        self.assertGreater(len(packages), 100)


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
