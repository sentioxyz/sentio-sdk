import {
  Event,
  MoveFunction,
  MoveModule,
  MoveResource,
  MoveStruct,
  TransactionPayload_EntryFunctionPayload,
} from 'aptos-sdk/src/generated'
import { getMeaningfulFunctionParams, moduleQname, SPLITTER, VECTOR_STR } from './utils'
import { parseMoveType, TypeDescriptor } from './types'
import {
  TypedEventInstance,
  TypedMoveResource,
  StructWithTag,
  StructWithType,
  TypedEntryFunctionPayload,
} from './models'

export class MoveCoder {
  private moduleMapping = new Map<string, MoveModule>()
  private typeMapping = new Map<string, MoveStruct>()
  private funcMapping = new Map<string, MoveFunction>()

  contains(account: string, name: string) {
    return this.moduleMapping.has(account + '::' + name)
  }

  load(module: MoveModule) {
    if (this.contains(module.address, module.name)) {
      return
    }
    this.moduleMapping.set(moduleQname(module), module)

    for (const struct of module.structs) {
      // TODO move to util
      const key = [module.address, module.name, struct.name].join(SPLITTER)
      this.typeMapping.set(key, struct)
    }

    for (const func of module.exposed_functions) {
      if (!func.is_entry) {
        continue
      }
      const key = [module.address, module.name, func.name].join(SPLITTER)
      this.funcMapping.set(key, func)
    }
  }

  getMoveStruct(type: string): MoveStruct {
    const struct = this.typeMapping.get(type)
    if (!struct) {
      throw new Error('Failed to load type' + type)
    }
    return struct
  }

  getMoveFunction(type: string): MoveFunction {
    const func = this.funcMapping.get(type)
    if (!func) {
      throw new Error('Failed to load function' + type)
    }
    return func
  }

  decode(data: any, type: TypeDescriptor): any {
    // process simple type
    if (type.qname.startsWith('&')) {
      return data
    }
    switch (type.qname) {
      case 'signer': // TODO check this
      case 'address':
      case '0x1::string::String':
      case 'bool':
      case 'u8':
      case 'u16':
      case 'u32':
        return data
      case 'u64':
      case 'u128':
        return BigInt(data)
    }

    // process vector
    if (type.qname === VECTOR_STR) {
      // vector<u8> as hex string
      if (type.typeArgs[0].qname === 'u8') {
        return data
      }

      const res = []
      for (const entry of data) {
        res.push(this.decode(entry, type.typeArgs[0]))
      }
      return res
    }

    // Process complex type
    const struct = this.getMoveStruct(type.qname)

    const typeCtx = new Map<string, TypeDescriptor>()
    for (const [idx, typeArg] of type.typeArgs.entries()) {
      typeCtx.set('T' + idx, typeArg)
    }

    const typedData: any = {}

    for (const field of struct.fields) {
      let filedType = parseMoveType(field.type)
      filedType = filedType.applyTypeArgs(typeCtx)
      const value = this.decode(data[field.name], filedType)
      typedData[field.name] = value
    }
    return typedData
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

  private filterAndDecodeInternal<T>(typeQname: string, structs: StructWithTag[]): StructWithType<T>[] {
    if (!structs) {
      return []
    }
    const results: StructWithType<T>[] = []
    for (const resource of structs) {
      if (resource.type.split('<')[0] !== typeQname) {
        continue
      }
      const result = this.decodedInternal(resource)
      if (result) {
        results.push(result as StructWithType<T>)
      }
    }
    return results
  }

  private decodedInternal<T>(typeStruct: StructWithTag): StructWithType<T> | undefined {
    const registry = MOVE_CODER
    // this.loadTypes(registry)
    // TODO check if module is not loaded

    const typeDescriptor = parseMoveType(typeStruct.type)
    const typeArguments = typeDescriptor.typeArgs.map((t) => t.getSignature())

    let dataTyped = undefined
    try {
      dataTyped = registry.decode(typeStruct.data, typeDescriptor)
    } catch (e) {
      console.error('Decoding error for ', JSON.stringify(typeStruct), e)
      return undefined
    }
    return {
      ...typeStruct,
      data_typed: dataTyped,
      data_decoded: dataTyped,
      type_arguments: typeArguments,
    } as StructWithType<T>
  }

  decodeFunctionPayload(payload: TransactionPayload_EntryFunctionPayload): TransactionPayload_EntryFunctionPayload {
    const registry = MOVE_CODER
    // this.loadTypes(registry)
    const argumentsTyped: any[] = []

    try {
      const func = registry.getMoveFunction(payload.function)
      const params = getMeaningfulFunctionParams(func)
      for (const [idx, arg] of payload.arguments.entries()) {
        // TODO consider apply payload.type_arguments, but this might be hard since we don't code gen for them
        const argType = parseMoveType(params[idx])
        argumentsTyped.push(registry.decode(arg, argType))
      }
    } catch (e) {
      console.error('Decoding error for ', JSON.stringify(payload), e)
      return payload
    }

    return {
      ...payload,
      arguments_typed: argumentsTyped,
      arguments_decoded: argumentsTyped,
    } as TypedEntryFunctionPayload<any>
  }
}

export const MOVE_CODER = new MoveCoder()

export function defaultMoveCoder(): MoveCoder {
  return MOVE_CODER
}
