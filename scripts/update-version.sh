#!/bin/bash

set -e

pnpm  --filter "@sentio/sdk..." exec pnpm json -I -f package.json -e "this.version=\"${1}\""