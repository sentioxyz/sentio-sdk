import { TestProcessorServer } from './test-processor-server.js'
import { FuelChainId } from '@sentio/chain'
import { DataBinding, HandlerType } from '@sentio/protos'
import { FuelNetwork } from '../fuel/index.js'
import { getRpcEndpoint } from '../fuel/network.js'

export class FuelFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testOnTransaction(transaction: TestFuelTransaction, network: FuelNetwork = FuelNetwork.TEST_NET) {
    const bindings = this.buildBinding(transaction, network)
    if (!bindings) {
      throw Error('Invalid test transaction: ' + JSON.stringify(transaction))
    }

    return this.server.processBindings({
      bindings
    })
  }

  /*
   * Test on transactions by downloading them from the network
   */
  async testOnTransactionByID(network: FuelNetwork = FuelNetwork.TEST_NET, ...txIds: string[]) {
    const url = getRpcEndpoint(network)

    const allBindings: DataBinding[] = []
    for (const txId of txIds) {
      const tx = await this.gqlQuery(url, txId)

      const bindings = this.buildBinding(tx, network)
      allBindings.push(...bindings)
    }
    return this.server.processBindings({
      bindings: allBindings
    })
  }

  private buildBinding(transaction: any, network: FuelChainId): DataBinding[] {
    const res: DataBinding[] = []
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }
      for (const callConfig of config.fuelTransactionConfigs) {
        const binding = {
          data: {
            fuelTransaction: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [callConfig.handlerId],
          handlerType: HandlerType.FUEL_TRANSACTION,
          chainId: network
        }

        res.push(binding)
      }

      for (const assetConfig of config.assetConfigs) {
        const binding = {
          data: {
            fuelTransaction: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [assetConfig.handlerId],
          handlerType: HandlerType.FUEL_TRANSACTION,
          chainId: network
        }

        res.push(binding)
      }
    }

    // keep receipts order
    const receipts = transaction.status.receipts || []
    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i]
      if (receipt.receiptType != 'LOG' && receipt.receiptType != 'LOG_DATA') {
        continue
      }

      for (const config of this.server.contractConfigs) {
        for (const logConfig of config.fuelReceiptConfigs) {
          const logIds = logConfig.log?.logIds ?? []
          if (logIds.includes(receipt.rb)) {
            const binding = {
              data: {
                fuelLog: {
                  transaction,
                  timestamp: new Date(),
                  receiptIndex: BigInt(i)
                }
              },
              handlerIds: [logConfig.handlerId],
              handlerType: HandlerType.FUEL_RECEIPT,
              chainId: network
            }
            res.push(binding)
          }
        }
      }
    }

    return res
  }

  private async gqlQuery(url: string, txId: string) {
    const res = await fetch(url, {
      body: JSON.stringify({
        query: GetTransactionQuery,
        variables: {
          id: txId
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
    if (!res.ok) {
      throw Error('Failed to fetch transaction: ' + res.statusText)
    }
    const json = (await res.json()) as any
    return json.data.transaction as TestFuelTransaction
  }
}

export interface TestFuelTransaction {
  inputs?: Input[]
  outputs?: Output[]
  status?: Status
  rawPayload?: string
}

interface Input {
  utxoId: string
  balanceRoot?: string
  stateRoot?: string
  txPointer: string
  contractId?: string
  owner?: string
  amount?: string
  assetId?: string
  predicateGasUsed?: string
  predicate?: string
  predicateData?: string
}

interface Output {
  inputIndex?: string
  balanceRoot?: string
  stateRoot?: string
  to?: string
  amount?: string
  assetId?: string
}

interface Status {
  transactionId: string
  time: string
  totalGas: string
  totalFee: string
  block: Block
  receipts: Receipt[]
}

interface Block {
  id: string
  height: string
}

interface Receipt {
  id?: string | null
  pc?: string | null
  is?: string | null
  to?: string | null
  toAddress?: string | null
  amount?: string | null
  assetId?: string | null
  gas?: string | null
  param1?: string | null
  param2?: string | null
  val?: string | null
  ptr?: string | null
  digest?: string | null
  reason?: string | null
  ra?: string | null
  rb?: string | null
  rc?: string | null
  rd?: string | null
  len?: string | null
  receiptType: string
  result?: string | null
  gasUsed?: string | null
  data?: string | null
  sender?: string | null
  recipient?: string | null
  nonce?: string | null
  contractId?: string | null
  subId?: string | null
}

const GetTransactionQuery = `
      query GetTransaction($id: TransactionId!) {
    transaction(id: $id) {
        id
        rawPayload
        status {
            type: __typename
            ... on SuccessStatus {
                block {
                    id
                    header {
                        height
                    }
                }
                time
                programState {
                    returnType
                    data
                }
                blockHeight
                transactionId
                totalGas
                totalFee
                receipts {
                    id
                    pc
                    is
                    to
                    toAddress
                    amount
                    assetId
                    gas
                    param1
                    param2
                    val
                    ptr
                    digest
                    reason
                    ra
                    rb
                    rc
                    rd
                    len
                    receiptType
                    result
                    gasUsed
                    data
                    sender
                    recipient
                    nonce
                    contractId
                    subId
                }
            }
            ... on SubmittedStatus {
                time
            }
            ... on SqueezedOutStatus {
                reason
            }
            ... on FailureStatus {
                transactionId
                blockHeight
                time
                reason
                totalGas
                totalFee
            }
        }
        inputs {
            ... on InputCoin {
                utxoId
                owner
                amount
                assetId
                txPointer
                witnessIndex
                predicateGasUsed
                predicate
                predicateData
            }
            ... on InputContract {
                utxoId
                balanceRoot
                stateRoot
                txPointer
                contractId
            }
            ... on InputMessage {
                sender
                recipient
                amount
                nonce
                predicateGasUsed
                data
                predicate
                predicateData
            }
        }
        outputs {
            ... on ContractCreated {
                contract
                stateRoot
            }
            ... on VariableOutput {
                to
                amount
                assetId
            }
            ... on ChangeOutput {
                to
                amount
                assetId
            }
            ... on ContractOutput {
                inputIndex
                balanceRoot
                stateRoot
            }
            ... on CoinOutput {
                to
                amount
                assetId
            }
        }
        receiptsRoot
    }
}`
