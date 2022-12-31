import { TYPE_REGISTRY } from './type-registry'
import { aptos_account } from './builtin/0x1'

describe('type decode', () => {
  aptos_account.loadTypes(TYPE_REGISTRY)
  test('decode function payload', async () => {
    const decoded = TYPE_REGISTRY.decodeFunctionPayload(data)
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
