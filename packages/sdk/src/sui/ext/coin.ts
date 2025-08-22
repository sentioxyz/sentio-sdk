import { BaseCoinInfo } from '../../move/ext/index.js'
import fetch from 'node-fetch'
import { accountTypeString, SPLITTER } from '../../move/index.js'
import { getPriceByType } from '../../utils/index.js'
import { SuiChainId } from '@sentio/chain'
// import { validateAndNormalizeAddress } from '../utils.js'
import { getClient, SuiNetwork } from '../network.js'
import { CoinMetadata } from '@mysten/sui/client'

const WHITELISTED_COINS = new Map<string, BaseCoinInfo>()

let initiated = false
export async function initCoinList() {
  if (initiated) {
    return
  }
  let list = DEFAULT_LIST.coinlist
  try {
    const resp = await fetch('https://raw.githubusercontent.com/solflare-wallet/sui-coinlist/master/sui-coinlist.json')
    list = ((await resp.json()) as any).coinlist
  } catch (e) {
    console.warn("Can't not fetch newest coin list, use default list")
  }

  setCoinList(list)
  initiated = true
}

export interface SuiCoinInfo {
  network: string
  address: string
  symbol: string
  name: string
  decimals: number
}

function setCoinList(list: SuiCoinInfo[]) {
  for (const info of list) {
    if (info.address.startsWith('0x2::coin::Coin')) {
      continue
    }
    if (info.network !== 'mainnet') {
      continue
    }
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
    WHITELISTED_COINS.set(info.address, {
      type: info.address,
      symbol: info.symbol,
      decimals: info.decimals,
      bridge
    })
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

export function getCoinInfo(type: string): BaseCoinInfo {
  const r = WHITELISTED_COINS.get(type)
  if (!r) {
    const parts = type.split('::')
    // TDDO retrive from network
    return {
      type,
      symbol: parts[2],
      decimals: 8,
      bridge: 'native'
    }
  }
  return r
}

const COIN_METADATA_CACHE = new Map<string, Promise<CoinMetadata | null>>()

export async function getCoinInfoWithFallback(type: string, network?: SuiNetwork): Promise<BaseCoinInfo> {
  const r = WHITELISTED_COINS.get(type)
  if (!r) {
    network = network || SuiChainId.SUI_MAINNET
    const key = network + '_' + type
    let promise = COIN_METADATA_CACHE.get(key)
    if (!promise) {
      const client = getClient(network)
      promise = client.getCoinMetadata({ coinType: type })
      COIN_METADATA_CACHE.set(key, promise)
    }
    const meta = await promise
    if (meta === null) {
      throw Error('Coin not existed ' + key)
    }

    const parts = type.split(SPLITTER)
    return {
      type,
      symbol: meta.symbol,
      decimals: meta.decimals,
      bridge: 'native'
    }
  }
  return r
}

export async function getPrice(coinType: string, timestamp: number): Promise<number> {
  if (!whiteListed(coinType)) {
    return 0.0
  }
  const date = new Date(timestamp / 1000)
  try {
    return (await getPriceByType(SuiChainId.SUI_MAINNET, coinType, date)) || 0
  } catch (error) {
    console.log(JSON.stringify(error))
    throw error
  }
}

export async function calculateValueInUsd(n: bigint, coinInfo: BaseCoinInfo, timestamp: number) {
  const price = await getPrice(coinInfo.type, timestamp)
  const amount = n.scaleDown(coinInfo.decimals)
  return amount.multipliedBy(price)
}

const DEFAULT_LIST = {
  name: 'Sui Coin List',
  timestamp: '2022-12-01T13:34:30.145Z',
  logoURI: 'https://s2.coinmarketcap.com/static/img/coins/128x128/20947.png',
  coinlist: [
    {
      network: 'mainnet',
      address: '0x2::coin::Coin<0x2::sui::SUI>',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'testnet',
      address: '0x2::coin::Coin<0x2::sui::SUI>',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'devnet',
      address: '0x2::coin::Coin<0x2::sui::SUI>',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'mainnet',
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'testnet',
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'devnet',
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui Coin',
      decimals: 9,
      logoURI: 'https://cryptototem.com/wp-content/uploads/2022/08/SUI-logo.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'sui'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestTEST',
      symbol: 'TEST',
      name: 'Test Token',
      logoURI: 'https://suiswap.app/images/token/suiswap-test.svg',
      tags: [],
      decimals: 8,
      extensions: {}
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestUSDT',
      symbol: 'USDT',
      name: 'Tether',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4/logo.png',
      tags: [],
      decimals: 8,
      extensions: {
        coingeckoId: 'tether'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestUSDC',
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'usd-coin'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestSOL',
      symbol: 'SOL',
      name: 'Solana',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      decimals: 8,
      extensions: {
        coingeckoId: 'solana'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestBTC',
      symbol: 'BTC',
      name: 'Bitcoin',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'bitcoin'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestDAI',
      symbol: 'DAI',
      name: 'DAI',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvdhK74ij1/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'dai'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestBNB',
      symbol: 'BNB',
      name: 'BNB',
      logoURI: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'binancecoin'
      }
    },
    {
      network: 'testnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestETH',
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'ethereum'
      }
    },
    {
      network: 'testnet',
      address: '0x31b14985adb91360ed90a5786cb0956c83e7f275a8ae6123f38adab9d2b792b1::usdc::USDC',
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'usd-coin'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestTEST',
      symbol: 'TEST',
      name: 'Test Token',
      logoURI: 'https://suiswap.app/images/token/suiswap-test.svg',
      tags: [],
      decimals: 8,
      extensions: {}
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestUSDT',
      symbol: 'USDT',
      name: 'Tether',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4/logo.png',
      tags: [],
      decimals: 8,
      extensions: {
        coingeckoId: 'tether'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestUSDC',
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'usd-coin'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestSOL',
      symbol: 'SOL',
      name: 'Solana',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      decimals: 8,
      extensions: {
        coingeckoId: 'solana'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestBTC',
      symbol: 'BTC',
      name: 'Bitcoin',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'bitcoin'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestDAI',
      symbol: 'DAI',
      name: 'DAI',
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvdhK74ij1/logo.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'dai'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestBNB',
      symbol: 'BNB',
      name: 'BNB',
      logoURI: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'binancecoin'
      }
    },
    {
      network: 'devnet',
      address: '0xe158e6df182971bb6c85eb9de9fbfb460b68163d19afc45873c8672b5cc521b2::TOKEN::TestETH',
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      decimals: 8,
      tags: [],
      extensions: {
        coingeckoId: 'ethereum'
      }
    },
    {
      network: 'mainnet',
      address: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
      symbol: 'wETH',
      name: 'Wrapped Ethereum (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      tags: [],
      extensions: {
        coingeckoId: 'ethereum'
      }
    },
    {
      network: 'mainnet',
      address: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
      symbol: 'wUSDT',
      name: 'Tether (Wormhole)',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4/logo.png',
      tags: [],
      extensions: {
        coingeckoId: 'tether'
      }
    },
    {
      network: 'mainnet',
      address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      symbol: 'wUSDC',
      name: 'USD Coin (Wormhole)',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      tags: [],
      extensions: {
        coingeckoId: 'usd-coin'
      }
    },
    {
      network: 'mainnet',
      address: '0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f::coin::COIN',
      symbol: 'wCELO',
      name: 'Celo (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/11090/large/InjXBNx9_400x400.jpg',
      tags: [],
      extensions: {
        coingeckoId: 'celo'
      }
    },
    {
      network: 'mainnet',
      address: '0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676::coin::COIN',
      symbol: 'wMATIC',
      name: 'Wrapped Matic (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      tags: [],
      extensions: {
        coingeckoId: 'matic-network'
      }
    },
    {
      network: 'mainnet',
      address: '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN',
      symbol: 'wBNB',
      name: 'Wrapped BNB (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      tags: [],
      extensions: {
        coingeckoId: 'binancecoin'
      }
    },
    {
      network: 'mainnet',
      address: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN',
      symbol: 'wBTC',
      name: 'Wrapped Bitcoin (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      tags: [],
      extensions: {
        coingeckoId: 'bitcoin'
      }
    },
    {
      network: 'mainnet',
      address: '0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766::coin::COIN',
      symbol: 'wAVAX',
      name: 'Wrapped AVAX (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
      tags: [],
      extensions: {
        coingeckoId: 'avalanche-2'
      }
    },
    {
      network: 'mainnet',
      address: '0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396::coin::COIN',
      symbol: 'wFTM',
      name: 'Wrapped Fantom (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/4001/large/Fantom_round.png',
      tags: [],
      extensions: {
        coingeckoId: 'fantom'
      }
    },
    {
      network: 'mainnet',
      address: '0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75::coin::COIN',
      symbol: 'wGLMR',
      name: 'Wrapped GLMR (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/22459/large/glmr.png',
      tags: [],
      extensions: {
        coingeckoId: 'moonbeam'
      }
    },
    {
      network: 'mainnet',
      address: '0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN',
      symbol: 'wSOL',
      name: 'Wrapped Solana (Wormhole)',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      tags: [],
      extensions: {
        coingeckoId: 'solana'
      }
    },
    {
      network: 'mainnet',
      address: '0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037::coin::COIN',
      symbol: 'wUSDCsol',
      name: 'USD Coin Solana (Wormhole)',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      tags: [],
      extensions: {
        coingeckoId: 'usd-coin'
      }
    }
  ]
}
