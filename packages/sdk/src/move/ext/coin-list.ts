import { BigDecimal } from '@sentio/bigdecimal'
import { SimpleCoinInfo } from './move-dex.js'

export interface MoveCoinList<Network> {
  whiteListed(type: string): boolean
  whitelistCoins(): Map<string, SimpleCoinInfo>
  getCoinInfo(type: string): SimpleCoinInfo
  calculateValueInUsd(
    amount: bigint,
    coinInfo: SimpleCoinInfo,
    timestamp: number,
    network: Network
  ): Promise<BigDecimal>
}
