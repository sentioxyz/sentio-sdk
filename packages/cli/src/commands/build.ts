import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { getPackageRoot } from '../utils.js'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import yaml from 'yaml'
import { YamlProjectConfig } from '../config.js'
import { getABIFilePath, getABI, writeABIFile } from '../abi.js'
import { execStep, execPackageManager } from '../execution.js'

export const buildOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'skip-gen',
    type: Boolean,
    description: 'Skip code generation.'
  },
  {
    name: 'skip-deps',
    type: Boolean,
    description: 'Skip dependency enforce.'
  },
  {
    name: 'example',
    type: Boolean,
    description: 'Generate example usage of the processor.'
  }
]

export const GenOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'example',
    type: Boolean,
    description: 'Generate example usage of the processor.'
  }
]

export async function buildProcessorWithArgs(argv: string[]) {
  const options = commandLineArgs(buildOptionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: 'Build project',
      content: 'sentio build'
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
  await buildProcessor(false, options)
}

export async function generate(argv: string[]) {
  const options = commandLineArgs(GenOptionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: 'Generate type binding',
      content: 'sentio gen [--example]'
    },
    {
      header: 'Options',
      optionList: GenOptionDefinitions
    }
  ])

  if (options.help) {
    console.log(usage)
    process.exit(0)
  }
  await buildProcessor(true, options)
}

export async function buildProcessor(onlyGen: boolean, options: commandLineArgs.CommandLineOptions) {
  if (!options['skip-deps'] && !onlyGen) {
    await installDeps()
  }

  if (!options['skip-gen']) {
    await codegen(options.example || false)
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
    // await execStep('yarn tsc -p .', 'Compile')
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
  const processorConfig = yaml.parse(fs.readFileSync('sentio.yaml', 'utf8')) as YamlProjectConfig
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

  const generators = ['eth', 'solana', 'aptos', 'sui', 'iota', 'fuel', 'starknet']

  for (const gen of generators) {
    try {
      const codegen = await import(`@sentio/sdk/${gen}/codegen`)

      const input = path.resolve('abis', gen)
      const output = path.resolve(outputBase, gen)
      await fs.remove(output)

      if (gen == 'eth') {
        await codegen.codegen(input, output, genExample ? contractsForUsage : [])
      } else {
        await codegen.codegen(input, output, genExample)
      }
    } catch (e) {
      console.error('code gen error', e)
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
    console.error('database schema gen failed', e)
  }
}

async function installDeps() {
  await execPackageManager(['install', '--ignore-scripts'], 'Install')
}
