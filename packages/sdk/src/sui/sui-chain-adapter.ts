import { ChainAdapter, moduleQname, SPLITTER, TypeDescriptor } from '../move/index.js'
import { toInternalModule } from './move-types.js'
import { SuiNetwork } from './network.js'
import { InternalMoveModule, InternalMoveStruct } from '../move/internal-models.js'
import { Connection, JsonRpcProvider, SuiMoveNormalizedModule } from '@mysten/sui.js'

export class SuiChainAdapter extends ChainAdapter<SuiNetwork, SuiMoveNormalizedModule> {
  static INSTANCE = new SuiChainAdapter()

  async fetchModule(account: string, module: string, network: SuiNetwork): Promise<SuiMoveNormalizedModule> {
    const client = getRpcClient(network)
    return await client.getNormalizedMoveModule({ package: account, module })
  }

  async fetchModules(account: string, network: SuiNetwork): Promise<SuiMoveNormalizedModule[]> {
    const client = getRpcClient(network)
    const modules = await client.getNormalizedMoveModulesByPackage({ package: account })
    return Object.values(modules)
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    if (params.length === 0) {
      return params
    }
    return params.slice(0, params.length - 1)
  }

  toInternalModules(modules: SuiMoveNormalizedModule[]): InternalMoveModule[] {
    return Object.values(modules).map(toInternalModule)
  }

  getEventStructs(module: InternalMoveModule) {
    const qname = moduleQname(module)
    const eventMap = new Map<string, InternalMoveStruct>()

    for (const struct of module.structs) {
      const abilities = new Set(struct.abilities)
      if (abilities.has('Drop') && abilities.has('Copy')) {
        eventMap.set(qname + SPLITTER + struct.name, struct)
      }
    }
    return eventMap
  }
}

function getRpcEndpoint(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return 'https://fullnode.testnet.sui.io/'
  }
  return 'https://fullnode.mainnet.sui.io/'
}

function getRpcClient(network: SuiNetwork): JsonRpcProvider {
  return new JsonRpcProvider(new Connection({ fullnode: getRpcEndpoint(network) }))
}
