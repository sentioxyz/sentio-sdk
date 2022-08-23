import { ProcessorState } from '@sentio/sdk'

export function cleanTest() {
  global.PROCESSOR_STATE = new ProcessorState()
}
