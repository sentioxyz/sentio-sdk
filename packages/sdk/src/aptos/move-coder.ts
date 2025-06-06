import { AptosNetwork, getClient } from './network.js'
import { MoveCoder, TypedFunctionPayload } from '@typemove/aptos'
import { Aptos, EntryFunctionPayloadResponse } from '@aptos-labs/ts-sdk'
import { TypeDescriptor, VECTOR_STR } from '@typemove/move'

const CODERS = new Map<AptosNetwork, MoveCoder>()
const URL_CODERS = new Map<string, MoveCoder>()

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    const client = getClient(network)

    coder = network == AptosNetwork.INITIA_ECHELON ? new InitiaMoveCoder(client) : new MoveCoder(client)
    CODERS.set(network, coder)
    URL_CODERS.set(client.config.fullnode || '', coder)
  }

  return coder
}

// TODO this function need to use used inside context, otherwise can't be init
export function defaultMoveCoderForClient(client: Aptos): MoveCoder {
  if (!client.config.fullnode) {
    throw new Error('Fullnode is not defined')
  }
  let coder = URL_CODERS.get(client.config.fullnode)
  if (!coder) {
    coder = new MoveCoder(client)
    URL_CODERS.set(client.config.fullnode, coder)
  }
  return coder
}

export class InitiaMoveCoder extends MoveCoder {
  constructor(client: Aptos) {
    super(client, true)
  }

  async decodeFunctionPayload<T extends Array<any>>(
    payload: EntryFunctionPayloadResponse
  ): Promise<TypedFunctionPayload<T>> {
    const func = await this.getMoveFunction(payload.function)
    const paramsTypes = this.adapter.getMeaningfulFunctionParams(func.params)
    const argumentsDecoded = []

    for (let i = 0; i < paramsTypes.length; i++) {
      const arg = payload.arguments[i]
      const paramType = paramsTypes[i]
      if (arg == null) {
        argumentsDecoded.push(null)
      } else {
        argumentsDecoded.push(await this.decodeBase64(Buffer.from(arg, 'base64'), paramType))
      }
    }

    return {
      ...payload,
      arguments_decoded: argumentsDecoded
    } as TypedFunctionPayload<T>
  }

  protected async decodeBase64(b: Buffer, type: TypeDescriptor): Promise<any> {
    switch (type.qname.toLowerCase()) {
      case 'signer': // TODO check this, aptos only
      case 'address':
      case '0x1::string::String':
        return b.toString()
      case 'bool':
        return b.readUInt8() !== 0 // Convert first byte to boolean
      case 'u8':
        return b.readUInt8()
      case 'u16':
        return b.readUInt16LE()
      case 'u32':
        return b.readUInt32LE()
      case 'u64':
        return b.readBigUInt64LE()
      case 'u128':
      case 'u256':
        const hex = b.toString('hex')
        const reversedHex = hex.match(/.{2}/g)?.reverse().join('') || ''
        return BigInt('0x' + reversedHex)
      case '0x1::object::object':
        return b.toString('hex')
      case VECTOR_STR:
        // vector<u8> as hex string
        if (type.typeArgs[0].qname === 'u8' || type.typeArgs[0].qname === 'U8') {
          return b.toString('hex')
        }

        console.warn(`can't decode vector type: ${type.qname}, data: ${b.toString('base64')}`)
        return b.toString('base64')
      default:
        // try enum type first
        const enumType = await this.maybeGetMoveEnum(type.qname)
        if (enumType) {
          return b.toString('utf-8')
        }

        // Process complex type
        /*const struct = await this.getMoveStruct(type.qname)

        const typeCtx = new Map<string, TypeDescriptor>()
        for (const [idx, typeArg] of type.typeArgs.entries()) {
          typeCtx.set('T' + idx, typeArg)
        }

        const typedData: any = {}

        for (const field of struct.fields) {
          let filedType = field.type
          filedType = filedType.applyTypeArgs(typeCtx)
          const fieldValue = this.adapter.getData(data)[field.name]
          const value = await this.decode(fieldValue, filedType)
          typedData[field.name] = value
        }*/

        // todo: how to decode complex type?
        console.warn(`can't decode type:${type.qname}, data: ${b.toString('base64')}`)
        return b.toString('hex')
    }
  }
}
