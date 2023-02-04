import { execSync } from 'child_process'
import path from 'path'
import { getPackageRoot } from '../utils.js'

export function runTest(argv: string[]) {
  const defaultJestConfig = path.resolve(getPackageRoot('@sentio/sdk'), 'lib', 'jest.config.js')
  // if config not existed copy that
  const jest = path.resolve(getPackageRoot('jest'), 'bin', 'jest')
  execSync(`NODE_OPTIONS=--experimental-vm-modules node ${jest} ${argv.join(' ')}`, { stdio: 'inherit' })
}
