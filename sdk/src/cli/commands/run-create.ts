import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

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
      type: String,
      description: '(Required) Project name',
    },
  ]

  const options = commandLineArgs(optionDefinitions, { argv })
  if (options.help || !options.name) {
    const usage = commandLineUsage([
      {
        header: 'Sentio Create',
        content: 'Create a template project',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    //
  }
}
