import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import { AptosResourcesContext, AptosContext, AptosNetwork } from '../index.js'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor, SimpleCoinInfo } from '../../move/ext/index.js'
import { MoveResource, Event, MoveModuleBytecode } from '@aptos-labs/ts-sdk'

export type PoolAdaptor<T> = MovePoolAdaptor<MoveResource, T>

export class CoinList implements MoveCoinList<AptosNetwork> {
  calculateValueInUsd(
    amount: bigint,
    coinInfo: SimpleCoinInfo,
    timestamp: number,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): Promise<BigDecimal> {
    return calculateValueInUsd(amount, coinInfo, timestamp, network)
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
