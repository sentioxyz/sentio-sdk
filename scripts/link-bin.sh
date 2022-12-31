#!/bin/bash

set -e

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $BASEDIR/..

if [ -f ./node_modules/.bin/sentio ]; then
  echo "sentio bin already existed"
else
  chmod +x $PWD/packages/cli/lib/cli.js
  ln -s $PWD/packages/cli/lib/cli.js node_modules/.bin/sentio
fi
