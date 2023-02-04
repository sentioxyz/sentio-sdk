#!/usr/bin/env node

import path from 'path'
import { codegen } from './codegen/codegen.js'

if (process.argv.length > 3) {
  const abisDir = process.argv[2]
  const targetDir = process.argv[3]
  codegen(abisDir, targetDir)
} else {
  console.error('Not enough argument')
  process.exit(1)
}
