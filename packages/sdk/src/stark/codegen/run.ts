import { codegen } from './index.js'

if (process.argv.length > 3) {
  const abisDir = process.argv[2]
  const targetDir = process.argv[3]
  await codegen(abisDir, targetDir)
} else {
  console.error('Not enough argument')
  process.exit(1)
}
