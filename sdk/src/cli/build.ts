import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { EVM, SOLANA, Target } from './config'

export async function buildProcessor(onlyGen: boolean, targets: Target[]) {
  await installDeps()

  // targets.forEach(async (target) => await buildProcessorForTarget(onlyGen, target))
  for (const target of targets) {
    await buildProcessorForTarget(onlyGen, target)
  }

  if (!onlyGen) {
    const WEBPACK_CONFIG = path.join(__dirname, 'webpack.config.js')
    await execStep('yarn tsc -p .', 'Compile')
    await execStep('yarn webpack --config=' + WEBPACK_CONFIG, 'Packaging')
  }
}

async function buildProcessorForTarget(onlyGen: boolean, target: Target) {
  if (target.chain === EVM) {
    await codeGenEthersProcessor(target.abisDir ?? path.join('abis', 'evm'))
  } else if (target.chain === SOLANA) {
    codeGenSolanaProcessor(target.abisDir ?? path.join('abis', 'solana'))
  }

  if (onlyGen) {
    return
  }
}

async function installDeps() {
  await execStep('yarn install --ignore-scripts', 'Yarn Install')
}

async function codeGenEthersProcessor(abisDir: string) {
  const ETHERS_TARGET = path.join(__dirname, '../target-ethers-sentio')
  await execStep(
    'yarn typechain --target ' + ETHERS_TARGET + ` --out-dir src/types/internal ${path.join(abisDir, '*.json')}`,
    'Type definitions gen'
  )
}

export function codeGenSolanaProcessor(abisDir: string, root = '', targetPath = path.join('src', 'types')) {
  const abisFolder = path.join(root, abisDir)
  const abisFiles = fs.readdirSync(abisFolder)
  const typeFolder = path.join(root, targetPath)
  for (const file of abisFiles) {
    if (path.extname(file) === '.json') {
      if (!fs.existsSync(typeFolder)) {
        fs.mkdirSync(typeFolder)
      }
      const idlContent = fs.readFileSync(path.join(abisFolder, file), 'utf-8')
      const idlObj = JSON.parse(idlContent)
      const idlName = idlObj.name
      const idlFile = path.join(typeFolder, idlName + '.ts')
      fs.writeFileSync(idlFile, `export const ${idlName}_idl = ${idlContent}`)
      fs.writeFileSync(path.join(typeFolder, `${idlName}_processor.ts`), codeGenSolanaIdlProcessor(idlObj))
    }
  }
}

function codeGenSolanaIdlProcessor(idlObj: any): string {
  const idlName = idlObj.name
  const idlNamePascalCase = toPascalCase(idlName)
  const instructions: any[] = idlObj.instructions
  return `import { BorshInstructionCoder, Instruction, Idl, BN } from '@project-serum/anchor'
import { SolanaBaseProcessor, SolanaContext } from "@sentio/sdk"
import { ${idlName}_idl } from "./${idlName}"
import bs58 from 'bs58'
import { PublicKey } from '@solana/web3.js'

export class ${idlNamePascalCase}Processor extends SolanaBaseProcessor {
  static bind(address: string, endpoint: string, name = '${idlNamePascalCase}'): ${idlNamePascalCase}Processor {
    return new ${idlNamePascalCase}Processor(name, address, endpoint)
  }

  decodeInstruction: (rawInstruction: string) => Instruction | null = (rawInstruction) => {
    const instructionCoder = new BorshInstructionCoder(${idlName}_idl as Idl)
    const decodedIns = instructionCoder.decode(Buffer.from(bs58.decode(rawInstruction)))
    return decodedIns
  }

  ${instructions.map((ins) => codeGenSolanaInstruction(idlNamePascalCase, ins)).join('')}
}
  `
}

function codeGenSolanaInstruction(idlName: string, ins: any): string {
  const instructionName = ins.name
  const argsTypeString = codeGenInstructionArgs(ins.args)
  return `
  on${
    instructionName.charAt(0).toUpperCase() + instructionName.slice(1)
  }(handler: (args: ${argsTypeString}, ctx: SolanaContext) => void): ${idlName}Processor {
    this.onInstruction('${instructionName}', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ${argsTypeString}, ctx)
      }
    })
    return this
  }
  `
}

function codeGenInstructionArgs(args: { name: string; type: string }[]): string {
  return `{ ${args.map((arg) => arg.name + ': ' + mapType(arg.type)).join(', ')} }`
}

// Reference: https://github.com/coral-xyz/anchor/blob/93332766f13e86efbe77c9986722731742317ede/ts/src/program/namespace/types.ts#L104
function mapType(tpe: string): string {
  switch (tpe) {
    case 'publicKey':
      return 'PublicKey'
    case 'bool':
      return 'boolean'
    case 'string':
      return 'string'
    case 'u8':
    case 'i8':
    case 'u16':
    case 'i16':
    case 'u32':
    case 'i32':
    case 'f32':
    case 'f64':
      return 'number'
    case 'u64':
    case 'i64':
    case 'u128':
    case 'i128':
      return 'BN'
    default:
      return 'any'
  }
}

function toPascalCase(str: string) {
  return `${str}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), ($1, $2, $3) => `${$2.toUpperCase() + $3}`)
    .replace(new RegExp(/\w/), (s) => s.toUpperCase())
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
