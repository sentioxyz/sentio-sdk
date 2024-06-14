import { execSync } from 'child_process'
import path from 'path'
import { getPackageRoot } from '../utils.js'

export function runTest(argv: string[]) {
  const tsx = path.resolve(getPackageRoot('tsx'), 'dist', 'cli.mjs')

  // Run tsc to do check before test
  const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
  execSync(`node ${tsc} --noEmit`, { stdio: 'inherit' })
  execSync(`node ${tsx} --test **/*.test.ts ${argv.join(' ')}`, { stdio: 'inherit' })
}
