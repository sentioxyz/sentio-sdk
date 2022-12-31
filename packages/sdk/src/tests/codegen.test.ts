import path from 'path'
import * as fs from 'fs'
import os from 'os'
import chalk from 'chalk'
import { execSync } from 'child_process'

export async function codeGenEthersProcessor(
  abisDir: string,
  ETHERS_TARGET = path.join(__dirname, '../target-ethers-sentio'),
  outDir = 'src/types/internal'
) {
  if (!fs.existsSync(abisDir)) {
    return
  }

  // TODO merge code with CLI
  let haveJson = false
  const files = fs.readdirSync(abisDir)
  for (const file of files) {
    if (file.toLowerCase().endsWith('.json')) {
      haveJson = true
      break
    }
  }
  if (!haveJson) {
    return
  }

  console.log(chalk.green('Generated Types for EVM'))

  execSync('yarn typechain --target ' + ETHERS_TARGET + ` --out-dir ${outDir} ${path.join(abisDir, '*.json')}`)
}

describe('Test EVM codegen', () => {
  // TODO make sure code could be compile
  jest.setTimeout(200000)
  test('code gen for evm', async () => {
    // const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))
    const codeGenFolder = path.join(__dirname, 'types/evm/test')

    console.log('source code generated to ' + codeGenFolder)

    await codeGenEthersProcessor(
      path.join(__dirname, 'abis/evm'),
      'lib/target-ethers-sentio',
      path.join(codeGenFolder, '/internal')
    )
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(6)
  })

  // afterAll(() => {
  //   if (fs.existsSync(codeGenFolder)) {
  //     fs.rmSync(codeGenFolder, { recursive: true, force: true })
  //   }
  // })
})
