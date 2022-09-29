import { codeGenEthersProcessor } from '../cli/build'
import path from 'path'
import * as fs from 'fs'
import os from 'os'

describe('Test EVM codegen', () => {
  const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))

  jest.setTimeout(20000)

  // TODO make sure code could be compile
  test('code gen for evm', async () => {
    console.log('source code generated to ' + codeGenFolder)

    await codeGenEthersProcessor(
      path.join(__dirname, 'abis/evm'),
      'lib/target-ethers-sentio',
      `${codeGenFolder}/internal`
    )
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(4)
  })

  // afterAll(() => {
  //   if (fs.existsSync(codeGenFolder)) {
  //     fs.rmSync(codeGenFolder, { recursive: true, force: true })
  //   }
  // })
})
