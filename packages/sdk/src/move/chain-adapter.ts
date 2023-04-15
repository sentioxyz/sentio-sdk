import { InternalMoveModule, InternalMoveStruct } from './internal-models.js'
import { TypeDescriptor } from './types.js'

export abstract class ChainAdapter<NetworkType, ModuleTypes> {
  abstract fetchModules(account: string, network: NetworkType): Promise<ModuleTypes>

  abstract fetchModules(account: string, network: NetworkType): Promise<ModuleTypes>
  abstract toInternalModules(modules: ModuleTypes): InternalMoveModule[]
  // Get the structs that represent Events
  abstract getEventStructs(module: InternalMoveModule): Map<string, InternalMoveStruct>
  // Get the parameters that actually have arguments in runtime
  // Aptos first signer and Sui's last TxContext are no use
  abstract getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[]
}
