#!/usr/bin/env node

import { codeGenAptosProcessor, codeGenSolanaProcessor } from './cli/build'
import path from 'path'

if (process.argv.length > 3) {
  const abisDir = process.argv[2]
  const targetDir = process.argv[3]
  codeGenAptosProcessor(path.join(abisDir, 'aptos'), path.join(targetDir, 'aptos'))
  codeGenSolanaProcessor(path.join(abisDir, 'solana'), path.join(targetDir, 'solana'))
} else {
  console.error('Not enough argument')
  process.exit(1)
}
