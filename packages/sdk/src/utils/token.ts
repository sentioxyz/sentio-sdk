import { getERC20Contract } from '../eth/builtin/erc20.js'
import { getERC20BytesContract } from '../eth/builtin/erc20bytes.js'
import { BigDecimal, scaleDown } from '../core/big-decimal.js'
import { PromiseOrValue } from '../eth/builtin/internal/common.js'
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
}

export async function getER20NormalizedAmount(
  tokenAddress: string,
  amount: bigint,
  chainId: number
): Promise<BigDecimal> {
  const tokenInfo = await getERC20TokenInfo(tokenAddress, chainId)
  return scaleDown(amount, tokenInfo.decimal)
}
