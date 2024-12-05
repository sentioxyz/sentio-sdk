import { getPriceByType } from '../../utils/index.js'
import fetch from 'node-fetch'
import { accountTypeString, parseMoveType, SPLITTER } from '@typemove/move'
import { AptosNetwork, getClient } from '../network.js'
import { coin, fungible_asset, type_info } from '../builtin/0x1.js'
import { MoveStructId } from '@aptos-labs/ts-sdk'
import { AptosChainId } from '@sentio/chain'
import { DEFAULT_TOKEN_LIST, InternalTokenInfo } from './token-list.js'
import { BaseCoinInfo } from '../../move/ext/index.js'
import { RichAptosClient } from '../api.js'

export interface TokenInfo extends BaseCoinInfo {
  type: `0x${string}` // either tokenAddress or faAddress, if both are present, tokenAddress is used
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

const TOKEN_METADATA_CACHE = new Map<string, Promise<TokenInfo>>()

// Go to more common method
function toTypeString(ty: type_info.TypeInfo) {
  const module = Buffer.from(ty.module_name.replace('0x', ''), 'hex')
  const name = Buffer.from(ty.struct_name.replace('0x', ''), 'hex')
  return `${ty.account_address}::${module.toString('utf-8')}::${name.toString('utf-8')}`
}

async function getFungibleTokenInfo(client: RichAptosClient, faAddress: `0x${string}`): Promise<TokenInfo> {
  const meta = await client.getTypedAccountResource({
    accountAddress: faAddress,
    resourceType: fungible_asset.Metadata.type()
  })
  if (!meta) {
    throw Error('fa token not existed: ' + faAddress)
  }

  const paired = await coin.view.pairedCoin(client, { functionArguments: [faAddress] })
  let type = faAddress
  let tokeType
  if (paired[0].vec[0]) {
    tokeType = type = toTypeString(paired[0].vec[0]) as `0x${string}`
  }

  return {
    type: type,
    category: 'Native',
    tokenAddress: tokeType,
    faAddress: faAddress as `0x${string}`,
    name: meta.name,
    symbol: meta.symbol,
    decimals: meta.decimals,
    bridge: 'Native',
    logoUrl: meta.icon_uri,
    websiteUrl: meta.project_uri
  }
}

async function getCoinTokenInfo(client: RichAptosClient, type: MoveStructId): Promise<TokenInfo> {
  const account = type.split(SPLITTER)[0]

  const info = await client.getTypedAccountResource({
    accountAddress: account,
    resourceType: coin.CoinInfo.type(parseMoveType(type))
  })

  if (!info) {
    throw Error('coin not existed: ' + type)
  }

  const paired = await coin.view.pairedMetadata(client, { typeArguments: [type] })
  let faAddress
  if (paired[0].vec[0]) {
    faAddress = paired[0].vec[0] as `0x${string}`
  }

  return {
    type: type as `0x${string}`,
    category: 'Native',
    tokenAddress: type as `0x${string}`,
    faAddress,
    name: info.name,
    symbol: info.symbol,
    decimals: info.decimals,
    bridge: 'Native'
  }
}

// token: address of the fungible asset, e.g. "0xa", or the coin type, e.g. "0x1::aptos::AptosCoin"
export async function getTokenInfoWithFallback(token: string, network?: AptosNetwork): Promise<TokenInfo> {
  const r = TOKEN_MAP.get(token)
  if (r) {
    return r
  }
  network = network || AptosNetwork.MAIN_NET
  const key = network + '_' + token
  let promise = TOKEN_METADATA_CACHE.get(key)
  const isFungibleAsset = !token.includes(SPLITTER)
  const client = getClient(network)

  if (!promise) {
    if (isFungibleAsset) {
      promise = getFungibleTokenInfo(client, token as `0x${string}`)
    } else {
      promise = getCoinTokenInfo(client, token as MoveStructId)
    }
    TOKEN_METADATA_CACHE.set(key, promise)
  }

  return promise
}

export async function getPriceForToken(
  token: string,
  timestamp: number,
  network = AptosChainId.APTOS_MAINNET
): Promise<number> {
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
