import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import { codegen } from './build.js'

// @ts-ignore no types
import { init } from 'etherscan-api'
import { AptosClient } from 'aptos-sdk'
import { JsonRpcProvider } from '@mysten/sui.js'

export async function runAdd(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'chain',
      alias: 'c',
      type: String,
      defaultValue: 'homestead',
      description:
        'Chain identifier, can be: homestead/mainnet,goerli,arbitrum,avalanche, apots, aptos/testnet and sui, sui/testnet',
    },
    {
      name: 'address',
      defaultOption: true,
      description: 'Address of the contract',
      type: String,
    },
    {
      name: 'name',
      alias: 'n',
      description: 'File name for the downloaded contract, if empty, use address as file name',
      type: String,
    },
  ]

  const options = commandLineArgs(optionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: "Add contract's ABI to the project",
      content: 'sentio add [--chain <chain> --name <name>] <address>',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
  ])

  if (options.help || !options.address) {
    console.log(usage)
  } else {
    const chain: string = options['chain'].toLowerCase()
    const address: string = options.address
    if (!address.startsWith('0x')) {
      console.error(chalk.red('Address must start with 0x'))
      console.log(usage)
      process.exit(1)
    }

    let ethApi
    let aptosClient: AptosClient | undefined
    let suiClient: JsonRpcProvider | undefined
    switch (chain) {
      case 'aptos':
        aptosClient = new AptosClient('https://mainnet.aptoslabs.com/')
        break
      case 'aptos/testnet':
        aptosClient = new AptosClient('https://testnet.aptoslabs.com/')
        break
      case 'sui':
        throw Error('SUI mainnet is not support yet, try sui/testnet')
      // suiClient = new JsonRpcProvider('https://fullnode.mainnet.sui.io/')
      // break
      case 'sui/testnet':
        suiClient = new JsonRpcProvider('https://fullnode.testnet.sui.io/')
        break
      case 'mainnet':
      case 'homestead':
        ethApi = init()
        break
      default:
        ethApi = init(undefined, chain)
    }

    const baseErrMsg = chalk.red(
      `Failed to automatic download contract ${address} from ${chain}, please manually download abi and put it into abis/eth directory`
    )

    const filename = options.name ? options.name : address

    if (aptosClient) {
      try {
        const module = await aptosClient.getAccountModules(address)
        writeToDirectory(module, chain, filename)
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
    if (suiClient) {
      try {
        const module = await suiClient.getNormalizedMoveModulesByPackage(address)
        writeToDirectory(module, chain, filename)
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }

    if (ethApi) {
      try {
        const resp = await ethApi.contract.getabi(address)
        if (resp.status !== '1') {
          throw Error(resp.message)
        }
        writeToDirectory(resp.result, chain, filename)
      } catch (e) {
        console.error(baseErrMsg, e)
        process.exit(1)
      }
    }
    // Run gen
    await codegen()
  }
}

function writeToDirectory(obj: object | string, chain: string, name: string) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }
  const data = JSON.stringify(obj, null, 2)
  let subpath = chain
  switch (chain) {
    case 'aptos':
    case 'aptos/testnet':
    case 'sui':
    case 'sui/testnet':
      break
    default:
      subpath = 'eth'
  }

  const output = path.join('abis', subpath, name + '.json')
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, data)
  console.log(chalk.green('ABI has been downloaded to', output))
}
