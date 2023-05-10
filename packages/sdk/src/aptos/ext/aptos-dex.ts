import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import {
  AptosResourcesContext,
  MoveResource,
  AptosContext,
  AptosNetwork,
  MoveModuleBytecode,
  Event,
} from '@sentio/sdk/aptos'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor, SimpleCoinInfo } from '../../move/ext/index.js'

export type PoolAdaptor<T> = MovePoolAdaptor<MoveResource, T>

export class CoinList implements MoveCoinList {
  calculateValueInUsd(amount: bigint, coinInfo: SimpleCoinInfo, timestamp: number): Promise<BigDecimal> {
    return calculateValueInUsd(amount, coinInfo, timestamp)
  }

  getCoinInfo(type: string): SimpleCoinInfo {
    return getCoinInfo(type)
  }

  whiteListed(type: string): boolean {
    return whiteListed(type)
  }

  whitelistCoins(): Map<string, SimpleCoinInfo> {
    return whitelistCoins()
  }
}

export const AptosCoinList = new CoinList()

export class AptosDex<T> extends MoveDex<
  AptosNetwork,
  MoveModuleBytecode,
  MoveResource,
  Event,
  AptosContext,
  AptosResourcesContext,
  T
> {
  coinList = new CoinList()
  declare poolAdaptor: PoolAdaptor<T>
}

export async function getPairValue(
  ctx: AptosContext,
  coinx: string,
  coiny: string,
  coinXAmount: bigint,
  coinYAmount: bigint
): Promise<BigDecimal> {
  return moveGetPairValue(AptosCoinList, ctx, coinx, coiny, coinXAmount, coinYAmount)
}
