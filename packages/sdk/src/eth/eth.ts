import {
  LogParams,
  formatBlock,
  formatLog,
  TransactionReceiptParams,
  formatTransactionResponse,
  allowNull,
  arrayOf,
  formatHash,
  formatReceiptLog,
  object,
  formatData
} from 'ethers/providers'
import {
  CallExceptionError,
  LogDescription,
  Result,
  DeferredTopicFilter,
  BlockParams,
  Interface,
  Contract,
  Addressable,
  InterfaceAbi,
  ContractRunner
} from 'ethers'
import { ContractContext } from './context.js'
import { getAddress } from 'ethers/address'
import { getBigInt, getNumber, hexlify } from 'ethers/utils'
import { EthCallContext, EthCallParam } from '@sentio/protos'
import { ALL_ADDRESS } from '../core/index.js'

export interface IResult {
  /**
   *  Returns the Result as a normal Array.
   */
  toArray(): Array<any>
  /**
   *  Returns the Result as an Object with each name-value pair.
   */
  toObject(): Record<string, any>
}

export interface TypedEvent<TArgsArray extends Array<any> = any, TArgsObject = any> extends LogParams {
  args: TArgsObject & IResult
  name: string
}

export type TypedEventFilter<_TEvent extends TypedEvent> = DeferredTopicFilter

export interface RichBlock extends BlockParams {
  traces?: Trace[]
  transactionReceipts?: TransactionReceiptParams[]
}

export class SimpleEthersError extends Error {
  e: Error

  constructor(message: string, e: Error, stack?: string) {
    super(message)
    this.stack = stack
  }

  toString() {
    return this.message + '\n' + this.stack?.toString()
  }
}

export function transformEtherError(e: Error, ctx: ContractContext<any, any> | undefined, stack?: string): Error {
  if (e instanceof SimpleEthersError) {
    return e
  }

  const checkPage = 'Check here for possible cause and fix: https://docs.sentio.xyz/docs/handling-errors#ethers-error'

  let msg = ''
  const err = e as CallExceptionError
  if (err.code === 'CALL_EXCEPTION' || err.code === 'BAD_DATA') {
    if (err.data === '0x') {
      if (ctx) {
        msg = `jsonrpc eth_call return '0x' (likely contract not existed) at chain ${ctx.chainId}, ${checkPage}:\n${e.message}`
      } else {
        msg = `jsonrpc eth_call return '0x' (likely contract not existed), ${checkPage}:\n${e.message}`
      }
      return new SimpleEthersError(msg, err, stack)
    } else {
      return new SimpleEthersError(`eth call error ${err.message}, ${checkPage}:\n${JSON.stringify(err)}`, err, stack)
    }
  }

  msg = `other error during call error ${e.message}\n` + JSON.stringify(e) + '\n' + stack?.toString() + '\n' + checkPage
  return new Error(msg)
}

export function fixEmptyKey(result: LogDescription): Result {
  const keys = []

  for (const [i, arg] of result.fragment.inputs.entries()) {
    if (arg.name === '') {
      keys.push('arg' + i)
    } else {
      keys.push(arg.name)
    }
  }
  return Result.fromItems(Array.from(result.args.values()), keys)
}

const _formatTransactionReceipt = object(
  {
    to: allowNull(getAddress, null),
    from: allowNull(getAddress, null),
    contractAddress: allowNull(getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: getNumber,
    root: allowNull(hexlify),
    gasUsed: getBigInt,
    logsBloom: allowNull(formatData),
    blockHash: formatHash,
    hash: formatHash,
    logs: allowNull(arrayOf(formatReceiptLog)), // Only thing that different
    blockNumber: getNumber,
    //confirmations: allowNull(getNumber, null),
    cumulativeGasUsed: getBigInt,
    effectiveGasPrice: allowNull(getBigInt),
    gasPrice: allowNull(getBigInt),
    l1Fee: allowNull(getBigInt),
    status: allowNull(getNumber),
    type: allowNull(getNumber, 0)
  },
  {
    // effectiveGasPrice: ['gasPrice'],
    hash: ['transactionHash'],
    index: ['transactionIndex']
  }
)

function formatTransactionReceipt(value: any): TransactionReceiptParams {
  return _formatTransactionReceipt(value)
}

export function formatEthData(data: {
  log?: any
  block?: any
  trace?: any
  transaction?: any
  transactionReceipt?: any
  __formattedEthData?: any
}) {
  // Return cached result if it exists
  if (data.__formattedEthData) {
    return data.__formattedEthData
  }

  try {
    const log = data.log ? formatLog(data.log) : undefined
    if (data.block && !data.block.transactions) {
      data.block.transactions = []
    }
    const block = data.block ? formatRichBlock(data.block) : undefined
    const trace = data.trace ? (data.trace as Trace) : undefined
    let transaction = undefined
    if (data.transaction) {
      if (!data.transaction.v) {
        data.transaction.v = '0x1c'
        data.transaction.r = '0x88ff6cf0fefd94db46111149ae4bfc179e9b94721fffd821d38d16464b3f71d0'
        data.transaction.s = '0x45e0aff800961cfce805daef7016b9b675c137a6a41a548f7b60a3484c06a33a'
      }
      transaction = formatTransactionResponse(data.transaction)
    }
    const transactionReceipt = data.transactionReceipt ? formatTransactionReceipt(data.transactionReceipt) : undefined

    const result = {
      log,
      block,
      trace,
      transaction,
      transactionReceipt
    }

    // Cache the result on the input data object
    data.__formattedEthData = result
    return result
  } catch (e) {
    console.error('Error formatting eth data', e)
    return data
  }
}

export function formatRichBlock(block: RichBlock): RichBlock {
  block = { ...block, ...formatBlock(block) }
  if (block.transactionReceipts) {
    block.transactionReceipts = block.transactionReceipts.map((t) => formatTransactionReceipt(t))
  }
  return block
}

export interface TypedCallTrace<TArgsArray extends Array<any> = any, TArgsObject = any> extends Trace {
  args: TArgsObject & IResult
  name: string
  functionSignature: string
}

export interface Trace {
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
  to?: string
  value: number
  gas: number
  input?: string
  callType?: string

  init?: string
  address?: string
  balance?: string
  refundAddress?: string
}

// TODO are more field missing for FailedCall, FailedCreate
export interface TraceResult {
  gasUsed: number
  output?: string
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

// const trac2: Trace =
//     {
//       "action": {
//         "from": "0x95ba4cf87d6723ad9c0db21737d862be80e93911",
//         "gas": 0x630d0b,
//         "init": "0x608060405234801561001057600080fd5b50604051602080610b2983398101806040528101908080519060200190929190505050808060405180807f6f72672e7a657070656c696e6f732e70726f78792e696d706c656d656e74617481526020017f696f6e000000000000000000000000000000000000000000000000000000000081525060230190506040518091039020600019167f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3600102600019161415156100c657fe5b6100de81610169640100000000026401000000009004565b5060405180807f6f72672e7a657070656c696e6f732e70726f78792e61646d696e000000000000815250601a0190506040518091039020600019167f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b6001026000191614151561014a57fe5b6101623361024e640100000000026401000000009004565b5050610290565b60006101878261027d6401000000000261084b176401000000009004565b1515610221576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603b8152602001807f43616e6e6f742073657420612070726f787920696d706c656d656e746174696f81526020017f6e20746f2061206e6f6e2d636f6e74726163742061646472657373000000000081525060400191505060405180910390fd5b7f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c360010290508181555050565b60007f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b60010290508181555050565b600080823b905060008111915050919050565b61088a8061029f6000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633659cfe6146100775780634f1ef286146100ba5780635c60da1b146101085780638f2839701461015f578063f851a440146101a2575b6100756101f9565b005b34801561008357600080fd5b506100b8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610213565b005b610106600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001908201803590602001919091929391929390505050610268565b005b34801561011457600080fd5b5061011d610308565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561016b57600080fd5b506101a0600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610360565b005b3480156101ae57600080fd5b506101b761051e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610201610576565b61021161020c610651565b610682565b565b61021b6106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561025c57610257816106d9565b610265565b6102646101f9565b5b50565b6102706106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102fa576102ac836106d9565b3073ffffffffffffffffffffffffffffffffffffffff163483836040518083838082843782019150509250505060006040518083038185875af19250505015156102f557600080fd5b610303565b6103026101f9565b5b505050565b60006103126106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103545761034d610651565b905061035d565b61035c6101f9565b5b90565b6103686106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561051257600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614151515610466576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260368152602001807f43616e6e6f74206368616e6765207468652061646d696e206f6620612070726f81526020017f787920746f20746865207a65726f20616464726573730000000000000000000081525060400191505060405180910390fd5b7f7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f61048f6106a8565b82604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a161050d81610748565b61051b565b61051a6101f9565b5b50565b60006105286106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561056a576105636106a8565b9050610573565b6105726101f9565b5b90565b61057e6106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151515610647576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001807f43616e6e6f742063616c6c2066616c6c6261636b2066756e6374696f6e20667281526020017f6f6d207468652070726f78792061646d696e000000000000000000000000000081525060400191505060405180910390fd5b61064f610777565b565b6000807f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c36001029050805491505090565b3660008037600080366000845af43d6000803e80600081146106a3573d6000f35b3d6000fd5b6000807f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b6001029050805491505090565b6106e281610779565b7fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b81604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a150565b60007f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b60010290508181555050565b565b60006107848261084b565b151561081e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603b8152602001807f43616e6e6f742073657420612070726f787920696d706c656d656e746174696f81526020017f6e20746f2061206e6f6e2d636f6e74726163742061646472657373000000000081525060400191505060405180910390fd5b7f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c360010290508181555050565b600080823b9050600081119150509190505600a165627a7a72305820a4a547cfc7202c5acaaae74d428e988bc62ad5024eb0165532d3a8f91db4ed2400290000000000000000000000000882477e7895bdc5cea7cb1552ed914ab157fe56",
//         "value": 0x0
//       },
//       "blockHash": "0xb2f6986457f5a24ff088a0beb5567c8c1fe2da02687c78e743507ee7c982b977",
//       "blockNumber": 6082465,
//       "result": {
//         "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//         "code": "0x60806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633659cfe6146100775780634f1ef286146100ba5780635c60da1b146101085780638f2839701461015f578063f851a440146101a2575b6100756101f9565b005b34801561008357600080fd5b506100b8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610213565b005b610106600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001908201803590602001919091929391929390505050610268565b005b34801561011457600080fd5b5061011d610308565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561016b57600080fd5b506101a0600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610360565b005b3480156101ae57600080fd5b506101b761051e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610201610576565b61021161020c610651565b610682565b565b61021b6106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561025c57610257816106d9565b610265565b6102646101f9565b5b50565b6102706106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102fa576102ac836106d9565b3073ffffffffffffffffffffffffffffffffffffffff163483836040518083838082843782019150509250505060006040518083038185875af19250505015156102f557600080fd5b610303565b6103026101f9565b5b505050565b60006103126106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103545761034d610651565b905061035d565b61035c6101f9565b5b90565b6103686106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561051257600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614151515610466576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260368152602001807f43616e6e6f74206368616e6765207468652061646d696e206f6620612070726f81526020017f787920746f20746865207a65726f20616464726573730000000000000000000081525060400191505060405180910390fd5b7f7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f61048f6106a8565b82604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a161050d81610748565b61051b565b61051a6101f9565b5b50565b60006105286106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561056a576105636106a8565b9050610573565b6105726101f9565b5b90565b61057e6106a8565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151515610647576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001807f43616e6e6f742063616c6c2066616c6c6261636b2066756e6374696f6e20667281526020017f6f6d207468652070726f78792061646d696e000000000000000000000000000081525060400191505060405180910390fd5b61064f610777565b565b6000807f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c36001029050805491505090565b3660008037600080366000845af43d6000803e80600081146106a3573d6000f35b3d6000fd5b6000807f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b6001029050805491505090565b6106e281610779565b7fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b81604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a150565b60007f10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b60010290508181555050565b565b60006107848261084b565b151561081e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603b8152602001807f43616e6e6f742073657420612070726f787920696d706c656d656e746174696f81526020017f6e20746f2061206e6f6e2d636f6e74726163742061646472657373000000000081525060400191505060405180910390fd5b7f7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c360010290508181555050565b600080823b9050600081119150509190505600a165627a7a72305820a4a547cfc7202c5acaaae74d428e988bc62ad5024eb0165532d3a8f91db4ed240029",
//         "gasUsed": 0x74f42
//       },
//       "subtraces": 0,
//       "traceAddress": [],
//       "transactionHash": "0xe7e0fe390354509cd08c9a0168536938600ddc552b3f7cb96030ebef62e75895",
//       "transactionPosition": 22,
//       "type": "create"
//     }

export function isNullAddress(address: string) {
  try {
    // Normalize the input address
    const normalizedAddress = getAddress(address)
    // Check if the normalized address is equal to the null address (all zeros)
    return normalizedAddress === '0x0000000000000000000000000000000000000000'
  } catch (error) {
    return false
  }
}

export function validateAndNormalizeAddress(address: string): string {
  if (address === ALL_ADDRESS) {
    return address
  }
  const normalizedAddress = getAddress(address)
  return normalizedAddress.toLowerCase()
}

export function encodeCallData(
  context: EthCallContext,
  name: string,
  funcABI: string,
  values?: ReadonlyArray<any>
): EthCallParam {
  try {
    const iface = new Interface([funcABI])
    const calldata = iface.encodeFunctionData(name, values)
    return {
      context,
      calldata
    }
  } catch (e) {
    const stack = new Error().stack
    throw transformEtherError(e, undefined, stack)
  }
}

export function newContract(
  target: string | Addressable,
  abi: Interface | InterfaceAbi,
  runner?: ContractRunner | null | undefined
) {
  return new Contract(target, abi, runner)
}

export function newInterface(fragments: InterfaceAbi) {
  return new Interface(fragments)
}
