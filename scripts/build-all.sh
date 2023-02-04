#!/bin/bash

set -e

yarn install
yarn lerna run build --scope="@sentio/*" --scope="@sentio-example/*"
yarn lerna run build --scope="template-*" --concurrency=1
