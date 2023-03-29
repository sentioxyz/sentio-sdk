import path from 'path'
import * as fs from 'fs'
import { jest } from '@jest/globals'
import * as url from 'url'
import { codegen } from '../codegen/index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('Test EVM codegen', () => {
  test('code gen for evm', async () => {
    if (process.env.CI) {
      return
    }

    jest.setTimeout(200000)
    jest.retryTimes(3)
    // const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))
    const codeGenFolder = path.resolve(__dirname, 'types/eth')

    console.log('source code generated to ' + codeGenFolder)

    const yamlContractConfig = [
      {
        name: 'Pyth',
        chain: '1',
        address: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
      },
      {
        name: 'Pyth',
        chain: '10',
        address: '0xff1a0f4744e8582df1ae09d5611b887b6a12925c',
      },
      {
        name: 'Pyth',
        chain: '56',
        address: '0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594',
      },
    ]

    await codegen(path.resolve(__dirname, 'abis/eth'), codeGenFolder, [])
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(8)
  })

  // afterAll(() => {
  //   if (fs.existsSync(codeGenFolder)) {
  //     fs.rmSync(codeGenFolder, { recursive: true, force: true })
  //   }
  // })
})
