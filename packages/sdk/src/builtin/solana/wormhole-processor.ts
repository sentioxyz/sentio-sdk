import { SolanaBaseProcessor, SolanaContext, SolanaBindOptions } from '@sentio/sdk'
import { Instruction } from '@project-serum/anchor'
import bs58 from 'bs58'

import {
  deserialize,
  field,
  vec, fixedArray, option,
} from "@dao-xyz/borsh";

// https://github.com/certusone/wormhole/blob/8818d4b8f0471095dd48fa6f5da9c315cbfc9b52/solana/modules/token_bridge/program/src/lib.rs#L100
enum TokenBridgeInstruction {
  Initialize = 0,
  AttestToken,
  CompleteNative, // no args
  CompleteWrapped, // no args
  TransferWrapped,
  TransferNative,
  RegisterChain, // no args
  CreateWrapped, // no args
  UpgradeContract, // no args
  CompleteNativeWithPayload, // no args
  CompleteWrappedWithPayload, // no args
  TransferWrappedWithPayload,
  TransferNativeWithPayload,
}

class TransferDataValues {
  @field({ type: 'u32' })
  nonce: number

  @field({type: 'u64'})
  amount: bigint

  @field({type: 'u64'})
  fee: bigint

  @field({ type: fixedArray('u8', 32) })
  target_address: number[];

  @field({ type: 'u16' })
  target_chain: number

  constructor(data?: TransferDataValues)  {
    if(data){
      Object.assign(this,data)
    }
  }
}

class TransferNativeWithPayloadData {
  @field({ type: 'u32' })
  nonce: number

  @field({type: 'u64'})
  amount: bigint

  @field({type: 'u64'})
  fee: bigint

  @field({ type: fixedArray('u8', 32) })
  target_address: number[];

  @field({ type: 'u16' })
  target_chain: number

  @field({ type: vec('u8') })
  payload: number[];

  @field({type: option(fixedArray('u8', 32) )})
  cpi_program_id?: number[]

  constructor(data?: TransferNativeWithPayloadData)  {
    if(data){
      Object.assign(this,data)
    }
  }
}

class AttestTokenValues {
  @field({ type: 'u32' })
  nonce: number

  constructor(data?: AttestTokenValues)  {
    if(data){
      Object.assign(this,data)
    }
  }
}

class InitializeDataValues {
  @field({type: fixedArray('u8', 32) })
  bridge: number[]

  constructor(data?: InitializeDataValues)  {
    if(data){
      Object.assign(this,data)
    }
  }
}

export class TokenBridgeProcessor extends SolanaBaseProcessor {

  // private readonly transferDataValues = [
  //   borsh.u32('nonce'),
  //   borsh.u64('amount'),
  //   borsh.u64('fee'),
  //   borsh.array(borsh.u8(undefined), 32, 'target_address'),
  //   borsh.u16('target_chain')
  // ]
  // https://github.com/certusone/wormhole/blob/8818d4b8f0471095dd48fa6f5da9c315cbfc9b52/solana/modules/token_bridge/program/src/api/transfer_payload.rs#L170
  // private readonly transferDataWithPayloadValues = [
  //   borsh.u32('nonce'),
  //   borsh.u64('amount'),
  //   borsh.array(borsh.u8(undefined), 32, 'target_address'),
  //   borsh.u16('target_chain'),
  //   borsh.vecU8('payload'),
  //   borsh.option(borsh.publicKey(undefined), 'cpi_program_id')
  // ]
  // private readonly attestTokenValues = [
  //   borsh.u32('nonce')
  // ]
  // private readonly initializeDataValues = [
  //   borsh.publicKey('bridge')
  // ]

  static bind(options: SolanaBindOptions): TokenBridgeProcessor {
    if (options && !options.name) {
      options.name = 'WormholeTokenBridge'
    }
    return new TokenBridgeProcessor(options)
  }

  decodeInstruction: (rawInstruction: string) => Instruction | null = (ins) => {
    const u8Arr = bs58.decode(ins)
    if (u8Arr.length === 0) {
      return null
    }

    let data: any
    // wormhole pass intruction's enum value as its first instrcution data
    switch (u8Arr[0]) {
      case TokenBridgeInstruction.Initialize:
        return {
          data: '',
          name: TokenBridgeInstruction[TokenBridgeInstruction.Initialize]
        }
      case TokenBridgeInstruction.TransferNative:
        data = deserialize(Buffer.from(u8Arr.slice(1)), TransferDataValues)

        // struct is defined at: https://github.com/certusone/wormhole/blob/8818d4b8f0471095dd48fa6f5da9c315cbfc9b52/solana/modules/token_bridge/program/src/api/transfer.rs#L295
        // data = borsh.struct(this.transferDataValues, 'TransferNativeData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.TransferNative]
        }
      case TokenBridgeInstruction.TransferWrapped:
        data = deserialize(Buffer.from(u8Arr.slice(1)), TransferDataValues)

        // stuct is defined at: https://github.com/certusone/wormhole/blob/8818d4b8f0471095dd48fa6f5da9c315cbfc9b52/solana/modules/token_bridge/program/src/api/transfer.rs#L295
        // data = borsh.struct(this.transferDataValues, 'TransferWrappedData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.TransferWrapped]
        }
      case TokenBridgeInstruction.TransferNativeWithPayload:
        data = deserialize(Buffer.from(u8Arr.slice(1)), TransferNativeWithPayloadData)

        // data = borsh.struct(this.transferDataWithPayloadValues, 'TransferNativeWithPayloadData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.TransferNativeWithPayload]
        }
      case TokenBridgeInstruction.TransferWrappedWithPayload:
        data = deserialize(Buffer.from(u8Arr.slice(1)), TransferNativeWithPayloadData)

        // data = borsh.struct(this.transferDataWithPayloadValues, 'TransferWrappedWithPayloadData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.TransferWrappedWithPayload]
        }
      case TokenBridgeInstruction.Initialize:
        data = deserialize(Buffer.from(u8Arr.slice(1)), InitializeDataValues)

        // data = borsh.struct(this.initializeDataValues, 'InitializeData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.Initialize]
        }
      case TokenBridgeInstruction.AttestToken:
        data = deserialize(Buffer.from(u8Arr.slice(1)), AttestTokenValues)

        // data = borsh.struct(this.attestTokenValues, 'AttestTokenData').decode(Buffer.from(u8Arr.slice(1)))
        return {
          data,
          name: TokenBridgeInstruction[TokenBridgeInstruction.AttestToken]
        }
      case TokenBridgeInstruction.CompleteNative:
      case TokenBridgeInstruction.CompleteNativeWithPayload:
      case TokenBridgeInstruction.CompleteWrapped:
      case TokenBridgeInstruction.CompleteWrappedWithPayload:
      case TokenBridgeInstruction.CreateWrapped:
      case TokenBridgeInstruction.UpgradeContract:
      case TokenBridgeInstruction.RegisterChain:
        return {
          data: '',
          name: TokenBridgeInstruction[u8Arr[0]]
        }

      default:
        return null
    }
  }

  onInitialize(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('Initialize', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data, accounts, ctx)
      }
    })
    return this
  }

  onAttestToken(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('AttestToken', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data, accounts, ctx)
      }
    })
    return this
  }


  onTransferWrapped(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('TransferWrapped', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data, accounts, ctx)
      }
    })
    return this
  }

  onTransferNativeWithPayload(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('TransferNativeWithPayload', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data,  accounts, ctx)
      }
    })
    return this
  }

  onTransferWrappedWithPaylod(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('TransferWrappedWithPaylod', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data, accounts, ctx)
      }
    })
    return this
  }

  onTransferNative(handler: (args: any, accounts: string[], ctx: SolanaContext) => void): TokenBridgeProcessor {
    this.onInstruction('TransferNative', (ins: Instruction, ctx, accounts: string[]) => {
      if (ins) {
        handler(ins.data, accounts, ctx)
      }
    })
    return this
  }
}
