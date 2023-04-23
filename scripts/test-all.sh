#!/bin/bash

set -e

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$BASEDIR/build-all.sh
pnpm --filter "./packages/*" --filter "./examples/*" test
