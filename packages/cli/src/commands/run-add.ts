import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs-extra'
import chalk from 'chalk'

import { codegen } from './build.js'

import * as process from 'process'
import yaml from 'yaml'
import { getABIFilePath, getABI, writeABIFile, ETH_API_URL_MAP } from '../abi.js'
import { CHAIN_IDS, getChainName } from '../chain.js'

export async function runAdd(argv: string[]) {
  const supportedChain: string[] = [CHAIN_IDS.APTOS_MAINNET, CHAIN_IDS.APTOS_TESTNET, CHAIN_IDS.SUI_TESTNET]
  supportedChain.push(...Object.keys(ETH_API_URL_MAP))
  const supprtedChainMessage = [
    '',
    ...supportedChain.map(
      (chainId, idx) => `  ${getChainName(chainId)}:\t${chainId}${idx === supportedChain.length - 1 ? '' : '\n'}`
    ),
  ]

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
      defaultValue: '1',
      description: 'Chain id, current support (chain name: id)s are:\n' + supprtedChainMessage,
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

    const abiRes = await getABI(chain, address, options.name)
    const filename = abiRes.name || address

    writeABIFile(abiRes.abi, getABIFilePath(chain, filename))

    // Write contract info to sentio.yaml
    const yamlDocument: yaml.Document = yaml.parseDocument(fs.readFileSync('sentio.yaml', 'utf8'))
    let contracts = yamlDocument.get('contracts') as yaml.YAMLSeq
    if (!contracts) {
      contracts = new yaml.YAMLSeq()
      yamlDocument.set('contracts', contracts)
    }

    let hasContract = false
    for (const item of contracts.items as yaml.YAMLMap[]) {
      if (item.get('chain') === chain && item.get('address') === address) {
        hasContract = true
      }
    }

    if (!hasContract) {
      const newContract = new yaml.YAMLMap()
      newContract.set('chain', chain)
      newContract.set('address', address)
      if (address !== filename) {
        newContract.set('name', filename)
      }
      contracts.add(newContract)
      fs.writeFileSync('sentio.yaml', yamlDocument.toString(), 'utf8')
    }

    // Run gen
    await codegen(false)
  }
}
