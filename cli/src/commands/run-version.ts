import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { getCliVersion } from '../utils'

export function runVersion(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
  ]
  const options = commandLineArgs(optionDefinitions, { argv })

  if (options.help) {
    const usage = commandLineUsage([
      {
        header: 'Show current version',
        content: 'sentio version',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    console.log('CLI Version: ', getCliVersion())
    // TODO show SDK version for current package
  }
}
