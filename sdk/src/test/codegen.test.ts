import { codeGenEthersProcessor } from '../cli/build'
import path from 'path'
import * as fs from 'fs'

describe('Test EVM codegen', () => {
  const codeGenFolder = path.join(__dirname, 'types/evm')
  beforeAll(() => {
    if (fs.existsSync(codeGenFolder)) {
      fs.rmSync(codeGenFolder, { recursive: true, force: true })
    }
    fs.mkdirSync(codeGenFolder, { recursive: true })
  })

  test('code gen for anyswapRouter', async () => {
    await codeGenEthersProcessor(
      path.join(__dirname, 'abis/evm'),
      'dist/target-ethers-sentio',
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
