import fs from 'fs-extra'
import path from 'path'
import { createRequire } from 'module'
import url from 'url'
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

export function errorOnUnknownOption(options: any) {
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
    console.log('Using development versions\n')
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
    console.log(`Using @sentio/sdk ${sdkVersion}, latest version is ${latestSdkVersion}\n`)
  } catch (e) {}
}

function majorVersion(version: string): number | undefined {
  const major = Number.parseInt(version.split('.')[0], 10)
  return Number.isNaN(major) ? undefined : major
}

/**
 * Whether the installed @sentio/sdk is compatible with the given @sentio/cli.
 * @sentio/cli, @sentio/sdk and @sentio/runtime are released in lockstep, so they
 * are only compatible when their major versions match — the CLI drives the SDK's
 * build tooling (it runs the SDK's `dist/tsdown.config.js`), which changes across
 * majors. Development builds and unparseable versions are treated as compatible so
 * the local workspace and test flows are never blocked.
 */
export function isSdkVersionCompatible(cliVersion: string, sdkVersion: string): boolean {
  if (cliVersion.endsWith('-development') || sdkVersion.endsWith('-development')) {
    return true
  }
  const cliMajor = majorVersion(cliVersion)
  const sdkMajor = majorVersion(sdkVersion)
  if (cliMajor === undefined || sdkMajor === undefined) {
    return true
  }
  return sdkMajor === cliMajor
}

/**
 * Fail fast with a clear message when the installed @sentio/sdk is too old for this
 * CLI, instead of letting the build crash later with a cryptic packaging error.
 */
export function checkSdkCompatibility() {
  const cliVersion = getCliVersion()
  const sdkVersion = getSdkVersion()
  // SDK is not installed (e.g. `sentio create` in a fresh dir): nothing to validate.
  if (!sdkVersion) {
    return
  }
  if (!isSdkVersionCompatible(cliVersion, sdkVersion)) {
    const cliMajor = majorVersion(cliVersion)
    const sdkMajor = majorVersion(sdkVersion)
    console.error(
      chalk.red(
        `Version mismatch: @sentio/cli ${cliVersion} (v${cliMajor}) and @sentio/sdk ${sdkVersion} (v${sdkMajor}) ` +
          `must share the same major version.\n` +
          `Please align them, e.g. install @sentio/sdk@^${cliMajor} (or switch to @sentio/cli@^${sdkMajor} to match the installed SDK).`
      )
    )
    process.exit(1)
  }
}

export function getApiUrl(apiPath: string, host: string) {
  let apiHost = host
  if (host.includes('sentio.xyz')) {
    apiHost = host.replace('test', 'api-test').replace('staging', 'api-staging').replace('app', 'api')
    if (apiPath.startsWith('/api/')) {
      apiPath = apiPath.slice(4)
    }
  }
  return new URL(apiPath, apiHost)
}
