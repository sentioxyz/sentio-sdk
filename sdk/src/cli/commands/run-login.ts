import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { getFinalizedHost } from '../config'
import chalk from 'chalk'
import https from 'https'
import http from 'http'
import { WriteKey } from '../key'

export function runLogin(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'api-key',
      type: String,
      description: '(Required) Your API key',
    },
    {
      name: 'host',
      description: '(Optional) Override Sentio Host name',
      type: String,
    },
  ]
  const options = commandLineArgs(optionDefinitions, { argv })

  if (options.help || !options['api-key']) {
    const usage = commandLineUsage([
      {
        header: 'Login to Sentio',
        content: 'sentio login --api-key=<key>',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    const host = getFinalizedHost(options.host)
    console.log(chalk.blue('login to ' + host))
    const url = new URL(host)
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: '/api/v1/processors/check_key',
      method: 'HEAD',
      headers: {
        'api-key': options['api-key'],
      },
    }
    const h = url.protocol == 'https:' ? https : http
    const req = h.request(reqOptions, (res) => {
      if (res.statusCode == 200) {
        WriteKey(host, options['api-key'])
        console.log(chalk.green('login success'))
      } else {
        console.error(chalk.red('login failed, code:', res.statusCode, res.statusMessage))
      }
    })

    req.on('error', (error) => {
      console.error(error)
    })
    req.end()
  }
}
