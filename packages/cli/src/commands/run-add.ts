import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs-extra'
import chalk from 'chalk'

import { codegen } from './build.js'

import yaml from 'yaml'
import { getABIFilePath, getABI, writeABIFile } from '../abi.js'
import { AptosChainId, ChainId, getChainName, SuiChainId, EthChainInfo, ExplorerApiType } from '@sentio/chain'
import { errorOnUnknownOption } from '../utils.js'

const supportedChain: string[] = [
  AptosChainId.APTOS_MAINNET,
  AptosChainId.APTOS_TESTNET,
  AptosChainId.APTOS_MOVEMENT_TESTNET,
  AptosChainId.APTOS_MOVEMENT_MAINNET,
  AptosChainId.INITIA_ECHELON,
  SuiChainId.SUI_MAINNET,
  SuiChainId.SUI_TESTNET,
  SuiChainId.IOTA_MAINNET,
  SuiChainId.IOTA_TESTNET
]

export async function runAdd(argv: string[]) {
  for (const chain of Object.values(EthChainInfo)) {
    if (
      chain.explorerApiType === ExplorerApiType.ETHERSCAN ||
      chain.explorerApiType === ExplorerApiType.BLOCKSCOUT ||
      chain.explorerApiType === ExplorerApiType.ETHERSCAN_V2
    ) {
      supportedChain.push(chain.chainId)
    }
  }

  const supportedChainMessage = [
    ',  <Chain ID> (<Chain Name>)',
    '  --------------------',
    ...supportedChain.map((chainId, idx) => `  ${chainId} (${getChainName(chainId)})`)
  ]

  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.'
    },
    {
      name: 'address',
      defaultOption: true,
      description: 'Address of the contract',
      type: String
    },
    {
      name: 'name',
      alias: 'n',
      description: 'File name for the downloaded contract, if empty, use address as file name',
      type: String
    },
    {
      name: 'chain',
      alias: 'c',
      type: String,
      defaultValue: '1',
      description:
        'Chain ID, current supports the following, otherwise you need manually download ABI to abis/*:\n' +
        supportedChainMessage.join('\n,')
    },
    {
      name: 'folder',
      description: '(Optional) The folder to save the downloaded ABI file',
      type: String
    }
  ]

  const options = commandLineArgs(optionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: "Add contract's ABI to the project",
      content: 'sentio add [--chain <chain> --name <name>] <address>'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    }
  ])

  if (options.help || !options.address) {
    console.log(usage)
    process.exit(0)
  }

  errorOnUnknownOption(options)

  const chain = options['chain'].toLowerCase() as ChainId
  const address: string = options.address
  const folder: string = options.folder
  if (!address.startsWith('0x')) {
    console.error(chalk.red('Address must start with 0x'))
    console.log(usage)
    process.exit(1)
  }

  const abiRes = await getABI(chain, address, options.name)
  const filename = abiRes.name || address

  writeABIFile(abiRes.abi, getABIFilePath(chain, filename, '', folder))

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
    if (folder) {
      newContract.set('folder', folder)
    }
    contracts.add(newContract)
    fs.writeFileSync('sentio.yaml', yamlDocument.toString(), 'utf8')
  }

  // Run gen
  await codegen(false)
}
