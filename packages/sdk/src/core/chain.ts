// copy from https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.js
// and https://besu.hyperledger.org/en/stable/Concepts/NetworkID-And-ChainID/

export const CHAIN_IDS = {
  KARDIA: '0',
  ETHEREUM: '1',
  EXPANSE: '2',
  ROPSTEN: '3',
  RINKEBY: '4',
  GOERLI: '5',
  KOTTI: '6',
  UBIQ: '8',
  OPTIMISM: '10',
  SONGBIRD: '19',
  ELASTOS: '20',
  CRONOS: '25',
  RSK: '30',
  TELOS: '40',
  XDC: '50',
  CSC: '52',
  ZYX: '55',
  BINANCE: '56',
  SYSCOIN: '57',
  GOCHAIN: '60',
  ETHCLASSIC: '61',
  MORDOR: '63',
  OKEXCHAIN: '66',
  HOO: '70',
  METER: '82',
  TOMOCHAIN: '88',
  BINANCE_TEST: '97',
  XDAI: '100',
  VELAS: '106',
  THUNDERCORE: '108',
  FUSE: '122',
  HECO: '128',
  POLYGON: '137',
  XDAIARB: '200',
  ASTOR: '212',
  ENERGYWEB: '246',
  FANTOM: '250',
  HPB: '269',
  BOBA: '288',
  KUCOIN: '321',
  SHIDEN: '336',
  THETA: '361',
  SX: '416',
  CANDLE: '534',
  ASTAR: '592',
  CALLISTO: '820',
  WANCHAIN: '888',
  METIS: '1088',
  OMCHAIN: '1246',
  MOONBEAM: '1284',
  MOONRIVER: '1285',
  MOONBASE: '1287',
  DEV: '2018',
  RONIN: '2020',
  KAVA: '2222',
  EZCHAIN: '2612',
  PHI: '4181',
  IOTEX: '4689',
  XLC: '5050',
  NAHMII: '5551',
  NMACTEST: '7777',
  KLAYTN: '8217',
  EVMOS: '9001',
  SMARTBCH: '10000',
  CRYSTALEUM: '103090',
  FUSION: '32659',
  ARBITRUM: '42161',
  CELO: '42220',
  OASIS: '42262',
  AVALANCHE: '43114',
  GODWOKEN: '71402',
  AKROMA: '200625',
  POLIS: '333999',
  ARBITRUM_TEST: '421613',
  SEPOLIA: '11155111',
  AURORA: '1313161554',
  HARMONY: '1666600000',
  PALM: '11297108109',
  CURIO: '836542336838601',
  SOLANA_MAINNET: 'sol_mainnet',
  SOLANA_DEVNET: 'sol_devnet',
  SOLANA_TESTNET: 'sol_testnet',
  SOLANA_PYTH: 'sol_pyth',
  SUI_MAINNET: 'sui_mainnet',
  SUI_TESTNET: 'sui_testnet',
  APTOS_MAINNET: 'aptos_mainnet',
  APTOS_TESTNET: 'aptos_testnet',
}

export const CHAIN_MAP: Record<string, string> = {}

for (const [key, value] of Object.entries(CHAIN_IDS)) {
  const parts = key.split('_')
  CHAIN_MAP[value] = parts
    .map((part, index) => {
      return part[0] + part.slice(1).toLowerCase()
    })
    .join(' ')
}

export function getChainName(chainId: string | number | null | undefined): string {
  if (typeof chainId === 'number') {
    chainId = chainId.toString()
  }
  if (chainId) {
    const name = CHAIN_MAP[chainId]
    if (name) {
      return name
    }
  }
  return chainId || ''
}

export function getChainType(chainId?: string | number): string {
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
  return 'EVM'
}
