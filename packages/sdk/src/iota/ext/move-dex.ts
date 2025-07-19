import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor, BaseCoinInfo } from '../../move/ext/index.js'
import { IotaEvent, IotaMoveNormalizedModule, IotaMoveObject } from '@iota/iota-sdk/client'
import { IotaNetwork } from '../network.js'
import { IotaContext, IotaObjectContext } from '../context.js'

export type PoolAdaptor<T> = MovePoolAdaptor<IotaMoveObject, T>

export class CoinList implements MoveCoinList<BaseCoinInfo, IotaNetwork> {
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

export const IotaCoinList = new CoinList()

export class IotaDex<T> extends MoveDex<
  BaseCoinInfo,
  IotaNetwork,
  IotaMoveNormalizedModule,
  IotaMoveObject,
  IotaEvent,
  IotaContext,
  IotaObjectContext,
  T
> {
  coinList = IotaCoinList
  declare poolAdaptor: PoolAdaptor<T>
}

export async function getPairValue(
  ctx: IotaContext,
  coinx: string,
  coiny: string,
  coinXAmount: bigint,
  coinYAmount: bigint
): Promise<BigDecimal> {
  return moveGetPairValue(IotaCoinList, ctx, coinx, coiny, coinXAmount, coinYAmount)
}
