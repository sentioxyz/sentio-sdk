import { ChainId, EthChainId } from '@sentio/chain'
import fs from 'fs-extra'
import yaml from 'yaml'

const HostMap: { [host: string]: string } = {
  local: 'http://localhost:10000',
  test: 'https://test.sentio.xyz',
  staging: 'https://staging.sentio.xyz',
  prod: 'https://app.sentio.xyz'
}

export const CHAIN_TYPES = ['eth', 'solana', 'aptos', 'sui', 'iota', 'fuel', 'starknet']

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
}

export interface Variable {
  key: string
  value: string
  isSecret: boolean
}

export function getFinalizedHost(host: string): string {
  if (host === undefined || host === '') {
    host = 'prod'
  }
  return HostMap[host] ?? host
}

export function getAuthConfig(host: string): {
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
  return { domain, clientId, audience, redirectUri }
}

export function overrideConfigWithOptions(config: YamlProjectConfig, options: any) {
  finalizeProjectName(config, options.owner, options.name)
  finalizeHost(config, options.host)

  if (options.debug) {
    config.debug = true
  }
  if (options.silentOverwrite) {
    config.silentOverwrite = true
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

export function loadProcessorConfig(): YamlProjectConfig {
  let yamlContent
  try {
    yamlContent = fs.readFileSync('sentio.yaml', 'utf8')
  } catch (e) {
    console.error('sentio.yaml loading error, CLI is not running under Sentio project')
    process.exit(1)
  }
  return yaml.parse(yamlContent) as YamlProjectConfig
}
