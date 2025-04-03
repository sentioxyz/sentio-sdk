import fs from 'fs-extra'
import path from 'path'
import { createRequire } from 'module'
import url from 'url'
import { CommandLineOptions } from 'command-line-args'
import chalk from 'chalk'
import latestVersion from 'latest-version'

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

export function errorOnUnknownOption(options: CommandLineOptions) {
  if (options._unknown?.length) {
    console.error(chalk.red('Unknown option:', options._unknown.join(' ')))
    process.exit(1)
  }
}

export async function printVersions() {
  const cliVersion = JSON.parse(
    fs.readFileSync(path.join(getPackageRoot('@sentio/cli'), 'package.json'), 'utf8')
  ).version
  if (cliVersion.endsWith('-development')) {
    return
  }
  try {
    const [latestCliVersion, latestSdkVersion] = await Promise.all([
      latestVersion('@sentio/cli'),
      latestVersion('@sentio/sdk')
    ])
    console.log(`Using @sentio/cli ${cliVersion}, latest version is ${latestCliVersion}`)
    const sdkVersion = JSON.parse(
      fs.readFileSync(path.join(getPackageRoot('@sentio/sdk'), 'package.json'), 'utf8')
    ).version
    console.log(`Using @sentio/sdk ${sdkVersion}, latest version is ${latestSdkVersion}`)
  } catch (e) {}
}
