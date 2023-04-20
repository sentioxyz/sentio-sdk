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
import { parseMoveType, TypeDescriptor } from '../move/index.js'

export class MoveCoder extends AbstractMoveCoder<AptosNetwork, MoveModuleBytecode, Event | MoveResource> {
  constructor(network: AptosNetwork) {
    super(network)
    this.adapter = new AptosChainAdapter()
  }

  load(module: MoveModuleBytecode) {
    if (!module.abi) {
      throw Error('Module without abi')
    }
    let m = this.moduleMapping.get(module.abi.address + '::' + module.abi.name)
    // if (this.contains(module.abi.address, module.abi.name)) {
    //   return
    // }
    if (m) {
      return m
    }
    m = toInternalModule(module)
    this.loadInternal(m)
    return m
  }

  decodeEvent<T>(event: Event): Promise<TypedEventInstance<T> | undefined> {
    return this.decodedStruct(event)
  }
  filterAndDecodeEvents<T>(type: string | TypeDescriptor<T>, resources: Event[]): Promise<TypedEventInstance<T>[]> {
    if (typeof type === 'string') {
      type = parseMoveType(type)
    }
    return this.filterAndDecodeStruct(type, resources)
  }
  decodeResource<T>(res: MoveResource): Promise<TypedMoveResource<T> | undefined> {
    return this.decodedStruct(res)
  }
  filterAndDecodeResources<T>(
    type: string | TypeDescriptor<T>,
    resources: MoveResource[]
  ): Promise<TypedMoveResource<T>[]> {
    if (typeof type === 'string') {
      type = parseMoveType(type)
    }
    return this.filterAndDecodeStruct(type, resources)
  }

  async decodeFunctionPayload(
    payload: TransactionPayload_EntryFunctionPayload
  ): Promise<TransactionPayload_EntryFunctionPayload> {
    const func = await this.getMoveFunction(payload.function)
    const params = this.adapter.getMeaningfulFunctionParams(func.params)
    const argumentsDecoded = await this.decodeArray(payload.arguments, params)

    return {
      ...payload,
      arguments_decoded: argumentsDecoded,
    } as TypedFunctionPayload<any>
  }
}

const MOVE_CODER = new MoveCoder(AptosNetwork.MAIN_NET)
const TESTNET_MOVE_CODER = new MoveCoder(AptosNetwork.TEST_NET)

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  if (network == AptosNetwork.MAIN_NET) {
    return MOVE_CODER
  }
  return TESTNET_MOVE_CODER
}
