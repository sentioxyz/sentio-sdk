#!/bin/bash

set -e

yarn install
yarn lerna run build
yarn lerna run test --scope="@sentio/example-*"
