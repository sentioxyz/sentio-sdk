import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import latestVersion from 'latest-version'
import process from 'process'
import { execPackageManager } from '../execution.js'
import { errorOnUnknownOption, getPackageRoot } from '../utils.js'
import { EthChainInfo } from '@sentio/chain'

export const supportedChainMessage = [
  ',  <Chain ID> (<Chain Name>)',
  '  --------------------',
  ...Object.values(EthChainInfo).map((info) => `  ${info.chainId} (${info.name})`)
]

export async function runCreate(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.'
    },
    {
      name: 'name',
      alias: 'n',
      defaultOption: true,
      type: String,
      description: 'Project name'
    },
    {
      name: 'subproject',
      alias: 'p',
      type: Boolean,
      description:
        'If this is a subproject in mono-repo setup, in this case sdk version is controlled in parent package.json.'
    },
    {
      name: 'sdk-version',
      alias: 's',
      type: String,
      description: '(Optional) The version of @sentio/sdk to use, default latest'
    },
    {
      name: 'directory',
      alias: 'd',
      description: '(Optional) The root direct new project will be created, default current working dir',
      type: String
    },
    {
      name: 'chain-type',
      alias: 'c',
      description:
        'The type of project you want to create, can be \n,  eth \n,  aptos \n,  fuel\n,  solana\n,  sui\n,  iota\n,  starknet\n,  raw (if you want to start from scratch and support multiple types of chains)',
      type: String,
      defaultValue: 'eth'
    },
    {
      name: 'chain-id',
      type: String,
      description: '(Optional) The chain id to use for eth. Supported: ' + supportedChainMessage.join('\n,'),
      defaultValue: '1'
    }
  ]

  const options = commandLineArgs(optionDefinitions, { argv, partial: true })
  const usage = commandLineUsage([
    {
      header: 'Create a template project',
      content: 'sentio create <name>'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    }
  ])

  if (options.help || !options.name) {
    console.log(usage)
    process.exit(0)
  }

  errorOnUnknownOption(options)

  const chainType: string = options['chain-type'].toLowerCase()
  const chainId: string = options['chain-id']
  switch (chainType) {
    case 'eth':
      break
    case 'aptos':
      break
    case 'raw':
      break
    case 'solana':
      break
    case 'iota':
      break
    case 'sui':
      break
    case 'fuel':
      break
    case 'starknet':
      break
    default:
      console.error(chalk.red('non supported chain-type for template creation, use --help for more information.'))
      console.log(usage)
      process.exit(1)
  }

  const packageRoot = getPackageRoot('@sentio/cli')
  const templateFolder = path.join(packageRoot, 'templates', chainType)
  const projectFullName = options.name || 'default'
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
      // TODO read from .gitignore to be more reliable
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
  if (options.name) {
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

    // Don't add directly to avoid deps issue
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
