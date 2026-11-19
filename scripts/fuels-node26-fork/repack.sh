#!/usr/bin/env bash
# Download the 17 official fuels 0.103.0 tarballs and repack them under @sentio names
# with Node 26 added to engines. Nothing is published. Nothing inside the extracted
# directories is ever executed: no npm install / npm pack is run in them, tar does the packing.
#
# Usage: ./repack.sh   (FORK_VERSION=x.y.z to publish under another version, WORK_DIR to change the output dir)
# Output (under work/): official/<slug>/{*.tgz,x/package}   pristine download + extraction
#         repacked/<slug>/package             modified copy
#         dist/*.tgz                          tarballs to publish
set -euo pipefail

SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
ROOT="${WORK_DIR:-$SCRIPTS/work}"
mkdir -p "$ROOT"
cd "$ROOT"

names() { node "$SCRIPTS/list.mjs"; }

rm -rf official repacked dist
mkdir -p dist

while IFS=$'\t' read -r upstream slug fork_tgz; do
  mkdir -p "official/$slug/x" "repacked/$slug"
  # --ignore-scripts: belt and braces, registry specs do not run scripts anyway.
  # npm verifies the tarball against the registry integrity hash.
  (cd "official/$slug" && npm pack "$upstream@0.103.0" --ignore-scripts --silent >/dev/null)
  tgz="$(ls "official/$slug"/*.tgz)"

  # Refuse anything that would land outside package/.
  if tar -tzf "$tgz" | grep -Ev '^package/' | grep -q . || tar -tzf "$tgz" | grep -Eq '(^|/)\.\.(/|$)'; then
    echo "unsafe paths in $tgz" >&2; exit 1
  fi
  tar -xzf "$tgz" -C "official/$slug/x"

  cp -R "official/$slug/x/package" "repacked/$slug/package"
  node "$SCRIPTS/rewrite-package-json.mjs" "repacked/$slug/package/package.json"

  COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata --uid 0 --gid 0 --uname '' --gname '' \
    -czf "dist/$fork_tgz" -C "repacked/$slug" package
done < <(names)

echo "repacked $(ls dist | wc -l | tr -d ' ') packages into $ROOT/dist"
