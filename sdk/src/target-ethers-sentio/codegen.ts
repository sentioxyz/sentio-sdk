import {
  Contract,
  createImportsForUsedIdentifiers,
  EventDeclaration,
  FunctionDeclaration,
  getFullSignatureAsSymbolForEvent,
} from 'typechain'

import { reservedKeywords } from '@typechain/ethers-v5/dist/codegen/reserved-keywords'
import { generateInputTypes } from '@typechain/ethers-v5/dist/codegen/types'
import { getFullSignatureForEvent } from 'typechain/dist/utils/signatures'

export function codeGenSentioFile(contract: Contract): string {
  const source = `
  const templateContract = ${contract.name}__factory.connect("", DummyProvider)

  class ${contract.name}ContractWrapper extends ContractWrapper<${contract.name}> {

    constructor (contract: ${contract.name}) {
      super(contract);
    }

    ${Object.values(contract.functions)
      .filter((f) => !reservedKeywords.has(f[0].name))
      .flatMap((v) => v.filter((f) => f.stateMutability == 'view').map(generateViewFunction))
      .join('\n')}
  }

  export type ${contract.name}Context = Context<${contract.name}, ${contract.name}ContractWrapper>

  export class ${contract.name}ProcessorTemplate extends BaseProcessorTemplate<${contract.name}, ${
    contract.name
  }ContractWrapper> {
    bindInternal(options: BindOptions) {
      let processor = getProcessor("${contract.name}", options) as ${contract.name}Processor
      if (!processor) {
        const wrapper = get${contract.name}Contract(options.address, options.network)
        const finalOptions = Object.assign({}, options)
        finalOptions.name = getContractName("${contract.name}", options.name, options.address, options.network)
        processor = new ${contract.name}Processor(finalOptions, wrapper)
        addProcessor("${contract.name}", options, processor)
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
    }
  
    export class ${contract.name}Processor extends BaseProcessor<${contract.name}, ${contract.name}ContractWrapper> {
      ${Object.values(contract.events)
        .map((events) => {
          if (events.length === 1) {
            return generateOnEventFunction(events[0], contract.name, false)
          } else {
            return events.map((e) => generateOnEventFunction(e, contract.name, true)).join('\n')
          }
        })
        .join('\n')}
    
    public static filters = templateContract.filters
    
    public static bind(options: BindOptions): ${contract.name}Processor {
      let processor = getProcessor("${contract.name}", options) as ${contract.name}Processor
      if (!processor) {
        const wrapper = get${contract.name}Contract(options.address, options.network)
  
        const finalOptions = Object.assign({}, options)
        finalOptions.name = getContractName("${contract.name}", options.name, options.address, options.network)
        processor = new ${contract.name}Processor(finalOptions, wrapper)
        addProcessor("${contract.name}", options, processor)
      }
      return processor
    }
  }
  
  export function get${contract.name}Contract(address: string, network: Networkish = 1): ${
    contract.name
  }ContractWrapper {
    let contract = getContractByABI("${contract.name}", address, network) as ${contract.name}ContractWrapper
    if (!contract) {
      const rawContract = ${contract.name}__factory.connect(address, getProvider(network))
      contract = new ${contract.name}ContractWrapper(rawContract)
      addContractByABI("${contract.name}", address, network, contract)
    }
    return contract
  }
  
  // export const ${contract.name}Processor = new ${contract.name}ProcessorTemplate("${contract.name}")
  `

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
        'Context',
        'ContractWrapper',
        'DummyProvider',
        'getContractName',
      ],
      './common': ['PromiseOrValue'],
      './index': [`${contract.name}`, `${contract.name}__factory`],
      [`./${contract.name}`]: (<string[]>[]).concat(
        ...Object.values(contract.events).map((events) => {
          if (events.length === 1) {
            return [`${events[0].name}Event`, `${events[0].name}EventFilter`]
          } else {
            return events.flatMap((e) => [
              `${getFullSignatureAsSymbolForEvent(e)}_Event`,
              `${getFullSignatureAsSymbolForEvent(e)}_EventFilter`,
            ])
          }
        })
      ),
    },
    source
  )

  return imports + source
}

function generateOnEventFunction(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  let eventName = event.name
  if (includeArgTypes) {
    eventName = getFullSignatureAsSymbolForEvent(event) + '_'
  }

  const filterName = getFullSignatureForEvent(event)

  return `
  on${eventName}(
    handler: (event: ${eventName}Event, ctx: ${contractName}Context) => void,
    filter?: ${eventName}EventFilter | ${eventName}EventFilter[]
  ) {
    if (!filter) {
      filter = ${contractName}Processor.filters['${filterName}'](${event.inputs.map(() => 'null').join(',')})
    }
    return super.onEvent(handler, filter)
  }
  `
}

function generateViewFunction(func: FunctionDeclaration): string {
  return `
  async ${func.name}(${generateInputTypes(func.inputs, { useStructs: true })}overrides?: CallOverrides) {
    try {
      if (!overrides) {
        overrides = {
          blockTag: this.context.blockNumber.toNumber(),
        }
      }
      return await this.contract.${func.name}(${
    func.inputs.length > 0 ? func.inputs.map((input, index) => input.name || `arg${index}`).join(',') + ',' : ''
  } overrides)
    } catch (e) {
      throw transformEtherError(e, this.context)
    }
  }
  `
}
