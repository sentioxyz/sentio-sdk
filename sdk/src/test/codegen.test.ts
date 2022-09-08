import { codeGenEthersProcessor } from '../cli/build'
import path from 'path'
import * as fs from 'fs'
import os from 'os'

describe('Test EVM codegen', () => {
  const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))

  jest.setTimeout(20000)

  test('code gen for anyswapRouter', async () => {
    await codeGenEthersProcessor(
      path.join(__dirname, 'abis/evm'),
      'lib/target-ethers-sentio',
      `${codeGenFolder}/internal`
    )
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(2)
  })

  afterAll(() => {
    if (fs.existsSync(codeGenFolder)) {
      fs.rmSync(codeGenFolder, { recursive: true, force: true })
    }
  })
})
