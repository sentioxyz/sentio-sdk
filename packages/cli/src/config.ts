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

export function getAuthConfig(host: string): { domain: string; clientId: string; audience: string, redirectUri: string } {
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
