import fs from 'fs-extra'
import path from 'path'

export function getCliVersion() {
  const packageJsonPath = path.resolve(__dirname, '../package.json')
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageJsonContent)

  return packageJson.version
}

export function getSdkVersion() {
  try {
    const packageJsonPath = require.resolve('@sentio/sdk/package.json')
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)
    return packageJson.version
  } catch (e) {
    return undefined
  }
}
