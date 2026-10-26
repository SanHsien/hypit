"""Properties of tools/check_upstream_updates.py that the weekly upstream check relies on.

Nothing here reaches GitHub or the network: `gh` is replaced and git runs in throwaway local
repositories.
"""

from __future__ import annotations

import json
import subprocess
import unittest
from unittest import mock

import _paths  # noqa: F401  (puts tools/ on sys.path)
import check_upstream_updates as upstream

BASELINE = {
    "repo": "https://github.com/owner/name.git",
    "reviewed_pr_through": 100,
    "reviewed_issue_through": 100,
}


def fake_gh(newest_first: list[int]):
    """A `gh <kind> list --limit N` that, like the real one, returns only the newest N items."""

    def run(command: list[str], **_: object) -> subprocess.CompletedProcess[str]:
        limit = int(command[command.index("--limit") + 1])
        items = [{"number": number, "title": f"item {number}"} for number in newest_first[:limit]]
        return subprocess.CompletedProcess(command, 0, json.dumps(items), "")

    return run


class TicketCollectionTests(unittest.TestCase):
    def collect(self, newest_first: list[int]) -> list[dict] | None:
        with mock.patch.object(upstream.subprocess, "run", side_effect=fake_gh(newest_first)):
            return upstream.collect_new_tickets(BASELINE, "pr")

    def test_every_item_above_the_watermark_is_returned_when_there_are_few(self) -> None:
        tickets = self.collect(list(range(130, 90, -1)))
        assert tickets is not None
        self.assertEqual([item["number"] for item in tickets], list(range(101, 131)))

    def test_a_listing_cut_off_above_the_watermark_is_reported_as_not_checked(self) -> None:
        # `gh ... list` returns only the newest --limit items. When even the oldest item it
        # returned is above the watermark, the older unreviewed ones were dropped silently, and
        # the report would say "N new items" for a larger N. It has to be None ("not checked"),
        # never a partial list that reads as complete.
        newest_first = list(range(5000, 100, -1))
        tickets = self.collect(newest_first)
        self.assertTrue(
            tickets is None or {item["number"] for item in tickets} == set(range(101, 5001)),
            "a truncated listing was returned as if it were the full set of new items",
        )


class CommitCollectionTests(unittest.TestCase):
    SHA = "a" * 40

    def collect(self, log_output: str) -> list[dict]:
        def run_git(args: list[str], repo_dir: object) -> str:
            return log_output if args[0] == "log" else "docs/readme.md\n"

        with mock.patch.object(upstream, "run_git", side_effect=run_git):
            return upstream.collect_new_commits({"reviewed_through": "0" * 40}, None, "ref")

    def test_a_subject_with_a_unicode_line_separator_is_one_commit(self) -> None:
        # str.splitlines() breaks on U+2028, U+0085 and form feed as well as newline. A subject
        # containing one (pasted from a document, say) turned one `git log` record into two
        # fragments and the unpack of the second raised ValueError, ending the whole check.
        for separator in (" ", " ", "\x85", "\x0c", "\x0b"):
            with self.subTest(separator=repr(separator)):
                subject = f"fix: first{separator}second"
                commits = self.collect(f"{self.SHA}\x1f2026-10-26\x1f{subject}\n")
                self.assertEqual([commit["subject"] for commit in commits], [subject])

    def test_each_log_line_is_its_own_commit(self) -> None:
        other = "b" * 40
        commits = self.collect(
            f"{self.SHA}\x1f2026-10-25\x1ffirst\n{other}\x1f2026-10-26\x1fsecond\n"
        )
        self.assertEqual([commit["subject"] for commit in commits], ["first", "second"])
        self.assertEqual([commit["short"] for commit in commits], ["aaaaaaa", "bbbbbbb"])


if __name__ == "__main__":
    unittest.main()
