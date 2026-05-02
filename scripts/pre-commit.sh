#!/usr/bin/env bash
# RoastMe pre-commit hook
# Aborts the commit if RoastMe finds high-severity issues in staged files.
# Install with:  ln -s ../../scripts/pre-commit.sh .git/hooks/pre-commit

set -e

ROASTME_BIN="${ROASTME_BIN:-npx roastme}"
THRESHOLD="${ROASTME_THRESHOLD:-high}"

STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|mjs|cjs)$' || true)

if [ -z "$STAGED" ]; then
  exit 0
fi

echo "🔥 RoastMe pre-commit: scanning $(echo "$STAGED" | wc -l | tr -d ' ') file(s)…"

FAILED=0
for f in $STAGED; do
  if ! $ROASTME_BIN serious "$f"; then
    echo "❌ RoastMe flagged $f"
    FAILED=1
  fi
done

if [ $FAILED -ne 0 ] && [ "$THRESHOLD" = "high" ]; then
  echo "Commit blocked. Set ROASTME_THRESHOLD=off to bypass."
  exit 1
fi

exit 0
