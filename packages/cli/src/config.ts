import { ChainId, EthChainId } from '@sentio/chain'
import fs from 'fs-extra'
import yaml from 'yaml'
import path from 'path'

const HostMap: { [host: string]: string } = {
  local: 'http://localhost:10000',
  test: 'https://test.sentio.xyz',
  staging: 'https://staging.sentio.xyz',
  prod: 'https://app.sentio.xyz'
}

export const CHAIN_TYPES = ['eth', 'solana', 'aptos', 'sui', 'iota', 'fuel']

export interface YamlContractConfig {
  address: string
  chain: ChainId
  name: string
  folder?: string
}

export interface YamlNetworkOverride {
  chain: EthChainId
  host: string
}

export interface YamlProjectConfig {
  project: string
  host: string
  contracts?: YamlContractConfig[]
  networkOverrides?: YamlNetworkOverride[]
  debug: boolean
  type?: string
  silentOverwrite?: boolean
  variables?: Variable[]
  numWorkers?: number // Number of processor worker to start, default to 1
  sentioNetwork?: string // Sentio network to connect to, can be testnet, devnet or mainnet
  requiredChainIds?: string[]
}

export interface Variable {
  key: string
  value: string
  isSecret: boolean
}

export function getFinalizedHost(host: string | undefined): string {
  if (host === undefined || host === '') {
    host = 'prod'
  }
  return HostMap[host] ?? host
}

export interface AuthConfig {
  clientId: string
  audience: string
  redirectUri: string
  authorizationEndpoint: string
  tokenEndpoint: string
  resourceParameter: 'audience' | 'resource'
  scope: string
}

export async function getAuthConfig(host: string): Promise<AuthConfig> {
  const origin = new URL(host).origin
  const response = await fetch(new URL('/api/cli/auth', origin), {
    redirect: 'error',
    signal: AbortSignal.timeout(10_000)
  })
  // Keep installations whose server has not deployed discovery on their existing
  // login flow. Outages or invalid config must never select a different issuer.
  if (response.status === 404) {
    const { domain, clientId, audience, redirectUri } = getLegacyAuthConfig(host)
    return {
      clientId,
      audience,
      redirectUri,
      authorizationEndpoint: domain + '/authorize',
      tokenEndpoint: domain + '/oauth/token',
      resourceParameter: 'audience',
      scope: 'openid profile email'
    }
  }
  if (!response.ok) throw new Error(`Unable to load login configuration (${response.status}). Try again later.`)
  return validateAuthConfig(await response.json(), origin)
}

export function validateAuthConfig(value: unknown, origin: string): AuthConfig {
  const config = value as AuthConfig
  if (
    !config ||
    (['clientId', 'audience', 'redirectUri', 'authorizationEndpoint', 'tokenEndpoint', 'scope'] as const).some(
      (key) => typeof config[key] !== 'string' || !config[key]
    ) ||
    !['audience', 'resource'].includes(config.resourceParameter)
  )
    throw new Error('Invalid login configuration')
  for (const field of ['authorizationEndpoint', 'tokenEndpoint', 'redirectUri'] as const) {
    const url = new URL(config[field])
    if (
      url.username ||
      url.password ||
      url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
    ) {
      throw new Error('Login configuration requires secure URLs')
    }
  }
  if (new URL(config.redirectUri).origin !== origin) throw new Error('Invalid login callback origin')
  return config
}

function getLegacyAuthConfig(host: string): {
  domain: string
  clientId: string
  audience: string
  redirectUri: string
} {
  let domain = '',
    clientId = '',
    audience = '',
    redirectUri = ''
  switch (host) {
    case HostMap['local']:
      domain = 'https://sentio-dev.us.auth0.com'
      clientId = 'JREam3EysMTM49eFbAjNK02OCykpmda3'
      audience = 'http://localhost:8080/v1'
      redirectUri = 'http://localhost:10000/redirect/sdk'
      break
    case HostMap['prod']:
      domain = 'https://auth.sentio.xyz'
      clientId = '66oqMrep54LVI9ckH97cw8C4GBA1cpKW'
      audience = 'https://app.sentio.xyz/api/v1'
      redirectUri = 'https://app.sentio.xyz/redirect/sdk'
      break
    case HostMap['test']:
    case HostMap['staging']:
      domain = 'https://auth.test.sentio.xyz'
      clientId = '6SH2S1qJ2yYqyYGCQOcEnGsYgoyONTxM'
      audience = 'https://test.sentio.xyz/api/v1'
      redirectUri = 'https://test.sentio.xyz/redirect/sdk'
      break
    default:
      break
  }
  if (!domain) throw new Error('No login configuration for this host. Use --api-key instead.')
  return { domain, clientId, audience, redirectUri }
}

export function overrideConfigWithOptions(config: YamlProjectConfig, options: any) {
  // In `--no-platform` (Sentio Network) mode, `--owner` is a 0x-prefixed
  // Ethereum address identifying the on-chain processor owner — completely
  // orthogonal to the platform's "<username>/<slug>" project namespace.
  // Don't let it rewrite `config.project`, since that field is the source
  // of the on-chain processor id and a 42-char address would always
  // overflow `ProcessorRegistry.MAX_PROCESSOR_ID_LENGTH` (32).
  const projectOwner = options.platform === false ? undefined : options.owner
  finalizeProjectName(config, projectOwner, options.name)
  finalizeHost(config, options.host)

  if (options.debug) {
    config.debug = true
  }
  if (options.silentOverwrite) {
    config.silentOverwrite = true
  }
  if (options.numWorkers !== undefined) {
    config.numWorkers = options.numWorkers
  }
  if (options.sentioNetwork) {
    switch (options.sentioNetwork) {
      case 'mainnet':
        config.sentioNetwork = '789210'
        break
      case 'testnet':
      case 'testnet-v2':
        config.sentioNetwork = '7892102'
        break
      case 'devnet':
        config.sentioNetwork = '7892301'
        break
      case '7892102':
      case '7892301':
      case '789210':
        config.sentioNetwork = options.sentioNetwork
        break
      default:
        console.error(`Invalid sentio network: ${options.sentioNetwork}, only mainnet, testnet or devnet is allowed`)
        process.exit(1)
    }
  }
}

function finalizeHost(config: YamlProjectConfig, host?: string) {
  config.host = getFinalizedHost(host || config.host)
}

function finalizeProjectName(config: YamlProjectConfig, owner: string | undefined, slug: string | undefined) {
  if (owner || slug) {
    let name = config.project
    if (name.includes('/')) {
      owner = owner || config.project.split('/')[0]
      name = config.project.split('/')[1]
    }
    if (slug) {
      if (slug.includes('/')) {
        owner = slug.split('/')[0]
        name = slug.split('/')[1]
      } else {
        name = slug
      }
    }
    config.project = owner ? [owner, name].join('/') : name
  }
}

// export interface Target {
//   chain: string
//   abisDir?: string
// }
//
// // Supported target chain, lower case
// export const EVM = 'evm'
// export const SOLANA = 'solana'

export function loadProcessorConfig(p = ''): YamlProjectConfig {
  let yamlContent
  try {
    yamlContent = fs.readFileSync(path.join(p, `sentio.yaml`), 'utf8')
  } catch (e) {
    console.error('sentio.yaml loading error, CLI is not running under Sentio project')
    process.exit(1)
  }
  return yaml.parse(yamlContent) as YamlProjectConfig
}
