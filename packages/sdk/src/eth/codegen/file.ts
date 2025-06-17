import {
  Contract,
  createImportsForUsedIdentifiers,
  EventDeclaration,
  getFullSignatureAsSymbolForEvent,
  getFullSignatureForEvent
} from 'typechain'

import { reservedKeywords } from '@sentio/ethers-v6/dist/codegen/reserved-keywords.js'
import { codegenCallTraceTypes, generateCallHandlers } from './functions-handler.js'
import { generateEventFilters, generateEventHandlers } from './event-handler.js'
import {
  generateBoundFunctionCallEncoders,
  generateBoundViewFunctions,
  generateFunctionCallEncoders,
  generateViewFunctions
} from './function-calls.js'

export function codeGenIndex(contract: Contract): string {
  return ` 
  export * from './internal/${contract.name.toLowerCase()}-processor.js'
  export * from './internal/${contract.name.toLowerCase()}-test-utils.js'
  export * from './internal/${contract.name}.js'
  export * from './internal/factories/${contract.name}__factory.js'
  `
}

export function codeGenSentioFile(contract: Contract): string {
  const source = `
  ${Object.values(contract.functions).map(codegenCallTraceTypes).join('\n')}

  const templateContract = ${contract.name}__factory.connect("0x0", DummyProvider)
  
  export class ${contract.name}ContractView extends ContractView<${contract.name}> {
    constructor (contract: ${contract.name}) {
      super(contract);
      this.callStatic.contract = contract;
    }

    ${Object.values(contract.functions)
      .filter((f) => !reservedKeywords.has(f[0].name))
      .flatMap((fs) => generateViewFunctions(true, fs))
      .join('\n')}
    
    callStatic = {
      contract: this.contract,
      ${Object.values(contract.functions)
        .filter((f) => !reservedKeywords.has(f[0].name))
        .flatMap((fs) => generateViewFunctions(false, fs))
        .join(',\n')}
    }
    
    encodeCall = {
      ${Object.values(contract.functions)
        .filter((f) => !reservedKeywords.has(f[0].name))
        .flatMap((fs) => generateFunctionCallEncoders(fs))
        .join(',\n')}
    }
  }
  
  export class ${contract.name}BoundContractView extends BoundContractView<${contract.name}, 
    ${contract.name}ContractView> {
  ${Object.values(contract.functions)
    .filter((f) => !reservedKeywords.has(f[0].name))
    .flatMap((fs) => generateBoundViewFunctions(true, fs))
    .join('\n')}
  
    callStatic = {
      view: this.view,
      context: this.context,
      ${Object.values(contract.functions)
        .filter((f) => !reservedKeywords.has(f[0].name))
        .flatMap((fs) => generateBoundViewFunctions(false, fs))
        .join(',\n')}
    }
    
    encodeCall = {
      view: this.view,
      context: this.context,
      ${Object.values(contract.functions)
        .filter((f) => !reservedKeywords.has(f[0].name))
        .flatMap((fs) => generateBoundFunctionCallEncoders(fs))
        .join(',\n')}
    }
  }

  export type ${contract.name}Context = ContractContext<${contract.name}, ${contract.name}BoundContractView>

  export class ${contract.name}Processor extends BaseProcessor<${contract.name}, ${contract.name}BoundContractView> {
    ${Object.values(contract.events)
      .map((events) => generateEventHandlers(events, contract.name))
      .join('\n')}

    ${Object.values(contract.functions)
      .map((f) => generateCallHandlers(f, contract.name))
      .join('\n')}

  public static filters = {
    ${Object.values(contract.events)
      .map((events) => generateEventFilters(events))
      .join(',')}
  }
  
  protected CreateBoundContractView(): ${contract.name}BoundContractView {
    const view = get${contract.name}Contract(this.config.network, this.config.address)
    return new ${contract.name}BoundContractView(this.config.address, view)
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

  export function get${contract.name}Contract(chainId: EthChainId, address: string): ${contract.name}ContractView {
    let contract = getContractByABI("${contract.name}", address, chainId) as ${contract.name}ContractView
    if (!contract) {
      const rawContract = ${contract.name}__factory.connect(address, getProvider(chainId))
      contract = new ${contract.name}ContractView(rawContract)
      addContractByABI("${contract.name}", address, chainId, contract)
    }
    return contract
  }
  
  export function get${contract.name}ContractOnContext(context: EthContext, address: string): 
    ${contract.name}BoundContractView {
    const view = get${contract.name}Contract(context.getChainId(), address)
    const boundView = new ${contract.name}BoundContractView(address, view) 
    boundView.context = context;
    if (boundView.callStatic) {
      boundView.callStatic.context = context;
    }
    return boundView;
  }
  `
  const eventsImports = Object.values(contract.events).flatMap((events) => {
    if (events.length === 1) {
      return [`${events[0].name}Event`, `${events[0].name}EventFilter`]
    } else {
      return events.flatMap((e) => [
        `${getFullSignatureAsSymbolForEvent(e)}_Event`,
        `${getFullSignatureAsSymbolForEvent(e)}_EventFilter`
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
      ethers: ['BigNumberish', 'Overrides', 'BytesLike', 'Interface'],
      // 'ethers/providers': ['Networkish'],
      '@sentio/sdk': ['HandlerOptions'],
      '@sentio/sdk/eth': [
        'addContractByABI',
        'getContractByABI',
        'addProcessor',
        'getProcessor',
        'getProvider',
        'transformEtherError',
        'defaultPreprocessHandler',
        'Trace',
        'BindOptions',
        'BaseProcessor',
        'BaseProcessorTemplate',
        'BoundContractView',
        'ContractContext',
        'ContractView',
        'DummyProvider',
        'EthChainId',
        'TypedCallTrace',
        'EthContext',
        'EthFetchConfig',
        'PreprocessResult',
        'makeEthCallKey',
        'encodeCallData'
      ],
      // '@sentio/sdk/eth': ['BaseContext'],
      // '@sentio/protos': ['EthFetchConfig'],
      '@sentio/protos': ['EthCallParam', 'EthCallContext', 'PreparedData'],
      './common.js': ['PromiseOrValue'],
      './index.js': [`${contract.name}__factory`],
      [`./${contract.name}.js`]: [`${contract.name}`, ...eventsImports, ...uniqueStructImports]
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

  const possibleImports = {
    'ethers/providers': ['LogParams'],
    '@sentio/sdk/eth': ['EthChainId']
  } as any
  possibleImports[`./${contract.name}.js`] = Object.values(contract.events).flatMap((events) => {
    if (events.length === 1) {
      return `${events[0].name}EventObject`
    } else {
      return events.flatMap((e) => `${getFullSignatureAsSymbolForEvent(e)}_EventObject`)
    }
  })

  possibleImports[`./${contract.name.toLowerCase()}-processor.js`] = [`get${contract.name}Contract`]

  const imports = createImportsForUsedIdentifiers(possibleImports, source)

  return imports + source
}

function generateMockEventLogFunction(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  let eventName = event.name
  if (includeArgTypes) {
    eventName = getFullSignatureAsSymbolForEvent(event) + '_'
  }

  const eventArgs = event.inputs.map((input, i) => `event.${input.name ?? `arg${i.toString()}`}`)

  return `
    export function mock${eventName}Log(contractAddress: string, event: ${eventName}EventObject): LogParams {
      const contract = get${contractName}Contract(EthChainId.ETHEREUM, contractAddress)
      const encodedLog = contract.rawContract.interface.encodeEventLog(
        '${getFullSignatureForEvent(event)}',
        [${eventArgs.join(', ')}]
      )
      return {
        ...mockField,
        index: 0,
        address: contractAddress,
        data: encodedLog.data,
        topics: encodedLog.topics,
      }
    }
  `
}
