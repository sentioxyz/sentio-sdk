import { getPriceByType } from '../../utils/index.js'
import fetch from 'node-fetch'
import { accountTypeString, parseMoveType, SPLITTER } from '@typemove/move'
import { SimpleCoinInfo } from '../../move/ext/move-dex.js'
import { AptosNetwork, getClient } from '../network.js'
import { coin } from '../builtin/0x1.js'
import { MoveStructId } from '@aptos-labs/ts-sdk'
import { AptosChainId } from '@sentio/chain'

const WHITELISTED_COINS = new Map<string, SimpleCoinInfo>()

export async function initCoinList() {
  let list = DEFAULT_LIST
  try {
    const resp = await fetch(
      'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/src/permissionless.json'
    )
    list = (await resp.json()) as any[]
  } catch (e) {
    console.warn("Can't not fetch newest coin list, use default list")
  }

  setCoinList(list)
}

function setCoinList(list: (Omit<SimpleCoinInfo, 'bridge'> & { name: string })[]) {
  for (const info of list) {
    let bridge = 'native'
    if (info.name.includes('Celer')) {
      bridge = 'Celer'
    }
    if (info.name.includes('LayerZero')) {
      bridge = 'LayerZero'
    }
    if (info.name.includes('Wormhole')) {
      bridge = 'Wormhole'
    }
    if (
      info.token_type.type ===
        '0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt' &&
      info.symbol === 'stAPT'
    ) {
      info.symbol = 'amStApt'
    } else {
      if (info.hippo_symbol) {
        info.symbol = info.hippo_symbol
      }
    }
    WHITELISTED_COINS.set(info.token_type.type, { ...info, bridge })
  }
}

export function whitelistCoins() {
  return WHITELISTED_COINS
}

export function whiteListed(coin: string): boolean {
  const [addr, module, type] = coin.split(SPLITTER)
  const normalized = [accountTypeString(addr), module, type].join(SPLITTER)
  return WHITELISTED_COINS.has(normalized)
}

export function getCoinInfo(type: string): SimpleCoinInfo {
  const r = WHITELISTED_COINS.get(type)
  if (!r) {
    const parts = type.split('::')
    // TDDO retrive from network
    return {
      token_type: { type: type, account_address: parts[0] },
      symbol: parts[2],
      decimals: 8,
      bridge: 'native'
    }
  }
  return r
}

const COIN_METADATA_CACHE = new Map<string, Promise<any | null>>()

export async function getCoinInfoWithFallback(type: string, network?: AptosNetwork): Promise<SimpleCoinInfo> {
  const r = WHITELISTED_COINS.get(type)
  if (!r) {
    network = network || AptosNetwork.MAIN_NET
    const key = network + '_' + type
    let promise = COIN_METADATA_CACHE.get(key)
    if (!promise) {
      const client = getClient(network)
      // client.getDigitalAssetData()
      const account = type.split(SPLITTER)[0]
      const coinInfo = coin.CoinInfo.type(parseMoveType(type)).getSignature() as MoveStructId
      promise = client.getAccountResource({ accountAddress: account, resourceType: coinInfo })
      COIN_METADATA_CACHE.set(key, promise)
    }
    const meta = await promise
    if (meta === null) {
      throw Error('Coin not existed ' + key)
    }

    const parts = type.split(SPLITTER)
    return {
      token_type: { type: type, account_address: parts[0] },
      symbol: meta.symbol,
      decimals: meta.decimals,
      bridge: 'native'
    }
  }
  return r
}

export async function getPrice(
  coinType: string,
  timestamp: number,
  network = AptosChainId.APTOS_MAINNET
): Promise<number> {
  if (!whiteListed(coinType)) {
    return 0.0
  }
  const date = new Date(timestamp / 1000)
  try {
    return (await getPriceByType(network, coinType, date)) || 0
  } catch (error) {
    console.log(JSON.stringify(error))
    throw error
  }
}

export async function calculateValueInUsd(
  n: bigint,
  coinInfo: SimpleCoinInfo,
  timestamp: number,
  network = AptosChainId.APTOS_MAINNET
) {
  const price = await getPrice(coinInfo.token_type.type, timestamp, network)
  const amount = n.scaleDown(coinInfo.decimals)
  return amount.multipliedBy(price)
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const DEFAULT_LIST = [
  {
    name: 'Aptos Coin',
    symbol: 'APT',
    official_symbol: 'APT',
    coingecko_id: 'aptos',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp',
    project_url: 'https://aptoslabs.com/',
    token_type: {
      type: '0x1::aptos_coin::AptosCoin',
      account_address: '0x1',
      module_name: 'aptos_coin',
      struct_name: 'AptosCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 1,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'APT',
    pancake_symbol: 'APT'
  },
  {
    name: 'Meeiro',
    symbol: 'MEE',
    official_symbol: 'MEE',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MEE.svg',
    project_url: 'https://meeiro.xyz',
    token_type: {
      type: '0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9::mee_coin::MeeCoin',
      account_address: '0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9',
      module_name: 'mee_coin',
      struct_name: 'MeeCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 101,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'MEE',
    pancake_symbol: 'MEE'
  },
  {
    name: 'Move Dollar',
    symbol: 'MOD',
    official_symbol: 'MOD',
    coingecko_id: 'move-dollar',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOD.svg',
    project_url: 'https://www.thala.fi/',
    token_type: {
      type: '0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD',
      account_address: '0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01',
      module_name: 'mod_coin',
      struct_name: 'MOD'
    },
    extensions: {
      data: []
    },
    unique_index: 128,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'MOD',
    pancake_symbol: 'MOD'
  },
  {
    name: 'Thala Token',
    symbol: 'THL',
    official_symbol: 'THL',
    coingecko_id: 'thala',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/THL.svg',
    project_url: 'https://www.thala.fi/',
    token_type: {
      type: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
      account_address: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615',
      module_name: 'thl_coin',
      struct_name: 'THL'
    },
    extensions: {
      data: []
    },
    unique_index: 129,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'THL',
    pancake_symbol: 'THL'
  },
  {
    name: 'Aptopad Coin',
    symbol: 'APD',
    official_symbol: 'APD',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/aptopad.png',
    project_url: 'https://aptopad.io',
    token_type: {
      type: '0xcc78307c77f1c2c0fdfee17269bfca7876a0b35438c3442417480c0d5c370fbc::AptopadCoin::APD',
      account_address: '0xcc78307c77f1c2c0fdfee17269bfca7876a0b35438c3442417480c0d5c370fbc',
      module_name: 'AptopadCoin',
      struct_name: 'APD'
    },
    extensions: {
      data: []
    },
    unique_index: 130,
    source: 'native',
    hippo_symbol: 'APD',
    pancake_symbol: 'APD',
    permissioned_listing: false
  },
  {
    name: 'Mover',
    symbol: 'MOVER',
    official_symbol: 'MOVER',
    coingecko_id: 'mover-xyz',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOVER.svg',
    project_url: 'https://mov3r.xyz/',
    token_type: {
      type: '0x14b0ef0ec69f346bea3dfa0c5a8c3942fb05c08760059948f9f24c02cd0d4fd8::mover_token::Mover',
      account_address: '0x14b0ef0ec69f346bea3dfa0c5a8c3942fb05c08760059948f9f24c02cd0d4fd8',
      module_name: 'mover_token',
      struct_name: 'Mover'
    },
    extensions: {
      data: []
    },
    unique_index: 131,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'MOVER',
    pancake_symbol: 'MOVER'
  },
  {
    name: 'Ditto Staked Aptos',
    symbol: 'stAPT',
    official_symbol: 'stAPT',
    coingecko_id: 'ditto-staked-aptos',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DittoStakedAptos.svg',
    project_url: 'https://www.dittofinance.io/',
    token_type: {
      type: '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos',
      account_address: '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5',
      module_name: 'staked_coin',
      struct_name: 'StakedAptos'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 156,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'stAPT',
    pancake_symbol: 'stAPT'
  },
  {
    name: 'Ditto Discount Token',
    symbol: 'DTO',
    official_symbol: 'DTO',
    coingecko_id: 'ditto-discount-token',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DTO.svg',
    project_url: 'https://www.dittofinance.io/',
    token_type: {
      type: '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::ditto_discount_coin::DittoDiscountCoin',
      account_address: '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5',
      module_name: 'ditto_discount_coin',
      struct_name: 'DittoDiscountCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 191,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'DTO',
    pancake_symbol: 'DTO'
  },
  {
    name: 'Aptoge',
    symbol: 'APTOGE',
    official_symbol: 'APTOGE',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APTOGE.svg',
    project_url: 'https://aptoge.com',
    token_type: {
      type: '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::Aptoge::Aptoge',
      account_address: '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf',
      module_name: 'Aptoge',
      struct_name: 'Aptoge'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 231,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'APTOGE',
    pancake_symbol: 'APTOGE'
  },
  {
    name: 'Eternal Token',
    symbol: 'ETERN',
    official_symbol: 'ETERN',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ETERN.svg',
    project_url: 'https://eternalfinance.io',
    token_type: {
      type: '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95::coin::ETERN',
      account_address: '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95',
      module_name: 'coin',
      struct_name: 'ETERN'
    },
    extensions: {
      data: []
    },
    unique_index: 256,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ETERN',
    pancake_symbol: 'ETERN'
  },
  {
    name: 'Argo USD',
    symbol: 'USDA',
    official_symbol: 'USDA',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDA.svg',
    project_url: 'https://argo.fi/',
    token_type: {
      type: '0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA',
      account_address: '0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc',
      module_name: 'usda',
      struct_name: 'USDA'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 351,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'USDA',
    pancake_symbol: 'USDA'
  },
  {
    name: 'APass Coin',
    symbol: 'APC',
    official_symbol: 'APC',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APC.svg',
    project_url: 'https://aptpp.com',
    token_type: {
      type: '0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb::apcoin::ApCoin',
      account_address: '0x777821c78442e17d82c3d7a371f42de7189e4248e529fe6eee6bca40ddbb',
      module_name: 'apcoin',
      struct_name: 'ApCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 392,
    source: 'native',
    hippo_symbol: 'APC',
    pancake_symbol: 'APC',
    permissioned_listing: false
  },
  {
    name: 'PancakeSwap Token',
    symbol: 'CAKE',
    official_symbol: 'CAKE',
    coingecko_id: 'pancakeswap-token',
    decimals: 8,
    logo_url: 'https://pancakeswap.finance/images/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.svg',
    project_url: 'https://pancakeswap.finance/',
    token_type: {
      type: '0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT',
      account_address: '0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6',
      module_name: 'oft',
      struct_name: 'CakeOFT'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 397,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'CAKE',
    pancake_symbol: 'CAKE'
  },
  {
    name: 'EON',
    symbol: 'EON',
    official_symbol: 'EON',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/EON.svg',
    project_url: 'https://eonlabz.com/',
    token_type: {
      type: '0x389dbbc6884a1d5b1ab4e1df2913a8c1b01251e50aed377554372b2842c5e3ef::EONcoin::EONCoin',
      account_address: '0x389dbbc6884a1d5b1ab4e1df2913a8c1b01251e50aed377554372b2842c5e3ef',
      module_name: 'EONcoin',
      struct_name: 'EONCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 477,
    source: 'native',
    hippo_symbol: 'EON',
    pancake_symbol: 'EON',
    permissioned_listing: false
  },
  {
    name: 'Mojito',
    symbol: 'MOJO',
    official_symbol: 'MOJO',
    coingecko_id: 'mojito',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOJO.svg',
    project_url: 'https://www.mojito.markets/',
    token_type: {
      type: '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO',
      account_address: '0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4',
      module_name: 'coin',
      struct_name: 'MOJO'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 551,
    source: 'native',
    hippo_symbol: 'MOJO',
    pancake_symbol: 'MOJO',
    permissioned_listing: false
  },
  {
    name: 'Doglaika Coin',
    symbol: 'DLC',
    official_symbol: 'DLC',
    coingecko_id: 'doglaikacoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DLC.svg',
    project_url: 'http://linktr.ee/doglaikacoin',
    token_type: {
      type: '0x84edd115c901709ef28f3cb66a82264ba91bfd24789500b6fd34ab9e8888e272::coin::DLC',
      account_address: '0x84edd115c901709ef28f3cb66a82264ba91bfd24789500b6fd34ab9e8888e272',
      module_name: 'coin',
      struct_name: 'DLC'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 591,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'DLC',
    pancake_symbol: 'DLC'
  },
  {
    name: 'The People',
    symbol: 'People',
    official_symbol: 'People',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/ThePeopleAPT/the_peoplemove/main/Logo.png',
    project_url: 'https://thepeopleapt.xyz/',
    token_type: {
      type: '0x5a1e84cdd217034d764abb91bf20aa0536c5a8c900831a37b393fe3af98c3f55::thepeoplecoin::The_People',
      account_address: '0x5a1e84cdd217034d764abb91bf20aa0536c5a8c900831a37b393fe3af98c3f55',
      module_name: 'thepeoplecoin',
      struct_name: 'The_People'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 691,
    source: 'native',
    hippo_symbol: 'People',
    pancake_symbol: 'People',
    permissioned_listing: false
  },
  {
    name: 'AnimeSwap Coin',
    symbol: 'ANI',
    official_symbol: 'ANI',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ANI.png',
    project_url: 'http://animeswap.org/',
    token_type: {
      type: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeCoin::ANI',
      account_address: '0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c',
      module_name: 'AnimeCoin',
      struct_name: 'ANI'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 712,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ANI',
    pancake_symbol: 'ANI'
  },
  {
    name: 'Abel Coin',
    symbol: 'ABEL',
    official_symbol: 'ABEL',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ABEL.svg',
    project_url: 'https://www.abelfinance.xyz/',
    token_type: {
      type: '0x7c0322595a73b3fc53bb166f5783470afeb1ed9f46d1176db62139991505dc61::abel_coin::AbelCoin',
      account_address: '0x7c0322595a73b3fc53bb166f5783470afeb1ed9f46d1176db62139991505dc61',
      module_name: 'abel_coin',
      struct_name: 'AbelCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 790,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ABEL',
    pancake_symbol: 'ABEL'
  },
  {
    name: 'SPRING',
    symbol: 'SPRING',
    official_symbol: 'SPRING',
    coingecko_id: 'spring',
    decimals: 9,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SPRING.webp',
    project_url: 'https://springers.co.in/',
    token_type: {
      type: '0x7bdeaba6f037caf06bb5b2d57df9ee03a07e2a9df45b338ef3deb44d16c01d10::spring_coin::Spring_Coin',
      account_address: '0x7bdeaba6f037caf06bb5b2d57df9ee03a07e2a9df45b338ef3deb44d16c01d10',
      module_name: 'spring_coin',
      struct_name: 'Spring_Coin'
    },
    extensions: {
      data: []
    },
    unique_index: 797,
    source: 'native',
    hippo_symbol: 'SPRING',
    pancake_symbol: 'SPRING',
    permissioned_listing: false
  },
  {
    name: 'Gari',
    symbol: 'GARI',
    official_symbol: 'GARI',
    coingecko_id: 'gari-network',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/GARI.svg',
    project_url: 'https://gari.network',
    token_type: {
      type: '0x4def3d3dee27308886f0a3611dd161ce34f977a9a5de4e80b237225923492a2a::coin::T',
      account_address: '0x4def3d3dee27308886f0a3611dd161ce34f977a9a5de4e80b237225923492a2a',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 800,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wGARI',
    pancake_symbol: 'whGARI'
  },
  {
    name: 'BlueMove',
    symbol: 'MOVE',
    official_symbol: 'MOVE',
    coingecko_id: 'bluemove',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOVE.svg',
    project_url: 'https://bluemove.net/',
    token_type: {
      type: '0x27fafcc4e39daac97556af8a803dbb52bcb03f0821898dc845ac54225b9793eb::move_coin::MoveCoin',
      account_address: '0x27fafcc4e39daac97556af8a803dbb52bcb03f0821898dc845ac54225b9793eb',
      module_name: 'move_coin',
      struct_name: 'MoveCoin'
    },
    extensions: {
      data: []
    },
    unique_index: 912,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'MOVE',
    pancake_symbol: 'MOVE'
  },
  {
    name: 'AptosLaunch Token',
    symbol: 'ALT',
    official_symbol: 'ALT',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/Aptoslaunchlogob.svg',
    project_url: 'https://aptoslaunch.io',
    token_type: {
      type: '0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::aptos_launch_token::AptosLaunchToken',
      account_address: '0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e',
      module_name: 'aptos_launch_token',
      struct_name: 'AptosLaunchToken'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 928,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ALT',
    pancake_symbol: 'ALT'
  },
  {
    name: 'AlpacaINU Coin',
    symbol: 'ALI',
    official_symbol: 'ALI',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ALI.svg',
    project_url: 'https://twitter.com/AlpacaINU',
    token_type: {
      type: '0x27975005fd8b836a905dc7f81c51f89e76091a4d0c4d694265f6eae0c05cb400::proton_a5d::PROTON_E54',
      account_address: '0x27975005fd8b836a905dc7f81c51f89e76091a4d0c4d694265f6eae0c05cb400',
      module_name: 'proton_a5d',
      struct_name: 'PROTON_E54'
    },
    extensions: {
      data: []
    },
    unique_index: 937,
    source: 'native',
    hippo_symbol: 'ALI',
    pancake_symbol: 'ALI',
    permissioned_listing: false
  },
  {
    name: 'Tortuga Staked Aptos',
    symbol: 'tAPT',
    official_symbol: 'tAPT',
    coingecko_id: 'tortuga-staked-aptos',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/TortugaStakedAptos.png',
    project_url: 'https://tortuga.finance/',
    token_type: {
      type: '0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin',
      account_address: '0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114',
      module_name: 'staked_aptos_coin',
      struct_name: 'StakedAptosCoin'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 952,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'tAPT',
    pancake_symbol: 'tAPT'
  },
  {
    name: 'AptSwap Governance Token',
    symbol: 'APTSWAP',
    official_symbol: 'APTSWAP',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/AptSwap.svg',
    project_url: 'http://aptswap.io',
    token_type: {
      type: '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::AptSwap::AptSwapGovernance',
      account_address: '0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf',
      module_name: 'AptSwap',
      struct_name: 'AptSwapGovernance'
    },
    extensions: {
      data: [['bridge', 'native']]
    },
    unique_index: 971,
    source: 'native',
    hippo_symbol: 'APTSWAP',
    pancake_symbol: 'APTSWAP',
    permissioned_listing: false
  },
  {
    name: 'USD Coin (Wormhole)',
    symbol: 'USDC',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
      account_address: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2001,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wUSDC',
    pancake_symbol: 'whUSDC'
  },
  {
    name: 'Tether USD (Wormhole)',
    symbol: 'USDT',
    official_symbol: 'USDT',
    coingecko_id: 'tether',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg',
    project_url: '',
    token_type: {
      type: '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T',
      account_address: '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2002,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wUSDT',
    pancake_symbol: 'whUSDT'
  },
  {
    name: 'Wrapped BTC (Wormhole)',
    symbol: 'WBTC',
    official_symbol: 'WBTC',
    coingecko_id: 'wrapped-bitcoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BTC.webp',
    project_url: '',
    token_type: {
      type: '0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T',
      account_address: '0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2003,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wWBTC',
    pancake_symbol: 'whWBTC'
  },
  {
    name: 'Wrapped Ether (Wormhole)',
    symbol: 'WETH',
    official_symbol: 'WETH',
    coingecko_id: 'weth',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
    project_url: '',
    token_type: {
      type: '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T',
      account_address: '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2004,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wWETH',
    pancake_symbol: 'whWETH'
  },
  {
    name: 'Dai Stablecoin (Wormhole)',
    symbol: 'DAI',
    official_symbol: 'DAI',
    coingecko_id: 'dai',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp',
    project_url: '',
    token_type: {
      type: '0x407a220699982ebb514568d007938d2447d33667e4418372ffec1ddb24491b6c::coin::T',
      account_address: '0x407a220699982ebb514568d007938d2447d33667e4418372ffec1ddb24491b6c',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2005,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wDAI',
    pancake_symbol: 'whDAI'
  },
  {
    name: 'BUSD Token (Wormhole)',
    symbol: 'BUSD',
    official_symbol: 'BUSD',
    coingecko_id: 'binance-usd',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.webp',
    project_url: '',
    token_type: {
      type: '0xccc9620d38c4f3991fa68a03ad98ef3735f18d04717cb75d7a1300dd8a7eed75::coin::T',
      account_address: '0xccc9620d38c4f3991fa68a03ad98ef3735f18d04717cb75d7a1300dd8a7eed75',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2006,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wBUSD',
    pancake_symbol: 'whBUSD'
  },
  {
    name: 'Wrapped BNB (Wormhole)',
    symbol: 'WBNB',
    official_symbol: 'WBNB',
    coingecko_id: 'binancecoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.webp',
    project_url: '',
    token_type: {
      type: '0x6312bc0a484bc4e37013befc9949df2d7c8a78e01c6fe14a34018449d136ba86::coin::T',
      account_address: '0x6312bc0a484bc4e37013befc9949df2d7c8a78e01c6fe14a34018449d136ba86',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2009,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wWBNB',
    pancake_symbol: 'whWBNB'
  },
  {
    name: 'SOL (Wormhole)',
    symbol: 'SOL',
    official_symbol: 'SOL',
    coingecko_id: 'solana',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SOL.webp',
    project_url: '',
    token_type: {
      type: '0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T',
      account_address: '0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-solana']]
    },
    unique_index: 2011,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wSOL',
    pancake_symbol: 'whSOL'
  },
  {
    name: 'Tether USD',
    symbol: 'USDTbs',
    official_symbol: 'USDT',
    coingecko_id: 'tether',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg',
    project_url: '',
    token_type: {
      type: '0xacd014e8bdf395fa8497b6d585b164547a9d45269377bdf67c96c541b7fec9ed::coin::T',
      account_address: '0xacd014e8bdf395fa8497b6d585b164547a9d45269377bdf67c96c541b7fec9ed',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-bsc']]
    },
    unique_index: 2050,
    source: 'wormhole-bsc',
    permissioned_listing: true,
    hippo_symbol: 'USDTbs',
    pancake_symbol: 'USDTbs'
  },
  {
    name: 'USD Coin (Wormhole Solana)',
    symbol: 'USDCso',
    official_symbol: 'USDC',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T',
      account_address: '0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-solana']]
    },
    unique_index: 2113,
    source: 'wormhole-solana',
    permissioned_listing: true,
    hippo_symbol: 'USDCso',
    pancake_symbol: 'USDCso'
  },
  {
    name: 'USD Coin (Wormhole Polygon)',
    symbol: 'USDCpo',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0xc7160b1c2415d19a88add188ec726e62aab0045f0aed798106a2ef2994a9101e::coin::T',
      account_address: '0xc7160b1c2415d19a88add188ec726e62aab0045f0aed798106a2ef2994a9101e',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-polygon']]
    },
    unique_index: 2171,
    source: 'wormhole-polygon',
    permissioned_listing: true,
    hippo_symbol: 'USDCpo',
    pancake_symbol: 'USDCpo'
  },
  {
    name: 'USD Coin (Wormhole, BSC)',
    symbol: 'USDCbs',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0x79a6ed7a0607fdad2d18d67d1a0e552d4b09ebce5951f1e5c851732c02437595::coin::T',
      account_address: '0x79a6ed7a0607fdad2d18d67d1a0e552d4b09ebce5951f1e5c851732c02437595',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-bsc']]
    },
    unique_index: 2202,
    source: 'wormhole-bsc',
    permissioned_listing: true,
    hippo_symbol: 'USDCbs',
    pancake_symbol: 'USDCbs'
  },
  {
    name: 'USD Coin (Wormhole Avalanche)',
    symbol: 'USDCav',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0x39d84c2af3b0c9895b45d4da098049e382c451ba63bec0ce0396ff7af4bb5dff::coin::T',
      account_address: '0x39d84c2af3b0c9895b45d4da098049e382c451ba63bec0ce0396ff7af4bb5dff',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole-avalanche']]
    },
    unique_index: 2304,
    source: 'wormhole-avalanche',
    permissioned_listing: true,
    hippo_symbol: 'USDCav',
    pancake_symbol: 'USDCav'
  },
  {
    name: 'Wrapped AVAX (Wormhole)',
    symbol: 'WAVAX',
    official_symbol: 'WAVAX',
    coingecko_id: 'avalanche-2',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/AVAX.webp',
    project_url: '',
    token_type: {
      type: '0x5b1bbc25524d41b17a95dac402cf2f584f56400bf5cc06b53c36b331b1ec6e8f::coin::T',
      account_address: '0x5b1bbc25524d41b17a95dac402cf2f584f56400bf5cc06b53c36b331b1ec6e8f',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2332,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wWAVAX',
    pancake_symbol: 'whWAVAX'
  },
  {
    name: 'SWEAT',
    symbol: 'SWEAT',
    official_symbol: 'SWEAT',
    coingecko_id: 'sweatcoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SWEAT.webp',
    project_url: '',
    token_type: {
      type: '0x9aa4c03344444b53f4d9b1bca229ed2ac47504e3ea6cd0683ebdc0c5ecefd693::coin::T',
      account_address: '0x9aa4c03344444b53f4d9b1bca229ed2ac47504e3ea6cd0683ebdc0c5ecefd693',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2409,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wSWEAT',
    pancake_symbol: 'whSWEAT'
  },
  {
    name: 'NEAR (Wormhole)',
    symbol: 'NEAR',
    official_symbol: 'NEAR',
    coingecko_id: 'near',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEAR.webp',
    project_url: '',
    token_type: {
      type: '0x394205c024d8e932832deef4cbfc7d3bb17ff2e9dc184fa9609405c2836b94aa::coin::T',
      account_address: '0x394205c024d8e932832deef4cbfc7d3bb17ff2e9dc184fa9609405c2836b94aa',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2492,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wNEAR',
    pancake_symbol: 'whNEAR'
  },
  {
    name: 'Nexum Coin',
    symbol: 'NEXM',
    official_symbol: 'NEXM',
    coingecko_id: 'nexum',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEXM.webp',
    project_url: '',
    token_type: {
      type: '0x1f9dca8eb42832b9ea07a804d745ef08833051e0c75c45b82665ef6f6e7fac32::coin::T',
      account_address: '0x1f9dca8eb42832b9ea07a804d745ef08833051e0c75c45b82665ef6f6e7fac32',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2527,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wNEXM',
    pancake_symbol: 'whNEXM'
  },
  {
    name: 'SushiToken (Wormhole)',
    symbol: 'SUSHI',
    official_symbol: 'SUSHI',
    coingecko_id: 'sushi',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SUSHI.webp',
    project_url: '',
    token_type: {
      type: '0x2305dd96edd8debb5a2049be54379c74e61b37ceb54a49bd7dee4726d2a6b689::coin::T',
      account_address: '0x2305dd96edd8debb5a2049be54379c74e61b37ceb54a49bd7dee4726d2a6b689',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2700,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wSUSHI',
    pancake_symbol: 'whSUSHI'
  },
  {
    name: 'Celo (Wormhole)',
    symbol: 'CELO',
    official_symbol: 'CELO',
    coingecko_id: 'celo',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/CELO.webp',
    project_url: '',
    token_type: {
      type: '0xac0c3c35d50f6ef00e3b4db6998732fe9ed6331384925fe8ec95fcd7745a9112::coin::T',
      account_address: '0xac0c3c35d50f6ef00e3b4db6998732fe9ed6331384925fe8ec95fcd7745a9112',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2801,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wCELO',
    pancake_symbol: 'whCELO'
  },
  {
    name: 'FTX Token',
    symbol: 'FTT',
    official_symbol: 'FTT',
    coingecko_id: 'ftx-token',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/FTXToken.webp',
    project_url: '',
    token_type: {
      type: '0x419d16ebaeda8dc374b1178a61d24fb699799d55a3f475f427998769c537b51b::coin::T',
      account_address: '0x419d16ebaeda8dc374b1178a61d24fb699799d55a3f475f427998769c537b51b',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2971,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wFTT',
    pancake_symbol: 'whFTT'
  },
  {
    name: 'Chain',
    symbol: 'XCN',
    official_symbol: 'XCN',
    coingecko_id: 'chain-2',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/XCN.webp',
    project_url: '',
    token_type: {
      type: '0xcefd39b563951a9ec2670aa57086f9adb3493671368ea60ff99e0bc98f697bb5::coin::T',
      account_address: '0xcefd39b563951a9ec2670aa57086f9adb3493671368ea60ff99e0bc98f697bb5',
      module_name: 'coin',
      struct_name: 'T'
    },
    extensions: {
      data: [['bridge', 'wormhole']]
    },
    unique_index: 2991,
    source: 'wormhole',
    permissioned_listing: true,
    hippo_symbol: 'wXCN',
    pancake_symbol: 'whXCN'
  },
  {
    name: 'USD Coin (LayerZero)',
    symbol: 'zUSDC',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: '',
    token_type: {
      type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
      account_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
      module_name: 'asset',
      struct_name: 'USDC'
    },
    extensions: {
      data: [['bridge', 'layerzero']]
    },
    unique_index: 3001,
    source: 'layerzero',
    permissioned_listing: true,
    hippo_symbol: 'zUSDC',
    pancake_symbol: 'lzUSDC'
  },
  {
    name: 'USD Tether (LayerZero)',
    symbol: 'zUSDT',
    official_symbol: 'USDT',
    coingecko_id: 'tether',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg',
    project_url: '',
    token_type: {
      type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
      account_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
      module_name: 'asset',
      struct_name: 'USDT'
    },
    extensions: {
      data: [['bridge', 'layerzero']]
    },
    unique_index: 3002,
    source: 'layerzero',
    permissioned_listing: true,
    hippo_symbol: 'zUSDT',
    pancake_symbol: 'lzUSDT'
  },
  {
    name: 'Wrapped Ether (LayerZero)',
    symbol: 'zWETH',
    official_symbol: 'WETH',
    coingecko_id: 'weth',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
    project_url: '',
    token_type: {
      type: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
      account_address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa',
      module_name: 'asset',
      struct_name: 'WETH'
    },
    extensions: {
      data: [['bridge', 'layerzero']]
    },
    unique_index: 3004,
    source: 'layerzero',
    permissioned_listing: true,
    hippo_symbol: 'zWETH',
    pancake_symbol: 'lzWETH'
  },
  {
    name: 'USD Coin (Celer)',
    symbol: 'ceUSDC',
    official_symbol: 'USDC',
    coingecko_id: 'usd-coin',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'UsdcCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4001,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceUSDC',
    pancake_symbol: 'ceUSDC'
  },
  {
    name: 'Tether USD (Celer)',
    symbol: 'ceUSDT',
    official_symbol: 'USDT',
    coingecko_id: 'tether',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'UsdtCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4002,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceUSDT',
    pancake_symbol: 'ceUSDT'
  },
  {
    name: 'Wrapped BTC (Celer)',
    symbol: 'ceWBTC',
    official_symbol: 'WBTC',
    coingecko_id: 'wrapped-bitcoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WBTC.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WbtcCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'WbtcCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4003,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceWBTC',
    pancake_symbol: 'ceWBTC'
  },
  {
    name: 'Wrapped Ether (Celer)',
    symbol: 'ceWETH',
    official_symbol: 'WETH',
    coingecko_id: 'ethereum',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WethCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'WethCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4004,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceWETH',
    pancake_symbol: 'ceWETH'
  },
  {
    name: 'Dai Stablecoin (Celer)',
    symbol: 'ceDAI',
    official_symbol: 'DAI',
    coingecko_id: 'dai',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::DaiCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'DaiCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4005,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceDAI',
    pancake_symbol: 'ceDAI'
  },
  {
    name: 'Binance Coin (Celer)',
    symbol: 'ceBNB',
    official_symbol: 'BNB',
    coingecko_id: 'binancecoin',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BnbCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'BnbCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4113,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceBNB',
    pancake_symbol: 'ceBNB'
  },
  {
    name: 'Binance USD (Celer)',
    symbol: 'ceBUSD',
    official_symbol: 'BUSD',
    coingecko_id: 'binance-usd',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.svg',
    project_url: 'https://celer.network',
    token_type: {
      type: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BusdCoin',
      account_address: '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d',
      module_name: 'celer_coin_manager',
      struct_name: 'BusdCoin'
    },
    extensions: {
      data: [['bridge', 'celer']]
    },
    unique_index: 4119,
    source: 'celer',
    permissioned_listing: true,
    hippo_symbol: 'ceBUSD',
    pancake_symbol: 'ceBUSD'
  },
  {
    name: 'XBTC',
    symbol: 'XBTC',
    official_symbol: 'XBTC',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/XBTC.svg',
    project_url: 'https://github.com/OmniBTC/OmniBridge',
    token_type: {
      type: '0x3b0a7c06837e8fbcce41af0e629fdc1f087b06c06ff9e86f81910995288fd7fb::xbtc::XBTC',
      account_address: '0x3b0a7c06837e8fbcce41af0e629fdc1f087b06c06ff9e86f81910995288fd7fb',
      module_name: 'xbtc',
      struct_name: 'XBTC'
    },
    extensions: {
      data: []
    },
    unique_index: 5003,
    source: 'omnibridge',
    permissioned_listing: true,
    hippo_symbol: 'XBTC',
    pancake_symbol: 'XBTC'
  },
  {
    name: 'Aries Aptos Coin LP Token',
    symbol: 'ar-APT',
    official_symbol: 'aAPT',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-APT.svg',
    project_url: 'https://ariesmarkets.xyz/',
    token_type: {
      type: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0x1::aptos_coin::AptosCoin>',
      account_address: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3',
      module_name: 'reserve',
      struct_name: 'LP<0x1::aptos_coin::AptosCoin>'
    },
    extensions: {
      data: [
        ['lp', 'aries'],
        ['bridge', 'native']
      ]
    },
    unique_index: 15338,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ar-APT',
    pancake_symbol: 'ar-APT'
  },
  {
    name: 'Aries Solana (Wormhole) LP Token',
    symbol: 'ar-SOL',
    official_symbol: 'aSOL',
    coingecko_id: '',
    decimals: 8,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-SOL.svg',
    project_url: 'https://ariesmarkets.xyz/',
    token_type: {
      type: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T>',
      account_address: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3',
      module_name: 'reserve',
      struct_name: 'LP<0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T>'
    },
    extensions: {
      data: [
        ['lp', 'aries'],
        ['bridge', 'native']
      ]
    },
    unique_index: 15339,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ar-SOL',
    pancake_symbol: 'ar-SOL'
  },
  {
    name: 'Aries USDC (Layerzero) LP Token',
    symbol: 'ar-zUSDC',
    official_symbol: 'aUSDC',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg',
    project_url: 'https://ariesmarkets.xyz/',
    token_type: {
      type: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
      account_address: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3',
      module_name: 'reserve',
      struct_name: 'LP<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>'
    },
    extensions: {
      data: [
        ['lp', 'aries'],
        ['bridge', 'native']
      ]
    },
    unique_index: 15340,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ar-zUSDC',
    pancake_symbol: 'ar-zUSDC'
  },
  {
    name: 'Aries USDC (Wormhole) LP Token',
    symbol: 'ar-USDC',
    official_symbol: 'aUSDC',
    coingecko_id: '',
    decimals: 6,
    logo_url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg',
    project_url: 'https://ariesmarkets.xyz/',
    token_type: {
      type: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>',
      account_address: '0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3',
      module_name: 'reserve',
      struct_name: 'LP<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>'
    },
    extensions: {
      data: [
        ['lp', 'aries'],
        ['bridge', 'native']
      ]
    },
    unique_index: 15341,
    source: 'native',
    permissioned_listing: true,
    hippo_symbol: 'ar-USDC',
    pancake_symbol: 'ar-USDC'
  }
]

setCoinList(DEFAULT_LIST)
