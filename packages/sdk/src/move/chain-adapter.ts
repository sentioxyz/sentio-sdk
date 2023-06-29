import { InternalMoveModule, InternalMoveStruct } from './internal-models.js'
import { TypeDescriptor } from './types.js'
import { accountAddressString } from './utils.js'

export abstract class ChainAdapter<NetworkType, ModuleType, StructType> {
  abstract fetchModule(account: string, module: string, network: NetworkType): Promise<ModuleType>

  abstract fetchModules(account: string, network: NetworkType): Promise<ModuleType[]>
  abstract toInternalModules(modules: ModuleType[]): InternalMoveModule[]

  // Get all structs that represent Events
  abstract getAllEventStructs(module: InternalMoveModule[]): Map<string, InternalMoveStruct>

  // Get the parameters that actually have arguments in runtime
  // Aptos first signer and Sui's last TxContext are no use
  abstract getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[]

  abstract getType(base: StructType): string
  abstract getData<T>(base: StructType): any

  validateAndNormalizeAddress(address: string): string {
    return accountAddressString(address)
  }
}
