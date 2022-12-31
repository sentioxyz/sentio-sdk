#!/bin/bash

set -e

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$BASEDIR/build-all.sh
yarn lerna run test --scope="@sentio-example/*"
