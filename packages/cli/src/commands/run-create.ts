import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { getCliVersion } from '../utils'
import latestVersion from 'latest-version'

export async function runCreate(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'name',
      alias: 'n',
      defaultOption: true,
      type: String,
      description: 'Project name',
    },
    {
      name: 'directory',
      alias: 'd',
      description: '(Optional) The root direct new project will be created, default current working dir',
      type: String,
    },
    {
      name: 'chain-type',
      alias: 'c',
      description:
        'The type of project you want to create, can be evm, aptos, solana, raw (if you want to start from scratch and support multiple types of chains)',
      type: String,
      defaultValue: 'evm',
    },
  ]

  const options = commandLineArgs(optionDefinitions, { argv })
  const usage = commandLineUsage([
    {
      header: 'Create a template project',
      content: 'sentio create <name>',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
  ])

  if (options.help || !options.name) {
    console.log(usage)
  } else {
    const chainType: string = options['chain-type'].toLowerCase()
    switch (chainType) {
      case 'evm':
        break
      case 'aptos':
        break
      case 'raw':
        break
      case 'solana':
        break
      default:
        console.error(chalk.red('non supported chain-type for template creation, use --help for more information.'))
        console.log(usage)
        process.exit(1)
    }
    const templateFolder = path.resolve(__dirname, '../../templates', chainType)
    const projectName = options.name || 'default'

    const rootDir = options.directory || process.cwd()
    const dstFolder = path.resolve(rootDir, projectName)
    if (fs.existsSync(dstFolder)) {
      console.error(chalk.red("can't create project '" + projectName + "', directory already existed"))
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
      overwrite: false,
    })
    if (options.name) {
      const sentioYamlPath = path.resolve(dstFolder, 'sentio.yaml')
      fs.writeFileSync(sentioYamlPath, 'project: ' + projectName + '\n', { flag: 'w+' })

      const packageJsonPath = path.resolve(dstFolder, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      let cliVersion = getCliVersion()
      if (!cliVersion.startsWith('^')) {
        cliVersion = '^' + cliVersion
      }

      const sdkVersion = '^' + (await latestVersion('@sentio/sdk'))
      packageJson.dependencies['@sentio/sdk'] = sdkVersion

      switch (chainType) {
        case 'aptos':
          packageJson.dependencies['@sentio/sdk-aptos'] = sdkVersion
          break
        case 'solana':
          packageJson.dependencies['@sentio/sdk-solana'] = sdkVersion
          break
        default:
      }

      packageJson.dependencies['@sentio/cli'] = cliVersion
      packageJson.name = projectName

      // Don't add directly to avoid deps issue
      packageJson.scripts.postinstall = 'sentio gen'

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }
    console.log(chalk.green("successfully create project '" + projectName + "'"))
  }
}
