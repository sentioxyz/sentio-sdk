import fs from 'fs-extra'
import path from 'path'
import { createRequire } from 'module'
import url from 'url'

const require = createRequire(import.meta.url)
const PACKAGE_JSON = 'package.json'

export function getPackageRoot(pkgId: string): string {
  const m = require.resolve(pkgId)

  let dir = path.dirname(m)
  while (!fs.existsSync(path.join(dir, PACKAGE_JSON))) {
    dir = path.dirname(dir)
  }
  return dir
}

export function getCliVersion() {
  const packageJsonPath = url.fileURLToPath(new URL('../' + PACKAGE_JSON, import.meta.url))
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageJsonContent)

  return packageJson.version
}

export function getSdkVersion() {
  try {
    const packageJsonPath = getPackageRoot('@sentio/sdk')
    const packageJsonContent = fs.readFileSync(path.join(packageJsonPath, PACKAGE_JSON), 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)
    return packageJson.version
  } catch (e) {
    return undefined
  }
}
