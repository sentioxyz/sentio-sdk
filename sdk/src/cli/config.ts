export interface SentioProjectConfig {
  project: string
  host: string
  source: string
  build: boolean
  targets: Target[]
}

export function FinalizeHost(config: SentioProjectConfig) {
  switch (config.host) {
    case '':
    case 'prod':
      config.host = 'https://app.sentio.xyz'
      break
    case 'test':
      config.host = 'https://test.sentio.xyz'
      break
    case 'staging':
      config.host = 'https://staging.sentio.xyz'
      break
    case 'local':
      config.host = 'http://localhost:10000'
  }
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
