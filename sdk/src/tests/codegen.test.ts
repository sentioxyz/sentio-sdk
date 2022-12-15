import { codeGenEthersProcessor } from '../cli/build'
import path from 'path'
import * as fs from 'fs'
import os from 'os'

describe('Test EVM codegen', () => {
  // TODO make sure code could be compile
  jest.setTimeout(20000)
  test('code gen for evm', async () => {
    const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))
    // const codeGenFolder = path.join(__dirname, 'types/evm/test')

    console.log('source code generated to ' + codeGenFolder)

    await codeGenEthersProcessor(
      path.join(__dirname, 'abis/evm'),
      'lib/target-ethers-sentio',
      path.join(codeGenFolder, '/internal')
    )
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(5)
  })

  // afterAll(() => {
  //   if (fs.existsSync(codeGenFolder)) {
  //     fs.rmSync(codeGenFolder, { recursive: true, force: true })
  //   }
  // })
})
