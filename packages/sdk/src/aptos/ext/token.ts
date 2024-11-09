import { getPriceByType } from '../../utils/index.js'
import fetch from 'node-fetch'
import { accountTypeString, parseMoveType, SPLITTER } from '@typemove/move'
import { AptosNetwork, getClient } from '../network.js'
import { coin } from '../builtin/0x1.js'
import { MoveStructId } from '@aptos-labs/ts-sdk'
import { AptosChainId } from '@sentio/chain'
import { DEFAULT_TOKEN_LIST, InternalTokenInfo } from './token-list.js'
import { BaseCoinInfo } from '../../move/ext/index.js'

export interface TokenInfo extends BaseCoinInfo {
  type: `0x${string}` // either tokenAddress or faAddress
  tokenAddress?: `0x${string}`
  faAddress?: `0x${string}`
  name: string
  symbol: string
  decimals: number
  bridge: 'LayerZero' | 'Wormhole' | 'Celer' | 'Echo' | 'Native'
  logoUrl?: string
  websiteUrl?: string
  category: 'Native' | 'Bridged' | 'Meme'
  coinGeckoId?: string
  coinMarketCapId?: number
}

const TOKEN_MAP = new Map<string, TokenInfo>()

export async function initTokenList() {
  let list = DEFAULT_TOKEN_LIST
  try {
    const resp = await fetch(
      'https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/refs/heads/main/token-list.json'
    )
    list = (await resp.json()) as InternalTokenInfo[]
  } catch (e) {
    console.warn("Can't not fetch newest token list, use default list")
  }

  setTokenList(list)
}

function tokenInfoToSimple(info: InternalTokenInfo): TokenInfo {
  const type = info.tokenAddress || info.faAddress
  if (!type) {
    throw Error('Token info must have tokenAddress or faAddress')
  }
  return {
    type,
    tokenAddress: info.tokenAddress || undefined,
    faAddress: info.faAddress || undefined,
    name: info.name,
    symbol: info.panoraSymbol,
    decimals: info.decimals,
    bridge: info.bridge === null ? 'Native' : info.bridge,
    logoUrl: info.logoUrl || undefined,
    websiteUrl: info.websiteUrl || undefined,
    category: info.category,
    coinGeckoId: info.coinGeckoId || undefined,
    coinMarketCapId: info.coinMarketCapId == null ? undefined : info.coinMarketCapId
  }
}

function setTokenList(list: InternalTokenInfo[]) {
  for (const info of list) {
    const simpleInfo = tokenInfoToSimple(info)
    if (
      simpleInfo.tokenAddress ===
        '0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt' &&
      simpleInfo.symbol === 'stAPT'
    ) {
      simpleInfo.symbol = 'amStApt'
    }
    if (info.tokenAddress) {
      TOKEN_MAP.set(info.tokenAddress, simpleInfo)
    }
    if (info.faAddress) {
      TOKEN_MAP.set(info.faAddress, simpleInfo)
    }
  }
}

export function whitelistTokens() {
  return TOKEN_MAP
}

export function isWhiteListToken(token: string): boolean {
  if (token.includes(SPLITTER)) {
    const [addr, module, type] = token.split(SPLITTER)
    const normalized = [accountTypeString(addr), module, type].join(SPLITTER)
    return TOKEN_MAP.has(normalized)
  }
  return TOKEN_MAP.has(accountTypeString(token))
}

const TOKEN_METADATA_CACHE = new Map<string, Promise<any | null>>()

// token: address of the fungible asset, e.g. "0xa", or the coin type, e.g. "0x1::aptos::AptosCoin"
export async function getTokenInfoWithFallback(token: string, network?: AptosNetwork): Promise<TokenInfo> {
  const r = TOKEN_MAP.get(token)
  if (!r) {
    network = network || AptosNetwork.MAIN_NET
    const key = network + '_' + token
    let promise = TOKEN_METADATA_CACHE.get(key)
    if (!promise) {
      const client = getClient(network)
      // client.getDigitalAssetData()

      let account = token
      let metadataType: MoveStructId = `0x1::fungible_asset::Metadata`
      if (account.includes(SPLITTER)) {
        account = account.split(SPLITTER)[0]
        metadataType = coin.CoinInfo.type(parseMoveType(token)).getSignature() as MoveStructId
      }

      promise = client.getAccountResource({ accountAddress: account, resourceType: metadataType })
      TOKEN_METADATA_CACHE.set(key, promise)
    }
    const meta = await promise
    if (meta === null) {
      throw Error('Coin not existed ' + key)
    }

    // const parts = type.split(SPLITTER)
    return {
      type: token as `0x${string}`,
      category: 'Native',
      tokenAddress: token as `0x${string}`,
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      bridge: 'Native',
      logoUrl: meta.icon_uri,
      websiteUrl: meta.project_uri
    }
  }
  return r
}

export async function getPriceForToken(
  token: string,
  timestamp: number,
  network = AptosChainId.APTOS_MAINNET
): Promise<number> {
  if (!isWhiteListToken(token)) {
    return 0.0
  }
  const date = new Date(timestamp / 1000)
  try {
    return (await getPriceByType(network, token, date)) || 0
  } catch (error) {
    console.log(JSON.stringify(error))
    throw error
  }
}

export async function tokenTokenValueInUsd(
  n: bigint,
  coinInfo: TokenInfo,
  timestamp: number,
  network = AptosChainId.APTOS_MAINNET
) {
  const token = coinInfo.tokenAddress || coinInfo.faAddress
  if (token) {
    const price = await getPriceForToken(token, timestamp, network)
    const amount = n.scaleDown(coinInfo.decimals)
    return amount.multipliedBy(price)
  }
  throw Error('Token not found' + JSON.stringify(coinInfo))
}

setTokenList(DEFAULT_TOKEN_LIST as InternalTokenInfo[])
