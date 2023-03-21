import { Gauge } from '@sentio/sdk'
import { BigDecimal } from '@sentio/bigdecimal'
import { calculateValueInUsd, getCoinInfo, whitelistCoins, whiteListed } from './coin.js'
import {
  AptosResourceContext,
  TypedMoveResource,
  MoveResource,
  defaultMoveCoder,
  AptosContext,
} from '@sentio/sdk/aptos'

export interface PoolAdaptor<T> {
  getXReserve(pool: T): bigint
  getYReserve(pool: T): bigint
  getExtraPoolTags(pool: TypedMoveResource<T>): any
  poolTypeName: string
}

export class AptosDex<T> {
  poolAdaptor: PoolAdaptor<T>
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
    poolAdaptor: PoolAdaptor<T>
  ) {
    this.volume = volume
    this.volumeByCoin = volumeByCoin
    this.tvlAll = tvlAll
    this.tvlByPool = tvlByPool
    this.tvlByCoin = tvlByCoin
    this.poolAdaptor = poolAdaptor
  }

  async recordTradingVolume(
    ctx: AptosContext,
    coinx: string,
    coiny: string,
    coinXAmount: bigint,
    coinYAmount: bigint,
    extraLabels?: any
  ): Promise<BigDecimal> {
    let result = BigDecimal(0)

    const whitelistx = whiteListed(coinx)
    const whitelisty = whiteListed(coiny)
    if (!whitelistx && !whitelisty) {
      return result
    }
    const coinXInfo = await getCoinInfo(coinx)
    const coinYInfo = await getCoinInfo(coiny)
    const timestamp = ctx.transaction.timestamp
    let resultX = BigDecimal(0)
    let resultY = BigDecimal(0)
    const pair = await getPair(coinx, coiny)
    const baseLabels: Record<string, string> = extraLabels ? { ...extraLabels, pair } : { pair }
    if (whitelistx) {
      resultX = await calculateValueInUsd(coinXAmount, coinXInfo, timestamp)
    }
    if (whitelisty) {
      resultY = await calculateValueInUsd(coinYAmount, coinYInfo, timestamp)
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
        bridge: coinXInfo.bridge,
      })
    }
    if (resultX.gt(0)) {
      this.volumeByCoin.record(ctx, resultX, {
        coin: coinXInfo.symbol,
        type: coinXInfo.token_type.type,
      })
    }
    if (resultY.gt(0)) {
      this.volumeByCoin.record(ctx, resultY, {
        coin: coinYInfo.symbol,
        type: coinYInfo.token_type.type,
      })
    }
    result = resultX.plus(resultY).div(2)
    return result
  }

  async syncPools(
    resources: MoveResource[],
    ctx: AptosResourceContext,
    poolsHandler?: (pools: TypedMoveResource<T>[]) => Promise<void> | void
  ) {
    const pools: TypedMoveResource<T>[] = defaultMoveCoder().filterAndDecodeResources(
      this.poolAdaptor.poolTypeName,
      resources
    )

    const volumeByCoin = new Map<string, BigDecimal>()
    const timestamp = ctx.timestampInMicros

    console.log('num of pools: ', pools.length, ctx.version.toString())

    let tvlAllValue = BigDecimal(0)
    for (const pool of pools) {
      // savePool(ctx.version, pool.type_arguments)
      const coinx = pool.type_arguments[0]
      const coiny = pool.type_arguments[1]
      const whitelistx = whiteListed(coinx)
      const whitelisty = whiteListed(coiny)
      if (!whitelistx && !whitelisty) {
        continue
      }

      const pair = await getPair(coinx, coiny)
      const extraLabels = this.poolAdaptor.getExtraPoolTags(pool)
      const baseLabels: Record<string, string> = { ...extraLabels, pair }

      const coinXInfo = await getCoinInfo(coinx)
      const coinYInfo = await getCoinInfo(coiny)

      const coinx_amount = this.poolAdaptor.getXReserve(pool.data_decoded)
      const coiny_amount = this.poolAdaptor.getYReserve(pool.data_decoded)

      let resultX = BigDecimal(0)
      let resultY = BigDecimal(0)

      if (whitelistx) {
        resultX = await calculateValueInUsd(coinx_amount, coinXInfo, timestamp)
        let coinXTotal = volumeByCoin.get(coinXInfo.token_type.type)
        if (!coinXTotal) {
          coinXTotal = resultX
        } else {
          coinXTotal = coinXTotal.plus(resultX)
        }
        volumeByCoin.set(coinXInfo.token_type.type, coinXTotal)
      }
      if (whitelisty) {
        resultY = await calculateValueInUsd(coiny_amount, coinYInfo, timestamp)
        let coinYTotal = volumeByCoin.get(coinYInfo.token_type.type)
        if (!coinYTotal) {
          coinYTotal = resultY
        } else {
          coinYTotal = coinYTotal.plus(resultY)
        }
        volumeByCoin.set(coinYInfo.token_type.type, coinYTotal)
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
      const coinInfo = whitelistCoins().get(k)
      if (!coinInfo) {
        throw Error('unexpected coin ' + k)
      }
      // const price = await getPrice(coinInfo, timestamp)
      // priceGauge.record(ctx, price, { coin: coinInfo.symbol })
      if (v.isGreaterThan(0)) {
        this.tvlByCoin.record(ctx, v, {
          coin: coinInfo.symbol,
          bridge: coinInfo.bridge,
          type: coinInfo.token_type.type,
        })
      }
    }
  }
}

export async function getPair(coinx: string, coiny: string): Promise<string> {
  const coinXInfo = await getCoinInfo(coinx)
  const coinYInfo = await getCoinInfo(coiny)
  if (coinXInfo.symbol.localeCompare(coinYInfo.symbol) > 0) {
    return `${coinYInfo.symbol}-${coinXInfo.symbol}`
  }
  return `${coinXInfo.symbol}-${coinYInfo.symbol}`
}

export async function getPairValue(
  ctx: AptosContext,
  coinx: string,
  coiny: string,
  coinXAmount: bigint,
  coinYAmount: bigint
): Promise<BigDecimal> {
  const whitelistx = whiteListed(coinx)
  const whitelisty = whiteListed(coiny)
  const coinXInfo = await getCoinInfo(coinx)
  const coinYInfo = await getCoinInfo(coiny)
  const timestamp = ctx.transaction.timestamp
  let result = BigDecimal(0.0)

  if (!whitelistx || !whitelisty) {
    return result
  }

  if (whitelistx) {
    const value = await calculateValueInUsd(coinXAmount, coinXInfo, timestamp)
    result = value

    if (!whitelisty) {
      result = result.plus(value)
    }
  }
  if (whitelisty) {
    const value = await calculateValueInUsd(coinYAmount, coinYInfo, timestamp)

    if (!whitelistx) {
      result = result.plus(value)
    }
  }

  return result
}
