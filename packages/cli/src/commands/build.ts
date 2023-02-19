import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { exec } from 'child_process'
import * as process from 'process'
import { getPackageRoot } from '../utils.js'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

export const buildOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.',
  },
  {
    name: 'skip-gen',
    type: Boolean,
    description: 'Skip code generation.',
  },
  {
    name: 'skip-deps',
    type: Boolean,
    description: 'Skip dependency enforce.',
  },
]

export async function buildProcessorWithArgs(argv: string[]) {
  const options = commandLineArgs(buildOptionDefinitions, { argv })
  const usage = commandLineUsage([
    {
      header: 'Create a template project',
      content: 'sentio create <name>',
    },
    {
      header: 'Options',
      optionList: buildOptionDefinitions,
    },
  ])

  if (options.help) {
    console.log(usage)
    process.exit(0)
  }
  await buildProcessor(false, options)
}

export async function buildProcessor(onlyGen: boolean, options: commandLineArgs.CommandLineOptions) {
  if (!options['skip-deps'] && !onlyGen) {
    await installDeps()
  }

  if (!options['skip-gen']) {
    await codegen()
  }

  if (!onlyGen) {
    let tsupConfig: string
    try {
      tsupConfig = path.resolve(getPackageRoot('@sentio/sdk'), 'lib/tsup.config.ts')
    } catch (e) {
      console.error(chalk.red("Wrong CLI version for sdk, can't find tsup.config.ts"))
      process.exit(1)
    }

    const tsup = path.resolve(getPackageRoot('tsup'), 'dist', 'cli-default.js')
    // await execStep('yarn tsc -p .', 'Compile')
    await execStep(`node ${tsup} --config=${tsupConfig}`, 'Packaging')

    const dir = fs.readdirSync(path.join(process.cwd(), 'dist'))
    const generated = dir.filter((d) => d.endsWith('.js')).length
    if (generated < 0) {
      console.error(chalk.red('No filed generated, please check if your processor.ts file'))
      process.exit(1)
    }
    if (generated > 1) {
      console.error(
        chalk.red('Packing failed: '),
        `Multiple entry point is not allowed. If your processor.ts have multiple file imported, please change:
import('mine.js')
to
import 'mine.js'
`
      )
    }
  }
}

export async function codegen() {
  const outputBase = path.resolve('src', 'types')
  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/eth/codegen')
    let input = path.resolve('abis', 'eth')
    let output = path.resolve(outputBase, 'eth')
    if (!fs.existsSync(input)) {
      input = path.resolve('abis', 'evm')
      output = path.resolve(outputBase, 'eth')
    }
    fs.emptyDirSync(output)
    // @ts-ignore dynamic import
    await codegen.codegen(input, output)
  } catch (e) {
    console.error('code gen error', e)
  }

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/solana/codegen')

    const output = path.resolve(outputBase, 'solana')
    fs.emptyDirSync(output)

    // @ts-ignore dynamic import
    await codegen.codegen(path.resolve('abis', 'solana'), output)
  } catch (e) {
    console.error('code gen error', e)
  }

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/aptos/codegen')

    const output = path.resolve(outputBase, 'aptos')
    fs.emptyDirSync(output)

    // @ts-ignore dynamic import
    await codegen.codegen(path.resolve('abis', 'aptos'), output)
  } catch (e) {
    console.error('code gen error', e)
  }

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/sui/codegen')

    const output = path.resolve(outputBase, 'sui')
    fs.emptyDirSync(output)

    // @ts-ignore dynamic import
    await codegen.codegen(path.resolve('abis', 'sui'), output)
  } catch (e) {
    console.error('code gen error', e)
  }
}

async function installDeps() {
  await execStep('yarn install --ignore-scripts', 'Yarn Install')
}

async function execStep(cmd: string, stepName: string) {
  const child = exec(cmd)
  console.log(chalk.blue(stepName + ' begin'))

  if (!child.stdout || !child.stderr) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(1)
  }

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  await new Promise((resolve) => {
    child.on('close', resolve)
  })

  if (child.exitCode) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(child.exitCode)
  }
  console.log(chalk.blue(stepName + ' success'))
  console.log()
}
