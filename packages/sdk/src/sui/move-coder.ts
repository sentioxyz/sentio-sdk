import { TypedEventInstance, TypedFunctionPayload } from './models.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'
import { MoveCall, MoveEvent, SuiMoveNormalizedModule } from '@mysten/sui.js'
import { toInternalModule } from './move-types.js'
import { SPLITTER, TypeDescriptor } from '../move/index.js'
import { getMeaningfulFunctionParams } from './utils.js'

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
  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  decodeFunctionPayload(payload: MoveCall): MoveCall {
    const functionType = [payload.package.objectId, payload.module, payload.function].join(SPLITTER)
    const func = this.getMoveFunction(functionType)
    const params = getMeaningfulFunctionParams(func.params)
    const argumentsTyped = this.decodeArray(payload.arguments || [], params)
    return {
      ...payload,
      arguments_decoded: argumentsTyped,
    } as TypedFunctionPayload<any>
  }
}

export const MOVE_CODER = new MoveCoder()

export function defaultMoveCoder(): MoveCoder {
  return MOVE_CODER
}
