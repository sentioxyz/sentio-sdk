import { SolanaBaseProcessor } from '../../solana-processor'
import { SolanaContext } from '../../context'
import { Instruction } from '@project-serum/anchor'
import { Approve, Burn, CloseAccount, FreezeAccount, InitializeAccount, InitializeAccount2, InitializeAccount3, InitializeMint, InitializeMultisig, MintTo, Revoke, ThawAccount, Transfer } from './types';
import { SolanaBindOptions } from '../../bind-options';

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
  // Todo(pcxu): auto gen this file
}
