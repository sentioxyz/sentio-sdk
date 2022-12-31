#!/bin/bash

set -e

yarn install
yarn lerna run build
