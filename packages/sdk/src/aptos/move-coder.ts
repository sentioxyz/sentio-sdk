import {
  Event,
  MoveModuleBytecode,
  MoveResource,
  toInternalModule,
  TransactionPayload_EntryFunctionPayload,
} from './move-types.js'

import { TypedEventInstance, TypedMoveResource, TypedEntryFunctionPayload } from './models.js'
import { getMeaningfulFunctionParams } from './utils.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'

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
    return this.decodedInternal<T>(event) as TypedEventInstance<T>
  }
  filterAndDecodeEvents<T>(typeQname: string, resources: Event[]): TypedEventInstance<T>[] {
    return this.filterAndDecodeInternal(typeQname, resources) as TypedEventInstance<T>[]
  }
  decodeResource<T>(res: MoveResource): TypedMoveResource<T> | undefined {
    return this.decodedInternal<T>(res)
  }
  filterAndDecodeResources<T>(typeQname: string, resources: MoveResource[]): TypedMoveResource<T>[] {
    return this.filterAndDecodeInternal(typeQname, resources)
  }

  decodeFunctionPayload(payload: TransactionPayload_EntryFunctionPayload): TransactionPayload_EntryFunctionPayload {
    const argumentsTyped: any[] = []

    try {
      const func = this.getMoveFunction(payload.function)
      const params = getMeaningfulFunctionParams(func.params)
      for (const [idx, arg] of payload.arguments.entries()) {
        // TODO consider apply payload.type_arguments, but this might be hard since we don't code gen for them
        const argType = params[idx]
        argumentsTyped.push(this.decode(arg, argType))
      }
    } catch (e) {
      console.error('Decoding error for ', JSON.stringify(payload), e)
      return payload
    }

    return {
      ...payload,
      arguments_decoded: argumentsTyped,
    } as TypedEntryFunctionPayload<any>
  }
}

export const MOVE_CODER = new MoveCoder()

export function defaultMoveCoder(): MoveCoder {
  return MOVE_CODER
}
