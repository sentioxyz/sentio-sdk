import { MOVE_CODER } from '../move-coder.js'
import { loadAllTypes } from '../builtin/0x1.js'

describe('type decode', () => {
  loadAllTypes(MOVE_CODER)
  test('decode function payload', async () => {
    const decoded = MOVE_CODER.decodeFunctionPayload(data)
    console.log(decoded)
  })
})

const data = {
  type: 'entry_function_payload',
  type_arguments: [],
  arguments: ['0xaaaf981fec16d967eb79bb51b4c6d39e75acb3482c6dabddb19ca9adbfceee80'],
  code: { bytecode: '' },
  function: '0x1::aptos_account::create_account',
}
