import {
  Event,
  MoveModuleBytecode,
  MoveResource,
  toInternalModule,
  TransactionPayload_EntryFunctionPayload,
} from './move-types.js'

import { TypedEventInstance, TypedMoveResource, TypedFunctionPayload } from './models.js'
import { getMeaningfulFunctionParams } from './utils.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'
import { TypeDescriptor } from '../move/index.js'

export class MoveCoder extends AbstractMoveCoder<Event | MoveResource> {
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

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  decodeFunctionPayload(payload: TransactionPayload_EntryFunctionPayload): TransactionPayload_EntryFunctionPayload {
    const func = this.getMoveFunction(payload.function)
    const params = getMeaningfulFunctionParams(func.params)
    const argumentsDecoded = this.decodeArray(payload.arguments, params)

    return {
      ...payload,
      arguments_decoded: argumentsDecoded,
    } as TypedFunctionPayload<any>
  }
}

export const MOVE_CODER = new MoveCoder()

export function defaultMoveCoder(): MoveCoder {
  return MOVE_CODER
}
