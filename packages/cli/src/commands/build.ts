import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { getPackageRoot } from '../utils.js'
import { Command } from '@commander-js/extra-typings'
import { CHAIN_TYPES, loadProcessorConfig } from '../config.js'
import { getABIFilePath, getABI, writeABIFile } from '../abi.js'
import { execStep, execPackageManager } from '../execution.js'
import { CommandOptionsType } from './types.js'

export function createBuildCommand() {
  return new Command('build')
    .description('Build the processor')
    .option('--skip-gen', 'Skip code generation.')
    .option('--skip-deps', 'Skip dependency enforce.')
    .option('--example', 'Generate example usage of the processor.')
    .action(async (options) => {
      await buildProcessor(false, options)
    })
}

export function createGenCommand() {
  return new Command('gen')
    .description('Generate ABI')
    .option('--example', 'Generate example usage of the processor.')
    .action(async (options) => {
      await buildProcessor(true, options)
    })
}

export async function buildProcessor(onlyGen: boolean, options: CommandOptionsType<typeof createBuildCommand>) {
  if (!options.skipDeps && !onlyGen) {
    await installDeps()
  }

  if (!options.skipGen) {
    console.log(chalk.blue('Codegen Begin (can be skipped with --skip-gen)'))
    await codegen(options.example || false)
    console.log(chalk.blue('Codegen finished'))
    console.log()
  }

  if (!onlyGen) {
    let tsupConfig: string
    try {
      tsupConfig = path.resolve(getPackageRoot('@sentio/sdk'), 'lib', 'tsup.config.ts')
    } catch (e) {
      console.error(chalk.red("Wrong CLI version for sdk, can't find tsup.config.ts"))
      process.exit(1)
    }

    const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
    await execStep(['node', tsc, '--noEmit'], 'type checking')

    const tsup = path.resolve(getPackageRoot('tsup'), 'dist', 'cli-default.js')
    await execStep(['node', tsup, '--config', tsupConfig], 'Packaging')

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

export async function codegen(genExample: boolean) {
  const processorConfig = loadProcessorConfig()
  const contractsForUsage = processorConfig.contracts || []
  let previousChain = ''
  for (const contract of contractsForUsage) {
    const outputPath = getABIFilePath(contract.chain, contract.name, contract.address, contract.folder)
    if (fs.existsSync(outputPath)) {
      continue
    }
    console.log('Download Missing ABI specified in sentio.yaml')
    if (contract.chain === previousChain) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } else {
      previousChain = contract.chain
    }
    const res = await getABI(contract.chain, contract.address, contract.name)
    writeABIFile(res.abi, outputPath)
  }

  const outputBase = path.resolve('src', 'types')

  for (const gen of CHAIN_TYPES) {
    try {
      const codegen = await import(`@sentio/sdk/${gen}/codegen`)

      try {
        const input = path.resolve('abis', gen)
        const output = path.resolve(outputBase, gen)
        fs.removeSync(output)

        if (gen == 'eth') {
          await codegen.codegen(input, output, genExample ? contractsForUsage : [])
        } else {
          await codegen.codegen(input, output, genExample)
        }
      } catch (e) {
        console.error('processor codegen error', e)
      }
    } catch (e) {
      // ignore
    }
  }

  try {
    const src = path.resolve('.')

    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/store/codegen')
    const output = path.resolve('src', 'schema')
    fs.emptyDirSync(output)
    await codegen.codegen(src, output)
  } catch (e) {
    console.error('schema codegen error', e)
  }
}

async function installDeps() {
  await execPackageManager(['install', '--ignore-scripts'], 'Install')
}
