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
    let WEBPACK_CONFIG: string
    try {
      WEBPACK_CONFIG = path.resolve(getPackageRoot('@sentio/sdk'), 'lib/tsup.config.ts')
    } catch (e) {
      console.error(chalk.red("Wrong CLI version for sdk, can't find tsup.config.ts"))
      process.exit(1)
    }

    // await execStep('yarn tsc -p .', 'Compile')
    await execStep('yarn tsup --config=' + WEBPACK_CONFIG, 'Packaging')

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
  await codeGenEthersProcessor(path.join('abis', 'evm'))

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk-solana/codegen')
    codegen.codeGenSolanaProcessor(path.join('abis', 'solana'))
  } catch (e) {}

  try {
    // @ts-ignore dynamic import
    const codegen = await import('@sentio/sdk-aptos/codegen')
    codegen.codeGenAptosProcessor(path.join('abis', 'aptos'))
  } catch (e) {}

  if (onlyGen) {
    return
  }
}

async function installDeps() {
  await execStep('yarn install --ignore-scripts', 'Yarn Install')
}

export async function codeGenEthersProcessor(
  abisDir: string,
  ETHERS_TARGET = path.resolve(getPackageRoot('@sentio/sdk'), 'lib/target-ethers-sentio/index.cjs'),
  outDir = 'src/types/internal'
) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  let haveJson = false
  const files = fs.readdirSync(abisDir)
  for (const file of files) {
    if (file.toLowerCase().endsWith('.json')) {
      haveJson = true
      break
    }
  }
  if (!haveJson) {
    return
  }

  console.log(chalk.green('Generated Types for EVM'))

  // TODO this will fail during postinstall, need to locate real typechain path
  await execStep(
    'yarn typechain --target ' + ETHERS_TARGET + ` --out-dir ${outDir} ${path.join(abisDir, '*.json')}`,
    'Type definitions gen'
  )
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
