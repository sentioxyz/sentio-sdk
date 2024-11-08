import { DecodedStruct, TypeDescriptor } from '@typemove/move'
import { BigDecimal } from '@sentio/bigdecimal'
import { Gauge } from '../../core/index.js'
import { MoveAccountContext, MoveContext } from '../move-context.js'
import { MoveCoinList, BaseCoinInfo } from './coin.js'

export interface MovePoolAdaptor<StructType, T> {
  getXReserve(pool: T): bigint

  getYReserve(pool: T): bigint

  getExtraPoolTags(pool: DecodedStruct<StructType, T>): any

  poolType: TypeDescriptor<T>
}

export class MoveDex<
  TokenType extends BaseCoinInfo,
  Network,
  ModuleType,
  StructType,
  EventType,
  ContextType extends MoveContext<Network, ModuleType, StructType | EventType>,
  AccountContextType extends MoveAccountContext<Network, ModuleType, StructType | EventType>,
  T
> {
  coinList: MoveCoinList<TokenType, Network>
  poolAdaptor: MovePoolAdaptor<StructType, T>
  volume: Gauge
  volumeByCoin: Gauge
  tvlAll: Gauge
  tvlByPool: Gauge
  tvlByCoin: Gauge

  constructor(
    volume: Gauge,
    volumeByCoin: Gauge,
    tvlAll: Gauge,
    tvlByCoin: Gauge,
    tvlByPool: Gauge,
    poolAdaptor: MovePoolAdaptor<StructType, T>
  ) {
    this.volume = volume
    this.volumeByCoin = volumeByCoin
    this.tvlAll = tvlAll
    this.tvlByPool = tvlByPool
    this.tvlByCoin = tvlByCoin
    this.poolAdaptor = poolAdaptor
  }

  async recordTradingVolume(
    ctx: ContextType,
    coinx: string,
    coiny: string,
    coinXAmount: bigint,
    coinYAmount: bigint,
    extraLabels?: any
  ): Promise<BigDecimal> {
    let result = BigDecimal(0)

    const whitelistx = this.coinList.whiteListed(coinx)
    const whitelisty = this.coinList.whiteListed(coiny)
    if (!whitelistx && !whitelisty) {
      return result
    }
    const coinXInfo = await this.coinList.getCoinInfo(coinx)
    const coinYInfo = await this.coinList.getCoinInfo(coiny)
    const timestamp = ctx.getTimestamp()
    let resultX = BigDecimal(0)
    let resultY = BigDecimal(0)
    const pair = await this.getPair(coinx, coiny)
    const baseLabels: Record<string, string> = extraLabels ? { ...extraLabels, pair } : { pair }
    if (whitelistx) {
      resultX = await this.coinList.calculateValueInUsd(coinXAmount, coinXInfo, timestamp, ctx.network)
    }
    if (whitelisty) {
      resultY = await this.coinList.calculateValueInUsd(coinYAmount, coinYInfo, timestamp, ctx.network)
    }
    if (resultX.eq(0)) {
      resultX = BigDecimal(resultY)
    }
    if (resultY.eq(0)) {
      resultY = BigDecimal(resultX)
    }
    const total = resultX.plus(resultY)
    if (total.gt(0)) {
      this.volume.record(ctx, total, {
        ...baseLabels,
        bridge: coinXInfo.bridge
      })
    }
    if (resultX.gt(0)) {
      this.volumeByCoin.record(ctx, resultX, {
        coin: coinXInfo.symbol,
        bridge: coinXInfo.bridge,
        type: coinXInfo.type
      })
    }
    if (resultY.gt(0)) {
      this.volumeByCoin.record(ctx, resultY, {
        coin: coinYInfo.symbol,
        bridge: coinYInfo.bridge,
        type: coinYInfo.type
      })
    }
    result = resultX.plus(resultY).div(2)
    return result
  }

  async syncPools(
    resources: StructType[],
    ctx: AccountContextType,
    poolsHandler?: (pools: DecodedStruct<StructType, T>[]) => Promise<void> | void
  ) {
    const pools = await ctx.coder.filterAndDecodeStruct(this.poolAdaptor.poolType, resources)

    const volumeByCoin = new Map<string, BigDecimal>()
    const timestamp = ctx.getTimestamp()

    console.log('num of pools: ', pools.length, timestamp)

    let tvlAllValue = BigDecimal(0)
    for (const pool of pools) {
      // savePool(ctx.version, pool.type_arguments)
      const coinx = pool.type_arguments[0]
      const coiny = pool.type_arguments[1]
      const whitelistx = this.coinList.whiteListed(coinx)
      const whitelisty = this.coinList.whiteListed(coiny)
      if (!whitelistx && !whitelisty) {
        continue
      }

      const pair = await this.getPair(coinx, coiny)
      const extraLabels = this.poolAdaptor.getExtraPoolTags(pool)
      const baseLabels: Record<string, string> = { ...extraLabels, pair }

      const coinXInfo = await this.coinList.getCoinInfo(coinx)
      const coinYInfo = await this.coinList.getCoinInfo(coiny)

      const coinx_amount = this.poolAdaptor.getXReserve(pool.data_decoded)
      const coiny_amount = this.poolAdaptor.getYReserve(pool.data_decoded)

      let resultX = BigDecimal(0)
      let resultY = BigDecimal(0)

      if (whitelistx) {
        resultX = await this.coinList.calculateValueInUsd(coinx_amount, coinXInfo, timestamp, ctx.network)
        let coinXTotal = volumeByCoin.get(coinXInfo.type)
        if (!coinXTotal) {
          coinXTotal = resultX
        } else {
          coinXTotal = coinXTotal.plus(resultX)
        }
        volumeByCoin.set(coinXInfo.type, coinXTotal)
      }
      if (whitelisty) {
        resultY = await this.coinList.calculateValueInUsd(coiny_amount, coinYInfo, timestamp, ctx.network)
        let coinYTotal = volumeByCoin.get(coinYInfo.type)
        if (!coinYTotal) {
          coinYTotal = resultY
        } else {
          coinYTotal = coinYTotal.plus(resultY)
        }
        volumeByCoin.set(coinYInfo.type, coinYTotal)
      }

      if (resultX.eq(0)) {
        resultX = BigDecimal(resultY)
      }
      if (resultY.eq(0)) {
        resultY = BigDecimal(resultX)
      }

      const poolValue = resultX.plus(resultY)

      if (poolValue.isGreaterThan(0)) {
        this.tvlByPool.record(ctx, poolValue, baseLabels)
      }
      tvlAllValue = tvlAllValue.plus(poolValue)
    }
    this.tvlAll.record(ctx, tvlAllValue)

    if (poolsHandler) {
      poolsHandler(pools)
    }

    for (const [k, v] of volumeByCoin) {
      const coinInfo = this.coinList.whitelistCoins().get(k)
      if (!coinInfo) {
        throw Error('unexpected coin ' + k)
      }
      // const price = await getPrice(coinInfo, timestamp)
      // priceGauge.record(ctx, price, { coin: coinInfo.symbol })
      if (v.isGreaterThan(0)) {
        this.tvlByCoin.record(ctx, v, {
          coin: coinInfo.symbol,
          bridge: coinInfo.bridge,
          type: coinInfo.type
        })
      }
    }
  }

  async getPair(coinx: string, coiny: string): Promise<string> {
    const coinXInfo = await this.coinList.getCoinInfo(coinx)
    const coinYInfo = await this.coinList.getCoinInfo(coiny)
    if (coinXInfo.symbol.localeCompare(coinYInfo.symbol) > 0) {
      return `${coinYInfo.symbol}-${coinXInfo.symbol}`
    }
    return `${coinXInfo.symbol}-${coinYInfo.symbol}`
  }
}

export async function moveGetPairValue<
  TokenType extends BaseCoinInfo,
  Network,
  ContextType extends MoveAccountContext<Network, any, any>
>(
  coinList: MoveCoinList<TokenType, Network>,
  ctx: ContextType,
  coinx: string,
  coiny: string,
  coinXAmount: bigint,
  coinYAmount: bigint
): Promise<BigDecimal> {
  const whitelistx = coinList.whiteListed(coinx)
  const whitelisty = coinList.whiteListed(coiny)
  const coinXInfo = await coinList.getCoinInfo(coinx)
  const coinYInfo = await coinList.getCoinInfo(coiny)
  const timestamp = ctx.getTimestamp()
  let result = BigDecimal(0.0)

  if (!whitelistx || !whitelisty) {
    return result
  }

  if (whitelistx) {
    const value = await coinList.calculateValueInUsd(coinXAmount, coinXInfo, timestamp, ctx.network)
    result = value

    if (!whitelisty) {
      result = result.plus(value)
    }
  }
  if (whitelisty) {
    const value = await coinList.calculateValueInUsd(coinYAmount, coinYInfo, timestamp, ctx.network)

    if (!whitelistx) {
      result = result.plus(value)
    }
  }

  return result
}
