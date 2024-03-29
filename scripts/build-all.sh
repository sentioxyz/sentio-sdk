#!/bin/bash

set -e

pnpm install
pnpm --filter "./packages/*" -filter "./examples/*" build

pnpm --filter "./packages/cli/templates/**"  build --skip-deps
