import { TypedEventInstance, TypedFunctionPayload } from './models.js'
import { AbstractMoveCoder } from '../move/abstract-move-coder.js'
import { MoveCallSuiTransaction, SuiCallArg, SuiEvent, SuiMoveNormalizedModule, SuiMoveObject } from '@mysten/sui.js'
import { toInternalModule } from './move-types.js'
import { ANY_TYPE, DecodedStruct, parseMoveType, SPLITTER, TypeDescriptor } from '../move/index.js'
import { SuiNetwork } from './network.js'
import { SuiChainAdapter } from './sui-chain-adapter.js'
import { InternalMoveModule } from '../move/internal-models.js'
import { dynamic_field } from './builtin/0x2.js'

export class MoveCoder extends AbstractMoveCoder<SuiNetwork, SuiMoveNormalizedModule, SuiEvent | SuiMoveObject> {
  constructor(network: SuiNetwork) {
    super(network)
    this.adapter = new SuiChainAdapter()
  }

  load(module: SuiMoveNormalizedModule): InternalMoveModule {
    let m = this.moduleMapping.get(module.address + '::' + module.name)
    if (m) {
      return m
    }
    m = toInternalModule(module)
    this.loadInternal(m)
    return m
  }

  decode(data: any, type: TypeDescriptor): any {
    switch (type.qname) {
      case '0x2::object::ID':
      case '0x2::coin::Coin':
      case '0x2::balance::Balance':
        return data
      case '0x1::option::Option':
        if (data === null) {
          return data
        }
        return this.decode(data, type.typeArgs[0])
      default:
        return super.decode(data, type)
    }
  }

  decodeEvent<T>(event: SuiEvent): Promise<TypedEventInstance<T> | undefined> {
    return this.decodedStruct(event)
  }
  filterAndDecodeEvents<T>(type: TypeDescriptor<T> | string, resources: SuiEvent[]): Promise<TypedEventInstance<T>[]> {
    if (typeof type === 'string') {
      type = parseMoveType(type)
    }
    return this.filterAndDecodeStruct(type, resources)
  }

  async getDynamicFields<T1, T2>(
    objects: SuiMoveObject[],
    keyType: TypeDescriptor<T1> = ANY_TYPE,
    valueType: TypeDescriptor<T2> = ANY_TYPE
  ): Promise<dynamic_field.Field<T1, T2>[]> {
    // const type = dynamic_field.Field.TYPE
    // Not using the code above to avoid cycle initialize failed
    const type = new TypeDescriptor<dynamic_field.Field<T1, T2>>('0x2::dynamic_field::Field')
    type.typeArgs = [keyType, valueType]
    const res = await this.filterAndDecodeObjects(type, objects)
    return res.map((o) => o.data_decoded)
  }

  filterAndDecodeObjects<T>(
    type: TypeDescriptor<T>,
    objects: SuiMoveObject[]
  ): Promise<DecodedStruct<SuiMoveObject, T>[]> {
    return this.filterAndDecodeStruct(type, objects)
  }

  async decodeFunctionPayload(payload: MoveCallSuiTransaction, inputs: SuiCallArg[]): Promise<MoveCallSuiTransaction> {
    const functionType = [payload.package, payload.module, payload.function].join(SPLITTER)
    const func = await this.getMoveFunction(functionType)
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

    const argumentsTyped = await this.decodeArray(args, params)
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
