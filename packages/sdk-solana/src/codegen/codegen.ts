import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

export function codeGenSolanaProcessor(abisDir: string, targetPath = path.join('src', 'types', 'solana')) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  const abisFiles = fs.readdirSync(abisDir)

  if (abisFiles.length > 0) {
    console.log(chalk.green('Generated Types for Solana'))
  }

  for (const file of abisFiles) {
    if (path.extname(file) === '.json') {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true })
      }
      const idlContent = fs.readFileSync(path.join(abisDir, file), 'utf-8')
      const idlObj = JSON.parse(idlContent)
      const idlName = idlObj.name
      const idlFile = path.join(targetPath, idlName + '.ts')
      fs.writeFileSync(idlFile, `export const ${idlName}_idl = ${idlContent}`)
      fs.writeFileSync(path.join(targetPath, `${idlName}_processor.ts`), codeGenSolanaIdlProcessor(idlObj))
    }
  }
}

function codeGenSolanaIdlProcessor(idlObj: any): string {
  const idlName = idlObj.name
  const idlNamePascalCase = toPascalCase(idlName)
  const instructions: any[] = idlObj.instructions
  return `import { BorshInstructionCoder, Instruction, Idl } from '@project-serum/anchor'
import { SolanaBaseProcessor, SolanaContext, SolanaBindOptions } from "@sentio/sdk-solana"
import { ${idlName}_idl } from "./${idlName}"
import bs58 from 'bs58'
import { PublicKey } from '@solana/web3.js'

export class ${idlNamePascalCase}Processor extends SolanaBaseProcessor {
  static bind(options: SolanaBindOptions): ${idlNamePascalCase}Processor {
    if (options && !options.name) {
      options.name = '${idlNamePascalCase}'
    }
    return new ${idlNamePascalCase}Processor(options)
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
  return `
  on${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}(handler: (args: ${codeGenInstructionArgsType(
    ins.args
  )}, accounts: string[], ctx: SolanaContext) => void): ${idlName}Processor {
    this.onInstruction('${instructionName}', (ins: Instruction, ctx, accounts: string[]) => {
      const origin = ins.data as any
      const data = ${codeGenInstructionArgs(ins.args)}
      if (ins) {
        handler(data, accounts, ctx)
      }
    })
    return this
  }
  `
}

function codeGenInstructionArgs(args: { name: string; type: string }[]): string {
  return `{ ${args.map((arg) => codeGenInstructionArg(arg.name, arg.type)).join(', ')} }`
}

function codeGenInstructionArg(name: string, type: string): string {
  const mType = mapType(type)
  if (mType === 'bigint') {
    return `${name}: BigInt(origin.${name}.toString())`
  }
  return `${name}: origin.${name} as ${mType}`
}

function codeGenInstructionArgsType(args: { name: string; type: string }[]): string {
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
      return 'bigint'
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
