import { EventDeclaration, getFullSignatureAsSymbolForEvent } from 'typechain'
import { getFullSignatureForEventPatched } from './types.js'
import { generateEventInputs } from '@sentio/ethers-v6/dist/codegen/events.js'

export function generateEventHandler(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  const eventName = includeArgTypes ? getFullSignatureAsSymbolForEvent(event) : event.name
  const eventNamePrefix = includeArgTypes ? eventName + '_' : eventName

  const filterName = getFullSignatureForEventPatched(event)
  return `
  onEvent${eventName}(
    handler: (event: ${eventNamePrefix}Event, ctx: ${contractName}Context) => void,
    filter?: ${eventNamePrefix}EventFilter | ${eventNamePrefix}EventFilter[],
    handlerOptions?: HandlerOptions<EthFetchConfig, ${eventNamePrefix}Event>,
    preprocessHandler?: (event: ${eventNamePrefix}Event, ctx: ${contractName}Context, preprocessStore: {[k: string]: any}) => Promise<PreprocessResult>
  ): this {
    if (!filter) {
      filter = templateContract.filters['${filterName}'](${event.inputs.map(() => 'null').join(',')})
    }
    return super.onEthEvent(handler, filter!, handlerOptions, preprocessHandler)
  }
  `
}

export function generateEventHandlers(events: EventDeclaration[], contractName: string): string {
  if (events.length === 1) {
    return generateEventHandler(events[0], contractName, false)
  } else {
    return events.map((e) => generateEventHandler(e, contractName, true)).join('\n')
  }
}

function generateEventFilter(event: EventDeclaration, includeArgTypes: boolean): string {
  const eventName = includeArgTypes ? getFullSignatureAsSymbolForEvent(event) : event.name
  const eventNamePrefix = includeArgTypes ? eventName + '_' : eventName

  const filterName = getFullSignatureForEventPatched(event)
  return `
    ${eventNamePrefix}(${generateEventInputs(event.inputs)}): ${eventNamePrefix}EventFilter { return templateContract.filters['${filterName}'](${event.inputs
      .map((i, idx) => i.name || `arg${idx}`)
      .join(',')}) }
  `
}

export function generateEventFilters(events: EventDeclaration[]): string[] {
  if (events.length === 1) {
    return [generateEventFilter(events[0], false)]
  } else {
    return events.map((e) => generateEventFilter(e, true))
  }
}
