import chalk from 'chalk'
import process from 'process'
import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { AptosChainId, ChainId, StarknetChainId, SuiChainId } from '@sentio/chain'

import type { Aptos } from '@aptos-labs/ts-sdk'
import type { IotaClient } from '@iota/iota-sdk/client'
import type { SuiClient } from '@mysten/sui/client'
import { ReadKey } from './key.js'
import { Auth } from './commands/upload.js'
import { getApiUrl } from './utils.js'

export async function getABI(
  chain: ChainId,
  address: string,
  name: string | undefined
): Promise<{ name?: string; abi: object | string }> {
  const baseErrMsg = chalk.red(
    `Failed to automatic download contract ${address} from ${chain}, please manually download abi and put it into abis/eth directory`
  )

  // SUI
  try {
    const SuiClient = (await import('@mysten/sui/client')).SuiClient
    let suiClient: SuiClient | undefined
    switch (chain) {
      case SuiChainId.SUI_MAINNET:
        suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' })
        break
      case SuiChainId.SUI_TESTNET:
        suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' })
        break
    }
    if (suiClient) {
      try {
        return {
          abi: await suiClient.getNormalizedMoveModulesByPackage({ package: address }),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('sui module not loaded')
  }

  // Iota
  try {
    const IotaClient = (await import('@iota/iota-sdk/client')).IotaClient
    let iotaClient: IotaClient | undefined
    switch (chain) {
      case SuiChainId.IOTA_MAINNET:
        iotaClient = new IotaClient({ url: 'https://api.mainnet.iota.cafe/' })
        break
      case SuiChainId.IOTA_TESTNET:
        iotaClient = new IotaClient({ url: 'https://api.testnet.iota.cafe/' })
        break
    }
    if (iotaClient) {
      try {
        return {
          abi: await iotaClient.getNormalizedMoveModulesByPackage({ package: address }),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('iota module not loaded')
  }

  // aptos
  try {
    const Aptos = (await import('@aptos-labs/ts-sdk')).Aptos
    const AptosConfig = (await import('@aptos-labs/ts-sdk')).AptosConfig
    const Network = (await import('@aptos-labs/ts-sdk')).Network

    let aptosClient: Aptos | undefined
    switch (chain) {
      case AptosChainId.APTOS_MAINNET:
        aptosClient = new Aptos(
          new AptosConfig({ network: Network.MAINNET, fullnode: 'https://mainnet.aptoslabs.com/v1' })
        )
        break
      case AptosChainId.APTOS_TESTNET:
        aptosClient = new Aptos(
          new AptosConfig({ network: Network.TESTNET, fullnode: 'https://testnet.aptoslabs.com/v1' })
        )
        break
      case AptosChainId.APTOS_MOVEMENT_TESTNET:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://aptos.testnet.bardock.movementlabs.xyz/v1'
          })
        )
        break
      case AptosChainId.APTOS_MOVEMENT_MAINNET:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://mainnet.movementnetwork.xyz/v1'
          })
        )
        break
      case AptosChainId.INITIA_ECHELON:
        aptosClient = new Aptos(
          new AptosConfig({
            network: Network.CUSTOM,
            fullnode: 'https://rpc.sentio.xyz/initia-aptos/v1'
          })
        )
        break
    }
    if (aptosClient) {
      try {
        return {
          abi: await aptosClient.getAccountModules({ accountAddress: address }),
          name
        }
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
  } catch (e) {
    console.log('aptos module not loaded')
  }

  // ethereum
  try {
    const uploadAuth: Auth = {}
    const host = 'https://app.sentio.xyz'
    const apiKey = ReadKey(host)
    if (apiKey) {
      uploadAuth['api-key'] = apiKey
    } else {
      const cmd = 'sentio login'
      console.error(chalk.red('No Credential found for', host, '. Please run `' + cmd + '`.'))
      process.exit(1)
    }
    const url = getApiUrl(`/api/v1/solidity/etherscan_abi?chainSpec.chainId=${chain}&address=${address}`, host)
    const resp = (await (
      await fetch(url, {
        headers: {
          ...uploadAuth
        }
      })
    ).json()) as any
    if (!resp.abi) {
      if (resp.message?.startsWith('contract source code not verified')) {
        throw Error(resp.message + "(API can't retrieve ABI based on similar contract)")
      }
      if (resp.message?.includes('unsupported')) {
        throw Error(`chain ${chain} not supported for direct add, please download the ABI manually`)
      }
      throw Error(resp.message)
    }
    return {
      abi: resp.abi,
      name: name ?? resp.contractName
    }
  } catch (e) {
    console.error(baseErrMsg, e)
    process.exit(1)
  }
}

export function getABIFilePath(chain: string, name: string, address?: string, folder?: string): string {
  let subpath
  let filename = name ?? address
  switch (chain) {
    case AptosChainId.APTOS_MAINNET:
      subpath = 'aptos'
      break
    case AptosChainId.APTOS_TESTNET:
      subpath = 'aptos/testnet'
      break
    case AptosChainId.APTOS_MOVEMENT_MAINNET:
      subpath = 'aptos/movement-mainnet'
      break
    case AptosChainId.APTOS_MOVEMENT_TESTNET:
      subpath = 'aptos/movement-testnet'
      break
    case AptosChainId.INITIA_ECHELON:
      subpath = 'aptos/initia-echelon'
      break
    case SuiChainId.SUI_MAINNET:
      subpath = 'sui'
      break
    case SuiChainId.SUI_TESTNET:
      subpath = 'sui/testnet'
      break
    case SuiChainId.IOTA_MAINNET:
      subpath = 'iota'
      break
    case SuiChainId.IOTA_TESTNET:
      subpath = 'iota/testnet'
      break
    case StarknetChainId.STARKNET_MAINNET:
      subpath = 'starknet'
      filename = name && address ? `${name}-${address}` : (name ?? address)
      break
    case StarknetChainId.STARKNET_SEPOLIA:
      subpath = 'starknet/sepolia'
      filename = name && address ? `${name}-${address}` : (name ?? address)
      break
    default:
      subpath = 'eth'
  }

  if (folder) {
    if (folder.startsWith(subpath + '/')) {
      subpath = folder
    } else {
      console.log(
        chalk.red('ABI folder must be'),
        chalk.blue(subpath),
        chalk.red('or a folder inside', chalk.blue(subpath))
      )
      process.exit(1)
    }
  }

  return path.join('abis', subpath, filename + '.json')
}

export function writeABIFile(obj: string | object, output: string) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }
  const data = JSON.stringify(obj, null, 2)

  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, data)
  console.log(chalk.green('ABI has been downloaded to', output))
}
