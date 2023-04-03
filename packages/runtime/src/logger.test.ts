import { setupJsonLogger } from './logger.js'

describe('Test logger', () => {
  test('check log output', () => {
    setupJsonLogger()
    console.log('asdf')
    console.log(console)
    console.log('asdf')

    console.log({ a: 'asdf', b: 'Asdf' })
  })
})
