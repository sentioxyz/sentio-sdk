import { SolanaBaseProcessor } from 'solana-processor'
import { ParsedInstruction } from '@solana/web3.js'
import {
  ApproveInstructionData,
  BurnInstructionData,
  CloseAccountInstructionData,
  FreezeAccountInstructionData,
  InitializeAccount2InstructionData,
  InitializeAccount3InstructionData,
  InitializeAccountInstructionData,
  InitializeMintInstructionData,
  InitializeMultisigInstructionData,
  MintToInstructionData,
  RevokeInstructionData,
  ThawAccountInstructionData,
  TokenInstruction,
  TransferInstructionData,
} from '@solana/spl-token'
import { SolanaContext } from 'context'
import { Instruction } from '@project-serum/anchor'

export class SPLTokenProcessor extends SolanaBaseProcessor {
  private TokenInstructionMapCache: Map<string, TokenInstruction | undefined> =
    new Map()

  static bind(
    address: string,
    endpoint: string,
    name = 'Token Program'
  ): SPLTokenProcessor {
    return new SPLTokenProcessor(name, address, endpoint)
  }

  public fromParsedInstruction(
    instruction: ParsedInstruction
  ): Instruction | null {
    const instructionType = instruction.parsed.type as string
    if (
      !instructionType ||
      !this.instructionTypeToTokenInstruction(instructionType)
    ) {
      return null
    }
    return {
      name: instruction.parsed.type,
      data: {
        instruction: this.instructionTypeToTokenInstruction(instructionType),
        ...instruction.parsed.info,
      },
    }
  }

  private instructionTypeToTokenInstruction(
    type: string
  ): TokenInstruction | undefined {
    const findTokenInstruction: () => TokenInstruction | undefined = () => {
      const camelCaseType = type[0].toLowerCase() + type.substring(1)
      const index = Object.keys(TokenInstruction).indexOf(camelCaseType)
      if (index !== -1) {
        return Object.values(TokenInstruction)[index] as TokenInstruction
      }
      return undefined
    }

    if (!this.TokenInstructionMapCache.has(type)) {
      this.TokenInstructionMapCache.set(type, findTokenInstruction())
    }

    return this.TokenInstructionMapCache.get(type)
  }

  public onInitializeMint(
    handler: (data: InitializeMintInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeMint', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMintInstructionData, ctx)
      }
    })
    return this
  }

  public onInitializeAccount(
    hanlder: (
      data: InitializeAccountInstructionData,
      ctx: SolanaContext
    ) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccountInstructionData, ctx)
      }
    })
    return this
  }

  public onInitializeAccount2(
    hanlder: (
      data: InitializeAccount2InstructionData,
      ctx: SolanaContext
    ) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount2', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccount2InstructionData, ctx)
      }
    })
    return this
  }

  public onInitializeAccount3(
    hanlder: (
      data: InitializeAccount3InstructionData,
      ctx: SolanaContext
    ) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeAccount3', (ins: Instruction, ctx) => {
      if (ins) {
        hanlder(ins.data as InitializeAccount3InstructionData, ctx)
      }
    })
    return this
  }

  public onInitializeMultisig(
    handler: (
      data: InitializeMultisigInstructionData,
      ctx: SolanaContext
    ) => void
  ): SPLTokenProcessor {
    this.onInstruction('initializeMultisig', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as InitializeMultisigInstructionData, ctx)
      }
    })
    return this
  }

  public onTransfer(
    handler: (data: TransferInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('transfer', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as TransferInstructionData, ctx)
      }
    })
    return this
  }

  public onApprovend(
    handler: (data: ApproveInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('approve', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ApproveInstructionData, ctx)
      }
    })
    return this
  }

  public onRevoke(
    handler: (data: RevokeInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('revoke', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as RevokeInstructionData, ctx)
      }
    })
    return this
  }

  public onSetAuthority(
    handler: (data: any, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('setAuthority', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as any, ctx)
      }
    })
    return this
  }

  public onMintTo(
    handler: (data: MintToInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('mintTo', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as MintToInstructionData, ctx)
      }
    })
    return this
  }

  public onBurn(
    handler: (data: BurnInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('burn', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as BurnInstructionData, ctx)
      }
    })
    return this
  }

  public onCloseAccount(
    handler: (data: CloseAccountInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('closeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as CloseAccountInstructionData, ctx)
      }
    })
    return this
  }

  public onFreezeAccount(
    handler: (data: FreezeAccountInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('freezeAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as FreezeAccountInstructionData, ctx)
      }
    })
    return this
  }

  public onThawAccount(
    handler: (data: ThawAccountInstructionData, ctx: SolanaContext) => void
  ): SPLTokenProcessor {
    this.onInstruction('thawAccount', (ins: Instruction, ctx) => {
      if (ins) {
        handler(ins.data as ThawAccountInstructionData, ctx)
      }
    })
    return this
  }
  // Todo(pcxu): auto gen this file
}
