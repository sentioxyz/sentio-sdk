import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import * as process from 'process'
import { getPackageRoot } from './utils.js'

export async function buildProcessor(onlyGen: boolean) {
  if (!onlyGen) {
    await installDeps()
  }

  // targets.forEach(async (target) => await buildProcessorForTarget(onlyGen, target))
  // for (const target) {
  await buildProcessorForTarget(onlyGen)
  // }

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

async function buildProcessorForTarget(onlyGen: boolean) {
  const outputBase = path.resolve('src', 'types')
  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/eth/codegen')
    let input = path.resolve('abis', 'eth')
    let output = path.resolve(outputBase)
    if (!fs.existsSync(input)) {
      input = path.resolve('abis', 'evm')
      output = path.resolve(outputBase)
    }
    // @ts-ignore dynamic import
    await codegen.codegen(input, output)
  } catch (e) {
    console.error('code gen error', e)
  }

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/solana/codegen')
    // @ts-ignore dynamic import
    await codegen.codegen(path.resolve('abis', 'solana'), path.resolve(outputBase, 'solana'))
  } catch (e) {
    console.error('code gen error', e)
  }

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk/aptos/codegen')
    // @ts-ignore dynamic import
    await codegen.codegen(path.resolve('abis', 'aptos'), path.resolve(outputBase, 'aptos'))
  } catch (e) {
    console.error('code gen error', e)
  }

  if (onlyGen) {
    return
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
