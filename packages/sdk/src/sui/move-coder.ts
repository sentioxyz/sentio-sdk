import { TypedEventInstance, TypedFunctionPayload, TypedSuiMoveObject } from './models.js'
import { AbstractMoveCoder, StructWithTag } from '../move/abstract-move-coder.js'
import {
  MoveCallSuiTransaction,
  SuiCallArg,
  SuiEvent,
  SuiMoveNormalizedModule,
  SuiMoveObject,
  SuiRawData,
} from '@mysten/sui.js'
import { toInternalModule } from './move-types.js'
import { SPLITTER, TypeDescriptor } from '../move/index.js'
import { dynamic_field } from './builtin/0x2.js'
import { SuiNetwork } from './network.js'
import { SuiChainAdapter } from './sui-chain-adapter.js'

export class MoveCoder extends AbstractMoveCoder<SuiNetwork, SuiMoveNormalizedModule, SuiEvent | SuiMoveObject> {
  constructor(network: SuiNetwork) {
    super(network)
    this.adapter = new SuiChainAdapter()
  }

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
        // return this.decode(data, type.typeArgs[0])
        return data
      default:
        return super.decode(data, type)
    }
  }

  toStructWithTag(val: SuiEvent | SuiMoveObject): StructWithTag<SuiEvent> {
    if (SuiEvent.is(val)) {
      return {
        ...val,
        data: val.parsedJson as any,
      }
    }
    if (SuiRawData.is(val)) {
      return {
        ...val,
        data: val.fields as any,
      }
    }
    return val as any
  }

  decodeEvent<T>(event: SuiEvent): TypedEventInstance<T> | undefined {
    return this.decodedStruct<T>(event) as any
  }
  filterAndDecodeEvents<T>(typeQname: string, resources: SuiEvent[]): TypedEventInstance<T>[] {
    return this.filterAndDecodeStruct(typeQname, resources)
  }

  getObjectsFromDynamicFields<Name, Value>(objects: SuiMoveObject[]): dynamic_field.Field<Name, Value>[] {
    return this.filterAndDecodeObjects(`0x2::dynamic_field::Field`, objects).map((o) => o.data_decoded) as any
  }

  filterAndDecodeObjects<T>(typeQname: string, objects: SuiMoveObject[]): TypedSuiMoveObject<T>[] {
    return this.filterAndDecodeStruct(typeQname, objects)
  }

  decodeFunctionPayload(payload: MoveCallSuiTransaction, inputs: SuiCallArg[]): MoveCallSuiTransaction {
    const functionType = [payload.package, payload.module, payload.function].join(SPLITTER)
    const func = this.getMoveFunction(functionType)
    const params = this.adapter.getMeaningfulFunctionParams(func.params)
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

const MOVE_CODER = new MoveCoder(SuiNetwork.MAIN_NET)
const TESTNET_MOVE_CODER = new MoveCoder(SuiNetwork.TEST_NET)

export function defaultMoveCoder(network: SuiNetwork = SuiNetwork.MAIN_NET): MoveCoder {
  if (network == SuiNetwork.MAIN_NET) {
    return MOVE_CODER
  }
  return TESTNET_MOVE_CODER
}
