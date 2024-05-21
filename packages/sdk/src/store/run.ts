import { codegen } from './codegen.js'

if (process.argv.length > 3) {
  const srcFile = process.argv[2]
  const targetDir = process.argv[3]
  await codegen(srcFile, targetDir)
} else {
  console.error('Not enough argument')
  process.exit(1)
}
