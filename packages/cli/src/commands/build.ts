import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { checkSdkCompatibility, getPackageRoot } from '../utils.js'
import { Command } from '@commander-js/extra-typings'
import { CHAIN_TYPES, loadProcessorConfig } from '../config.js'
import { getABIFilePath, getABI, writeABIFile, redownloadLegacySuiAbis } from '../abi.js'
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
  // Fail fast with a clear message if an incompatible (older-major) @sentio/sdk is
  // already installed, instead of crashing later with a cryptic packaging error.
  checkSdkCompatibility()

  if (!options.skipDeps && !onlyGen) {
    await installDeps()
    // Re-check after install in case it resolved an older-major @sentio/sdk.
    checkSdkCompatibility()
  }

  if (!options.skipGen) {
    console.log(chalk.blue('Codegen Begin (can be skipped with --skip-gen)'))
    await codegen(options.example || false)
    console.log(chalk.blue('Codegen finished'))
    console.log()
  }

  if (!onlyGen) {
    // The SDK ships its tsdown config as plain JS (dist/tsdown.config.js) so Node
    // can load it natively from node_modules — a .ts config fails there because
    // Node refuses to strip types for files under node_modules.
    let tsdownConfig: string
    try {
      tsdownConfig = path.resolve(getPackageRoot('@sentio/sdk'), 'dist', 'tsdown.config.js')
    } catch (e) {
      console.error(chalk.red('@sentio/sdk is not installed. Run an install (or drop --skip-deps) and try again.'))
      process.exit(1)
    }
    if (!fs.existsSync(tsdownConfig)) {
      console.error(
        chalk.red(
          "Incompatible @sentio/sdk: missing dist/tsdown.config.js. Please upgrade @sentio/sdk to match this CLI's version."
        )
      )
      process.exit(1)
    }

    const tsc = path.resolve(getPackageRoot('typescript'), 'bin', 'tsc')
    await execStep(['node', tsc, '--noEmit'], 'type checking')

    const tsdown = path.resolve(getPackageRoot('tsdown'), 'dist', 'run.mjs')
    await execStep(['node', tsdown, '--config', tsdownConfig], 'Packaging')

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

  // Re-download any Sui ABIs saved by an older CLI in the legacy JSON-RPC map
  // shape; the current codegen only reads the gRPC array shape, so a stale file
  // left in abis/sui would otherwise make the Sui codegen throw for the whole
  // project.
  await redownloadLegacySuiAbis(path.resolve('abis', 'sui'))

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
