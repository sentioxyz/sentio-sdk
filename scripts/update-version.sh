#!/bin/bash

set -e

FILTER=$1
VERSION=$2

pnpm  --filter "${FILTER}" exec pnpm json -I -f package.json -e "this.version=\"${VERSION}\""