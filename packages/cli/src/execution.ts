import { execFile, ExecFileOptions } from 'child_process'
import chalk from 'chalk'
import process from 'process'

export async function execStep(cmds: string[], stepName: string, options?: ExecFileOptions) {
  const child = execFile(cmds[0], cmds.slice(1), options)

  console.log(chalk.blue(stepName + ' begin'))

  if (!child.stdout || !child.stderr) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(1)
  }

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  let stderr = ''
  child.stderr.on('data', (data) => {
    stderr += data
  })
  await new Promise((resolve) => {
    child.on('close', resolve)
  })

  if (child.exitCode || (cmds[1] == 'graph' && stderr.includes('Failed'))) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(child.exitCode || 1)
  }
  console.log(chalk.blue(stepName + ' success'))
  console.log()
}

export async function execYarn(args: string[], stepName: string, options?: ExecFileOptions) {
  const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'
  return execStep([yarn, ...args], stepName, options)
}
