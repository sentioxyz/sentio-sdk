import { execFile, ExecFileOptions } from 'child_process'
import chalk from 'chalk'
import process from 'process'

export async function execStep(cmds: string[], stepName: string, options?: ExecFileOptions) {
  const child = execFile(cmds[0], cmds.splice(1), options)

  console.log(chalk.blue(stepName + ' begin'))

  if (!child.stdout || !child.stderr) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(1)
  }

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  await new Promise((resolve) => {
    child.on('close', resolve)
  })

  if (child.exitCode) {
    console.error(chalk.red(stepName + ' failed'))
    process.exit(child.exitCode)
  }
  console.log(chalk.blue(stepName + ' success'))
  console.log()
}

export async function execYarn(args: string[], stepName: string, options?: ExecFileOptions) {
  const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'
  return execStep([yarn, ...args], stepName, options)
}
