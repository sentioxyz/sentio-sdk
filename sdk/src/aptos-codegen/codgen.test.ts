import path from 'path'
import { AptosCodegen } from './codegen'

describe('Test Aptos Example', () => {
  test.skip('code gen for aptos', async () => {
    const filename = path.join(__dirname, '0x4188c8694687e844677c2aa87171019e23d61cac60de5082a278a8aa47e9d807')

    const codegen = new AptosCodegen(filename, { outputDir: path.join(__dirname, '..') })
    codegen.generate()
  })
})
