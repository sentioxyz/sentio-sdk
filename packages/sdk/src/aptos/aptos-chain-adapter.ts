import { ChainAdapter, moduleQname, SPLITTER, TypeDescriptor } from '../move/index.js'
import { Event, MoveModuleBytecode, MoveResource, toInternalModule } from './move-types.js'
import { AptosNetwork } from './network.js'
import { InternalMoveModule, InternalMoveStruct } from '../move/internal-models.js'
import { AptosClient } from 'aptos-sdk'

export class AptosChainAdapter extends ChainAdapter<AptosNetwork, MoveModuleBytecode, Event | MoveResource> {
  static INSTANCE = new AptosChainAdapter()

  async fetchModules(account: string, network: AptosNetwork): Promise<MoveModuleBytecode[]> {
    const client = getRpcClient(network)
    return await client.getAccountModules(account)
  }

  async fetchModule(account: string, module: string, network: AptosNetwork): Promise<MoveModuleBytecode> {
    const client = getRpcClient(network)
    return await client.getAccountModule(account, module)
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

  getAllEventStructs(modules: InternalMoveModule[]) {
    const eventMap = new Map<string, InternalMoveStruct>()
    const structMap = new Map<string, InternalMoveStruct>()
    for (const module of modules) {
      const qname = moduleQname(module)
      for (const struct of module.structs) {
        structMap.set(qname + SPLITTER + struct.name, struct)
      }
    }

    for (const module of modules) {
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
    }
    return eventMap
  }

  getType(data: Event | MoveResource): string {
    return data.type
  }

  getData(data: Event | MoveResource) {
    if ('data' in data && 'type' in data) {
      return data.data
    }
    return data
  }
  // validateAndNormalizeAddress(address: string): string {
  //   return validateAndNormalizeAddress(address)
  // }
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
