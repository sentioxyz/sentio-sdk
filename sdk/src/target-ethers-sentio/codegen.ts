import {
  Contract,
  createImportsForUsedIdentifiers,
  EventDeclaration,
  FunctionDeclaration,
  getFullSignatureAsSymbolForEvent,
} from 'typechain'

import { reservedKeywords } from '@typechain/ethers-v5/dist/codegen/reserved-keywords'
import { generateInputTypes, generateOutputTypes } from '@typechain/ethers-v5/dist/codegen/types'
import { getFullSignatureForEvent } from 'typechain/dist/utils/signatures'
import { codegenCallTraceTypes, codegenFunctions } from './functions'
import { EvmType } from 'typechain/dist/parser/parseEvmType'

export function codeGenIndex(contract: Contract): string {
  return ` 
  export * from '../internal/${contract.name.toLowerCase()}_processor'
  export * from '../internal/${contract.name}'
  `
}

export function codeGenSentioFile(contract: Contract): string {
  const source = `
  ${Object.values(contract.functions).map(codegenCallTraceTypes).join('\n')}

  const templateContract = ${contract.name}__factory.connect("", DummyProvider)

  export class ${contract.name}ContractView extends ContractView<${contract.name}> {
    constructor (contract: ${contract.name}) {
      super(contract);
    }

    ${Object.values(contract.functions)
      .filter((f) => !reservedKeywords.has(f[0].name))
      .flatMap((v) => v.filter((f) => f.stateMutability == 'view').map(generateViewFunction))
      .join('\n')}
  }
  
  export class ${contract.name}BoundContractView extends BoundContractView<${contract.name}, ${
    contract.name
  }ContractView> {
    // constructor (contract: ${contract.name}) {
    //   super(contract);
    // }

    ${Object.values(contract.functions)
      .filter((f) => !reservedKeywords.has(f[0].name))
      .flatMap((v) => v.filter((f) => f.stateMutability == 'view').map(generateBoundViewFunction))
      .join('\n')}
  }

  export type ${contract.name}Context = ContractContext<${contract.name}, ${contract.name}BoundContractView>

  export class ${contract.name}ProcessorTemplate extends BaseProcessorTemplate<${contract.name}, ${
    contract.name
  }BoundContractView> {
    bindInternal(options: BindOptions) {
      if (!options.name) {
        options.name = "${contract.name}"
      }
      let processor = getProcessor(options) as ${contract.name}Processor
      if (!processor) {
        processor = new ${contract.name}Processor(options)
        addProcessor(options, processor)
      }
      return processor
    }

    ${Object.values(contract.events)
      .map((events) => {
        if (events.length === 1) {
          return generateOnEventFunction(events[0], contract.name, false)
        } else {
          return events.map((e) => generateOnEventFunction(e, contract.name, true)).join('\n')
        }
      })
      .join('\n')}
    
    ${Object.values(contract.functions)
      .map((f) => codegenFunctions(f, contract.name))
      .join('\n')}
    }

    export class ${contract.name}Processor extends BaseProcessor<${contract.name}, ${contract.name}BoundContractView> {
      ${Object.values(contract.events)
        .map((events) => {
          if (events.length === 1) {
            return generateOnEventFunction(events[0], contract.name, false)
          } else {
            return events.map((e) => generateOnEventFunction(e, contract.name, true)).join('\n')
          }
        })
        .join('\n')}

      ${Object.values(contract.functions)
        .map((f) => codegenFunctions(f, contract.name))
        .join('\n')}

    public static filters = templateContract.filters
    
    protected CreateBoundContractView(): ${contract.name}BoundContractView {
      const view = get${contract.name}Contract(this.config.address, this.config.network)
      return new ${contract.name}BoundContractView(view)
    }

    public static bind(options: BindOptions): ${contract.name}Processor {
       if (!options.name) {
        options.name = "${contract.name}"
      }
      let processor = getProcessor(options) as ${contract.name}Processor
      if (!processor) {
        processor = new ${contract.name}Processor(options)
        addProcessor(options, processor)
      }
      return processor
    }
  }

  export function get${contract.name}Contract(address: string, network: Networkish = 1): ${contract.name}ContractView {
    let contract = getContractByABI("${contract.name}", address, network) as ${contract.name}ContractView
    if (!contract) {
      const rawContract = ${contract.name}__factory.connect(address, getProvider(network))
      contract = new ${contract.name}ContractView(rawContract)
      addContractByABI("${contract.name}", address, network, contract)
    }
    return contract
  }
  `
  const eventsImports = Object.values(contract.events).flatMap((events) => {
    if (events.length === 1) {
      return [`${events[0].name}Event`, `${events[0].name}EventFilter`]
    } else {
      return events.flatMap((e) => [
        `${getFullSignatureAsSymbolForEvent(e)}_Event`,
        `${getFullSignatureAsSymbolForEvent(e)}_EventFilter`,
      ])
    }
  })

  const structImports = Object.values(contract.structs).flatMap((structs) => {
    return structs.flatMap((s) => {
      if (!s.structName) {
        return []
      }
      if (s.structName.namespace) {
        return [s.structName.namespace]
      } else {
        return [s.structName.identifier + 'StructOutput', s.structName.identifier + 'Struct']
      }
    })
  })
  // dedup namespace
  const uniqueStructImports = [...new Set(structImports)]

  const imports = createImportsForUsedIdentifiers(
    {
      ethers: ['BigNumber', 'BigNumberish', 'CallOverrides', 'BytesLike'],
      '@ethersproject/providers': ['Networkish'],
      '@sentio/sdk': [
        'addContractByABI',
        'getContractByABI',
        'addProcessor',
        'getProcessor',
        'getProvider',
        'transformEtherError',
        'BindOptions',
        'BaseProcessor',
        'BaseProcessorTemplate',
        'BoundContractView',
        'ContractContext',
        'ContractView',
        'DummyProvider',
        'getContractName',
        'TypedCallTrace',
      ],
      './common': ['PromiseOrValue'],
      './index': [`${contract.name}`, `${contract.name}__factory`],
      [`./${contract.name}`]: eventsImports.concat(uniqueStructImports),
    },
    source
  )

  return imports + source
}

export function codeGenTestUtilsFile(contract: Contract): string {
  const source = `
  const mockField = {
    blockHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    blockNumber: 0,
    logIndex: 0,
    removed: false,
    transactionHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionIndex: 0,
  }
  ${Object.values(contract.events)
    .map((events) => {
      if (events.length === 1) {
        return generateMockEventLogFunction(events[0], contract.name, false)
      } else {
        return events.map((e) => generateMockEventLogFunction(e, contract.name, true)).join('\n')
      }
    })
    .join('\n')}
  `

  const imports = createImportsForUsedIdentifiers(
    {
      '@ethersproject/providers': ['Log'],
      '.': [
        `get${contract.name}Contract`,
        ...Object.values(contract.events).flatMap((events) => {
          if (events.length === 1) {
            return `${events[0].name}EventObject`
          } else {
            return events.flatMap((e) => `${getFullSignatureAsSymbolForEvent(e)}_EventObject`)
          }
        }),
      ],
    },
    source
  )

  return imports + source
}

function formatType(type: EvmType): string {
  if (type.type === 'array') {
    return formatType(type.itemType) + '[]'
  } else if (type.type === 'tuple') {
    return '(' + type.components.map((s) => formatType(s.type)).join(',') + ')'
  } else {
    return type.originalType
  }
}

// TODO contribute upstream
function getFullSignatureForEventPatched(event: EventDeclaration): string {
  return `${event.name}(${event.inputs
    .map((e) => {
      return formatType(e.type)
    })
    .join(',')})`
}

function generateOnEventFunction(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  let eventName = event.name
  if (includeArgTypes) {
    eventName = getFullSignatureAsSymbolForEvent(event) + '_'
  }

  const filterName = getFullSignatureForEventPatched(event)
  return `
  onEvent${eventName}(
    handler: (event: ${eventName}Event, ctx: ${contractName}Context) => void,
    filter?: ${eventName}EventFilter | ${eventName}EventFilter[]
  ) {
    if (!filter) {
      // @ts-ignore
      filter = ${contractName}Processor.filters['${filterName}'](${event.inputs.map(() => 'null').join(',')})
    }
    return super.onEvent(handler, filter!)
  }
  `
}

// https://github.com/dethcrypto/TypeChain/blob/015abb28bd22826611051f27e0ec96a00f9a0b61/packages/target-ethers-v5/src/codegen/functions.ts#L54
function generateReturnTypes(fn: FunctionDeclaration) {
  // sounds like returnResultObject should be true but we need to set false to make it work
  return `Promise<${generateOutputTypes({ returnResultObject: false, useStructs: true }, fn.outputs)}>`
}

function generateViewFunction(func: FunctionDeclaration): string {
  return `
  async ${func.name}(${generateInputTypes(func.inputs, {
    useStructs: true,
  })}overrides?: CallOverrides): ${generateReturnTypes(func)} {
    try {
      if (overrides) {
        return await this.contract.${func.name}(${
    func.inputs.length > 0 ? func.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  } overrides)
      } else {
        return await this.contract.${func.name}(${func.inputs
    .map((input, index) => input.name || `arg${index}`)
    .join(',')})
      }
    } catch (e) {
      throw transformEtherError(e, undefined)
    }
  }
  `
}

function generateBoundViewFunction(func: FunctionDeclaration): string {
  return `
  async ${func.name}(${generateInputTypes(func.inputs, {
    useStructs: true,
  })}overrides?: CallOverrides): ${generateReturnTypes(func)} {
    try {
      if (!overrides && this.context) {
        overrides = {
          blockTag: this.context.blockNumber.toNumber(),
        }
      }
      if (overrides) {
        return await this.view.${func.name}(${
    func.inputs.length > 0 ? func.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  } overrides)
      } else {
        return await this.view.${func.name}(${func.inputs.map((input, index) => input.name || `arg${index}`).join(',')})
      }
    } catch (e) {
      throw transformEtherError(e, this.context)
    }
  }
  `
}

function generateMockEventLogFunction(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  let eventName = event.name
  let eventNameWithSignature = event.name
  if (includeArgTypes) {
    eventName = getFullSignatureAsSymbolForEvent(event) + '_'
    eventNameWithSignature = getFullSignatureForEvent(event)
  }

  const eventArgs = event.inputs.map((input, i) => `event.${input.name ?? `arg${i.toString()}`}`)

  return `
    export function mock${eventName}Log(contractAddress: string, event: ${eventName}EventObject): Log {
      const contract = get${contractName}Contract(contractAddress)
      const encodedLog = contract.rawContract.interface.encodeEventLog(
        contract.rawContract.interface.getEvent('${eventNameWithSignature}'),
        [${eventArgs.join(', ')}]
      )
      return {
        ...mockField,
        address: contractAddress,
        data: encodedLog.data,
        topics: encodedLog.topics,
      }
    }
  `
}
