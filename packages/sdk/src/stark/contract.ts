import {
  ArgsOrCalldata,
  ArgsOrCalldataWithOptions,
  AsyncContractFunction,
  CallOptions,
  Contract,
  Result,
  RpcProvider,
  CallData,
  splitArgsAndOptions
} from 'starknet'
import { Abi } from '@sentio/abi-wan-kanabi'

export class StarknetContractView {
  private _contract: Contract

  constructor(
    readonly abi: Abi,
    readonly address: string,
    readonly provider: RpcProvider,
    readonly blockNumber: number
  ) {
    this._contract = new Contract(abi, address, provider)
    const callData = new CallData(abi)

    for (const fn of callData.abi) {
      if (fn.type == 'function' && fn.state_mutability == 'view') {
        const signature = fn.name
        Object.defineProperty(this, signature, {
          enumerable: true,
          writable: false,
          value: buildCall(this, signature)
        })
      }
    }
  }

  call(method: string, args?: ArgsOrCalldata, callOptions?: CallOptions): Promise<Result> {
    return this._contract.call(method, args, {
      ...callOptions,
      blockIdentifier: this.blockNumber
    })
  }
}

function buildCall(contract: StarknetContractView, name: string): AsyncContractFunction {
  return async function (...args: ArgsOrCalldataWithOptions): Promise<any> {
    const params = splitArgsAndOptions(args)
    return contract.call(name, params.args, {
      parseRequest: true,
      parseResponse: true,
      ...params.options
    })
  }
}
