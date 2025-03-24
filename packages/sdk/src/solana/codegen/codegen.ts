import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { Idl } from '@coral-xyz/anchor'
import {
  IdlField,
  IdlInstruction,
  IdlType,
  IdlInstructionAccountItem,
  IdlDefinedFields,
  IdlTypeDef
} from '@coral-xyz/anchor/dist/esm/idl.js'
import { recursiveCodegen } from '../../core/codegen.js'

export function codegen(abisDir: string, targetPath = path.join('src', 'types', 'solana'), genExample = false) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  const numFiles = recursiveCodegen(abisDir, targetPath, codegenInternal)

  console.log(chalk.green(`Generated ${numFiles} for Solana`))
}

async function codegenInternal(abisDir: string, targetPath: string) {
  let numFiles = 0
  const abisFiles = fs.readdirSync(abisDir)
  for (const file of abisFiles) {
    if (path.extname(file) === '.json') {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true })
      }
      const idlContent = fs.readFileSync(path.join(abisDir, file), 'utf-8')
      const idlObj = JSON.parse(idlContent) as Idl
      const idlName = idlObj.metadata.name
      const idlFile = path.join(targetPath, idlName + '.ts')
      fs.writeFileSync(idlFile, `export const ${idlName}_idl = ${idlContent}`)
      fs.writeFileSync(path.join(targetPath, `${idlName}_processor.ts`), codeGenSolanaIdlProcessor(idlObj))
      numFiles += 2
    }
  }
  return numFiles
}

function codeGenSolanaIdlProcessor(idlObj: Idl): string {
  const idlName = idlObj.metadata.name
  const idlNamePascalCase = toPascalCase(idlName)
  const instructions = idlObj.instructions
  return `import { BorshInstructionCoder, Instruction, Idl } from '@sentio/sdk/solana'
import { SolanaBaseProcessor, SolanaContext, SolanaBindOptions } from "@sentio/sdk/solana"
import { ${idlName}_idl } from "./${idlName}.js"
import { PublicKey } from '@solana/web3.js'

${idlObj.types?.map((def) => codeGenType(def)).join('')}

export class ${idlNamePascalCase}Processor extends SolanaBaseProcessor {
  static DEFAULT_OPTIONS = {
    name: '${idlNamePascalCase}',
    instructionCoder: new BorshInstructionCoder(${idlName}_idl as Idl)
  }

  static bind(options: SolanaBindOptions): ${idlNamePascalCase}Processor {
    return new ${idlNamePascalCase}Processor( { ...${idlNamePascalCase}Processor.DEFAULT_OPTIONS, ...options })
  }

  ${instructions.map((ins) => codeGenSolanaInstruction(idlNamePascalCase, ins)).join('')}
}
  `
}

function codeGenDefinedFields(fields: IdlDefinedFields): string[] {
  if (typeof fields[0] == 'object' && 'name' in fields[0]) {
    return (fields as IdlField[]).map(({ name, type }) => `${name}: ${mapType(type)},`)
  }

  return (fields as IdlType[]).map((t) => mapType(t))
}

function codeGenType({ name, type }: IdlTypeDef): string {
  switch (type.kind) {
    case 'struct':
      const fields = type.fields ? codeGenDefinedFields(type.fields).join('\n  ') : ''
      return `
interface ${name} {
  ${fields}
}
`
    case 'enum':
      const variants = type.variants
        .map(({ name, fields }) => {
          if (fields) {
            const body = codeGenDefinedFields(fields).join('\n        ')
            return `{
      ${name}: {
        ${body}
      }
    }`
          }
          return `{ ${name}: {} }`
        })
        .join('\n  | ')
      return `
type ${name} = ${variants}
`
    case 'type':
      return `
type ${name} = ${mapType(type.alias)}
`
    default:
      return ''
  }
}

function codeGenSolanaInstruction(idlName: string, ins: IdlInstruction): string {
  const instructionName = ins.name

  const argsType = codeGenInstructionArgsType(ins.args)
  const accountType = codeGenAccountType(ins.accounts)

  return `
  on${
    instructionName.charAt(0).toUpperCase() + instructionName.slice(1)
  }(handler: (args: ${argsType}, accounts: ${accountType}, ctx: SolanaContext) => void): ${idlName}Processor {
    this.onInstruction('${instructionName}', (ins: Instruction, ctx, accounts: string[]) => {
      const origin = ins.data as any
      if (origin) {
        const data = ${codeGenInstructionArgs(ins.args)}
        const accountData = ${codeGenAccountTypeArgs(ins.accounts)}
        handler(data, accountData, ctx)
      }
    })
    return this
  }
  `
}

function codeGenInstructionArgs(args: IdlField[]): string {
  return `{ ${args.map((arg) => codeGenInstructionArg(arg.name, arg.type)).join(', ')} }`
}

function codeGenInstructionArg(name: string, type: IdlType): string {
  const mType = mapType(type)
  if (mType === 'bigint') {
    return `${name}: BigInt(origin.${name}.toString())`
  }
  return `${name}: origin.${name} as ${mType}`
}

function codeGenInstructionArgsType(args: IdlField[]): string {
  return `{ ${args.map((arg) => arg.name + ': ' + mapType(arg.type)).join(', ')} }`
}

function codeGenAccountType(args: IdlInstructionAccountItem[]): string {
  return `{ ${args.map((arg) => arg.name + ': string').join(', ')} }`
}

function codeGenAccountTypeArgs(args: IdlInstructionAccountItem[]): string {
  return `{ ${args.map((arg, idx) => `${arg.name}: accounts[${idx}]`).join(', ')} }`
}

// Reference: https://github.com/coral-xyz/anchor/blob/93332766f13e86efbe77c9986722731742317ede/ts/src/program/namespace/types.ts#L104
function mapType(tpe: IdlType): string {
  if (typeof tpe == 'object') {
    if ('array' in tpe) {
      //IdlTypeArray
      return `${mapType(tpe.array[0])}[]`
    }
    if ('defined' in tpe) {
      // IdlTypeDefined
      return tpe.defined.name
    }
    if ('option' in tpe) {
      // IdlTypeOption
      return mapType(tpe.option) + ' | null | undefined'
    }
    if ('vec' in tpe) {
      //IdlTypeVec
      return `${mapType(tpe.vec)}[]`
    }
  }
  switch (tpe) {
    case 'pubkey':
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
