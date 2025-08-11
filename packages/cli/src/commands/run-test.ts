import { execSync, spawnSync } from 'child_process'
import path from 'path'
import { Command } from 'commander'
import { getPackageRoot } from '../utils.js'

export function createTestCommand() {
  return new Command('test')
    .description('Test the processor')
    .option('--test-only', "run tests with 'only' option set")
    .option('--test-name-pattern <pattern>', 'run tests whose name matches this regular expression')
    .option('--test-skip-pattern <pattern>', 'run tests whose name do not match this regular expression')
    .allowUnknownOption()
    .action((options, command) => {
      runTestInternal(command.args)
    })
}

function runTestInternal(argv: string[]) {
  const tsx = path.resolve(getPackageRoot('tsx'), 'dist', 'cli.mjs')

  const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
  execSync(`node ${tsc} --noEmit`, { stdio: 'inherit' })
  spawnSync('node', [tsx, '--test', ...argv], { stdio: 'inherit' })
}
