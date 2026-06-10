import { TestProcessorServer } from './test-processor-server.js'
import { Data_SolInstructionSchema, DataBindingSchema, HandlerType, type ProcessBindingResponse } from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { ChainId } from '@sentio/chain'

export class SolanaFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testInstructions(
    instructions: MessageInitShape<typeof Data_SolInstructionSchema>[]
  ): Promise<ProcessBindingResponse> {
    return this.server.processBindings({
      bindings: instructions.map((instruction) => {
        return create(DataBindingSchema, {
          data: {
            value: {
              case: 'solInstruction',
              value: instruction
            }
          },
          handlerIds: [],
          handlerType: HandlerType.SOL_INSTRUCTION,
          chainId: ChainId.SOLANA_MAINNET
        })
      })
    })
  }
}
