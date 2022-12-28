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

echo
echo "### Build cli"
cd $PROCESSOR_DIR/cli
echo $PWD
yarn build

cd ..

if [ -f ./node_modules/.bin/sentio ]; then
  echo "sentio bin already existed"
else
  chmod +x $PWD/cli/lib/cli.js
  ln -s $PWD/cli/lib/cli.js node_modules/.bin/sentio
fi

yarn install

for dir in $PROCESSOR_DIR/examples/*/; do # list directories in the form "/tmp/dirname/"
  dir=${dir%*/}                           # remove the trailing "/"
  echo
  echo "### Build ${dir##*/}" # print everything after the final "/"
  cd $dir
  yarn sentio gen && yarn test
  yarn sentio build
done
