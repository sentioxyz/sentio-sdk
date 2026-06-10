#!/bin/bash
set -euo pipefail

# Delete pre-release GitHub releases (keeps their git tags, which semantic-release relies on).
gh release list --limit 1000 --json tagName,isPrerelease \
  --jq '.[] | select(.isPrerelease) | .tagName' |
  xargs -r -L1 gh release delete --yes
