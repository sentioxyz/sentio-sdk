import { TestProcessorServer } from './test-processor-server.js'
import { DataBinding, HandlerType } from '@sentio/protos'
import { StarknetChainId } from '@sentio/chain'

export class StarknetFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testOnEvents(events: any, network: StarknetChainId = StarknetChainId.STARKNET_SEPOLIA) {
    const bindings = this.buildBinding(events, network)
    if (!bindings) {
      throw Error('Invalid test : ' + JSON.stringify(events))
    }

    return this.server.processBindings({
      bindings
    })
  }

  private buildBinding(events: any, network: StarknetChainId): DataBinding[] {
    const res: DataBinding[] = []
    const data = Array.isArray(events) ? events : [events]
    for (const event of data) {
      for (const config of this.server.contractConfigs) {
        if (config.contract?.chainId !== network) {
          continue
        }

        for (const logConfig of config.starknetEventConfigs) {
          const binding = {
            data: {
              starknetEvents: {
                result: event,
                timestamp: new Date()
              }
            },
            handlerIds: [logConfig.handlerId],
            handlerType: HandlerType.STARKNET_EVENT,
            chainId: config.contract.chainId
          }

          const logFilters = logConfig.filters
          const keys = event.keys as string[]

          for (const key of keys) {
            for (const logFilter of logFilters) {
              if (logFilter.keys.includes(key)) {
                res.push(binding)
                return res
              }
            }
          }
        }
      }
    }

    return res
  }
}
