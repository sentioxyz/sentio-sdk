import { Command } from '@commander-js/extra-typings'
import fs from 'fs-extra'
import chalk from 'chalk'

import { codegen } from './build.js'

import yaml from 'yaml'
import { getABIFilePath, getABI, writeABIFile } from '../abi.js'
import { AptosChainId, ChainId, getChainName, SuiChainId, EthChainInfo, ExplorerApiType } from '@sentio/chain'
import { CommandOptionsType } from './types.js'

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

export function createAddCommand() {
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

  return new Command('add')
    .description('Add a contract to the project')
    .argument('<address>', 'Address of the contract')
    .option('-n, --name <name>', 'File name for the downloaded contract, if empty, use address as file name')
    .requiredOption(
      '-c, --chain <chain>',
      'Chain ID, current supports the following, otherwise you need manually download ABI to abis/*:\n' +
        supportedChainMessage.join('\n,'),
      '1'
    )
    .requiredOption('--folder <folder>', '(Optional) The folder to save the downloaded ABI file', '')
    .action(async (address, options) => {
      await runAddInternal(address, options)
    })
}

async function runAddInternal(address: string, options: CommandOptionsType<typeof createAddCommand>) {
  if (!address) {
    console.error('Address is required')
    process.exit(1)
  }

  const chain = options.chain.toLowerCase() as ChainId
  const folder: string = options.folder
  if (!address.startsWith('0x')) {
    console.error(chalk.red('Address must start with 0x'))
    process.exit(1)
  }

  const abiRes = await getABI(chain, address, options.name)
  const filename = abiRes.name || address

  writeABIFile(abiRes.abi, getABIFilePath(chain, filename, '', folder))

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

  await codegen(false)
}
