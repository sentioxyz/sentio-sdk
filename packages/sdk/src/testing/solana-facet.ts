import { TestProcessorServer } from './test-processor-server.js'
import { Data_SolInstruction, HandlerType, ProcessBindingResponse } from '@sentio/protos'
import { ChainId } from '@sentio/chain'

export class SolanaFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testInstructions(instructions: Data_SolInstruction[]): Promise<ProcessBindingResponse> {
    return this.server.processBindings({
      bindings: instructions.map((instruction) => {
        return {
          data: {
            raw: new Uint8Array(),
            solInstruction: instruction
          },
          handlerIds: [],
          handlerType: HandlerType.SOL_INSTRUCTION,
          chainId: ChainId.SOLANA_MAINNET
        }
      })
    })
  }
}
