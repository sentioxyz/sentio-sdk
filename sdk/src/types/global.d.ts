import { ProcessorState } from '../state/processor-state'
import { Endpoints } from "../endpoints";

declare global {
  var PROCESSOR_STATE: ProcessorState
  var ENDPOINTS: Endpoints
}


// declare module "long" {
//   export interface Long {
//     toBigInt(): bigint;
//   }
// }
//