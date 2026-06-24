export interface RpcConfig {
  Url: string
  Headers?: Record<string, string>
}

export interface ChainConfig {
  ChainID: string
  Https?: string[]
  Rpc?: RpcConfig
}
