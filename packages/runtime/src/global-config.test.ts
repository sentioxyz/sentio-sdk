import { deepFreeze, GLOBAL_CONFIG } from './global-config.js'
import { assert } from 'chai'

describe('global config test', () => {
  test('freeze test', async () => {
    GLOBAL_CONFIG.execution = {
      sequential: true,
      forceExactBlockTime: false
    }

    deepFreeze(GLOBAL_CONFIG.execution)
    deepFreeze(GLOBAL_CONFIG.execution)

    assert.throw(() => {
      GLOBAL_CONFIG.execution.sequential = false
    })
  })
})
