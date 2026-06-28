import { getEACAggregatorProxyContract } from '../eth/builtin/eacaggregatorproxy.js'
import fs from 'fs'
import { BlockTag } from 'ethers/providers'
import { scaleDown } from '../core/big-decimal.js'
import { EthChainId } from '@sentio/chain'
import { createRequire } from 'module'
import path from 'path'

// Maps an oracle pair (e.g. "ETH / USD") to its EACAggregatorProxy address.
type OracleMap = Record<string, string>

export enum PriceUnit {
  USD = 0,
  ETH = 1,
  BTC = 2
}

export interface DexPriceResult {
  price?: number
  error?: string
}

export function getPackageRoot(pkgId: string): string {
  const require = createRequire(import.meta.url)
  const m = require.resolve(pkgId)

  let dir = path.dirname(m)
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir)
  }
  return dir
}

// Load price feed from https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum
// and then use EACAggregatorProxy contract to get price
class DexPrice {
  USD_ORACLE_MAP = new Map<string, string>()
  ETH_ORACLE_MAP = new Map<string, string>()
  BTC_ORACLE_MAP = new Map<string, string>()
  ASSETS_INFOS = new Map<string, number>()

  readonly chainId: EthChainId

  constructor(jsonFileName: string, chainId: EthChainId) {
    this.chainId = chainId
    const packageRoot = getPackageRoot('@sentio/sdk')
    const jsonFilePath = path.join(packageRoot, 'assets', jsonFileName)
    const fileContent = fs.readFileSync(jsonFilePath, { encoding: 'utf-8' })

    const oracles: OracleMap = JSON.parse(fileContent)

    for (const [rawPair, rawAddress] of Object.entries(oracles)) {
      const pair = rawPair.split('/')
      const asset = pair[0].trim().toLowerCase()
      const target = pair[1].trim().toLowerCase()
      const address = rawAddress.toLowerCase()
      if (target === 'usd') {
        this.USD_ORACLE_MAP.set(asset, address)
      } else if (target === 'eth') {
        this.ETH_ORACLE_MAP.set(asset, address)
      } else if (target == 'btc') {
        this.BTC_ORACLE_MAP.set(asset, address)
      } else {
        console.error('wrong asset record: ' + JSON.stringify({ [rawPair]: rawAddress }))
      }
    }
  }

  // asset: symbol of the asset
  // unit: usd, eth or btc
  // blockTag: blockNumber of block symbol like "latest"
  // returns the asset price,
  // throw exception if calling to price feed failed, e.g. due to a invalid block number
  async getPrice(
    asset: string,
    blockTag: BlockTag = 'latest',
    unit: PriceUnit = PriceUnit.USD
  ): Promise<DexPriceResult> {
    // if (chainId !== 1 && chainId !== 5) {
    //   return {
    //     error: "current dex price only support chain 1 (mainnet) or 5 (goerli)"
    //   }
    // }

    let oracleMap = this.USD_ORACLE_MAP
    switch (unit) {
      case PriceUnit.ETH:
        oracleMap = this.ETH_ORACLE_MAP
        break
      case PriceUnit.BTC:
        oracleMap = this.BTC_ORACLE_MAP
        break
      default:
    }

    asset = asset.trim().toLowerCase()

    const addr = oracleMap.get(asset)
    if (!addr) {
      return {
        error: 'No price feed found for asset'
      }
    }

    const contract = getEACAggregatorProxyContract(this.chainId, addr)
    try {
      const price = await contract.latestAnswer({
        blockTag: blockTag
      })

      let decimal = this.ASSETS_INFOS.get(asset)
      if (!decimal) {
        decimal = Number(await contract.decimals())
        this.ASSETS_INFOS.set(asset, decimal)
      }

      return {
        price: scaleDown(price, decimal).toNumber()
      }
    } catch (e) {
      return {
        error:
          'Price query error for ' +
          asset +
          ' failed at ' +
          addr +
          ' at chain ' +
          this.chainId +
          '. Details: ' +
          String(e)
      }
    }
  }
}

export const EthereumDexPrice = new DexPrice('chainlink-oracles.json', EthChainId.ETHEREUM)
export const SepoliaDexPrice = new DexPrice('chainlink-oracles-sepolia.json', EthChainId.SEPOLIA)
