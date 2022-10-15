// copy from https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.js
// and https://besu.hyperledger.org/en/stable/Concepts/NetworkID-And-ChainID/

export const CHAIN_MAP: Record<string, string> = {
  0: 'kardia',
  1: 'ethereum',
  2: 'expanse',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  6: 'kotti',
  8: 'ubiq',
  10: 'optimism',
  19: 'songbird',
  20: 'elastos',
  25: 'cronos',
  30: 'rsk',
  40: 'telos',
  50: 'xdc',
  52: 'csc',
  55: 'zyx',
  56: 'binance',
  57: 'syscoin',
  60: 'gochain',
  61: 'ethclassic',
  63: 'mordor',
  66: 'okexchain',
  70: 'hoo',
  82: 'meter',
  88: 'tomochain',
  100: 'xdai',
  106: 'velas',
  108: 'thundercore',
  122: 'fuse',
  128: 'heco',
  137: 'polygon',
  200: 'xdaiarb',
  212: 'astor',
  246: 'energyweb',
  250: 'fantom',
  269: 'hpb',
  288: 'boba',
  321: 'kucoin',
  336: 'shiden',
  361: 'theta',
  416: 'sx',
  534: 'candle',
  592: 'astar',
  820: 'callisto',
  888: 'wanchain',
  1088: 'metis',
  1246: 'omchain',
  1284: 'moonbeam',
  1285: 'moonriver',
  2018: 'dev',
  2020: 'ronin',
  2222: 'kava',
  2612: 'ezchain',
  4181: 'phi',
  4689: 'iotex',
  5050: 'xlc',
  5551: 'nahmii',
  7777: 'nmactest',
  8217: 'klaytn',
  9001: 'evmos',
  10000: 'smartbch',
  103090: 'crystaleum',
  32659: 'fusion',
  42161: 'arbitrum',
  42220: 'celo',
  42262: 'oasis',
  43114: 'avalanche',
  71402: 'godwoken',
  200625: 'akroma',
  333999: 'polis',
  11155111: 'sepolia',
  1313161554: 'aurora',
  1666600000: 'harmony',
  11297108109: 'palm',
  836542336838601: 'curio',
}

export const SOL_MAINMET_ID = 'sol_mainnet'
export const SOL_DEVNET_ID = 'sol_devnet'
export const SOL_TESTNENT_ID = 'sol_testnet'
CHAIN_MAP[SOL_MAINMET_ID] = 'solana'
CHAIN_MAP[SOL_DEVNET_ID] = 'solana-dev'
CHAIN_MAP[SOL_TESTNENT_ID] = 'solana-test'

export const SUI_DEVNET_ID = 'sui_devnet'
CHAIN_MAP[SUI_DEVNET_ID] = 'sui-dev'

export const APTOS_TESTNET_ID = 'aptos_testnet'
export const APTOS_MAINNET_ID = 'aptos_mainnet'
CHAIN_MAP[APTOS_TESTNET_ID] = 'aptos-test'
CHAIN_MAP[APTOS_MAINNET_ID] = 'aptos-mainnet'

export function getChainName(chainId: string | number): string {
  if (typeof chainId === 'number') {
    chainId = chainId.toString()
  }
  const name = CHAIN_MAP[chainId]
  if (name) {
    return name
  }
  return chainId
}

export function getChainType(chainId: string | number): string {
  const id = String(chainId).toLowerCase()
  if (id.startsWith('sol')) {
    return 'solana'
  }
  if (id.startsWith('sui')) {
    return 'sui'
  }
  if (id.startsWith('apt')) {
    return 'aptos'
  }
  return 'ethereum'
}
