import { transformEtherError } from '../error.js'
import { getERC20Contract } from '../builtin/erc20/index.js'
import { getERC20BytesContract } from '../builtin/internal/erc20bytes_processor.js'
import { BigDecimal } from '../core/big-decimal.js'
// import { toBigDecimal } from './conversion'
// import { utils } from 'ethers'
import { PromiseOrValue } from '../builtin/internal/common.js'
import { decodeBytes32String } from 'ethers'

export interface TokenInfo {
  symbol: string
  name: string
  decimal: number
}

export const NATIVE_ETH = {
  symbol: 'ETH',
  decimal: 18,
  name: 'Native ETH',
}

const TOKEN_INFOS = new Map<string, Promise<TokenInfo>>()

async function getTokenInfoPromise(
  symbol: PromiseOrValue<string> | string,
  name: PromiseOrValue<string> | string,
  decimal: PromiseOrValue<bigint>
): Promise<TokenInfo> {
  return {
    symbol: await symbol,
    name: await name,
    decimal: Number(await decimal),
  }
}

export async function getERC20TokenInfo(tokenAddress: string, chainId = 1): Promise<TokenInfo> {
  const key = chainId + tokenAddress
  const res = TOKEN_INFOS.get(key)
  if (res) {
    return res
  }
  const contract = getERC20Contract(tokenAddress, chainId)
  const bytesContract = getERC20BytesContract(tokenAddress, chainId)

  try {
    // TODO maybe not do try catch, just do raw call the parse results
    let name = ''
    try {
      name = await contract.name()
    } catch (e) {
      name = decodeBytes32String(await bytesContract.name())
    }

    let symbol = ''
    try {
      symbol = await contract.symbol()
    } catch (e) {
      symbol = decodeBytes32String(await bytesContract.symbol())
    }

    const decimal = await contract.decimals()
    const info = getTokenInfoPromise(symbol, name, decimal)

    TOKEN_INFOS.set(key, info)
    return info
  } catch (e) {
    throw transformEtherError(e, undefined)
  }
}

export async function getER20NormalizedAmount(
  tokenAddress: string,
  amount: bigint,
  chainId: number
): Promise<BigDecimal> {
  const tokenInfo = await getERC20TokenInfo(tokenAddress, chainId)
  return scaleDown(amount, tokenInfo.decimal)
}

export function scaleDown(amount: bigint, decimal: number | bigint) {
  const divider = new BigDecimal(10).pow(Number(decimal))
  return amount.asBigDecimal().dividedBy(divider)
}
