import { getCliVersion, getSdkVersion } from '../utils.js'

export function runVersion(argv: string[]) {
  console.log('CLI Version: ', getCliVersion())
  const sdkVersion = getSdkVersion()
  if (sdkVersion) {
    console.log('SDK Version: ', sdkVersion)
  } else {
    console.log('SDK Not installed for this project')
  }
}
