import { assert } from 'chai'
import { MapStateStorage } from './state-storage'
import { ProcessorState } from './processor-state'

describe('state storage tests', () => {
  global.PROCESSOR_STATE = new ProcessorState()

  test('test labels', async () => {
    class TestState extends MapStateStorage<any> {
      static INSTANCE = new TestState()
    }
    const m = TestState.INSTANCE.getOrRegister()
    assert(m !== undefined)

    const v1 = TestState.INSTANCE.getOrSetValue('k1', {})
    const v2 = TestState.INSTANCE.getOrSetValue('k1', { a: '' })
    assert(v1 === v2)
    TestState.INSTANCE.getOrSetValue('k2', 'v2')

    assert(TestState.INSTANCE.getValues().length === 2)
    assert(global.PROCESSOR_STATE.stateMap.size === 1)
    assert(global.PROCESSOR_STATE.stateMap.keys().next().value === 'TestState')
  })
})
