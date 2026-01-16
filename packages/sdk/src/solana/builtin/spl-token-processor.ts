import { SolanaBaseProcessor, SolanaContext, SolanaBindOptions, SolanaFetchConfig } from "../index.js"
import { Instruction } from '@coral-xyz/anchor'
import { AmountToUiAmount, Approve, ApproveChecked, Burn, BurnChecked, CloseAccount, CreateNativeMint, DefaultAccountStateExtension, FreezeAccount, GetAccountDataSize, InitializeAccount, InitializeAccount2, InitializeAccount3, InitializeImmutableOwner, InitializeMint, InitializeMintCloseAuthority, InitializeMultisig, MemoTransferExtension, MintTo, MintToChecked, Reallocate, Revoke, SyncNative, ThawAccount, Transfer, TransferChecked, TransferFeeExtension, UiAmountToAmount } from './types.js';
import { HandlerOptions } from '../../core/handler-options.js'

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
    handler: (data: InitializeMint, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeMint', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMint, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeAccount(
    handler: (data: InitializeAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeAccount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeAccount2(
    handler: (data: InitializeAccount2, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount2', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeAccount2, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeAccount3(
    handler: (data: InitializeAccount3, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount3', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeAccount3, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeMultisig(
    handler: (data: InitializeMultisig, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeMultisig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMultisig, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onTransfer(
    handler: (data: Transfer, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('transfer', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Transfer, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onApprove(
    handler: (data: Approve, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('approve', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Approve, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onRevoke(
    handler: (data: Revoke, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('revoke', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Revoke, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onSetAuthority(
    handler: (data: any, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('setAuthority', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as any, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onMintTo(
    handler: (data: MintTo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('mintTo', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MintTo, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onBurn(
    handler: (data: Burn, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('burn', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Burn, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onCloseAccount(
    handler: (data: CloseAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('closeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as CloseAccount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onFreezeAccount(
    handler: (data: FreezeAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('freezeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as FreezeAccount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onThawAccount(
    handler: (data: ThawAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('thawAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ThawAccount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onTransferChecked(
    handler: (data: TransferChecked, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('transferChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as TransferChecked, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onApproveChecked(
    handler: (data: ApproveChecked, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('approveChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ApproveChecked, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onMintToChecked(
    handler: (data: MintToChecked, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('mintToChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MintToChecked, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onBurnChecked(
    handler: (data: BurnChecked, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('burnChecked', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as BurnChecked, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onSyncNative(
    handler: (data: SyncNative, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('syncNative', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as SyncNative, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onGetAccountDataSize(
    handler: (data: GetAccountDataSize, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('getAccountDataSize', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as GetAccountDataSize, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeImmutableOwner(
    handler: (data: InitializeImmutableOwner, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeImmutableOwner', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeImmutableOwner, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onAmountToUiAmount(
    handler: (data: AmountToUiAmount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('amountToUiAmount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as AmountToUiAmount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onUiAmountToAmount(
    handler: (data: UiAmountToAmount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('uiAmountToAmount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as UiAmountToAmount, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onInitializeMintCloseAuthority(
    handler: (data: InitializeMintCloseAuthority, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('initializeMintCloseAuthority', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMintCloseAuthority, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onTransferFeeExtension(
    handler: (data: TransferFeeExtension, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('transferFeeExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as TransferFeeExtension, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onDefaultAccountStateExtension(
    handler: (data: DefaultAccountStateExtension, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('defaultAccountStateExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as DefaultAccountStateExtension, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onReallocate(
    handler: (data: Reallocate, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('reallocate', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as Reallocate, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onMemoTransferExtension(
    handler: (data: MemoTransferExtension, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('memoTransferExtension', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MemoTransferExtension, ctx)
      }
    }, handlerOptions)
    return this
  }

  public onCreateNativeMint(
    handler: (data: CreateNativeMint, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): SPLTokenProcessor {
    this.onInstruction('createNativeMint', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as CreateNativeMint, ctx)
      }
    }, handlerOptions)
    return this
  }

  // Todo(pcxu): auto gen this file
}
