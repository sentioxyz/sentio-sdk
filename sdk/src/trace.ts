// https://github.com/openethereum/parity-ethereum/blob/55c90d4016505317034e3e98f699af07f5404b63/rpc/src/v1/types/trace.rs#L482
import { Result } from '@ethersproject/abi'

export interface TypedTrace<TArgsArray extends Array<any> = any, TArgsObject = any> extends Trace {
  args: TArgsArray & TArgsObject
}

export interface Trace {
  args?: Result

  action: TraceAction
  blockHash: string
  blockNumber: number
  result: TraceResult
  subtraces: number
  traceAddress: number[]
  transactionHash: string
  transactionPosition: number
  type: string
  error?: string
}
// export type CallType = "call" | "callcode" |  "delegatecall" | "staticcall"

export interface TraceAction {
  from: string
  to: string
  value: number
  gas: number
  input: string
  callType: string

  init?: string
  address?: string
  balance?: string
  refundAddress?: string
}

// TODO are more field missing for FailedCall, FailedCreate
export interface TraceResult {
  gasUsed: number
  output: string
  address?: string
  code?: string
}

// const TRACE: Trace = {
//   action: {
//     from: '0xd771111cbfa2bbdafbf9f0e58b49b3f827da31f5',
//     callType: 'call',
//     gas: 0x12154,
//     input:
//       '0xb1a417f4000000000000000000000000d771111cbfa2bbdafbf9f0e58b49b3f827da31f5000000000000000000000000d771111cbfa2bbdafbf9f0e58b49b3f827da31f500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000131888b5aaf000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
//     to: '0x0baba1ad5be3a5c0a66e7ac838a129bf948f1ea4',
//     value: 0x131888b5aaf0000,
//   },
//   blockHash: '0x5451711bc530a7c04128fedbe149eb359c10eccd44a83909d448c5244c7eea26',
//   blockNumber: 15533908,
//   result: { gasUsed: 0x114c1, output: '0x' },
//   subtraces: 1,
//   traceAddress: [],
//   transactionHash: '0x66dce11d6217042ed709a38e507e7762c93b1bde4a0447ae7a243493bbdffc0e',
//   transactionPosition: 73,
//   type: 'call',
// }
