import { describe, test } from 'node:test'
import { setupLogger } from './logger.js'

describe('Test logger', () => {
  test('check log output', () => {
    const object = { a: 'asdf', b: 'Asdf' }

    console.log(JSON.stringify(object), object)
    setupLogger(false, true)
    console.log('asdf')
    console.log('asdf')
    console.log(1111, true, 'asdf')
    console.log(111111111n)

    // console.log(object)
    console.log(JSON.stringify(object), object)
  })

  test('check debug log', () => {
    console.log('check debug log')
    setupLogger(false, true)
    console.debug('debug=true')
    setupLogger(true, false)
    console.debug('debug=false')
  })
})
