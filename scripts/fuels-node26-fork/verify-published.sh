#!/usr/bin/env bash
# After publishing: download the 17 @sentio packages back from the registry into
# published/ and run the same verification against the official tarballs, proving
# the registry copies are the verified ones.
set -euo pipefail

SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
ROOT="${WORK_DIR:-$SCRIPTS/work}"
mkdir -p "$ROOT"
cd "$ROOT"

rm -rf published && mkdir published
node "$SCRIPTS/list.mjs" | while IFS=$'\t' read -r _ _ tgz; do
  name="@sentio/$(echo "$tgz" | sed -E 's/^sentio-(.*)-[0-9][^-]*\.tgz$/\1/')"
  version="$(echo "$tgz" | sed -E 's/^.*-([0-9][^-]*)\.tgz$/\1/')"
  (cd published && npm pack "$name@$version" --ignore-scripts --silent >/dev/null)
done
node "$SCRIPTS/verify.mjs" published | tail -1
