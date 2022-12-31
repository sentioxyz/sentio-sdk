import path from 'path'
import fs from 'fs'
import os from 'os'

const homeDir = os.homedir()
const sentioDir = path.join(homeDir, '.sentio')
const configFile = path.join(sentioDir, 'config.json')

interface SentioKeyConfig {
  [key: string]: {
    api_keys: string
  }
}

export function WriteKey(host: string, api_key: string) {
  const sentioDir = path.join(homeDir, '.sentio')
  if (!fs.existsSync(sentioDir)) {
    fs.mkdirSync(sentioDir, { recursive: true })
  }
  let config: SentioKeyConfig = {}
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8')
    config = JSON.parse(content)
  }
  const hostConfig = config[host] || { api_keys: {} }
  hostConfig.api_keys = api_key
  config[host] = hostConfig
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
}

export function ReadKey(host: string): string | undefined {
  if (!fs.existsSync(sentioDir)) {
    return undefined
  }
  const configFile = path.join(sentioDir, 'config.json')
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8')
    const config = JSON.parse(content)
    return config[host]?.api_keys
  } else {
    return undefined
  }
}
