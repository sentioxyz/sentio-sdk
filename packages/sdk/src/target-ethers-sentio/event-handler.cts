import { EventDeclaration, Contract, getFullSignatureAsSymbolForEvent } from 'typechain'
import { getFullSignatureForEventPatched } from './types.cjs'
import { generateEventInputs } from '@sentio/ethers-v6/dist/codegen/events'

export function generateEventHandler(event: EventDeclaration, contractName: string, includeArgTypes: boolean): string {
  const eventName = includeArgTypes ? getFullSignatureAsSymbolForEvent(event) : event.name
  const eventNamePrefix = includeArgTypes ? eventName + '_' : eventName

  const filterName = getFullSignatureForEventPatched(event)
  return `
  onEvent${eventName}(
    handler: (event: ${eventNamePrefix}Event, ctx: ${contractName}Context) => void,
    filter?: ${eventNamePrefix}EventFilter | ${eventNamePrefix}EventFilter[],
    fetchConfig?: EthFetchConfig
  ) {
    if (!filter) {
      filter = templateContract.filters['${filterName}'](${event.inputs.map(() => 'null').join(',')})
    }
    return super.onEvent(handler, filter!, fetchConfig)
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

  const filterName = getFullSignatureForEventPatched(event)
  return `
    ${eventName}(${generateEventInputs(event.inputs)}) { return templateContract.filters['${filterName}'](${event.inputs
    .map((i) => i.name)
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
