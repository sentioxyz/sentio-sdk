import { TypedEventInstance, TypedEntryFunctionPayload } from './models.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'
import { MoveCall, MoveEvent, SuiMoveNormalizedModule } from '@mysten/sui.js'
import { toInternalModule } from './move-types.js'
import { SPLITTER } from '../move/index.js'

export class MoveCoder extends AbstractMoveCoder<MoveEvent> {
  load(module: SuiMoveNormalizedModule) {
    if (this.contains(module.address, module.name)) {
      return
    }
    this.loadInternal(toInternalModule(module))
  }

  decodeEvent<T>(event: MoveEvent): TypedEventInstance<T> | undefined {
    const res = this.decodedInternal<T>({ ...event, data: event.fields })
    return { ...event, fields_decoded: res?.data_decoded as T, type_arguments: res?.type_arguments || [] }
  }
  filterAndDecodeEvents<T>(typeQname: string, resources: MoveEvent[]): TypedEventInstance<T>[] {
    const resp = this.filterAndDecodeInternal(
      typeQname,
      resources.map((event) => {
        return { ...event, data: event.fields, type: event.type }
      })
    )
    return resp.map((res) => {
      delete res.data_decoded
      const event = res as MoveEvent
      return { ...event, fields_decoded: res?.data_decoded as T, type_arguments: res?.type_arguments || [] }
    })
  }

  decodeFunctionPayload(payload: MoveCall): MoveCall {
    // this.loadTypes(registry)
    const argumentsTyped: any[] = []

    try {
      const functionType = [payload.package.objectId, payload.module, payload.function].join(SPLITTER)
      const func = this.getMoveFunction(functionType)
      const params = func.params.slice(0, func.params.length - 1)
      const args = payload.arguments || []
      for (const [idx, arg] of args.entries()) {
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
