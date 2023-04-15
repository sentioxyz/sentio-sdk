import {
  Event,
  MoveModuleBytecode,
  MoveResource,
  toInternalModule,
  TransactionPayload_EntryFunctionPayload,
} from './move-types.js'

import { TypedEventInstance, TypedFunctionPayload, TypedMoveResource } from './models.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'
import { AptosNetwork } from './network.js'
import { AptosChainAdapter } from './aptos-chain-adapter.js'

export class MoveCoder extends AbstractMoveCoder<AptosNetwork, MoveModuleBytecode[], Event | MoveResource> {
  constructor(network: AptosNetwork) {
    super(network)
    this.adapter = new AptosChainAdapter()
  }

  load(module: MoveModuleBytecode) {
    if (!module.abi) {
      throw Error('Module without abi')
    }
    if (this.contains(module.abi.address, module.abi.name)) {
      return
    }
    this.loadInternal(toInternalModule(module))
  }

  decodeEvent<T>(event: Event): TypedEventInstance<T> | undefined {
    return this.decodedStruct<T>(event) as TypedEventInstance<T>
  }
  filterAndDecodeEvents<T>(typeQname: string, resources: Event[]): TypedEventInstance<T>[] {
    return this.filterAndDecodeStruct(typeQname, resources) as TypedEventInstance<T>[]
  }
  decodeResource<T>(res: MoveResource): TypedMoveResource<T> | undefined {
    return this.decodedStruct<T>(res)
  }
  filterAndDecodeResources<T>(typeQname: string, resources: MoveResource[]): TypedMoveResource<T>[] {
    return this.filterAndDecodeStruct(typeQname, resources) as any
  }

  decodeFunctionPayload(payload: TransactionPayload_EntryFunctionPayload): TransactionPayload_EntryFunctionPayload {
    const func = this.getMoveFunction(payload.function)
    const params = this.adapter.getMeaningfulFunctionParams(func.params)
    const argumentsDecoded = this.decodeArray(payload.arguments, params)

    return {
      ...payload,
      arguments_decoded: argumentsDecoded,
    } as TypedFunctionPayload<any>
  }
}

export const MOVE_CODER = new MoveCoder(AptosNetwork.MAIN_NET)

export function defaultMoveCoder(): MoveCoder {
  return MOVE_CODER
}
