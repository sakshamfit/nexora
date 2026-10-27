#!/usr/bin/env bash
# Sync the Nexora website to its own GitHub repository, like the original
# TESERACT auto-sync, without copying or pushing to the TESERACT repository.
#
#   bash _tools/sync-github.sh             # sync once
#   bash _tools/sync-github.sh --dry-run   # show what would be auto-staged
#   bash _tools/sync-github.sh --loop 20   # sync every 20 minutes; Ctrl+C stops
#
# Only kads-labs-app/ is auto-staged. All existing commits on the current
# branch are pushed, so syncing main updates production on the linked Vercel
# project; other branches get previews. See README.md before starting the loop.
set -u
set -o pipefail
# Always operate on the checkout containing this script, not an inherited Git
# worktree or alternate index supplied by another tool's environment.
unset GIT_DIR GIT_WORK_TREE GIT_COMMON_DIR GIT_INDEX_FILE GIT_PREFIX

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="kads-labs-app"
EXPECTED_REPO="sakshamfit/nexora"
# Do not auto-stage common credential files, even if someone previously
# force-added one to Git. This is not a substitute for reviewing all changes.
EXCLUDES=(
  ":(exclude,glob)$SITE/**/.env*"
  ":(exclude,glob)$SITE/**/*.pem"
  ":(exclude,glob)$SITE/**/*.key"
  ":(exclude,glob)$SITE/**/*.p12"
  ":(exclude,glob)$SITE/**/*.pfx"
)

usage() {
  cat <<'EOF'
Usage: bash _tools/sync-github.sh [--once | --dry-run | --loop [MINUTES]]

  --once              Sync once (the default).
  --dry-run           Show the target and changed site files, without a push.
  --loop [MINUTES]    Repeat until stopped; defaults to every 20 minutes.
  -h, --help          Show this help.

Only non-ignored changes under kads-labs-app/ are auto-staged; common env and
key files are excluded even if tracked. A clean staged index and a successful
build of the site snapshot are required before a new commit. The current branch,
including any existing unpushed commits, is pushed to origin; it is never
force-pushed or merged automatically.
EOF
}

error() {
  printf 'Nexora sync: %s\n' "$*" >&2
  return 1
}

# Check the expanded push URL, not just the fetch URL. Reject multiple push
# URLs and mirror remotes, which could otherwise send commits somewhere else.
check_origin() {
  local urls mirror
  urls="$(git remote get-url --push --all origin 2>/dev/null)" || {
    error "No origin push URL found. Set origin to github.com/$EXPECTED_REPO."
    return 1
  }
  urls="${urls%/}"
  urls="${urls%.git}"
  case "$urls" in
    "https://github.com/$EXPECTED_REPO"|"git@github.com:$EXPECTED_REPO"|"ssh://git@github.com/$EXPECTED_REPO") ;;
    *)
      error "Origin must have exactly one push URL for github.com/$EXPECTED_REPO. No changes were pushed."
      return 1
      ;;
  esac
  mirror="$(git config --bool --get remote.origin.mirror 2>/dev/null || true)"
  if [ "$mirror" = "true" ]; then
    error "Origin is configured as a mirror; refusing to push other refs."
    return 1
  fi
}

check_git_state() {
  local state path
  for state in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-apply rebase-merge sequencer; do
    path="$(git rev-parse --git-path "$state")" || return 1
    if [ -e "$path" ]; then
      error "A Git merge, rebase, cherry-pick or revert is in progress. Finish it before syncing."
      return 1
    fi
  done
  if ! git diff --cached --quiet --; then
    error "There are already staged changes. Commit or unstage them before running auto-sync."
    return 1
  fi
}

# Construct an independent index from HEAD and the current site files. This
# allows the exact commit candidate to be built without staging user changes.
snapshot_tree() {
  local index="$1" head="$2"
  GIT_INDEX_FILE="$index" git read-tree "$head" || return 1
  GIT_INDEX_FILE="$index" git add -A -- "$SITE" "${EXCLUDES[@]}" || return 1
  GIT_INDEX_FILE="$index" git write-tree
}

check_unchanged() {
  local expected_branch="$1" expected_head="$2" branch head
  branch="$(git symbolic-ref --quiet --short HEAD)" || {
    error "HEAD is detached; no commit or push was made."
    return 1
  }
  head="$(git rev-parse --verify HEAD)" || return 1
  if [ "$branch" != "$expected_branch" ] || [ "$head" != "$expected_head" ]; then
    error "The branch or HEAD changed during the build. No commit or push was made; retry."
    return 1
  fi
  check_origin && check_git_state
}

sync_once() (
  local mode="${1:-sync}" branch head push_head parent head_tree tree latest_tree staged_tree git_root
  local lock_dir="" tmp_dir="" review_marker

  cd "$ROOT" || exit 1
  git_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    error "This folder is not a Git checkout."
    exit 1
  }
  if [ "$(cd "$git_root" && pwd -P)" != "$(pwd -P)" ]; then
    error "The script must be located in _tools/ at the root of the Nexora checkout."
    exit 1
  fi
  review_marker="$(git rev-parse --git-path nexora-auto-sync.needs-review)" || exit 1
  if [ -e "$review_marker" ]; then
    error "A previous auto-sync commit needs review. See $review_marker; after reviewing it, remove that marker to resume."
    exit 1
  fi
  branch="$(git symbolic-ref --quiet --short HEAD)" || {
    error "HEAD is detached. Check out a branch before syncing."
    exit 1
  }
  head="$(git rev-parse --verify HEAD)" || {
    error "The repository needs an initial commit before syncing."
    exit 1
  }
  check_origin || exit 1
  check_git_state || exit 1

  printf 'Nexora sync: origin (%s), branch %s\n' "$EXPECTED_REPO" "$branch"
  if [ "$mode" = "dry-run" ]; then
    printf 'Site files that would be considered for auto-staging:\n'
    git status --short --untracked-files=normal -- "$SITE" "${EXCLUDES[@]}" || exit 1
    printf 'Dry run only: no build, commit or push. Existing unpushed commits would also be pushed.\n'
    exit 0
  fi

  lock_dir="$(git rev-parse --git-path nexora-auto-sync.lock)" || exit 1
  if ! mkdir "$lock_dir" 2>/dev/null; then
    error "Another sync may be running (lock: $lock_dir). If it stopped unexpectedly, verify that no sync is running before removing the lock directory."
    exit 1
  fi
  # Install cleanup only after acquiring the lock, so another process's lock
  # is never removed. The temp directory contains only the source snapshot.
  cleanup() {
    if [ -n "$tmp_dir" ]; then rm -rf -- "$tmp_dir"; fi
    rmdir "$lock_dir" 2>/dev/null || true
  }
  trap cleanup EXIT

  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/nexora-sync.XXXXXXXX")" || {
    error "Could not create a temporary build directory."
    exit 1
  }
  tree="$(snapshot_tree "$tmp_dir/index" "$head")" || {
    error "Could not snapshot the site. No commit or push was made."
    exit 1
  }
  head_tree="$(git rev-parse "${head}^{tree}")" || exit 1

  if [ "$tree" != "$head_tree" ]; then
    command -v npm >/dev/null 2>&1 || {
      error "npm is required to validate site changes. Install Node.js and npm, then retry."
      exit 1
    }
    mkdir -p "$tmp_dir/source" || exit 1
    if ! git archive "$tree" -- "$SITE" | tar -x -C "$tmp_dir/source"; then
      error "Could not export the site snapshot. No commit or push was made."
      exit 1
    fi
    printf 'Building a clean snapshot before committing site changes...\n'
    if ! (cd "$tmp_dir/source/$SITE" && npm ci --include=dev --no-audit --no-fund && npm run build); then
      error "Site validation failed. Nothing was staged, committed or pushed; the previous deployment is unchanged."
      exit 1
    fi

    check_unchanged "$branch" "$head" || exit 1
    latest_tree="$(snapshot_tree "$tmp_dir/latest-index" "$head")" || {
      error "Could not recheck site changes after the build. No commit or push was made."
      exit 1
    }
    if [ "$tree" != "$latest_tree" ]; then
      error "Site files changed during the build. Nothing was staged or pushed; retry after editing stops."
      exit 1
    fi
    check_unchanged "$branch" "$head" || exit 1
    if ! git add -A -- "$SITE" "${EXCLUDES[@]}"; then
      error "Could not stage the site completely. No commit or push was made; review the Git index."
      exit 1
    fi
    staged_tree="$(git write-tree)" || {
      error "Could not inspect the staged snapshot. No commit or push was made; review the Git index."
      exit 1
    }
    if [ "$staged_tree" != "$tree" ]; then
      error "Files or the Git index changed while staging. No commit or push was made; review the staged changes."
      exit 1
    fi
    if ! git commit -m "Auto-sync Nexora: $(date -u '+%Y-%m-%d %H:%M UTC')"; then
      error "Commit failed. Nothing was pushed; review the staged changes."
      exit 1
    fi
    push_head="$(git rev-parse --verify HEAD)" || exit 1
    parent="$(git rev-parse "${push_head}^")" || exit 1
    if [ "$parent" != "$head" ] || [ "$(git rev-parse "${push_head}^{tree}")" != "$tree" ]; then
      printf 'Commit %s changed after the validated snapshot. Review it before removing this marker.\n' "$push_head" > "$review_marker" || true
      error "The commit changed after validation. It was not pushed. Review it and remove $review_marker before retrying."
      exit 42
    fi
  else
    printf 'No site changes to commit. Checking for unpushed commits...\n'
    push_head="$head"
  fi

  check_unchanged "$branch" "$push_head" || exit 1
  # Push the checked commit, not a possibly changed HEAD. An explicit refspec
  # and no following tags avoid force-pushing, mirroring, or pushing other refs.
  if ! git -c push.followTags=false push --porcelain origin "$push_head:refs/heads/$branch"; then
    error "Push failed. Any new commit remains local; resolve the error (for example, a remote branch that is ahead) and retry."
    exit 1
  fi
  printf 'Nexora sync complete: origin/%s\n' "$branch"
)

case "${1:-}" in
  ""|--once)
    [ "$#" -le 1 ] || { usage >&2; exit 2; }
    sync_once
    ;;
  --dry-run)
    [ "$#" -eq 1 ] || { usage >&2; exit 2; }
    sync_once dry-run
    ;;
  --loop)
    [ "$#" -le 2 ] || { usage >&2; exit 2; }
    interval="${2:-20}"
    if ! [[ "$interval" =~ ^[1-9][0-9]{0,4}$ ]] || [ "$interval" -gt 10080 ]; then
      error "The loop interval must be a whole number from 1 to 10080 minutes."
      exit 2
    fi
    printf 'Auto-sync is running every %s minute(s). Press Ctrl+C to stop.\n' "$interval"
    while true; do
      if sync_once; then
        :
      else
        status="$?"
        if [ "$status" -eq 42 ]; then
          error "Stopping the loop because a commit needs review."
          exit 1
        fi
        printf 'Nexora sync: retrying in %s minute(s).\n' "$interval" >&2
      fi
      sleep "$((interval * 60))" || exit 1
    done
    ;;
  -h|--help)
    [ "$#" -eq 1 ] || { usage >&2; exit 2; }
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
