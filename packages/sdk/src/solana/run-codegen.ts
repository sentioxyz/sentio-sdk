#!/usr/bin/env node

import path from 'path'
import { codeGenSolanaProcessor } from './codegen/codegen.js'

if (process.argv.length > 3) {
  const abisDir = process.argv[2]
  const targetDir = process.argv[3]
  codeGenSolanaProcessor(abisDir, targetDir)
} else {
  console.error('Not enough argument')
  process.exit(1)
}
