import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor, SimpleCoinInfo } from '../../move/ext/index.js'
import { SuiMoveObject, SuiMovePackage } from '@mysten/sui.js'
import { SuiNetwork } from '../network.js'
import { SuiContext, SuiObjectsContext } from '../context.js'

export type PoolAdaptor<T> = MovePoolAdaptor<SuiMoveObject, T>

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

export const SuiCoinList = new CoinList()

export class SuiDex<T> extends MoveDex<
  SuiNetwork,
  SuiMovePackage,
  SuiMoveObject,
  Event,
  SuiContext,
  SuiObjectsContext,
  T
> {
  coinList = SuiCoinList
  declare poolAdaptor: PoolAdaptor<T>
}

export async function getPairValue(
  ctx: SuiContext,
  coinx: string,
  coiny: string,
  coinXAmount: bigint,
  coinYAmount: bigint
): Promise<BigDecimal> {
  return moveGetPairValue(SuiCoinList, ctx, coinx, coiny, coinXAmount, coinYAmount)
}
