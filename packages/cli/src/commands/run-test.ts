import { execSync } from 'child_process'
import path from 'path'
import { getPackageRoot } from '../utils.js'

export function runTest(argv: string[]) {
  const defaultJest = path.resolve(getPackageRoot('@sentio/sdk'), 'lib/jest.config.js')
  // if config not existed copy that
  execSync(`NODE_OPTIONS=--experimental-vm-modules yarn jest ` + argv.join(' '), { stdio: 'inherit' })
}
