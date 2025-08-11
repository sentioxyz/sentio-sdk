import { Command } from 'commander'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import latestVersion from 'latest-version'
import process from 'process'
import { execPackageManager } from '../execution.js'
import { getPackageRoot } from '../utils.js'
import { EthChainInfo } from '@sentio/chain'

export const supportedChainMessage = [
  ',  <Chain ID> (<Chain Name>)',
  '  --------------------',
  ...Object.values(EthChainInfo).map((info) => `  ${info.chainId} (${info.name})`)
]

export function createCreateCommand() {
  return new Command('create')
    .description('Create a new Sentio project')
    .argument('<name>', 'Project name')
    .option(
      '-p, --subproject',
      'If this is a subproject in mono-repo setup, in this case sdk version is controlled in parent package.json.'
    )
    .option('-s, --sdk-version <version>', '(Optional) The version of @sentio/sdk to use, default latest')
    .option(
      '-d, --directory <dir>',
      '(Optional) The root direct new project will be created, default current working dir'
    )
    .option(
      '-c, --chain-type <type>',
      'The type of project you want to create, can be eth, aptos, fuel, solana, sui, iota, starknet, raw',
      'eth'
    )
    .option(
      '--chain-id <id>',
      '(Optional) The chain id to use for eth. Supported: ' + supportedChainMessage.join('\n,'),
      '1'
    )
    .action(async (name, options) => {
      await runCreateInternal(name, options)
    })
}

async function runCreateInternal(name: string, options: any) {
  if (!name) {
    console.error('Project name is required')
    process.exit(1)
  }

  const chainType: string = options.chainType.toLowerCase()
  const chainId: string = options.chainId
  switch (chainType) {
    case 'eth':
    case 'aptos':
    case 'raw':
    case 'solana':
    case 'iota':
    case 'sui':
    case 'fuel':
    case 'starknet':
      break
    default:
      console.error(chalk.red('non supported chain-type for template creation, use --help for more information.'))
      process.exit(1)
  }

  const packageRoot = getPackageRoot('@sentio/cli')
  const templateFolder = path.join(packageRoot, 'templates', chainType)
  const projectFullName = name || 'default'
  let projectSlug = projectFullName
  const projectParts = projectSlug.split('/')
  if (projectParts.length > 1) {
    projectSlug = projectParts[1]
  }

  const rootDir = options.directory || process.cwd()
  const dstFolder = path.resolve(rootDir, projectSlug)
  if (fs.existsSync(dstFolder)) {
    console.error(chalk.red("can't create project '" + projectSlug + "', directory already existed"))
    process.exit(1)
  }

  fs.copySync(templateFolder, dstFolder, {
    filter: (src, _) => {
      if (
        src.endsWith('types') ||
        src.endsWith('dist') ||
        src.endsWith('node_modules') ||
        src.endsWith('.lock') ||
        src.endsWith('dist')
      ) {
        return false
      }
      return true
    },
    overwrite: false
  })
  const gitignoreFile = path.join(dstFolder, 'gitignore')
  if (fs.existsSync(gitignoreFile)) {
    fs.renameSync(gitignoreFile, path.join(dstFolder, '.gitignore'))
  }
  if (name) {
    const sentioYamlPath = path.resolve(dstFolder, 'sentio.yaml')
    fs.writeFileSync(sentioYamlPath, 'project: ' + projectFullName + '\n', { flag: 'w+' })

    const packageJsonPath = path.resolve(dstFolder, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    let sdkVersion = options.sdkVersion

    if (!sdkVersion) {
      sdkVersion = '^' + (await latestVersion('@sentio/sdk'))
    }
    packageJson.dependencies['@sentio/sdk'] = sdkVersion

    const cliVersion = '^' + JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version
    packageJson.devDependencies['@sentio/cli'] = cliVersion
    packageJson.name = projectSlug

    if (options.subproject) {
      delete packageJson.dependencies
      delete packageJson.devDependencies
    }

    packageJson.scripts.postinstall = 'sentio gen'

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }
  const chainInfo = EthChainInfo[chainId]
  if (chainType == 'eth') {
    fs.readdirSync(dstFolder, { recursive: true }).forEach((p) => {
      if (typeof p != 'string' || !p.endsWith('.ts')) {
        return
      }
      const item = path.join(dstFolder, p)
      const template = fs.readFileSync(item, 'utf8')
      const content = template.replaceAll('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chainInfo.wrappedTokenAddress)
      fs.writeFileSync(item, content)
    })
  }
  console.log(chalk.green("successfully create project '" + projectFullName + "'"))
  if (!options.subproject) {
    console.log(chalk.green('running install for initialization'))

    await execPackageManager(['install'], 'install', { cwd: dstFolder })
  }
}
