import { execSync } from 'child_process'
import path from 'path'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { getPackageRoot } from '../utils.js'

const buildOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  { name: 'test-only', description: "run tests with 'only' option set" },
  { name: 'test-name-pattern', description: 'run tests whose name matches this regular expression' },
  { name: 'test-skip-pattern', description: 'run tests whose name do not match this regular expression' }
]

export function runTest(argv: string[]) {
  const options = commandLineArgs(buildOptionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: 'Sentio test runner',
      content: 'sentio test [options]'
    },
    {
      header: 'Documentation',
      content: 'All the options are piped to node test runner, see https://nodejs.org/api/test.html'
    },
    {
      header: 'Options',
      optionList: buildOptionDefinitions
    }
  ])

  if (options.help) {
    console.log(usage)
    process.exit(0)
  }

  const tsx = path.resolve(getPackageRoot('tsx'), 'dist', 'cli.mjs')

  // Run tsc to do check before test
  const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
  execSync(`node ${tsc} --noEmit`, { stdio: 'inherit' })
  execSync(`node ${tsx} --test ${argv.join(' ')}`, { stdio: 'inherit' })
}
