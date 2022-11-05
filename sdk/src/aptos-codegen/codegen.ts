import fs from 'fs'
import path from 'path'
import prettier from 'prettier'
import { MoveFunction, MoveModule, MoveModuleBytecode, MoveStruct } from 'aptos-sdk/src/generated'
import { AccountModulesImportInfo, AccountRegister, generateType } from './typegen'
import { isFrameworkAccount } from '../aptos/utils'
import chalk from 'chalk'
import { AptosNetwork, getChainName, getRpcClient } from '../aptos/network'

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
      console.log(`download depended module for account ${account} at ${getChainName(network)}`)

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
    const content = prettier.format(output.fileContent, { parser: 'typescript' })
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
    import { aptos } from "@sentio/sdk"
    import { Address, MoveModule } from "aptos-sdk/src/generated"
    `

    const dependedAccounts: string[] = []

    const moduleImports: string[] = []

    const info = this.loader.accountImports.get(address)

    if (info) {
      for (const [account, moduleImported] of info.imports.entries()) {
        // Remap to user's filename if possible, TODO codepath not well tested
        let tsAccountModule = './' + (this.loader.accountImports.get(account)?.moduleName || account)
        if (isFrameworkAccount(account) && !isFrameworkAccount(address)) {
          // Decide where to find runtime library
          let srcRoot = 'lib'
          if (__dirname.includes('sdk/src/aptos-codegen')) {
            srcRoot = 'src'
          }
          tsAccountModule = `@sentio/sdk/${srcRoot}/builtin/aptos/${account}`
        }
        const items = Array.from(moduleImported)
        moduleImports.push(`import { ${items.join(',')} } from "${tsAccountModule}"`)

        // Ideally we should use per module's load types, but it doesn't matter since we are loading the entire
        // account modules anyway
        items.forEach((m) => dependedAccounts.push(m))
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
    
    function loadAllTypes(registry: aptos.TypeRegistry) {
      ${dependedAccounts.map((m) => `${m}.loadTypes(registry)`).join('\n')}

      ${this.modules
        .map((m) => {
          return `registry.load(${m.abi?.name}.ABI)`
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
  const events = module.structs.map((e) => generateOnEvents(module, e)).filter((s) => s !== '')
  const structs = module.structs.map((s) => generateStructs(module, s))
  const callArgs = module.exposed_functions.map((f) => generateCallArgsStructs(module, f))

  let processor = ''
  if (functions.length > 0 || events.length > 0) {
    processor = `export class ${module.name} extends aptos.AptosBaseProcessor {

    constructor(options: aptos.AptosBindOptions) {
      super("${module.name}", options)
    }
    static DEFAULT_OPTIONS: aptos.AptosBindOptions = {
      address: "${module.address}",
      network: aptos.AptosNetwork.${generateNetworkOption(network)}       
    }

    static bind(options: Partial<aptos.AptosBindOptions> = {}): ${module.name} {
      return new ${module.name}({ ...${module.name}.DEFAULT_OPTIONS, ...options })
    }
    
    ${functions.join('\n')}
    
    ${events.join('\n')}
    
    loadTypesInternal(registry: aptos.TypeRegistry) {
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
       
    export function loadTypes(registry: aptos.TypeRegistry) {
      loadAllTypes(registry)
    }
    export const ABI: MoveModule = JSON.parse('${JSON.stringify(module)}')
 }
  `
}

function generateStructs(module: MoveModule, struct: MoveStruct) {
  const genericString = generateStructTypeParameters(struct)
  const genericStringAny = generateStructTypeParameters(struct, true)

  const fields = struct.fields.map((field) => {
    return `${field.name}: ${generateType(field.type)}`
  })

  let eventPayload = ''
  if (isEvent(struct)) {
    eventPayload = `
    export interface ${struct.name}Instance extends 
        aptos.TypedEventInstance<${struct.name}${genericStringAny}> {
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

// function generateFunctionTypeParameters(func: MoveFunction) {
//   let genericString = ''
//   if (func.generic_type_params && func.generic_type_params.length > 0) {
//     const params = func.generic_type_params
//       .map((v, idx) => {
//         return 'T' + idx
//       })
//       .join(',')
//     genericString = `<${params}>`
//   }
//   return genericString
// }

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

  // the first param is always signer so ignore
  // TODO check if there is any edge case
  const fields = func.params.slice(1).map((param) => {
    return `${generateType(param)}`
  })

  const camelFuncName = capitalizeFirstChar(camelize(func.name))

  // const genericString = generateFunctionTypeParameters(func)
  return `
  export interface ${camelFuncName}Payload
      extends aptos.TypedEntryFunctionPayload<[${fields.join(',')}]> {
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
  onEntry${camelFuncName}(func: (call: ${module.name}.${camelFuncName}Payload, ctx: aptos.AptosContext) => void, filter?: aptos.CallFilter): ${module.name} {
    this.onEntryFunctionCall(func, {
      ...filter,
      function: '${module.name}::${func.name}'
    })
    return this
  }`

  return source
}

function isEvent(struct: MoveStruct) {
  return struct.abilities.includes('drop') && struct.abilities.includes('store') && struct.name.endsWith('Event')
}

function generateOnEvents(module: MoveModule, struct: MoveStruct): string {
  // for struct that has drop + store
  if (!isEvent(struct)) {
    return ''
  }

  // const genericString = generateStructTypeParameters(struct)

  const source = `
  onEvent${struct.name}(func: (event: ${module.name}.${struct.name}Instance, ctx: aptos.AptosContext) => void): ${module.name} {
    this.onEvent(func, {
      type: '${module.name}::${struct.name}'
    })
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
        i === 0 ? word.toLowerCase() : `${res}${word.charAt(0).toUpperCase()}${word.substr(1).toLowerCase()}`,
      ''
    )
}

function capitalizeFirstChar(input: string): string {
  if (!input) {
    return input
  }
  return input[0].toUpperCase() + (input.length > 1 ? input.substring(1) : '')
}
