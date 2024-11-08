import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor, BaseCoinInfo } from '../../move/ext/index.js'
import { SuiEvent, SuiMoveNormalizedModule, SuiMoveObject } from '@mysten/sui/client'
import { SuiNetwork } from '../network.js'
import { SuiContext, SuiObjectContext } from '../context.js'

export type PoolAdaptor<T> = MovePoolAdaptor<SuiMoveObject, T>

export class CoinList implements MoveCoinList<BaseCoinInfo, SuiNetwork> {
  calculateValueInUsd(amount: bigint, coinInfo: BaseCoinInfo, timestamp: number): Promise<BigDecimal> {
    return calculateValueInUsd(amount, coinInfo, timestamp)
  }

  async getCoinInfo(type: string) {
    return getCoinInfo(type)
  }

  whiteListed(type: string): boolean {
    return whiteListed(type)
  }

  whitelistCoins(): Map<string, BaseCoinInfo> {
    return whitelistCoins()
  }
}

export const SuiCoinList = new CoinList()

export class SuiDex<T> extends MoveDex<
  BaseCoinInfo,
  SuiNetwork,
  SuiMoveNormalizedModule,
  SuiMoveObject,
  SuiEvent,
  SuiContext,
  SuiObjectContext,
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
