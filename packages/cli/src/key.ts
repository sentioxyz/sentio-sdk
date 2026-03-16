import path from 'path'
import fs from 'fs'
import os from 'os'

const homeDir = os.homedir()
const sentioDir = path.join(homeDir, '.sentio')
const configFile = path.join(sentioDir, 'config.json')

interface SentioHostConfig {
  api_keys: string
  access_token?: string
  access_token_expires_at?: number // unix epoch seconds
}

interface SentioKeyConfig {
  [host: string]: SentioHostConfig
}

function readConfig(): SentioKeyConfig {
  if (!fs.existsSync(sentioDir) || !fs.existsSync(configFile)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8')) as SentioKeyConfig
  } catch {
    return {}
  }
}

function writeConfig(config: SentioKeyConfig) {
  if (!fs.existsSync(sentioDir)) {
    fs.mkdirSync(sentioDir, { recursive: true })
  }
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
}

export function WriteKey(host: string, api_key: string) {
  const config = readConfig()
  config[host] = { ...config[host], api_keys: api_key }
  writeConfig(config)
}

export function ReadKey(host: string): string | undefined {
  return readConfig()[host]?.api_keys
}

export function WriteAccessToken(host: string, token: string, expiresAt: number) {
  const config = readConfig()
  config[host] = { ...config[host], access_token: token, access_token_expires_at: expiresAt }
  writeConfig(config)
}

export function ReadAccessToken(host: string): { token: string; expiresAt: number } | undefined {
  const hostConfig = readConfig()[host]
  if (!hostConfig?.access_token || hostConfig.access_token_expires_at === undefined) {
    return undefined
  }
  return { token: hostConfig.access_token, expiresAt: hostConfig.access_token_expires_at }
}

export function isAccessTokenExpired(expiresAt: number): boolean {
  // treat as expired 60 seconds early to avoid edge cases
  return Date.now() / 1000 >= expiresAt - 60
}
