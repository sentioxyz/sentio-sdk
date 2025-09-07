import { execSync, spawnSync } from 'child_process'
import path from 'path'
import { Command } from '@commander-js/extra-typings'
import { getPackageRoot } from '../utils.js'

export function createTestCommand() {
  return new Command('test')
    .description(
      `Test the processor, options are same as node test runner at https://nodejs.org/api/test.html#running-tests-from-the-command-line

  --test-only\t\t\trun tests with 'only' option set
  --test-name-pattern=...\trun tests whose name matches this regular expression
  --test-skip-pattern=...\trun tests whose name do not match this regular expression`
    )
    .allowUnknownOption()
    .allowExcessArguments()
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
