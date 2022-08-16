#!/bin/bash

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROCESSOR_DIR=$BASEDIR/..
echo $PROCESSOR_DIR

set -e

echo
echo "### Build sdk"
cd $PROCESSOR_DIR/sdk
echo $PWD
yarn install && yarn build

echo
echo "### Build x2y2"
cd $PROCESSOR_DIR/examples/x2y2
echo $PWD
rm -rf node_modules
yarn install --check-files && yarn build

echo
echo "### Build Wormhole"
cd $PROCESSOR_DIR/examples/wormhole
echo $PWD
rm -rf node_modules
yarn install --check-files && yarn build

echo
echo "### Build mirrorworld"
cd $PROCESSOR_DIR/examples/mirrorworld
echo $PWD
rm -rf node_modules
yarn install --check-files && yarn build
