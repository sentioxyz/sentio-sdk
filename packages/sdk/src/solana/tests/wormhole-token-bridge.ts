import { SPLTokenProcessor } from '../builtin/index.js'
import { TokenBridgeProcessor } from './types/token_bridge_processor.js'

import { token_bridge_idl } from './types/token_bridge.js'
import { Idl, Instruction } from '@coral-xyz/anchor'
import bs58 from 'bs58'
import { camel } from 'radash'
// @ts-ignore no type definition
import { Layout } from 'buffer-layout'
import { IdlField } from '@coral-xyz/anchor/dist/esm/idl.js'
import * as borsh from '@coral-xyz/borsh'
import { IdlCoder } from '@coral-xyz/anchor/dist/esm/coder/borsh/idl.js'

// TODO this could be more general
class TokenBridgeDecoder {
  private ixLayout: Map<string, Layout>

  constructor(idl: Idl) {
    this.ixLayout = TokenBridgeDecoder.parseIxLayout(idl)
  }

  private static parseIxLayout(idl: Idl): Map<string, Layout> {
    const stateMethods: any[] = []

    const ixLayouts = stateMethods.concat(
      idl.instructions.map((ix) => {
        const fieldLayouts = ix.args.map((arg: IdlField) => IdlCoder.fieldLayout(arg, idl.types ?? []))
        const name = camel(ix.name)
        return [name, borsh.struct(fieldLayouts, name)]
      })
    )
    return new Map(ixLayouts)
  }

  public decode(ix: Buffer | string, encoding: 'hex' | 'base58' = 'hex'): Instruction | null {
    if (typeof ix === 'string') {
      ix = encoding === 'hex' ? Buffer.from(ix, 'hex') : Buffer.from(bs58.decode(ix))
    }
    const discriminator = ix.subarray(0, 1).readInt8()
    const data = ix.subarray(1)

    const name = camel(TokenBridgeInstruction[discriminator])
    const layout = this.ixLayout.get(name)

    if (!layout) {
      return null
    }
    return { data: this.ixLayout.get(name)?.decode(data), name }
  }
}

export enum TokenBridgeInstruction {
  Initialize,
  AttestToken,
  CompleteNative,
  CompleteWrapped,
  TransferWrapped,
  TransferNative,
  RegisterChain,
  CreateWrapped,
  UpgradeContract,
  CompleteNativeWithPayload,
  CompleteWrappedWithPayload,
  TransferWrappedWithPayload,
  TransferNativeWithPayload
}

TokenBridgeProcessor.bind({
  address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
  instructionCoder: new TokenBridgeDecoder(token_bridge_idl as Idl)
}).onTransferNative((args, accounts, ctx) => {
  ctx.meter.Counter('total_transfer_amount').add(args.amount)
  ctx.meter.Counter(accounts.payer).add(args.amount)
})

SPLTokenProcessor.bind({ address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb', processInnerInstruction: true })
  .onMintTo((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').add(BigInt(data.amount))
    }
  })
  .onBurn((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').sub(BigInt(data.amount))
    }
  })
