import { BN, BorshInstructionCoder, Idl, Instruction } from '@project-serum/anchor'
import { SolanaBaseProcessor, SolanaContext } from '@sentio/sdk'
import { game_wallet_idl } from './game_wallet'
import bs58 from 'bs58'

export class GameWalletProcessor extends SolanaBaseProcessor {
  static bind(address: string, endpoint: string, name = 'GameWallet'): GameWalletProcessor {
    return new GameWalletProcessor(name, address, endpoint)
  }

  public decodeInstruction(ins: string): Instruction | null {
    const instructionCoder = new BorshInstructionCoder(game_wallet_idl as Idl)
    const decodedIns = instructionCoder.decode(Buffer.from(bs58.decode(ins)))
    return decodedIns
  }


  onInitializeTokenConfig(handler: (args: { tokenDecimal: number, isPaused: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean, isWithdrawServiceFeeEnable: boolean, withdrawServiceFeePercentage: BN, isSpendServiceFeeEnable: boolean, spendServiceFeePercentage: BN, isDistributionServiceFeeEnable: boolean, distributionServiceFeePercentage: BN, isMinWithdrawEnable: boolean, isMaxWithdrawEnable: boolean, minWithdraw: BN, maxWithdraw: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('initializeTokenConfig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenDecimal: number, isPaused: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean, isWithdrawServiceFeeEnable: boolean, withdrawServiceFeePercentage: BN, isSpendServiceFeeEnable: boolean, spendServiceFeePercentage: BN, isDistributionServiceFeeEnable: boolean, distributionServiceFeePercentage: BN, isMinWithdrawEnable: boolean, isMaxWithdrawEnable: boolean, minWithdraw: BN, maxWithdraw: BN }, ctx)
      }
    })
    return this
  }

  onDeposit(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, amount: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('deposit', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, amount: BN }, ctx)
      }
    })
    return this
  }

  onWithdraw(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('withdraw', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx)
      }
    })
    return this
  }

  onSpend(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('spend', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx)
      }
    })
    return this
  }

  onSpendWithoutUser(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('spendWithoutUser', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, userTokenConfigBump: number, amount: BN, nonce: BN }, ctx)
      }
    })
    return this
  }

  onAddDistributeSupply(handler: (args: { tokenConfigBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('addDistributeSupply', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN }, ctx)
      }
    })
    return this
  }

  onDistribute(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN, nonce: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('distribute', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN, nonce: BN }, ctx)
      }
    })
    return this
  }

  onDistributeWithoutUser(handler: (args: { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN, nonce: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('distributeWithoutUser', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, depositPoolBump: number, depositPoolTokenAccountBump: number, distributionPoolBump: number, distributionPoolTokenAccountBump: number, amount: BN, nonce: BN }, ctx)
      }
    })
    return this
  }

  onUpdateTokenConfig(handler: (args: { tokenConfigBump: number, tokenDecimal: number, isPaused: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean, isWithdrawServiceFeeEnable: boolean, withdrawServiceFeePercentage: BN, isSpendServiceFeeEnable: boolean, spendServiceFeePercentage: BN, isDistributionServiceFeeEnable: boolean, distributionServiceFeePercentage: BN, isMinWithdrawEnable: boolean, isMaxWithdrawEnable: boolean, minWithdraw: BN, maxWithdraw: BN }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('updateTokenConfig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, tokenDecimal: number, isPaused: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean, isWithdrawServiceFeeEnable: boolean, withdrawServiceFeePercentage: BN, isSpendServiceFeeEnable: boolean, spendServiceFeePercentage: BN, isDistributionServiceFeeEnable: boolean, distributionServiceFeePercentage: BN, isMinWithdrawEnable: boolean, isMaxWithdrawEnable: boolean, minWithdraw: BN, maxWithdraw: BN }, ctx)
      }
    })
    return this
  }

  onUpdateUserTokenConfig(handler: (args: { tokenConfigBump: number, userTokenConfigBump: number, isActive: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean }, ctx: SolanaContext) => void): GameWalletProcessor {
    this.onInstruction('updateUserTokenConfig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as { tokenConfigBump: number, userTokenConfigBump: number, isActive: boolean, canDeposit: boolean, canWithdraw: boolean, canSpend: boolean, canDistribute: boolean }, ctx)
      }
    })
    return this
  }

}
  