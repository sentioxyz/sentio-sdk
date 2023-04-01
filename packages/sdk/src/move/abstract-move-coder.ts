import { moduleQname, SPLITTER, VECTOR_STR } from './utils.js'
import { parseMoveType, TypeDescriptor } from './types.js'
import { InternalMoveFunction, InternalMoveModule, InternalMoveStruct } from './internal-models.js'
import { bytesToBigInt } from '../utils/index.js'

export type StructWithTag<Base> = Base & {
  type: string
  data: any
}

export type DecodedStructWithTag<B, T> = StructWithTag<B> & {
  data_decoded: T
  type_arguments: string[]
}

export abstract class AbstractMoveCoder<StructType> {
  private moduleMapping = new Map<string, InternalMoveModule>()
  private typeMapping = new Map<string, InternalMoveStruct>()
  private funcMapping = new Map<string, InternalMoveFunction>()

  contains(account: string, name: string) {
    return this.moduleMapping.has(account + '::' + name)
  }

  protected abstract getMeaningfulFunctionParams(params: TypeDescriptor[]): TypeDescriptor[]

  protected loadInternal(module: InternalMoveModule) {
    if (this.contains(module.address, module.name)) {
      return
    }
    this.moduleMapping.set(moduleQname(module), module)

    for (const struct of module.structs) {
      // TODO move to util
      const key = [module.address, module.name, struct.name].join(SPLITTER)
      this.typeMapping.set(key, struct)
    }

    for (const func of module.exposedFunctions) {
      // if (!func.isEntry) {
      //   continue
      // }
      const key = [module.address, module.name, func.name].join(SPLITTER)
      this.funcMapping.set(key, func)
    }
  }

  protected decodeBigInt(data: any): bigint {
    if (Array.isArray(data)) {
      // Only sui function need this, strange
      const bytes = data as number[]
      return bytesToBigInt(new Uint8Array(bytes.slice().reverse()))
    } else {
      return BigInt(data)
    }
  }

  protected encodeBigInt(data: bigint): any {
    return '0x' + data.toString(16)
  }

  getMoveStruct(type: string): InternalMoveStruct {
    const struct = this.typeMapping.get(type)
    if (!struct) {
      throw new Error('Failed to load type' + type + ' type are not imported anywhere')
    }
    return struct
  }

  getMoveFunction(type: string): InternalMoveFunction {
    const func = this.funcMapping.get(type)
    if (!func) {
      throw new Error('Failed to load function ' + type + ' type are not imported anywhere')
    }
    return func
  }

  decode(data: any, type: TypeDescriptor): any {
    // process simple type
    if (type.reference) {
      return data
    }
    switch (type.qname) {
      case 'signer': // TODO check this, aptos only
      case 'address':
      case 'Address':
      case '0x1::string::String':
      case 'bool':
      case 'Bool':
      case 'u8':
      case 'U8':
      case 'u16':
      case 'U16':
      case 'u32':
      case 'U32':
        return data
      case 'u64':
      case 'U64':
      case 'u128':
      case 'U128':
        return this.decodeBigInt(data)
    }

    // process vector
    if (type.qname === VECTOR_STR) {
      // vector<u8> as hex string
      if (type.typeArgs[0].qname === 'u8' || type.typeArgs[0].qname === 'U8') {
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
      let filedType = field.type
      filedType = filedType.applyTypeArgs(typeCtx)
      const value = this.decode(data[field.name], filedType)
      typedData[field.name] = value
    }
    return typedData
  }

  encode(data: any, type: TypeDescriptor): any {
    // process simple type
    if (type.reference) {
      return data
    }
    switch (type.qname) {
      case 'signer': // TODO check this, aptos only
      case 'address':
      case 'Address':
      case '0x2::object::ID':
      case '0x2::coin::Coin':
      case '0x1::string::String':
      case 'bool':
      case 'Bool':
      case 'u8':
      case 'U8':
      case 'u16':
      case 'U16':
      case 'u32':
      case 'U32':
        return data
      case 'u64':
      case 'U64':
      case 'u128':
      case 'U128':
      case 'u256':
      case 'U256':
        return this.encodeBigInt(data)
    }

    // process vector
    if (type.qname === VECTOR_STR) {
      // vector<u8> as hex string
      if (type.typeArgs[0].qname === 'u8' || type.typeArgs[0].qname === 'U8') {
        return data
      }

      const res = []
      for (const entry of data) {
        res.push(this.encode(entry, type.typeArgs[0]))
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
      let filedType = field.type
      filedType = filedType.applyTypeArgs(typeCtx)
      const value = this.encode(data[field.name], filedType)
      typedData[field.name] = value
    }
    return typedData
  }

  decodeArray(entries: any[], types: TypeDescriptor[]): any[] {
    const entriesDecoded: any[] = []
    for (const [idx, arg] of entries.entries()) {
      // TODO consider apply payload.type_arguments, but this might be hard since we don't code gen for them
      const argType = types[idx]
      try {
        entriesDecoded.push(this.decode(arg, argType))
      } catch (e) {
        console.error(e, 'Decoding error for ', JSON.stringify(arg), 'using type', argType)
        return entries
      }
    }
    return entriesDecoded
  }

  encodeArray(entriesDecoded: any[], types: TypeDescriptor[]): any[] {
    const entries: any[] = []
    for (const [idx, arg] of entriesDecoded.entries()) {
      // TODO consider apply payload.type_arguments, but this might be hard since we don't code gen for them
      const argType = types[idx]
      try {
        entries.push(this.encode(arg, argType))
      } catch (e) {
        throw Error('Decoding error for ' + JSON.stringify(arg) + 'using type' + argType + e.toString())
      }
    }
    return entries
  }

  encodeCallArgs(args: any[], func: string): any[] {
    const f = this.getMoveFunction(func)
    return this.encodeArray(args, this.getMeaningfulFunctionParams(f.params))
  }

  decodeCallResult(res: any[], func: string): any[] {
    const f = this.getMoveFunction(func)
    return this.decodeArray(res, f.return)
  }

  protected filterAndDecodeInternal<T>(
    typeQname: string,
    structs: StructWithTag<StructType>[]
  ): DecodedStructWithTag<StructType, T>[] {
    if (!structs) {
      return []
    }
    const results: DecodedStructWithTag<StructType, T>[] = []
    for (const resource of structs) {
      if (typeQname.includes('<')) {
        if (resource.type !== typeQname) {
          continue
        }
      } else if (resource.type.split('<')[0] !== typeQname) {
        continue
      }
      const result = this.decodedInternal(resource)
      if (result) {
        results.push(result as DecodedStructWithTag<StructType, T>)
      }
    }
    return results
  }

  protected decodedInternal<T>(typeStruct: StructWithTag<StructType>): DecodedStructWithTag<StructType, T> | undefined {
    const typeDescriptor = parseMoveType(typeStruct.type)
    const typeArguments = typeDescriptor.typeArgs.map((t) => t.getSignature())

    let dataTyped = undefined
    try {
      dataTyped = this.decode(typeStruct.data, typeDescriptor)
    } catch (e) {
      console.error('Decoding error for ', JSON.stringify(typeStruct), e)
      return undefined
    }
    return {
      ...typeStruct,
      data_decoded: dataTyped,
      type_arguments: typeArguments,
    } as DecodedStructWithTag<StructType, T>
  }
}
