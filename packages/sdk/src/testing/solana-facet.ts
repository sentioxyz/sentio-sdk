import { TestProcessorServer } from './test-processor-server.js'
import { Data_SolInstruction, HandlerType, ProcessBindingResponse } from '@sentio/protos'

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
            solInstruction: instruction,
          },
          handlerIds: [],
          handlerType: HandlerType.SOL_INSTRUCTION,
        }
      }),
    })
  }
}
