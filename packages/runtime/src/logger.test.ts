import { setupJsonLogger } from './logger.js'

describe('Test logger', () => {
  test('check log output', () => {
    const object = { a: 'asdf', b: 'Asdf' }

    console.log(JSON.stringify(object), object)
    setupJsonLogger()
    console.log('asdf')
    console.log('asdf')
    console.log(1111, true, 'asdf')
    console.log(111111111n)

    // console.log(object)
    console.log(JSON.stringify(object), object)
  })
})
