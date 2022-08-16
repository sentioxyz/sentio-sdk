#!/usr/bin/env node

import { codeGenSolanaProcessor } from './build'

const abisDir = 'abis/solana'
if (process.argv.length > 2) {
  const rootPath = process.argv[2]
  if (process.argv.length > 3) {
    const targetPath = process.argv[3]
    codeGenSolanaProcessor(abisDir, rootPath, targetPath)
  } else {
    codeGenSolanaProcessor(abisDir, rootPath)
  }
} else {
  codeGenSolanaProcessor(abisDir)
}
