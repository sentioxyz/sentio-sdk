// #!/usr/bin/env node

import { codeGenAptosProcessor } from './codegen/codegen'

if (process.argv.length > 3) {
  const abisDir = process.argv[2]
  const targetDir = process.argv[3]

  codeGenAptosProcessor(abisDir, targetDir)
} else {
  console.error('Not enough argument')
  process.exit(1)
}
