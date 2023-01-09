import * as fs from 'fs'
import * as path from 'path'
import { format } from 'prettier'
import { MoveFunction, MoveModule, MoveModuleBytecode, MoveStruct } from 'aptos-sdk/src/generated'
import { AccountModulesImportInfo, AccountRegister, generateType } from './typegen'
import { getMeaningfulFunctionParams, isFrameworkAccount, moduleQname, SPLITTER } from '../utils'
import chalk from 'chalk'
import { AptosNetwork, getAptosChainName, getRpcClient } from '../network'
import { parseMoveType } from '../types'

export function codeGenAptosProcessor(abisDir: string, outDir = 'src/types/aptos') {
  if (!fs.existsSync(abisDir)) {
    return
  }
  console.log(chalk.green('Generated Types for Aptos'))
  generate(abisDir, outDir)
}

export async function generate(srcDir: string, outputDir: string) {
  await generateForNetwork(srcDir, outputDir, AptosNetwork.MAIN_NET)
  await generateForNetwork(path.join(srcDir, 'testnet'), path.join(outputDir, 'testnet'), AptosNetwork.TEST_NET)
}

export async function generateForNetwork(srcDir: string, outputDir: string, network: AptosNetwork) {
  if (!fs.existsSync(srcDir)) {
    return
  }
  if (network === AptosNetwork.TEST_NET) {
    console.log('Found testnet directory, generate code for testnet modules')
  }
  const files = fs.readdirSync(srcDir)
  outputDir = path.resolve(outputDir)
  const outputs: OutputFile[] = []

  fs.mkdirSync(outputDir, { recursive: true })

  const loader = new AccountRegister()

  // when generating user code, don't need to generate framework account
  loader.accountImports.set('0x1', new AccountModulesImportInfo('0x1', '0x1'))
  loader.accountImports.set('0x2', new AccountModulesImportInfo('0x2', '0x2'))
  loader.accountImports.set('0x3', new AccountModulesImportInfo('0x3', '0x3'))
  const client = getRpcClient(network)

  for (const file of files) {
    if (!file.endsWith('.json')) {
      continue
    }
    const fullPath = path.resolve(srcDir, file)
    const modules = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))

    for (const module of modules) {
      if (module.abi) {
        loader.register(module.abi, path.basename(file, '.json'))
      }
    }
    const codeGen = new AccountCodegen(loader, modules, {
      fileName: path.basename(file, '.json'),
      outputDir: outputDir,
      network,
    })

    outputs.push(...codeGen.generate())
  }

  while (loader.pendingAccounts.size > 0) {
    for (const account of loader.pendingAccounts) {
      console.log(`download dependent module for account ${account} at ${getAptosChainName(network)}`)

      try {
        const modules = await client.getAccountModules(account)
        fs.writeFileSync(path.resolve(srcDir, account + '.json'), JSON.stringify(modules, null, '\t'))

        for (const module of modules) {
          if (module.abi) {
            loader.register(module.abi, account)
          }
        }
        const codeGen = new AccountCodegen(loader, modules, {
          fileName: account,
          outputDir: outputDir,
          network,
        })

        outputs.push(...codeGen.generate())
      } catch (e) {
        console.error(
          chalk.red(
            'Error downloading account module, check if you choose the right network，or download account modules manually into your director'
          )
        )
        console.error(e)
        process.exit(1)
      }
    }
  }

  for (const output of outputs) {
    const content = format(output.fileContent, { parser: 'typescript' })
    fs.writeFileSync(path.join(outputDir, output.fileName), content)
  }
}

interface OutputFile {
  fileName: string
  fileContent: string
}

interface Config {
  fileName: string
  outputDir: string
  network: AptosNetwork
}

export class AccountCodegen {
  modules: MoveModuleBytecode[]
  config: Config
  loader: AccountRegister

  constructor(loader: AccountRegister, modules: MoveModuleBytecode[], config: Config) {
    // const json = fs.readFileSync(config.srcFile, 'utf-8')
    this.modules = modules
    this.config = config
    this.loader = loader
  }

  generate(): OutputFile[] {
    if (!this.modules) {
      return []
    }
    // const baseName = path.basename(this.config.fileName, '.json')

    let address: string | undefined
    for (const module of this.modules) {
      if (module.abi && module.abi.address) {
        address = module.abi.address
      }
    }
    if (!address) {
      return []
    }

    const imports = `
    import { 
      TypeRegistry, AptosBindOptions, AptosBaseProcessor, 
      TypedEventInstance, AptosNetwork, TypedEntryFunctionPayload,
      AptosContext, CallFilter
    } from "@sentio/sdk-aptos"
    import { AptosFetchConfig } from "@sentio/protos"
    import { Address, MoveModule } from "aptos-sdk/src/generated"
    `

    const dependedAccounts: string[] = []

    const moduleImports: string[] = []

    const info = this.loader.accountImports.get(address)

    if (info) {
      for (const [account] of info.imports.entries()) {
        // Remap to user's filename if possible, TODO codepath not well tested
        let tsAccountModule = './' + (this.loader.accountImports.get(account)?.moduleName || account)
        if (isFrameworkAccount(account) && !isFrameworkAccount(address)) {
          // Decide where to find runtime library
          let srcRoot = 'lib'
          if (__dirname.includes('sdk-aptos/src/codegen')) {
            srcRoot = 'src'
          }
          tsAccountModule = `@sentio/sdk-aptos/${srcRoot}/builtin/${account}`
        }
        moduleImports.push(`import * as _${account} from "${tsAccountModule}"`)

        dependedAccounts.push(account)
      }
    }

    const source = `
    /* Autogenerated file. Do not edit manually. */
    /* tslint:disable */
    /* eslint-disable */
  
    /* Generated modules for account ${address} */
  
    ${imports}
    
    ${moduleImports.join('\n')}
    
    ${this.modules.map((m) => generateModule(m, this.config.network)).join('\n')}
    
    export function loadAllTypes(_r: TypeRegistry) {
      ${dependedAccounts.map((a) => `_${a}.loadAllTypes(_r)`).join('\n')}

      ${this.modules
        .map((m) => {
          return `_r.load(${m.abi?.name}.ABI)`
        })
        .join('\n')}
    }
    ` // source

    return [
      {
        fileName: this.config.fileName + '.ts',
        fileContent: source,
      },
    ]
  }
}

function generateNetworkOption(network: AptosNetwork) {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return 'TEST_NET'
  }
  return 'MAIN_NET'
}

function generateModule(moduleByteCode: MoveModuleBytecode, network: AptosNetwork) {
  if (!moduleByteCode.abi) {
    return ''
  }
  const module = moduleByteCode.abi

  const functions = module.exposed_functions.map((f) => generateOnEntryFunctions(module, f)).filter((s) => s !== '')

  const eventStructs = getEventStructs(module)
  const eventTypes = new Set(eventStructs.keys())
  const events = Array.from(eventStructs.values())
    .map((e) => generateOnEvents(module, e))
    .filter((s) => s !== '')
  const structs = module.structs.map((s) => generateStructs(module, s, eventTypes))
  const callArgs = module.exposed_functions.map((f) => generateCallArgsStructs(module, f))

  let processor = ''
  if (functions.length > 0 || events.length > 0) {
    processor = `export class ${module.name} extends AptosBaseProcessor {

    constructor(options: AptosBindOptions) {
      super("${module.name}", options)
    }
    static DEFAULT_OPTIONS: AptosBindOptions = {
      address: "${module.address}",
      network: AptosNetwork.${generateNetworkOption(network)}       
    }

    static bind(options: Partial<AptosBindOptions> = {}): ${module.name} {
      return new ${module.name}({ ...${module.name}.DEFAULT_OPTIONS, ...options })
    }
    
    ${functions.join('\n')}
    
    ${events.join('\n')}
    
    loadTypesInternal(registry: TypeRegistry) {
      loadAllTypes(registry)
    }
  }
  `
  }

  return `
  ${processor}

  export namespace ${module.name} {
    ${structs.join('\n')}
    
    ${callArgs.join('\n')}
       
    export function loadTypes(_r: TypeRegistry) {
      loadAllTypes(_r)
    }
    export const ABI: MoveModule = JSON.parse('${JSON.stringify(module)}')
 }
  `
}

function generateStructs(module: MoveModule, struct: MoveStruct, events: Set<string>) {
  const genericString = generateStructTypeParameters(struct)
  const genericStringAny = generateStructTypeParameters(struct, true)

  const fields = struct.fields.map((field) => {
    return `${field.name}: ${generateType(field.type, module.address)}`
  })

  let eventPayload = ''
  if (events.has(moduleQname(module) + SPLITTER + struct.name)) {
    eventPayload = `
    export interface ${struct.name}Instance extends 
        TypedEventInstance<${struct.name}${genericStringAny}> {
      data_typed: ${struct.name}${genericStringAny}
      type_arguments: [${struct.generic_type_params.map((_) => 'string').join(', ')}]
    }
    `
  }

  return `
  export class ${struct.name}${genericString} {
    static TYPE_QNAME = '${module.address}::${module.name}::${struct.name}'
    ${fields.join('\n')} 
  }
  
  ${eventPayload}
  `
}

function generateFunctionTypeParameters(func: MoveFunction) {
  let genericString = ''
  if (func.generic_type_params && func.generic_type_params.length > 0) {
    const params = func.generic_type_params
      .map((v, idx) => {
        return `T${idx}=any`
      })
      .join(',')
    genericString = `<${params}>`
  }
  return genericString
}

function generateStructTypeParameters(struct: MoveStruct, useAny = false) {
  let genericString = ''

  if (struct.generic_type_params && struct.generic_type_params.length > 0) {
    const params = struct.generic_type_params
      .map((v, idx) => {
        return useAny ? 'any' : 'T' + idx
      })
      .join(',')
    genericString = `<${params}>`
  }
  return genericString
}

function generateCallArgsStructs(module: MoveModule, func: MoveFunction) {
  if (!func.is_entry) {
    return
  }

  const fields = getMeaningfulFunctionParams(func).map((param) => {
    return `${generateType(param, module.address)}`
  })

  const camelFuncName = capitalizeFirstChar(camelize(func.name))

  const genericString = generateFunctionTypeParameters(func)
  return `
  export interface ${camelFuncName}Payload${genericString}
      extends TypedEntryFunctionPayload<[${fields.join(',')}]> {
    arguments_typed: [${fields.join(',')}],
    type_arguments: [${func.generic_type_params.map((_) => 'string').join(', ')}]
  }
  `
}

function generateOnEntryFunctions(module: MoveModule, func: MoveFunction) {
  if (!func.is_entry) {
    return ''
  }

  // const genericString = generateFunctionTypeParameters(func)

  const camelFuncName = capitalizeFirstChar(camelize(func.name))
  const source = `
  onEntry${camelFuncName}(func: (call: ${module.name}.${camelFuncName}Payload, ctx: AptosContext) => void, filter?: CallFilter, fetchConfig?: AptosFetchConfig): ${module.name} {
    this.onEntryFunctionCall(func, {
      ...filter,
      function: '${module.name}::${func.name}'
    },
    fetchConfig)
    return this
  }`

  return source
}

function getEventStructs(module: MoveModule) {
  const qname = moduleQname(module)
  const structMap = new Map<string, MoveStruct>()
  const eventMap = new Map<string, MoveStruct>()

  for (const struct of module.structs) {
    structMap.set(qname + SPLITTER + struct.name, struct)
  }

  for (const struct of module.structs) {
    for (const field of struct.fields) {
      const t = parseMoveType(field.type)
      if (t.qname === '0x1::event::EventHandle') {
        const event = t.typeArgs[0].qname
        const eventStruct = structMap.get(event)
        if (eventStruct) {
          eventMap.set(event, eventStruct)
        }
      }
    }
  }

  return eventMap
}

function generateOnEvents(module: MoveModule, struct: MoveStruct): string {
  // for struct that has drop + store
  // if (!isEvent(struct, module)) {
  //   return ''
  // }

  // const genericString = generateStructTypeParameters(struct)

  const source = `
  onEvent${struct.name}(func: (event: ${module.name}.${struct.name}Instance, ctx: AptosContext) => void, fetchConfig?: AptosFetchConfig): ${module.name} {
    this.onEvent(func, {
      type: '${module.name}::${struct.name}'
    },
    fetchConfig)
    return this
  }
  `
  return source
}

function camelize(input: string): string {
  return input
    .split('_')
    .reduce(
      (res, word, i) =>
        i === 0 ? word.toLowerCase() : `${res}${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
      ''
    )
}

function capitalizeFirstChar(input: string): string {
  if (!input) {
    return input
  }
  return input[0].toUpperCase() + (input.length > 1 ? input.substring(1) : '')
}
