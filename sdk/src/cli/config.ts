const HostMap: { [host: string]: string } = {
  local: 'http://localhost:10000',
  test: 'https://test.sentio.xyz',
  staging: 'https://staging.sentio.xyz',
  prod: 'https://app.sentio.xyz',
}

export interface SentioProjectConfig {
  project: string
  host: string
  // source: string
  build: boolean
  // targets: Target[]
  debug: boolean
}

export function getFinalizedHost(host: string): string {
  if (host === undefined || host === '') {
    host = 'prod'
  }
  return HostMap[host] ?? host
}

export function getAuthConfig(host: string): { domain: string; clientId: string; audience: string } {
  let domain = '',
    clientId = '',
    audience = ''
  switch (host) {
    case HostMap['local']:
      domain = 'https://sentio-dev.us.auth0.com'
      clientId = 'qGDisObqQbcPeRA8k02POPZ2Df4KVCna'
      audience = 'http://localhost:8080/v1'
      break
    case HostMap['prod']:
      domain = 'https://auth.sentio.xyz'
      clientId = 'xd80PeuvuZVHpBFh7yEdlSZdtE5mTpGe'
      audience = 'https://app.sentio.xyz/api/v1'
      break
    case HostMap['test']:
    case HostMap['staging']:
      domain = 'https://auth.test.sentio.xyz'
      clientId = 'qXVvovHaOE37SndxTZJxCKgZjw1axPax'
      audience = 'https://test.sentio.xyz/api/v1'
      break
    default:
      break
  }
  return { domain, clientId, audience }
}

export function finalizeHost(config: SentioProjectConfig) {
  config.host = getFinalizedHost(config.host)
}

export function FinalizeProjectName(config: SentioProjectConfig, owner: string | undefined) {
  if (owner) {
    let name = config.project
    if (name.includes('/')) {
      name = config.project.split('/')[1]
    }
    config.project = [owner, name].join('/')
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
