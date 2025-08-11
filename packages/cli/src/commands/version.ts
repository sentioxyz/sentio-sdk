import { Command } from 'commander'
import { getCliVersion, getSdkVersion } from '../utils.js'

export function createVersionCommand() {
  return new Command('version').description('Show current version').action(() => {
    version()
  })
}

function version() {
  console.log('CLI Version: ', getCliVersion())
  const sdkVersion = getSdkVersion()
  if (sdkVersion) {
    console.log('SDK Version: ', sdkVersion)
  } else {
    console.log('SDK Not installed for this project')
  }
}
