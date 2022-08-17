#!/bin/bash

set -e

BASEDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROCESSOR_DIR=$BASEDIR/..

echo
echo "### Build sdk"
cd $PROCESSOR_DIR/sdk
echo $PWD
yarn install && yarn build

for dir in $PROCESSOR_DIR/examples/*/     # list directories in the form "/tmp/dirname/"
do
    dir=${dir%*/}      # remove the trailing "/"
    echo "### Build ${dir##*/}"    # print everything after the final "/"
    cd $dir
    rm -rf node_modules
    yarn install --check-files && yarn sentio build
done