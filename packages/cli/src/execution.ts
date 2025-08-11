import { exec, execFile, ExecFileOptions } from 'child_process'
import chalk from 'chalk'
import process from 'process'
import { getPackageManager } from 'package-manager-manager'

export async function execStep(cmds: string[], stepName: string, options?: ExecFileOptions, extraBeginMsg?: string) {
  // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
  const child = process.platform === 'win32' ? exec(cmds.join(' ')) : execFile(cmds[0], cmds.slice(1), options)

  console.log(chalk.blue(stepName, 'begin', extraBeginMsg))

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

  if (child.exitCode || (cmds[1].includes('graph-cli') && stderr.includes('Failed'))) {
    console.error(chalk.red(stepName, 'failed'))
    process.exit(child.exitCode || 1)
  }
  console.log(chalk.blue(stepName, 'success'))
  console.log()
}

export async function execPackageManager(args: string[], stepName: string, options?: ExecFileOptions) {
  let pm = 'yarn'
  try {
    const packageManager = await getPackageManager()
    pm = packageManager.name
    if (pm == 'npm') {
      console.log(chalk.yellow('WARN: we recommend using yarn instead of npm'))
    }
  } catch (e) {}
  return execStep([pm, ...args], stepName, options, '(can be skipped with --skip-deps)')
}
