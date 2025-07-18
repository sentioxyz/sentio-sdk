import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'
import { SuiClient } from '@mysten/sui/client'
import chalk from 'chalk'
import process from 'process'
import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { AptosChainId, ChainId, StarknetChainId, SuiChainId, EthChainInfo, ExplorerApiType } from '@sentio/chain'
import { RpcProvider as Starknet } from 'starknet'
import { IotaClient } from '@iota/iota-sdk/client'

export async function getABI(
  chain: ChainId,
  address: string,
  name: string | undefined
): Promise<{ name?: string; abi: object | string }> {
  let ethApi
  let aptosClient: Aptos | undefined
  let suiClient: SuiClient | undefined
  let iotaClient: IotaClient | undefined
  let starknetClient: Starknet | undefined

  switch (chain as string) {
    case AptosChainId.APTOS_MAINNET:
      aptosClient = new Aptos(new AptosConfig({ fullnode: 'https://mainnet.aptoslabs.com/v1' }))
      break
    case AptosChainId.APTOS_TESTNET:
      aptosClient = new Aptos(new AptosConfig({ fullnode: 'https://testnet.aptoslabs.com/v1' }))
      break
    case AptosChainId.APTOS_MOVEMENT_TESTNET:
      aptosClient = new Aptos(
        new AptosConfig({
          fullnode: 'https://aptos.testnet.bardock.movementlabs.xyz/v1'
        })
      )
      break
    case AptosChainId.APTOS_MOVEMENT_MAINNET:
      aptosClient = new Aptos(
        new AptosConfig({
          fullnode: 'https://mainnet.movementnetwork.xyz/v1'
        })
      )
      break
    case AptosChainId.INITIA_ECHELON:
      aptosClient = new Aptos(
        new AptosConfig({
          fullnode: 'https://rpc.sentio.xyz/initia-aptos/v1'
        })
      )
      break
    case SuiChainId.SUI_MAINNET:
      suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' })
      break
    case SuiChainId.SUI_TESTNET:
      suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' })
      break
    case SuiChainId.IOTA_MAINNET:
      iotaClient = new IotaClient({ url: 'https://api.mainnet.iota.cafe/' })
      break
    case SuiChainId.IOTA_TESTNET:
      iotaClient = new IotaClient({ url: 'https://api.testnet.iota.cafe/' })
      break
    case StarknetChainId.STARKNET_MAINNET:
      starknetClient = new Starknet({
        nodeUrl: 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/8sD5yitBslIYCPFzSq_Q1ObJHqPlZxFw'
      })
      break
    case StarknetChainId.STARKNET_SEPOLIA:
      starknetClient = new Starknet({
        nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/8sD5yitBslIYCPFzSq_Q1ObJHqPlZxFw'
      })
      break
    default:
      const chainDetail = EthChainInfo[chain]
      ethApi = chainDetail.explorerApi
      if (
        !ethApi ||
        (chainDetail.explorerApiType !== ExplorerApiType.ETHERSCAN &&
          chainDetail.explorerApiType !== ExplorerApiType.BLOCKSCOUT)
      ) {
        console.error(chalk.red(`chain ${chain} not supported for direct add, please download the ABI manually`))
        process.exit(1)
      }
  }

  const baseErrMsg = chalk.red(
    `Failed to automatic download contract ${address} from ${chain}, please manually download abi and put it into abis/eth directory`
  )

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
  if (starknetClient) {
    const clazz = await starknetClient.getClassAt(address, 'latest')
    return { abi: clazz.abi, name }
  }

  try {
    let apiKey = process.env['ETHERSCAN_API_KEY_' + chain]
    if (!apiKey) {
      const keys: Record<string, string> = {
        [ChainId.ETHEREUM]: '1KQV22RY3KV1PX5IIB34TPAVVQG1ZMAU45',
        [ChainId.BASE]: 'K7613MC26RFMACK414RGZUEAX1184TWYZU'
      }
      apiKey = keys[chain]
    }
    if (apiKey) {
      ethApi = `${ethApi}/api?apikey=${apiKey}&`
    } else {
      ethApi = `${ethApi}/api?`
    }

    let resp = (await (await fetch(`${ethApi}module=contract&action=getabi&address=${address}`)).json()) as any
    if (resp.status !== '1') {
      if (resp.result?.startsWith('Contract source code not verified')) {
        throw Error(resp.result + "(API can't retrieve ABI based on similar contract)")
      }
      throw Error(resp.message)
    }
    const abi = resp.result

    if (!name) {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      resp = (await (await fetch(`${ethApi}module=contract&action=getsourcecode&address=${address}`)).json()) as any
      if (resp.status !== '1') {
        throw Error(resp.message)
      }
      const contractName = resp.result[0].ContractName
      if (contractName) {
        name = contractName
      }
    }
    return {
      name,
      abi
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
