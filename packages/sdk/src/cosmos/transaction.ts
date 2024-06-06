export interface CosmosTransaction {
  height: string
  txhash: string
  codespace: string
  code: number
  data: string
  raw_log: string
  logs: CosmosTxLog[]
  info: string
  gas_wanted: string
  gas_used: string
  tx: RestTx
  timestamp: string
  events: CosmosEvent[]
}

interface RestTxBody {
  messages: any[]
  memo: string
  timeout_height: string
}

interface RestTx {
  body: RestTxBody
  auth_info: RestAuthInfo
  signatures: string[]
}

interface RestSignerInfo {
  public_key: any
  mode_info: any
  sequence: string
}

interface RestAuthInfo {
  signer_infos: RestSignerInfo[]
  fee: any
}

export type CosmosEvent = { type: string; attributes: { key: string; value: string }[] }

export interface CosmosTxLog {
  msg_index: number
  log: string
  events: CosmosEvent[]
}
