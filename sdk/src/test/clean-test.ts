import { ProcessorState } from '../processor-state'

export function cleanTest() {
  global.PROCESSOR_STATE = new ProcessorState()
}
