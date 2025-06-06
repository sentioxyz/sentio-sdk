import { AptosNetwork, getClient } from './network.js'
import { MoveCoder, TypedFunctionPayload } from '@typemove/aptos'
import { Aptos, EntryFunctionPayloadResponse } from '@aptos-labs/ts-sdk'
import { TypeDescriptor } from '@typemove/move'

const CODERS = new Map<AptosNetwork, MoveCoder>()
const URL_CODERS = new Map<string, MoveCoder>()

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    const client = getClient(network)

    coder =
      network == AptosNetwork.INITIA_ECHELON
        ? new InitiaMoveCoder(client)
        : new MoveCoder(client)
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
        argumentsDecoded.push(this.decodeBase64(arg, paramType))
      }
    }

    return {
      ...payload,
      arguments_decoded: argumentsDecoded
    } as TypedFunctionPayload<T>
  }

  protected async decodeBase64(data: any, type: TypeDescriptor): Promise<any> {
    const b = Buffer.from(data, 'base64')
    switch (type.qname) {
      case 'signer': // TODO check this, aptos only
      case 'address':
      case 'Address':
      case '0x1::string::String':
        return b.toString()
      case 'bool':
      case 'Bool':
        return b.readUInt8() !== 0
      case 'u8':
      case 'U8':
        return b.readUInt8()
      case 'u16':
      case 'U16':
        return b.readUInt16LE()
      case 'u32':
      case 'U32':
        return b.readUInt32LE()
      case 'u64':
      case 'U64':
      case 'u128':
      case 'U128':
      case 'u256':
      case 'U256':
        return this.decodeBigInt('0x' + b.toString('hex')) as any
      default:
        return super.decode(data, type)
    }
  }
}
