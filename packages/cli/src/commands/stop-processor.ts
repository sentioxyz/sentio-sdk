import { Command } from '@commander-js/extra-typings'
import chalk from 'chalk'
import { handleCommandError } from '../api.js'
import { confirm } from './upload.js'
import { runProcessorStop } from './processor.js'
import {
  getSentioNetworkConfig,
  resolveNetworkAddresses,
  getWalletFromPrivateKey,
  requirePrivateKey,
  stopProcessorOnChain
} from '../network.js'

export function createStopProcessorCommand() {
  return new Command('stop')
    .description('Stop a processor. Uses Sentio Network contract when --sentio-network is specified.')
    .argument('<processorId>', 'ID of the processor to stop')
    .option('--sentio-network <network>', 'Stop via Sentio Network contract (only "testnet" supported)')
    .option('--host <host>', 'Override Sentio host')
    .option('--api-key <key>', 'Use an explicit API key instead of saved credentials')
    .option('--token <token>', 'Use an explicit bearer token instead of saved credentials')
    .option('--project <owner/slug>', 'Sentio project in <owner>/<slug> format')
    .option('--owner <owner>', 'Sentio project owner')
    .option('--name <name>', 'Sentio project name')
    .option('-y, --yes', 'Bypass confirmation')
    .showHelpAfterError()
    .action(async (processorId, options) => {
      try {
        if (options.sentioNetwork) {
          await runStopProcessorOnChain(processorId, options)
        } else {
          await runProcessorStop(processorId, options)
        }
      } catch (error) {
        handleCommandError(error)
      }
    })
}

async function runStopProcessorOnChain(processorId: string, options: { sentioNetwork?: string; yes?: boolean }) {
  const network = options.sentioNetwork!
  const networkConfig = getSentioNetworkConfig(network)

  const privateKey = requirePrivateKey()
  const wallet = getWalletFromPrivateKey(privateKey)

  console.log(chalk.blue(`Wallet address: ${wallet.address}`))
  console.log(chalk.blue('Resolving contract addresses from AddressBook...'))
  const addresses = await resolveNetworkAddresses(networkConfig)

  if (!options.yes) {
    const confirmed = await confirm(`Stop processor "${processorId}" on Sentio Network ${network}?`)
    if (!confirmed) {
      console.log('Stop cancelled.')
      return
    }
  }

  await stopProcessorOnChain(networkConfig, addresses, wallet, processorId)

  console.log()
  console.log(chalk.green(`Processor "${processorId}" stopped on Sentio Network ${network}.`))
}
