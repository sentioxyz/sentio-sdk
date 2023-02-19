import path from 'path'
import * as fs from 'fs'
import { jest } from '@jest/globals'
import * as url from 'url'
import { codegen } from '../codegen/index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('Test EVM codegen', () => {
  // TODO make sure code could be compile
  jest.setTimeout(200000)
  test('code gen for evm', async () => {
    // const codeGenFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen_test'))
    const codeGenFolder = path.resolve(__dirname, 'types/eth')

    console.log('source code generated to ' + codeGenFolder)

    await codegen(path.resolve(__dirname, 'abis/eth'), codeGenFolder)
    expect(fs.existsSync(codeGenFolder)).toEqual(true)
    expect(fs.readdirSync(codeGenFolder).length).toEqual(8)
  })

  // afterAll(() => {
  //   if (fs.existsSync(codeGenFolder)) {
  //     fs.rmSync(codeGenFolder, { recursive: true, force: true })
  //   }
  // })
})
