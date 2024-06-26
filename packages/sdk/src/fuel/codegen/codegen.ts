import fs, { readFileSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import { AbiTypeGen, IFile, IFunction, ProgramTypeEnum } from '@fuel-ts/abi-typegen'
import mkdirp from 'mkdirp'
import path from 'path'
import { upperFirst } from './utils.js'

export async function codegen(abisDir: string, outDir: string) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  const numFiles = await codegenInternal(abisDir, outDir)
  console.log(chalk.green(`Generated ${numFiles} files for Fuel`))
}

function patchImport(contents: string) {
  return (
    contents
      /* .replace(
      `import { Interface, Contract, ContractFactory } from "fuels";`,
      `import { Contract, } from "@fuel-ts/program";
import { ContractFactory } from "@fuel-ts/contract";
import { Interface } from "@fuel-ts/abi-coder";`
    )
    .replace(
      `import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot } from "fuels";
`,
      `import type { Provider, Account } from "@fuel-ts/account";
import type { AbstractAddress, BytesLike } from "@fuel-ts/interfaces";
import type { DeployContractOptions } from "@fuel-ts/contract";
import type { StorageSlot } from "@fuel-ts/transactions";`
    )*/
      .replace(/from\s+['"](\..+)['"]/g, `from '\$1.js'`)
  )
}

/*function patchEnumType(contents: string) {
  const matches = contents.matchAll(/export type (.+) = Enum<{ Ok: T, Err: E }>;/g)

  for (const m of matches) {
    const vname = m[1]
    contents = contents.replace(m[0], `export type ${vname}<T,E> = Enum<{ Ok: T, Err: E }>;`)

    const reg = new RegExp(`export type (.+) = ${vname}`, 'g')
    contents = contents.replace(reg, `export type \$1<T,E> = ${vname}<T,E>`)
  }
  return contents
}*/

async function codegenInternal(abisDir: string, outDir: string): Promise<number> {
  const allFiles = fs.readdirSync(abisDir)
  if (allFiles.length === 0) {
    return 0
  }

  const allABIFiles = []
  for (const f of allFiles) {
    if (f.toLowerCase().endsWith('-abi.json')) {
      allABIFiles.push(path.join(abisDir, f))
    }
  }
  if (allABIFiles.length === 0) {
    return 0
  }
  const abiFiles = allABIFiles.map((filepath) => {
    const abi: IFile = {
      path: filepath,
      contents: readFileSync(filepath, 'utf-8')
    }
    return abi
  })

  // fuels type gen
  const abiTypeGen = new AbiTypeGen({
    abiFiles,
    binFiles: [],
    storageSlotsFiles: [],
    outputDir: outDir,
    programType: ProgramTypeEnum.CONTRACT
  })

  mkdirp.sync(outDir)
  mkdirp.sync(path.join(outDir, 'factories'))
  let count = 0
  abiTypeGen.files.forEach((file) => {
    if (!file.path.endsWith('.hex.ts')) {
      const content = patchImport(file.contents)
      // content = patchEnumType(content)
      writeFileSync(file.path, content)
      count++
    }
  })

  // for (const file of abiTypeGen.files) {
  //   const jsonAbi: JsonAbi = JSON.parse(file.contents)
  //   for (const logType of jsonAbi.loggedTypes) {
  //     logType.loggedType.name
  //
  //   }
  // }

  for (const abi of abiTypeGen.abis) {
    const name = abi.name.endsWith('Abi') ? abi.name.slice(0, -3) : abi.name
    const filePath = path.join(outDir, `${name}Processor.ts`)
    const importedTypes = collectImportedTypes(abi.types)

    const logByTypes: Record<string, string[]> = {}

    for (const logType of abi.rawContents.loggedTypes) {
      // @ts-ignore - we know that the type is in the abi
      const t = abi.types.find((t) => t.rawAbiType.typeId == logType.loggedType?.type)
      // @ts-ignore - we know that the type is in the abi
      const typeName = t?.attributes?.outputLabel
      if (typeName) {
        if (!logByTypes[typeName]) {
          logByTypes[typeName] = []
        }
        logByTypes[typeName].push(logType.logId)
      }
    }

    const content = `/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */
    
import { FuelAbstractProcessor, FuelContext, FuelProcessorConfig, TypedCall, FuelFetchConfig, FuelCall, FuelLog} from '@sentio/sdk/fuel'
import {${abi.name}__factory } from './factories/${abi.name}__factory.js'
import {${abi.commonTypesInUse.join(',')}} from './common.js'
import {${importedTypes.join(',')}} from './${abi.name}.js'

import type { BigNumberish, BN } from 'fuels';
import type { BytesLike } from 'fuels';


namespace ${name} {
  export abstract class CallWithLogs<T extends Array<any>, R> extends TypedCall<T, R> {
${Object.entries(logByTypes)
  .flatMap(([t, ids]) => {
    const s = []
    s.push(`
    getLogsOfType${getTypeName(t)}(): Array<${t}> {
      return this.logs?.filter(l =>[${ids.map((id) => `"${id}"`).join(', ')}].includes(l.logId) ).map(l => l.data) as Array<${t}>
    }`)

    return s
  })
  .join('\n')}
  }

${abi.functions.map(genCallType).join('\n')}
}

export class ${name}Processor extends FuelAbstractProcessor {
  constructor(config?: FuelProcessorConfig) {
    super(${abi.name}__factory.abi, config)
  }
  
  static bind(config: FuelProcessorConfig) {
    return new ${name}Processor({
      name: '${name}',
      ...config,
    })
  }

${
  ''
  /* disable codegen for now
       abi.functions.map((f) => genOnCallFunction(name, f)).join('\n') */
}   

${Object.entries(logByTypes).map(genOnLogFunction).join('\n')}

}
`
    writeFileSync(filePath, content)
    count++
  }

  return count
}

function genCallType(f: IFunction) {
  const name = upperFirst(f.name)
  const argMap: Record<string, string> = {}
  const argTypes = f.attributes.inputs.split(',').map((t) => t.trim())
  f.rawAbiFunction.inputs.forEach((input, idx) => {
    argMap[input.name] = argTypes[idx]
  })

  return `
  export class ${name}Call extends CallWithLogs<[${argTypes.join(', ')}], ${f.attributes.output}> {
      declare args: [${argTypes.join(', ')}]
      declare returnValue: ${f.attributes.output}
      declare argsObject: {
          ${Object.entries(argMap)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}
      } 
      constructor(call: FuelCall) {
        super(call)
      }
  }
`
}

function genOnCallFunction(contractName: string, f: IFunction) {
  const name = upperFirst(f.name)
  return `
  onCall${name}(handler: (call: ${contractName}.${name}Call, ctx: FuelContext) => void | Promise<void>, config?: FuelFetchConfig) {
    return super.onCall('${f.name}', (call, ctx) => handler(new ${contractName}.${name}Call(call), ctx), config)
  }`
}

function collectImportedTypes(types: any[]): string[] {
  const ret = new Set<string>()
  for (const type of types) {
    if ((type && type.name == 'struct') || type.name == 'enum') {
      ret.add(type.attributes.inputLabel)
      ret.add(type.attributes.outputLabel)
    }
  }

  return Array.from(ret)
}

function genOnLogFunction([type, ids]: [string, string[]]) {
  const name = getTypeName(type)
  return `
  onLog${name}(handler: (log: FuelLog<${type}>, ctx: FuelContext) => void | Promise<void>, logIdFilter?: string | string[]) {
    return super.onLog<${type}>(logIdFilter ?? [${ids.map((id) => `"${id}"`).join(', ')}], (log, ctx) => handler(log, ctx))
  }`
}

function getTypeName(type: string) {
  return upperFirst(type.replace('Output', ''))
}
