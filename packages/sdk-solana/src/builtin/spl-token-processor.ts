import { SolanaBaseProcessor, SolanaContext, SolanaBindOptions } from '@sentio/sdk-solana'
import { Instruction } from '@project-serum/anchor'
import { AmountToUiAmount, Approve, ApproveChecked, Burn, BurnChecked, CloseAccount, CreateNativeMint, DefaultAccountStateExtension, FreezeAccount, GetAccountDataSize, InitializeAccount, InitializeAccount2, InitializeAccount3, InitializeImmutableOwner, InitializeMint, InitializeMintCloseAuthority, InitializeMultisig, MemoTransferExtension, MintTo, MintToChecked, Reallocate, Revoke, SyncNative, ThawAccount, Transfer, TransferChecked, TransferFeeExtension, UiAmountToAmount } from './types.js';

export class SPLTokenProcessor extends SolanaBaseProcessor {
  static bind(options: SolanaBindOptions): SPLTokenProcessor {
    if (options && !options.name) {
      options.name = 'SPL Token Program'
    }
    return new SPLTokenProcessor(options)
  }

  fromParsedInstruction: (instruction: { type: string, info: any }) => Instruction | null = (instruction: { type: string, info: any }) => {
    const instructionType = instruction.type
    if (!instructionType) {
      return null
    }
    return {
      name: instruction.type,
      data: {
        ...instruction.info,
      },
    }
  }

  public onInitializeMint(
    handler: (data: InitializeMint, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeMint', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMint, ctx)
      }
    })
    return this
  }

  public onInitializeAccount(
    hanlder: (data: InitializeAccount, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccount, ctx)
      }
    })
    return this
  }

  public onInitializeAccount2(
    hanlder: (data: InitializeAccount2, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount2', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccount2, ctx)
      }
    })
    return this
  }

  public onInitializeAccount3(
    hanlder: (data: InitializeAccount3, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount3', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccount3, ctx)
      }
    })
    return this
  }

  public onInitializeMultisig(
    handler: (data: InitializeMultisig, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeMultisig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMultisig, ctx)
      }
    })
    return this
  }

  public onTransfer(handler: (data: Transfer, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('transfer', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Transfer, ctx)
      }
    })
    return this
  }

  public onApprovend(handler: (data: Approve, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('approve', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Approve, ctx)
      }
    })
    return this
  }

  public onRevoke(handler: (data: Revoke, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('revoke', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Revoke, ctx)
      }
    })
    return this
  }

  public onSetAuthority(handler: (data: any, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('setAuthority', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as any, ctx)
      }
    })
    return this
  }

  public onMintTo(handler: (data: MintTo, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('mintTo', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MintTo, ctx)
      }
    })
    return this
  }

  public onBurn(handler: (data: Burn, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('burn', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Burn, ctx)
      }
    })
    return this
  }

  public onCloseAccount(handler: (data: CloseAccount, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('closeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as CloseAccount, ctx)
      }
    })
    return this
  }

  public onFreezeAccount(handler: (data: FreezeAccount, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('freezeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as FreezeAccount, ctx)
      }
    })
    return this
  }

  public onThawAccount(handler: (data: ThawAccount, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('thawAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ThawAccount, ctx)
      }
    })
    return this
  }

  public onTransferChecked(handler: (data: TransferChecked, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('transferChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as TransferChecked, ctx)
      }
    })
    return this
  }

  public onApproveChecked(handler: (data: ApproveChecked, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('approveChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ApproveChecked, ctx)
      }
    })
    return this
  }

  public onMintToChecked(handler: (data: MintToChecked, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('mintToChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MintToChecked, ctx)
      }
    })
    return this
  }

  public onBurnChecked(handler: (data: BurnChecked, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('burnChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as BurnChecked, ctx)
      }
    })
    return this
  }

  public onSyncNative(handler: (data: SyncNative, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('syncNative', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as SyncNative, ctx)
      }
    })
    return this
  }

  public onGetAccountDataSize(handler: (data: GetAccountDataSize, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('getAccountDataSize', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as GetAccountDataSize, ctx)
      }
    })
    return this
  }

  public onInitializeImmutableOwner(handler: (data: InitializeImmutableOwner, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('initializeImmutableOwner', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeImmutableOwner, ctx)
      }
    })
    return this
  }

  public onAmountToUiAmount(handler: (data: AmountToUiAmount, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('amountToUiAmount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as AmountToUiAmount, ctx)
      }
    })
    return this
  }

  public onUiAmountToAmount(handler: (data: UiAmountToAmount, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('uiAmountToAmount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as UiAmountToAmount, ctx)
      }
    })
    return this
  }

  public onInitializeMintCloseAuthority(handler: (data: InitializeMintCloseAuthority, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('initializeMintCloseAuthority', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMintCloseAuthority, ctx)
      }
    })
    return this
  }

  public onTransferFeeExtension(handler: (data: TransferFeeExtension, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('transferFeeExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as TransferFeeExtension, ctx)
      }
    })
    return this
  }

  public onDefaultAccountStateExtension(handler: (data: DefaultAccountStateExtension, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('defaultAccountStateExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as DefaultAccountStateExtension, ctx)
      }
    })
    return this
  }

  public onReallocate(handler: (data: Reallocate, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('reallocate', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Reallocate, ctx)
      }
    })
    return this
  }

  public onMemoTransferExtension(handler: (data: MemoTransferExtension, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('memoTransferExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MemoTransferExtension, ctx)
      }
    })
    return this
  }

  public onCreateNativeMint(handler: (data: CreateNativeMint, ctx: SolanaContext) => void): SPLTokenProcessor {
    this.onInstruction('createNativeMint', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as CreateNativeMint, ctx)
      }
    })
    return this
  }

  // Todo(pcxu): auto gen this file
}
