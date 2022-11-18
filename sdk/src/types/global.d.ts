import { ProcessorState } from '../processor-state'
import { Endpoints } from "../endpoints";

declare global {
  var PROCESSOR_STATE: ProcessorState
  var ENDPOINTS: Endpoints
}