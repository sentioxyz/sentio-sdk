import { assert } from 'chai'
import { State, MapStateStorage } from './state'

describe('state storage tests', () => {
  State.reset()

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
    assert(State.INSTANCE.stateMap.size === 1)
    assert(State.INSTANCE.stateMap.keys().next().value === 'TestState')
  })
})
