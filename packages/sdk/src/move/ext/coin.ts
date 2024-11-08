import { BigDecimal } from '@sentio/bigdecimal'

export interface BaseCoinInfo {
  // token_type: { type: string; account_address: string }
  type: string
  symbol: string
  hippo_symbol?: string
  decimals: number
  bridge: string
}

export interface MoveCoinList<TokenType extends BaseCoinInfo, Network> {
  whiteListed(type: string): boolean
  whitelistCoins(): Map<string, TokenType>
  getCoinInfo(type: string): Promise<TokenType>
  calculateValueInUsd(amount: bigint, coinInfo: TokenType, timestamp: number, network: Network): Promise<BigDecimal>
}
