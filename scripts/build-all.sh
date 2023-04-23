#!/bin/bash

set -e

pnpm install
pnpm --filter "./packages/**" build

pnpm install
pnpm --filter "./examples/**" build
