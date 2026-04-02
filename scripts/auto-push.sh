#!/usr/bin/env bash
set -euo pipefail

# Auto-commit and push changed files on a fixed interval.
# Usage:
#   AUTO_PUSH_INTERVAL=30 AUTO_PUSH_MESSAGE_PREFIX="chore(auto)" bash scripts/auto-push.sh

INTERVAL="${AUTO_PUSH_INTERVAL:-30}"
MESSAGE_PREFIX="${AUTO_PUSH_MESSAGE_PREFIX:-chore(auto)}"

if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]]; then
  echo "AUTO_PUSH_INTERVAL must be a positive integer (seconds)."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must run inside a git repository."
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$BRANCH" == "HEAD" ]]; then
  echo "Detached HEAD is not supported for auto-push."
  exit 1
fi

echo "Auto-push started on branch '$BRANCH' every ${INTERVAL}s. Press Ctrl+C to stop."

while true; do
  if [[ -n "$(git status --porcelain)" ]]; then
    git add -A

    # Commit only when staged content actually changed.
    if ! git diff --cached --quiet; then
      TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
      git commit -m "${MESSAGE_PREFIX}: ${TS}"
      git push origin "$BRANCH"
      echo "Pushed changes at ${TS}"
    fi
  fi

  sleep "$INTERVAL"
done
