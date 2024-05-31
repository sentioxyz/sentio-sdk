import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import latestVersion from 'latest-version'
import url from 'url'
import process from 'process'
import { execYarn } from '../execution.js'

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
        'The type of project you want to create, can be eth, aptos, solana, raw (if you want to start from scratch and support multiple types of chains)',
      type: String,
      defaultValue: 'eth'
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
  } else {
    const chainType: string = options['chain-type'].toLowerCase()
    switch (chainType) {
      case 'eth':
        break
      case 'aptos':
        break
      case 'raw':
        break
      case 'solana':
        break
      case 'fuel':
        break
      default:
        console.error(chalk.red('non supported chain-type for template creation, use --help for more information.'))
        console.log(usage)
        process.exit(1)
    }

    const templateFolder = url.fileURLToPath(new URL('../../templates/' + chainType, import.meta.url))
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

      const cliVersion = '^' + (await latestVersion('@sentio/cli'))
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
    console.log(chalk.green("successfully create project '" + projectFullName + "'"))
    if (!options.subproject) {
      console.log(chalk.green('running yarn install for initialization'))

      await execYarn(['install'], 'install', { cwd: dstFolder })
    }
  }
}
