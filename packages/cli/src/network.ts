import { ethers } from 'ethers'
import chalk from 'chalk'
import fetch from 'node-fetch'
import readline from 'readline'

// --- Network Configuration ---

interface SentioNetworkConfig {
  chainId: number
  rpcUrl: string
  explorerUrl: string
  // AddressBook proxy that resolves all contract names to addresses
  addressBookAddress: string
}

const TESTNET_CONFIG: SentioNetworkConfig = {
  chainId: 7892101,
  rpcUrl: 'https://sentio-testnet.rpc.sentio.xyz',
  explorerUrl: 'https://testnet-explorer.sentio.xyz',
  addressBookAddress: '0x94579F0e7873097279B48d7b15043698c522e47c'
}

const DEVNET_CONFIG: SentioNetworkConfig = {
  chainId: 7892201,
  rpcUrl: 'https://sentio-devnet.test-rpc.sentio.xyz',
  explorerUrl: 'https://devnet-explorer.sentio.xyz',
  addressBookAddress: '0xCfCE965429602b02b453477Cd8Bc7FEd5E8ffc14'
}

export function getSentioNetworkConfig(network: string): SentioNetworkConfig {
  if (network === 'testnet' || network === '7892101') {
    return TESTNET_CONFIG
  }
  if (network === 'devnet' || network === '7892201') {
    return DEVNET_CONFIG
  }
  if (network === 'mainnet' || network === '789210') {
    console.error(chalk.red('Sentio Network mainnet is not yet supported. Only testnet is available.'))
    process.exit(1)
  }
  console.error(chalk.red(`Invalid sentio network: ${network}. Only "testnet" or "devnet" is supported.`))
  process.exit(1)
}

// --- Contract ABIs ---

// AddressBook: resolves contract names to addresses
const ADDRESS_BOOK_ABI = [
  'function getAddress(string name) view returns (address)',
  'function getAddress(bytes32 id) view returns (address)'
]

// ProcessorRegistry: createProcessor (self + operator overloads), getProcessor, deleteProcessor
const PROCESSOR_REGISTRY_ABI = [
  `function createProcessor(
    string id,
    tuple(uint8 sourceType, string ipfsCid) source,
    tuple(string chainId, bool enableRpc, bool enableTrace)[] requireChains,
    string sdkVersion
  ) returns (string)`,
  `function createProcessor(
    address owner,
    string id,
    tuple(uint8 sourceType, string ipfsCid) source,
    tuple(string chainId, bool enableRpc, bool enableTrace)[] requireChains,
    string sdkVersion
  ) returns (string)`,
  'event ProcessorCreated(string indexed processorId)',
  `function getProcessor(string processorId) view returns (
    tuple(
      string id,
      bool active,
      uint256 createdAt,
      address owner,
      string sdkVersion,
      tuple(string chainId, bool enableRpc, bool enableTrace)[] requireChains,
      tuple(uint8 sourceType, string ipfsCid) source,
      tuple(uint256 indexerId, uint256 allocationTime, bool indexerReady, uint256 replicaIndex)[] allocations
    )
  )`,
  'function deleteProcessor(string processorId)'
]

// Controller: startProcessor / stopProcessor / getAllocations
const CONTROLLER_ABI = [
  'function startProcessor(string processorId)',
  'function stopProcessor(string processorId)',
  'function getAllocations(string processorId) view returns (tuple(uint256 indexerId, uint256 allocationTime, bool indexerReady, uint256 replicaIndex)[])'
]

// Databases:  getProcessorDatabases
const DATABASES_ABI = ['function getProcessorDatabases(string processorId) view returns (string[])']

// Permissions: isOperator (used to pre-check operator delegation before submitting tx)
const PERMISSIONS_ABI = ['function isOperator(address account, address operator) view returns (bool)']

// ERC20: balanceOf + approve
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]

// Billing: deposit / depositTo / withdraw + balanceOf
const BILLING_ABI = ['function balances(address account) view returns (uint256)']

// --- Address Resolution via AddressBook ---

// Known address book key names for the contracts we need
const ADDRESS_BOOK_KEYS = {
  processorRegistry: 'processor_registry',
  controller: 'controller',
  token: 'sentio_token',
  billing: 'billing',
  databases: 'databases',
  permissions: 'permissions'
} as const

interface ResolvedAddresses {
  addressBook: string
  processorRegistry: string
  controller: string
  token: string
  billing: string
  databases: string
  permissions: string
}

let cachedAddresses: ResolvedAddresses | undefined

export async function resolveNetworkAddresses(config: SentioNetworkConfig): Promise<ResolvedAddresses> {
  if (cachedAddresses) return cachedAddresses

  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const addressBookAddr = config.addressBookAddress

  console.log(chalk.gray(`AddressBook: ${addressBookAddr}`))

  const addressBook = new ethers.Contract(addressBookAddr, ADDRESS_BOOK_ABI, provider)

  const resolveAddress = async (name: string): Promise<string> => {
    try {
      // Try string-based lookup first
      return await addressBook['getAddress(string)'](name)
    } catch {
      try {
        // Fallback to bytes32-based lookup (keccak256 of name)
        const id = ethers.id(name)
        return await addressBook['getAddress(bytes32)'](id)
      } catch (e) {
        throw new Error(`Failed to resolve "${name}" from AddressBook (${addressBookAddr}): ${e.message}`)
      }
    }
  }

  const [processorRegistry, controller, token, billing, databases, permissions] = await Promise.all([
    resolveAddress(ADDRESS_BOOK_KEYS.processorRegistry),
    resolveAddress(ADDRESS_BOOK_KEYS.controller),
    resolveAddress(ADDRESS_BOOK_KEYS.token),
    resolveAddress(ADDRESS_BOOK_KEYS.billing),
    resolveAddress(ADDRESS_BOOK_KEYS.databases),
    resolveAddress(ADDRESS_BOOK_KEYS.permissions)
  ])

  console.log(chalk.gray(`ProcessorRegistry: ${processorRegistry}`))
  console.log(chalk.gray(`Controller:        ${controller}`))
  console.log(chalk.gray(`ST Token:          ${token}`))
  console.log(chalk.gray(`Billing:           ${billing}`))
  console.log(chalk.gray(`Databases:         ${databases}`))
  console.log(chalk.gray(`Permissions:       ${permissions}`))

  cachedAddresses = {
    addressBook: addressBookAddr,
    processorRegistry,
    controller,
    token,
    billing,
    databases,
    permissions
  }
  return cachedAddresses
}

// --- Wallet Utilities ---

export function getWalletFromPrivateKey(privateKey: string): ethers.Wallet {
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey
  }
  return new ethers.Wallet(privateKey)
}

export function requirePrivateKey(): string {
  const pk = process.env.PRIVATE_KEY
  if (!pk) {
    console.error(
      chalk.red('Error: $PRIVATE_KEY environment variable is required for Sentio Network direct transactions.')
    )
    console.error(chalk.red('Set it with: export PRIVATE_KEY=0x...'))
    process.exit(1)
  }
  return pk
}

export async function checkSTBalance(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  walletAddress: string
): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const token = new ethers.Contract(addresses.token, ERC20_ABI, provider)
  const balance: bigint = await token.balanceOf(walletAddress)
  return balance
}

export async function checkBillingBalance(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  walletAddress: string
): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const billing = new ethers.Contract(addresses.billing, BILLING_ABI, provider)
  try {
    const balance: bigint = await billing.balances(walletAddress)
    return balance
  } catch {
    // Billing contract may revert for accounts that have never deposited
    return 0n
  }
}

export async function isOperatorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  owner: string,
  operator: string
): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const permissions = new ethers.Contract(addresses.permissions, PERMISSIONS_ABI, provider)
  return await permissions.isOperator(owner, operator)
}

// --- IPFS Upload ---

export async function uploadToIPFS(fileBuffer: Buffer, ipfsUrl: string): Promise<string> {
  const formData = new FormData()
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' })
  formData.append('file', blob, 'lib.js')

  const response = await fetch(ipfsUrl, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`IPFS upload failed: ${response.status} ${response.statusText} - ${text}`)
  }

  const result = (await response.json()) as { Hash: string }
  return result.Hash
}

// --- Tx Helpers ---

async function submitAndWait(
  explorerUrl: string,
  label: string,
  txPromise: Promise<ethers.TransactionResponse>
): Promise<ethers.TransactionResponse> {
  let tx: ethers.TransactionResponse
  try {
    tx = await txPromise
  } catch (err: any) {
    throw new Error(`${label} failed to submit: ${err.shortMessage ?? err.message}`)
  }

  console.log(chalk.gray(`  Tx hash: ${explorerUrl}/tx/${tx.hash}`))
  console.log(chalk.blue('Waiting for confirmation...'))

  let receipt: ethers.TransactionReceipt | null
  try {
    receipt = await tx.wait()
  } catch (err: any) {
    throw new Error(`${label} failed: ${err.shortMessage ?? err.message}. Tx: ${explorerUrl}/tx/${tx.hash}`)
  }

  if (!receipt || receipt.status === 0) {
    throw new Error(`${label} transaction reverted. Tx: ${explorerUrl}/tx/${tx.hash}`)
  }

  return tx
}

// --- Contract Interactions ---

export interface OnChainProcessor {
  id: string
  active: boolean
  createdAt: bigint
  owner: string
  sdkVersion: string
}

/**
 * Fetch processor info from on-chain registry. Returns null if the processor does not exist.
 */
export async function getProcessorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  processorId: string
): Promise<OnChainProcessor | null> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const registry = new ethers.Contract(addresses.processorRegistry, PROCESSOR_REGISTRY_ABI, provider)

  try {
    const result = await registry.getProcessor(processorId)
    // result is a tuple: (id, active, createdAt, owner, sdkVersion, requireChains, source, allocations)
    const id: string = result[0]
    if (!id || id === '') {
      return null
    }
    return {
      id,
      active: result[1],
      createdAt: result[2],
      owner: result[3],
      sdkVersion: result[4]
    }
  } catch {
    // Contract reverts if processor doesn't exist
    return null
  }
}

export async function deleteProcessorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  wallet: ethers.Wallet,
  processorId: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const signer = wallet.connect(provider)

  const registry = new ethers.Contract(addresses.processorRegistry, PROCESSOR_REGISTRY_ABI, signer)

  console.log(chalk.blue('Deleting existing processor on-chain...'))
  const tx = await submitAndWait(config.explorerUrl, 'deleteProcessor', registry.deleteProcessor(processorId))
  console.log(chalk.green(`Processor deleted. Tx: ${config.explorerUrl}/tx/${tx.hash}`))
  await waitForProcessorDatabaseCleanup(addresses, processorId, provider)

  return tx.hash
}

async function waitForProcessorDatabaseCleanup(
  addresses: ResolvedAddresses,
  processorId: string,
  provider: ethers.JsonRpcProvider,
  timeoutMs = 120_000,
  pollIntervalMs = 5_000
): Promise<void> {
  const databases = new ethers.Contract(addresses.databases, DATABASES_ABI, provider)

  // getProcessorDatabases has no active check — returns all db IDs still in storage.
  // Only when this returns empty is it safe to recreate databases with the same IDs.
  const dbIds: string[] = await databases.getProcessorDatabases(processorId)
  if (dbIds.length === 0) {
    return
  }

  console.log(chalk.blue(`Waiting for ${dbIds.length} replica database(s) to be cleaned up...`))

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))

    const remaining: string[] = await databases.getProcessorDatabases(processorId)
    if (remaining.length === 0) {
      console.log(chalk.green('All replica databases cleaned up.'))
      return
    }

    console.log(chalk.gray(`  ${remaining.length} replica database(s) still pending cleanup...`))
  }

  throw new Error(`Timeout: processor databases not cleaned up within ${timeoutMs / 1000}s`)
}

export async function createProcessorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  wallet: ethers.Wallet,
  processorId: string,
  ipfsCid: string,
  requiredChainIds: string[],
  sdkVersion: string,
  ownerOverride?: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const signer = wallet.connect(provider)

  const registry = new ethers.Contract(addresses.processorRegistry, PROCESSOR_REGISTRY_ABI, signer)

  const source = {
    sourceType: 0, // IPFS
    ipfsCid
  }

  const requireChains = requiredChainIds.map((chainId) => ({
    chainId,
    enableRpc: true,
    enableTrace: false
  }))

  console.log(chalk.blue('Creating processor on-chain...'))
  console.log(chalk.gray(`  Processor ID: ${processorId}`))
  console.log(chalk.gray(`  IPFS CID:     ${ipfsCid}`))
  console.log(chalk.gray(`  Chains:        ${requiredChainIds.join(', ')}`))
  console.log(chalk.gray(`  SDK Version:   ${sdkVersion}`))
  if (ownerOverride) {
    console.log(chalk.gray(`  Owner:         ${ownerOverride} (operator: ${wallet.address})`))
  }

  // ethers v6 disambiguates overloads by full signature when both are present.
  const txPromise: Promise<ethers.TransactionResponse> = ownerOverride
    ? registry['createProcessor(address,string,(uint8,string),(string,bool,bool)[],string)'](
        ownerOverride,
        processorId,
        source,
        requireChains,
        sdkVersion
      )
    : registry['createProcessor(string,(uint8,string),(string,bool,bool)[],string)'](
        processorId,
        source,
        requireChains,
        sdkVersion
      )
  const tx = await submitAndWait(config.explorerUrl, 'createProcessor', txPromise)
  console.log(chalk.green(`Processor created. Tx: ${config.explorerUrl}/tx/${tx.hash}`))
  return tx.hash
}

export async function startProcessorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  wallet: ethers.Wallet,
  processorId: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const signer = wallet.connect(provider)

  const controller = new ethers.Contract(addresses.controller, CONTROLLER_ABI, signer)

  console.log(chalk.blue('Starting processor on-chain...'))
  const tx = await submitAndWait(config.explorerUrl, 'startProcessor', controller.startProcessor(processorId))
  console.log(chalk.green(`Processor started. Tx: ${config.explorerUrl}/tx/${tx.hash}`))
  return tx.hash
}

export async function stopProcessorOnChain(
  config: SentioNetworkConfig,
  addresses: ResolvedAddresses,
  wallet: ethers.Wallet,
  processorId: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const signer = wallet.connect(provider)

  const controller = new ethers.Contract(addresses.controller, CONTROLLER_ABI, signer)

  // stopProcessor reverts with ProcessorNotAllocated if the processor has no active allocations
  const allocations: unknown[] = await controller.getAllocations(processorId)
  if (allocations.length === 0) {
    console.log(chalk.gray('Processor has no allocations, skipping stopProcessor.'))
    return ''
  }

  console.log(chalk.blue('Stopping processor on-chain...'))
  const tx = await submitAndWait(config.explorerUrl, 'stopProcessor', controller.stopProcessor(processorId))
  console.log(chalk.green(`Processor stopped. Tx: ${config.explorerUrl}/tx/${tx.hash}`))
  return tx.hash
}

// --- Confirmation Prompt ---

export async function confirmNoPlatformUpload(
  walletAddress: string,
  stBalance: bigint,
  billingBalance: bigint,
  addresses: ResolvedAddresses,
  networkConfig: SentioNetworkConfig,
  ownerOverride?: string
): Promise<boolean> {
  const formattedST = ethers.formatEther(stBalance)
  const formattedBilling = ethers.formatEther(billingBalance)
  console.log()
  console.log(chalk.blue('=== Sentio Network Direct Upload (No Platform) ==='))
  if (ownerOverride) {
    console.log(chalk.white(`  Owner:           ${ownerOverride}`))
    console.log(chalk.white(`  Operator:        ${walletAddress}`))
  } else {
    console.log(chalk.white(`  Address:         ${walletAddress}`))
  }
  console.log(chalk.white(`  ST Balance:      ${formattedST} ST`))
  console.log(chalk.white(`  Billing Balance: ${formattedBilling} ST`))

  if (billingBalance === 0n) {
    const who = ownerOverride ? `the owner (${ownerOverride})` : 'you'
    const keyHint = ownerOverride ? "<owner's private key>" : '$PRIVATE_KEY'
    console.log()
    console.log(
      chalk.yellow(
        `  ⚠ ${ownerOverride ? "Owner's" : 'Your'} Billing balance is 0. Indexing fees are charged from the Billing contract.\n` +
          `    ${who} must deposit ST tokens into the Billing contract before the processor can run.\n` +
          `    Example (replace 100 with your desired ST amount):\n` +
          `    export AMOUNT=$(cast to-wei 100 ether)\n` +
          `    cast send ${addresses.token} "approve(address,uint256)" ${addresses.billing} $AMOUNT --rpc-url ${networkConfig.rpcUrl} --private-key ${keyHint}\n` +
          `    cast send ${addresses.billing} "deposit(uint256)" $AMOUNT --rpc-url ${networkConfig.rpcUrl} --private-key ${keyHint}`
      )
    )
  }
  console.log()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer: string = await new Promise((resolve) => rl.question('Continue with upload? (yes/no) ', resolve))
  rl.close()
  return ['y', 'yes'].includes(answer.toLowerCase())
}
