import {
  Contract,
  createImportsForUsedIdentifiers,
  EventDeclaration,
  getFullSignatureAsSymbolForEvent,
} from 'typechain'

import { reservedKeywords } from '@typechain/ethers-v5/dist/codegen/reserved-keywords'
import { getFullSignatureForEvent } from 'typechain/dist/utils/signatures'
import { codegenCallTraceTypes, generateCallHandlers } from './functions-handler'
import { generateEventHandlers } from './event-handler'
import { generateBoundViewFunctions, generateViewFunctions } from './view-function'

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
      .map((fs) => generateViewFunctions(fs))
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
      .map((fs) => generateBoundViewFunctions(fs))
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
      .map((events) => generateEventHandlers(events, contract.name))
      .join('\n')}
    
    ${Object.values(contract.functions)
      .map((functions) => {
        generateCallHandlers(functions, contract.name)
      })
      .join('\n')}
    }

    export class ${contract.name}Processor extends BaseProcessor<${contract.name}, ${contract.name}BoundContractView> {
      ${Object.values(contract.events)
        .map((events) => generateEventHandlers(events, contract.name))
        .join('\n')}

      ${Object.values(contract.functions)
        .map((f) => generateCallHandlers(f, contract.name))
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
        'TypedCallTrace',
        'toBlockTag',
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
