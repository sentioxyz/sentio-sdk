export interface RpcConfig {
  Url: string
  Meta?: Record<string, string>
}

export interface ChainConfig {
  ChainID: string
  Https?: string[]
  Rpc?: RpcConfig
}
