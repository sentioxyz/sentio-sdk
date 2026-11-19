#!/usr/bin/env bash
# Publish the 17 verified tarballs in dist/ to npm: the 16 @sentio/fuel-ts-* first,
# @sentio/fuels last (it depends on all the others). Safe to re-run: versions already
# on the registry are skipped. Requires `npm login` with publish rights on @sentio.
#
# Usage: ./publish.sh            (add --dry-run to only show what would be sent)
set -euo pipefail

SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
# Absolute, and exported so verify.mjs resolves the same directory after the cd below.
mkdir -p "${WORK_DIR:-$SCRIPTS/work}"
ROOT="$(cd "${WORK_DIR:-$SCRIPTS/work}" && pwd)"
export WORK_DIR="$ROOT"
cd "$ROOT"

npm whoami >/dev/null || { echo "not logged in: run npm login first" >&2; exit 1; }
node "$SCRIPTS/verify.mjs" >/dev/null || { echo "dist/ failed verification, not publishing" >&2; exit 1; }

# list.mjs prints fuels first; publish it last.
{ node "$SCRIPTS/list.mjs" | tail -n +2; node "$SCRIPTS/list.mjs" | head -1; } | while IFS=$'\t' read -r _ _ tgz; do
  name="@sentio/$(echo "$tgz" | sed -E 's/^sentio-(.*)-[0-9][^-]*\.tgz$/\1/')"
  version="$(echo "$tgz" | sed -E 's/^.*-([0-9][^-]*)\.tgz$/\1/')"
  if npm view "$name@$version" version >/dev/null 2>&1; then
    echo "skip $name@$version (already published)"
    continue
  fi
  echo "publish $name@$version"
  # Absolute path: a bare "dist/x.tgz" is parsed by npm as the GitHub shorthand user/repo.
  npm publish "$ROOT/dist/$tgz" --access public --ignore-scripts "$@" </dev/tty
done
