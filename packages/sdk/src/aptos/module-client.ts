import { defaultMoveCoder } from './index.js'
import { AptosClient, Types } from 'aptos-sdk'

export class ModuleClient {
  client: AptosClient
  constructor(client: AptosClient | string) {
    if (typeof client === 'string') {
      this.client = new AptosClient(client)
    } else {
      this.client = client
    }
  }
  public async viewDecoded(
    func: string,
    typeArguments: string[],
    args: any[],
    ledger_version?: bigint
  ): Promise<any[]> {
    const coder = defaultMoveCoder()
    const encodedArgs = coder.encodeCallArgs(args, func)

    const request: Types.ViewRequest = {
      function: func,
      type_arguments: typeArguments,
      arguments: encodedArgs,
    }
    const res = await this.client.view(request, ledger_version?.toString())
    return coder.decodeCallResult(res, func)
  }
}
