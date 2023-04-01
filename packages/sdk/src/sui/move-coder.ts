import { TypedEventInstance, TypedFunctionPayload, TypedSuiMoveObject } from './models.js'
import { AbstractMoveCoder, StructWithTag } from '../move/abstract-move-coder.js'
import { MoveCallSuiTransaction, SuiEvent, SuiMoveNormalizedModule, SuiCallArg, SuiMoveObject } from '@mysten/sui.js'
import { toInternalModule } from './move-types.js'
import { SPLITTER, TypeDescriptor } from '../move/index.js'
import { getMeaningfulFunctionParams } from './utils.js'
import { dynamic_field } from './builtin/0x2.js'

export class MoveCoder extends AbstractMoveCoder<SuiEvent> {
  load(module: SuiMoveNormalizedModule) {
    if (this.contains(module.address, module.name)) {
      return
    }
    this.loadInternal(toInternalModule(module))
  }

  decode(data: any, type: TypeDescriptor): any {
    switch (type.qname) {
      case '0x2::object::ID':
      case '0x2::coin::Coin':
        return data
      case '0x1::option::Option':
        return this.decode(data, type.typeArgs[0])
      default:
        return super.decode(data, type)
    }
  }

  decodeEvent<T>(event: SuiEvent): TypedEventInstance<T> | undefined {
    const res = this.decodedInternal<T>({ ...event, data: event.parsedJson })
    return { ...event, data_decoded: res?.data_decoded as T, type_arguments: res?.type_arguments || [] }
  }
  filterAndDecodeEvents<T>(typeQname: string, resources: SuiEvent[]): TypedEventInstance<T>[] {
    const resp = this.filterAndDecodeInternal(
      typeQname,
      resources.map((event) => {
        return { ...event, data: event.parsedJson, type: event.type }
      })
    )
    return resp.map((res) => {
      delete res.data
      const event = res as SuiEvent
      return { ...event, data_decoded: res?.data_decoded as T, type_arguments: res?.type_arguments || [] }
    })
  }

  getObjectsFromDynamicFields<Name, Value>(objects: SuiMoveObject[]): dynamic_field.Field<Name, Value>[] {
    return this.filterAndDecodeObjects(`0x2::dynamic_field::Field`, objects).map((o) => o.data_decoded) as any
  }

  filterAndDecodeObjects<T>(typeQname: string, objects: SuiMoveObject[]): TypedSuiMoveObject<T>[] {
    const structs = objects.map((obj) => {
      return { ...obj, data: obj.fields, type: obj.type }
    }) as StructWithTag<any>
    const resp = this.filterAndDecodeInternal(typeQname, structs)
    return resp.map((res) => {
      delete res.data
      const event = res as any as SuiMoveObject
      return { ...event, data_decoded: res?.data_decoded as T, type_arguments: res?.type_arguments || [] }
    })
  }

  getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[] {
    return getMeaningfulFunctionParams(params)
  }

  decodeFunctionPayload(payload: MoveCallSuiTransaction, inputs: SuiCallArg[]): MoveCallSuiTransaction {
    const functionType = [payload.package, payload.module, payload.function].join(SPLITTER)
    const func = this.getMoveFunction(functionType)
    const params = getMeaningfulFunctionParams(func.params)
    const args = []
    for (const value of payload.arguments || []) {
      const argValue = value as any
      if ('Input' in (argValue as any)) {
        const idx = argValue.Input
        const arg = inputs[idx]
        if (arg.type === 'pure') {
          args.push(arg.value)
        } else if (arg.type === 'object') {
          args.push(arg.objectId)
        } else {
          console.error('unexpected function arg value')
          args.push(undefined)
        }
        // args.push(arg) // TODO check why ts not work using arg.push(arg)
      } else {
        args.push(undefined)
      }
    }

    const argumentsTyped = this.decodeArray(args, params)
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
