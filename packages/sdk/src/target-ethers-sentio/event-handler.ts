import { EventDeclaration, getFullSignatureAsSymbolForEvent } from 'typechain'
import { getFullSignatureForEventPatched } from './types'

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
      // @ts-ignore
      filter = ${contractName}Processor.filters[
        // @ts-ignore
        '${filterName}'](${event.inputs.map(() => 'null').join(',')})
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
