#!/bin/bash

set -e

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROCESSOR_DIR=$BASEDIR/..

yarn install

echo
echo "### Build sdk"
cd $PROCESSOR_DIR/sdk
echo $PWD
yarn build

cd ..

if [ -d node_modules/.bin/sentio ]; then
  echo "sentio bin already existed"
else
  chmod +x $PWD/sdk/dist/cli/cli.js
  ln -s $PWD/sdk/dist/cli/cli.js node_modules/.bin/sentio
fi

for dir in $PROCESSOR_DIR/examples/*/; do # list directories in the form "/tmp/dirname/"
  dir=${dir%*/}                           # remove the trailing "/"
  echo
  echo "### Build ${dir##*/}" # print everything after the final "/"
  cd $dir
  yarn sentio build
done
