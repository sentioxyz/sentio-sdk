import { execSync } from 'child_process'
import path from 'path'
import { getPackageRoot } from '../utils.js'

export function runTest(argv: string[]) {
  const defaultJestConfig = path.resolve(getPackageRoot('@sentio/sdk'), 'lib', 'jest.config.js')
  // if config not existed copy that
  const jest = path.resolve(getPackageRoot('jest'), 'bin', 'jest')

  // Run tsc to do check before test
  const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
  execSync(`node ${tsc} --noEmit`, { stdio: 'inherit' })
  execSync(`NODE_OPTIONS=--experimental-vm-modules node ${jest} ${argv.join(' ')}`, { stdio: 'inherit' })
}
