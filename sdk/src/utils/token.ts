import { BigNumber } from '@ethersproject/bignumber'

import { transformEtherError } from '../error'
import { getERC20Contract } from '../builtin/erc20'
import { getERC20BytesContract } from '../builtin/internal/erc20bytes_processor'
import { BigDecimal } from '../core/big-decimal'
import { toBigDecimal } from './conversion'
import { utils } from 'ethers'

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

const TOKEN_INFOS = new Map<string, TokenInfo>()

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
      name = utils.parseBytes32String(await bytesContract.name())
    }

    let symbol = ''
    try {
      symbol = await contract.symbol()
    } catch (e) {
      symbol = utils.parseBytes32String(await bytesContract.symbol())
    }

    const decimal = await contract.decimals()
    const info: TokenInfo = { name, symbol, decimal }
    TOKEN_INFOS.set(key, info)
    return info
  } catch (e) {
    throw transformEtherError(e, undefined)
  }
}

export async function getER20NormalizedAmount(
  tokenAddress: string,
  amount: BigNumber,
  chainId: number
): Promise<BigDecimal> {
  const tokenInfo = await getERC20TokenInfo(tokenAddress, chainId)
  return scaleDown(amount, tokenInfo.decimal)
}

export function scaleDown(amount: BigNumber, decimal: number) {
  const divider = new BigDecimal(10).pow(decimal)
  return toBigDecimal(amount).dividedBy(divider)
}
