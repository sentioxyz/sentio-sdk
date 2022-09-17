export interface SentioProjectConfig {
  project: string
  host: string
  source: string
  build: boolean
  targets: Target[]
}

export function getFinalizedHost(host: string): string {
  switch (host) {
    case '':
    case 'prod':
      return 'https://app.sentio.xyz'
    case 'test':
      return 'https://test.sentio.xyz'
    case 'staging':
      return 'https://staging.sentio.xyz'
    case 'local':
      return 'http://localhost:10000'
  }
  return host
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

export interface Target {
  chain: string
  abisDir?: string
}

// Supported target chain, lower case
export const EVM = 'evm'
export const SOLANA = 'solana'
