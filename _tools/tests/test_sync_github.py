"""Integration tests for the opt-in Nexora auto-sync script.

All Git repositories and the push destination are local temporary fixtures.
The git wrapper intercepts every push, so this suite never contacts GitHub.
Run with: python3 -m unittest discover -s _tools/tests -v
"""

from __future__ import annotations

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "sync-github.sh"
ORIGIN = "https://github.com/sakshamfit/nexora.git"
REAL_GIT = shutil.which("git")


def fixture_branch() -> str:
    """Use the checkout's branch name only in disposable test repositories."""
    result = subprocess.run(
        [str(REAL_GIT), "symbolic-ref", "--quiet", "--short", "HEAD"],
        cwd=SCRIPT.parent.parent,
        text=True,
        capture_output=True,
    )
    return result.stdout.strip() if result.returncode == 0 else "nexora-sync-fixture"


BRANCH = fixture_branch()


class SyncTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="nexora-sync-test-")
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.repo = root / "checkout"
        self.remote = root / "remote.git"
        self.bin = root / "bin"
        self.home = root / "home"
        self.log = root / "calls.log"
        self.repo.mkdir()
        self.bin.mkdir()
        self.home.mkdir()
        self.env = os.environ.copy()
        self.env.update(
            {
                "HOME": str(self.home),
                "GIT_CONFIG_NOSYSTEM": "1",
                "GIT_TERMINAL_PROMPT": "0",
                "TEST_REMOTE": str(self.remote),
                "TEST_CALLS": str(self.log),
                "REAL_GIT": str(REAL_GIT),
            }
        )
        for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE"):
            self.env.pop(key, None)

        self.run_git("init", "-q", "-b", BRANCH, str(self.repo), cwd=root)
        self.run_git("init", "-q", "--bare", "-b", BRANCH, str(self.remote), cwd=root)
        self.run_git("config", "user.name", "Sync Test")
        self.run_git("config", "user.email", "sync-test@example.invalid")
        self.run_git("remote", "add", "origin", ORIGIN)
        (self.repo / "_tools").mkdir()
        shutil.copy(SCRIPT, self.repo / "_tools/sync-github.sh")
        self.app = self.repo / "kads-labs-app"
        self.app.mkdir()
        (self.app / ".gitignore").write_text("node_modules/\n.env*\n")
        (self.app / "package.json").write_text('{"name":"fixture","private":true}\n')
        (self.app / "package-lock.json").write_text('{}\n')
        (self.app / "site.txt").write_text("original\n")
        (self.app / "delete-me.txt").write_text("delete me\n")
        self.run_git("add", "-A")
        self.run_git("commit", "-qm", "Initial fixture")
        self.initial_head = self.head()

        # A wrapper is used rather than a Git URL rewrite: it still lets the
        # script verify the exact GitHub URL while redirecting all pushes to a
        # disposable bare repository. It will never execute a real remote push.
        git_wrapper = self.bin / "git"
        git_wrapper.write_text(
            """#!/usr/bin/env bash
for arg in "$@"; do
  if [ "$arg" = push ]; then
    printf 'push' >> "$TEST_CALLS"
    printf ' %s' "$@" >> "$TEST_CALLS"
    printf '\\n' >> "$TEST_CALLS"
    if [ "${TEST_FAIL_PUSH:-}" = 1 ]; then echo 'simulated push failure' >&2; exit 1; fi
    refspec="${@: -1}"
    exec "$REAL_GIT" -c push.followTags=false push --porcelain "$TEST_REMOTE" "$refspec"
  fi
done
exec "$REAL_GIT" "$@"
"""
        )
        git_wrapper.chmod(0o755)
        npm_wrapper = self.bin / "npm"
        npm_wrapper.write_text(
            """#!/usr/bin/env bash
printf 'npm %s | %s\\n' "$*" "$PWD" >> "$TEST_CALLS"
if [ -e .env.local ]; then echo 'ignored env file was copied into build' >&2; exit 1; fi
if [ "${1:-}" = ci ] && [ "${TEST_FAIL_INSTALL:-}" = 1 ]; then exit 1; fi
if [ "${1:-}" = run ] && [ "${2:-}" = build ]; then
  if [ -n "${TEST_MUTATE_FILE:-}" ]; then printf 'edited during build\\n' >> "$TEST_MUTATE_FILE"; fi
  if [ "${TEST_FAIL_BUILD:-}" = 1 ]; then exit 1; fi
fi
exit 0
"""
        )
        npm_wrapper.chmod(0o755)
        self.env["PATH"] = str(self.bin) + os.pathsep + self.env["PATH"]

    def run_git(self, *args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [str(REAL_GIT), *args],
            cwd=cwd or self.repo,
            env=self.env,
            check=True,
            text=True,
            capture_output=True,
        )

    def sync(self, *args: str, **extra_env: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["bash", str(self.repo / "_tools/sync-github.sh"), *args],
            cwd=self.repo,
            env={**self.env, **extra_env},
            text=True,
            capture_output=True,
            timeout=30,
        )

    def head(self) -> str:
        return self.run_git("rev-parse", "HEAD").stdout.strip()

    def remote_head(self) -> str:
        return self.run_git("--git-dir", str(self.remote), "rev-parse", BRANCH).stdout.strip()

    def calls(self) -> str:
        return self.log.read_text() if self.log.exists() else ""

    def assert_index_clean(self) -> None:
        self.assertEqual(self.run_git("diff", "--cached", "--name-only").stdout, "")

    def test_syncs_site_snapshot_only_and_pushes_current_branch(self) -> None:
        (self.app / "site.txt").write_text("updated\n")
        (self.app / "new image.txt").write_text("new asset\n")
        (self.app / "delete-me.txt").unlink()
        (self.app / ".env.local").write_text("SECRET=do-not-publish\n")
        (self.repo / "private-notes.txt").write_text("outside site\n")

        result = self.sync()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotEqual(self.head(), self.initial_head)
        self.assertEqual(self.remote_head(), self.head())
        self.assertIn("Nexora sync complete", result.stdout)
        self.assertEqual(self.run_git("show", "HEAD:kads-labs-app/site.txt").stdout, "updated\n")
        names = self.run_git("ls-tree", "-r", "--name-only", "HEAD").stdout.splitlines()
        self.assertIn("kads-labs-app/new image.txt", names)
        self.assertNotIn("kads-labs-app/delete-me.txt", names)
        self.assertNotIn("kads-labs-app/.env.local", names)
        self.assertNotIn("private-notes.txt", names)
        self.assert_index_clean()
        calls = self.calls()
        self.assertIn("npm ci --include=dev --no-audit --no-fund", calls)
        self.assertIn("npm run build", calls)
        self.assertIn(f":refs/heads/{BRANCH}", calls)
        self.assertNotIn("--force", calls)
        self.assertNotIn("--tags", calls)

    def test_known_credential_files_are_not_auto_staged_even_if_tracked(self) -> None:
        nested = self.app / "nested"
        nested.mkdir()
        paths = (self.app / ".env.tracked", self.app / "private.key", nested / ".env.production")
        for path in paths:
            path.write_text("already tracked\n")
            self.run_git("add", "-f", str(path.relative_to(self.repo)))
        self.run_git("commit", "-qm", "Fixture with previously tracked credentials")
        for path in paths:
            path.write_text("new secret that must not be auto-committed\n")
        (self.app / "site.txt").write_text("safe site change\n")
        result = self.sync()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        for path in paths:
            relative = path.relative_to(self.repo).as_posix()
            self.assertEqual(self.run_git("show", f"HEAD:{relative}").stdout, "already tracked\n")
            self.assertIn("new secret", path.read_text())
        self.assertEqual(self.remote_head(), self.head())
        self.assert_index_clean()

    def test_dry_run_never_builds_stages_or_pushes(self) -> None:
        (self.app / "site.txt").write_text("changed\n")
        result = self.sync("--dry-run")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("kads-labs-app/site.txt", result.stdout)
        self.assertIn(BRANCH, result.stdout)
        self.assertEqual(self.head(), self.initial_head)
        self.assertEqual(self.calls(), "")
        self.assert_index_clean()

    def test_no_changes_still_pushes_existing_commits_without_building(self) -> None:
        result = self.sync()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.remote_head(), self.initial_head)
        self.assertNotIn("npm ", self.calls())
        self.assertEqual(self.head(), self.initial_head)

    def test_loop_runs_immediately_and_waits_the_requested_interval(self) -> None:
        fake_sleep = self.bin / "sleep"
        fake_sleep.write_text('#!/bin/sh\nprintf "sleep %s\\n" "$1" >> "$TEST_CALLS"\nexit 1\n')
        fake_sleep.chmod(0o755)
        result = self.sync("--loop", "3")
        self.assertIn("running every 3 minute", result.stdout)
        self.assertIn("Nexora sync complete", result.stdout)
        self.assertIn("sleep 180", self.calls())
        self.assertEqual(self.remote_head(), self.initial_head)
        self.assertNotEqual(result.returncode, 0)  # the fake sleep stops the loop

    def test_install_or_build_failure_never_stages_commits_or_pushes(self) -> None:
        for failure in ("TEST_FAIL_INSTALL", "TEST_FAIL_BUILD"):
            with self.subTest(failure=failure):
                (self.app / "site.txt").write_text("unfinished edit\n")
                result = self.sync(**{failure: "1"})
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("validation failed", result.stderr)
                self.assertEqual(self.head(), self.initial_head)
                self.assert_index_clean()
                self.assertNotIn("push ", self.calls())
                self.assertFalse((self.repo / ".git/nexora-auto-sync.lock").exists())

    def test_existing_staged_changes_are_left_alone(self) -> None:
        (self.app / "site.txt").write_text("already staged\n")
        self.run_git("add", "kads-labs-app/site.txt")
        before = self.run_git("diff", "--cached").stdout
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("already staged", result.stderr)
        self.assertEqual(self.run_git("diff", "--cached").stdout, before)
        self.assertEqual(self.calls(), "")

    def test_wrong_origin_and_multiple_push_urls_are_rejected(self) -> None:
        self.run_git("remote", "set-url", "origin", "https://github.com/elsewhere/other.git")
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exactly one push URL", result.stderr)
        self.run_git("remote", "set-url", "origin", ORIGIN)
        self.run_git("remote", "set-url", "--add", "--push", "origin", ORIGIN)
        self.run_git("remote", "set-url", "--add", "--push", "origin", "https://github.com/elsewhere/other.git")
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exactly one push URL", result.stderr)
        self.assertEqual(self.calls(), "")

    def test_mirror_remote_is_rejected(self) -> None:
        self.run_git("config", "remote.origin.mirror", "true")
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("mirror", result.stderr)
        self.assertEqual(self.calls(), "")

    def test_edit_during_build_is_not_staged_or_pushed(self) -> None:
        target = self.app / "site.txt"
        target.write_text("first edit\n")
        result = self.sync(TEST_MUTATE_FILE=str(target))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("changed during the build", result.stderr)
        self.assertEqual(self.head(), self.initial_head)
        self.assert_index_clean()
        self.assertNotIn("push ", self.calls())
        retry = self.sync()
        self.assertEqual(retry.returncode, 0, retry.stdout + retry.stderr)
        self.assertEqual(self.remote_head(), self.head())
        self.assertEqual(self.run_git("show", "HEAD:kads-labs-app/site.txt").stdout, "first edit\nedited during build\n")

    def test_push_failure_is_reported_and_unpushed_commit_retries(self) -> None:
        (self.app / "site.txt").write_text("ready to publish\n")
        result = self.sync(TEST_FAIL_PUSH="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Push failed", result.stderr)
        self.assertNotIn("sync complete", result.stdout)
        committed = self.head()
        self.assertNotEqual(committed, self.initial_head)
        self.assert_index_clean()
        self.log.unlink()
        retry = self.sync()
        self.assertEqual(retry.returncode, 0, retry.stdout + retry.stderr)
        self.assertEqual(self.head(), committed)
        self.assertEqual(self.remote_head(), committed)
        self.assertNotIn("npm ", self.calls())

    def test_remote_ahead_is_not_force_pushed_or_overwritten(self) -> None:
        first = self.sync()
        self.assertEqual(first.returncode, 0, first.stdout + first.stderr)
        tree = self.run_git("rev-parse", "HEAD^{tree}").stdout.strip()
        self.run_git("--git-dir", str(self.remote), "config", "user.name", "Remote Test")
        self.run_git("--git-dir", str(self.remote), "config", "user.email", "remote-test@example.invalid")
        remote_commit = self.run_git(
            "--git-dir", str(self.remote), "commit-tree", tree, "-p", self.head(), "-m", "Remote-only commit"
        ).stdout.strip()
        self.run_git("--git-dir", str(self.remote), "update-ref", f"refs/heads/{BRANCH}", remote_commit)
        (self.app / "site.txt").write_text("local competing edit\n")
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Push failed", result.stderr)
        self.assertEqual(self.remote_head(), remote_commit)
        self.assertNotEqual(self.head(), remote_commit)
        self.assertNotIn("--force", self.calls())

    def test_hook_that_changes_commit_blocks_future_automatic_pushes(self) -> None:
        (self.app / "site.txt").write_text("validated content\n")
        hook = self.repo / ".git/hooks/pre-commit"
        hook.write_text("#!/bin/sh\nprintf 'unvalidated hook change\\n' > kads-labs-app/from-hook.txt\ngit add kads-labs-app/from-hook.txt\n")
        hook.chmod(0o755)
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("changed after validation", result.stderr)
        self.assertNotIn("push ", self.calls())
        self.assertTrue((self.repo / ".git/nexora-auto-sync.needs-review").exists())
        retry = self.sync()
        self.assertNotEqual(retry.returncode, 0)
        self.assertIn("needs review", retry.stderr)
        self.assertNotIn("push ", self.calls())

    def test_lock_and_invalid_arguments_do_not_mutate_the_repository(self) -> None:
        lock = self.repo / ".git/nexora-auto-sync.lock"
        lock.mkdir()
        result = self.sync()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Another sync may be running", result.stderr)
        self.assertTrue(lock.exists())  # must not remove a different process's lock
        lock.rmdir()
        for args in (("--loop", "0"), ("--loop", "-1"), ("--loop", "1.5"), ("--loop", "10081"), ("--unknown",)):
            with self.subTest(args=args):
                self.assertNotEqual(self.sync(*args).returncode, 0)
        self.assertEqual(self.head(), self.initial_head)
        self.assertEqual(self.calls(), "")


if __name__ == "__main__":
    unittest.main()
