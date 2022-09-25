import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { getCliVersion } from '../utils'

export function runCreate(argv: string[]) {
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
  ]

  const options = commandLineArgs(optionDefinitions, { argv })
  if (options.help || !options.name) {
    const usage = commandLineUsage([
      {
        header: 'Create a template project',
        content: 'sentio create $NAME',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    const templateFolder = path.resolve(__dirname, '../../../template')
    const projectName = options.name || 'default'

    const dstFolder = path.resolve(projectName)
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

      packageJson.version = cliVersion
      packageJson.name = projectName

      // Don't add directly to avoid deps issue
      packageJson.scripts.postinstall = 'sentio gen'

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }
    console.log(chalk.green("successfully create project '" + projectName + "'"))
  }
}
