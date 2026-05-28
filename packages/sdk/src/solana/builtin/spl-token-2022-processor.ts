import { SPLTokenProcessor } from './spl-token-processor.js'
import { SolanaBindOptions, SolanaContext, SolanaFetchConfig } from '../index.js'
import { Instruction } from '@anchor-lang/core'
import {
  ApplyPendingConfidentialTransferBalance,
  ApproveConfidentialTransferAccount,
  ConfidentialTransfer,
  ConfidentialTransferCreditsToggle,
  ConfidentialTransferWithFee,
  ConfigureConfidentialAccountWithRegistry,
  ConfigureConfidentialTransferAccount,
  DepositConfidentialTransfer,
  EmitTokenMetadataInfo,
  EmptyConfidentialTransferAccount,
  InitializeConfidentialTransferMint,
  InitializeGroupMemberPointerInfo,
  InitializeGroupPointerInfo,
  InitializeMetadataPointerInfo,
  InitializeMint2,
  InitializeNonTransferableMint,
  InitializePermanentDelegate,
  InitializeTokenGroupInfo,
  InitializeTokenGroupMemberInfo,
  InitializeTokenMetadataInfo,
  RemoveTokenMetadataKeyInfo,
  UpdateConfidentialTransferMint,
  UpdateGroupMemberPointerInfo,
  UpdateGroupPointerInfo,
  UpdateMetadataPointerInfo,
  UpdateTokenGroupMaxSizeInfo,
  UpdateTokenGroupUpdateAuthorityInfo,
  UpdateTokenMetadataAuthorityInfo,
  UpdateTokenMetadataFieldInfo,
  UpdateTokenMetadataUpdateAuthorityInfo,
  WithdrawConfidentialTransfer,
  WithdrawExcessLamports,
} from './types.js'
import { HandlerOptions } from '../../core/handler-options.js'

export const SPL_TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

// Mirrors SPL Token RPC `jsonParsed` decoding of the Token-2022 program. Inherits all
// instructions shared with the legacy SPL Token program (transfer, mintTo, burn, etc.)
// from SPLTokenProcessor; this subclass adds handlers for Token-2022-only instructions.
export class SPLToken2022Processor extends SPLTokenProcessor {
  static bind(options: SolanaBindOptions): SPLToken2022Processor {
    if (options && !options.name) {
      options.name = 'SPL Token 2022 Program'
    }
    return new SPLToken2022Processor(options)
  }

  private addHandler<T>(
    instructionName: string,
    handler: (data: T, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ): this {
    this.onInstruction(
      instructionName,
      (ins, ctx) => {
        if (ins) {
          handler(ins.data as T, ctx)
        }
      },
      handlerOptions
    )
    return this
  }

  public onInitializeMint2(
    handler: (data: InitializeMint2, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeMint2', handler, handlerOptions)
  }

  public onInitializeNonTransferableMint(
    handler: (data: InitializeNonTransferableMint, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeNonTransferableMint', handler, handlerOptions)
  }

  public onInitializePermanentDelegate(
    handler: (data: InitializePermanentDelegate, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializePermanentDelegate', handler, handlerOptions)
  }

  public onWithdrawExcessLamports(
    handler: (data: WithdrawExcessLamports, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('withdrawExcessLamports', handler, handlerOptions)
  }

  // Metadata Pointer

  public onInitializeMetadataPointer(
    handler: (data: InitializeMetadataPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeMetadataPointer', handler, handlerOptions)
  }

  public onUpdateMetadataPointer(
    handler: (data: UpdateMetadataPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateMetadataPointer', handler, handlerOptions)
  }

  // Group Pointer

  public onInitializeGroupPointer(
    handler: (data: InitializeGroupPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeGroupPointer', handler, handlerOptions)
  }

  public onUpdateGroupPointer(
    handler: (data: UpdateGroupPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateGroupPointer', handler, handlerOptions)
  }

  public onInitializeGroupMemberPointer(
    handler: (data: InitializeGroupMemberPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeGroupMemberPointer', handler, handlerOptions)
  }

  public onUpdateGroupMemberPointer(
    handler: (data: UpdateGroupMemberPointerInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateGroupMemberPointer', handler, handlerOptions)
  }

  // Token Group

  public onInitializeTokenGroup(
    handler: (data: InitializeTokenGroupInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeTokenGroup', handler, handlerOptions)
  }

  public onUpdateTokenGroupMaxSize(
    handler: (data: UpdateTokenGroupMaxSizeInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateTokenGroupMaxSize', handler, handlerOptions)
  }

  public onUpdateTokenGroupUpdateAuthority(
    handler: (data: UpdateTokenGroupUpdateAuthorityInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateTokenGroupUpdateAuthority', handler, handlerOptions)
  }

  public onInitializeTokenGroupMember(
    handler: (data: InitializeTokenGroupMemberInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeTokenGroupMember', handler, handlerOptions)
  }

  // Token Metadata

  public onInitializeTokenMetadata(
    handler: (data: InitializeTokenMetadataInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeTokenMetadata', handler, handlerOptions)
  }

  public onUpdateTokenMetadataField(
    handler: (data: UpdateTokenMetadataFieldInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateTokenMetadataField', handler, handlerOptions)
  }

  public onRemoveTokenMetadataKey(
    handler: (data: RemoveTokenMetadataKeyInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('removeTokenMetadataKey', handler, handlerOptions)
  }

  public onUpdateTokenMetadataAuthority(
    handler: (data: UpdateTokenMetadataAuthorityInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateTokenMetadataAuthority', handler, handlerOptions)
  }

  public onUpdateTokenMetadataUpdateAuthority(
    handler: (data: UpdateTokenMetadataUpdateAuthorityInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateTokenMetadataUpdateAuthority', handler, handlerOptions)
  }

  public onEmitTokenMetadata(
    handler: (data: EmitTokenMetadataInfo, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('emitTokenMetadata', handler, handlerOptions)
  }

  // Confidential Transfer

  public onInitializeConfidentialTransferMint(
    handler: (data: InitializeConfidentialTransferMint, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('initializeConfidentialTransferMint', handler, handlerOptions)
  }

  public onUpdateConfidentialTransferMint(
    handler: (data: UpdateConfidentialTransferMint, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('updateConfidentialTransferMint', handler, handlerOptions)
  }

  public onConfigureConfidentialTransferAccount(
    handler: (data: ConfigureConfidentialTransferAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('configureConfidentialTransferAccount', handler, handlerOptions)
  }

  public onApproveConfidentialTransferAccount(
    handler: (data: ApproveConfidentialTransferAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('approveConfidentialTransferAccount', handler, handlerOptions)
  }

  public onEmptyConfidentialTransferAccount(
    handler: (data: EmptyConfidentialTransferAccount, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('emptyConfidentialTransferAccount', handler, handlerOptions)
  }

  public onDepositConfidentialTransfer(
    handler: (data: DepositConfidentialTransfer, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('depositConfidentialTransfer', handler, handlerOptions)
  }

  public onWithdrawConfidentialTransfer(
    handler: (data: WithdrawConfidentialTransfer, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('withdrawConfidentialTransfer', handler, handlerOptions)
  }

  public onConfidentialTransfer(
    handler: (data: ConfidentialTransfer, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('confidentialTransfer', handler, handlerOptions)
  }

  public onConfidentialTransferWithFee(
    handler: (data: ConfidentialTransferWithFee, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('confidentialTransferWithFee', handler, handlerOptions)
  }

  public onApplyPendingConfidentialTransferBalance(
    handler: (data: ApplyPendingConfidentialTransferBalance, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('applyPendingConfidentialTransferBalance', handler, handlerOptions)
  }

  public onEnableConfidentialTransferConfidentialCredits(
    handler: (data: ConfidentialTransferCreditsToggle, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('enableConfidentialTransferConfidentialCredits', handler, handlerOptions)
  }

  public onDisableConfidentialTransferConfidentialCredits(
    handler: (data: ConfidentialTransferCreditsToggle, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('disableConfidentialTransferConfidentialCredits', handler, handlerOptions)
  }

  public onEnableConfidentialTransferNonConfidentialCredits(
    handler: (data: ConfidentialTransferCreditsToggle, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('enableConfidentialTransferNonConfidentialCredits', handler, handlerOptions)
  }

  public onDisableConfidentialTransferNonConfidentialCredits(
    handler: (data: ConfidentialTransferCreditsToggle, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('disableConfidentialTransferNonConfidentialCredits', handler, handlerOptions)
  }

  public onConfigureConfidentialAccountWithRegistry(
    handler: (data: ConfigureConfidentialAccountWithRegistry, ctx: SolanaContext) => void,
    handlerOptions?: HandlerOptions<SolanaFetchConfig, Instruction>
  ) {
    return this.addHandler('configureConfidentialAccountWithRegistry', handler, handlerOptions)
  }
}
