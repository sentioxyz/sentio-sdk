import { ChainAdapter, moduleQname, SPLITTER, TypeDescriptor } from '../move/index.js'
import { MoveModuleBytecode, toInternalModule } from './move-types.js'
import { AptosNetwork } from './network.js'
import { InternalMoveModule, InternalMoveStruct } from '../move/internal-models.js'
import { AptosClient } from 'aptos-sdk'

export class AptosChainAdapter extends ChainAdapter<AptosNetwork, MoveModuleBytecode[]> {
  static INSTANCE = new AptosChainAdapter()

  async fetchModules(account: string, network: AptosNetwork): Promise<MoveModuleBytecode[]> {
    const client = getRpcClient(network)
    return await client.getAccountModules(account)
  }

  toInternalModules(modules: MoveModuleBytecode[]): InternalMoveModule[] {
    return modules.flatMap((m) => (m.abi ? [toInternalModule(m)] : []))
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    if (params.length === 0) {
      return params
    }
    if (params[0].qname === 'signer' && params[0].reference) {
      params = params.slice(1)
    }
    return params
  }

  getEventStructs(module: InternalMoveModule) {
    const qname = moduleQname(module)
    const structMap = new Map<string, InternalMoveStruct>()
    const eventMap = new Map<string, InternalMoveStruct>()

    for (const struct of module.structs) {
      structMap.set(qname + SPLITTER + struct.name, struct)
    }

    for (const struct of module.structs) {
      for (const field of struct.fields) {
        const t = field.type
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
}

function getRpcClient(network: AptosNetwork): AptosClient {
  return new AptosClient(getRpcEndpoint(network))
}

function getRpcEndpoint(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/'
  }
  return 'https://mainnet.aptoslabs.com/'
}
