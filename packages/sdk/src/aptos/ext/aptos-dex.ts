import { BigDecimal } from '@sentio/bigdecimal'
import { AptosResourcesContext, AptosContext, AptosNetwork } from '../index.js'
import { MoveCoinList, MoveDex, moveGetPairValue, MovePoolAdaptor } from '../../move/ext/index.js'
import { MoveResource, Event, MoveModuleBytecode } from '@aptos-labs/ts-sdk'
import { getTokenInfoWithFallback, TokenInfo, tokenTokenValueInUsd, whitelistTokens } from './token.js'

export type PoolAdaptor<T> = MovePoolAdaptor<MoveResource, T>

export class CoinList implements MoveCoinList<TokenInfo, AptosNetwork> {
  calculateValueInUsd(
    amount: bigint,
    coinInfo: TokenInfo,
    timestamp: number,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): Promise<BigDecimal> {
    return tokenTokenValueInUsd(amount, coinInfo, timestamp, network)
  }

  async getCoinInfo(type: string) {
    return getTokenInfoWithFallback(type)
  }

  whiteListed(type: string): boolean {
    return whitelistTokens().has(type)
  }

  whitelistCoins() {
    return whitelistTokens()
  }
}

export const AptosCoinList = new CoinList()

export class AptosDex<T> extends MoveDex<
  TokenInfo,
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
