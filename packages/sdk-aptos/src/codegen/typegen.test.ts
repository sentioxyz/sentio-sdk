import { assert } from 'chai'
import { parseMoveType } from '../types.js'

describe('type gen', () => {
  test('type gen for generic', async () => {
    const res = parseMoveType('x<g1<a,g2<c,d>>,b,g3<a,b>,e>')

    assert(res.qname === 'x')
    assert(res.typeArgs[0].typeArgs[1].qname === 'g2')
    assert(res.typeArgs[0].typeArgs[1].typeArgs[1].qname === 'd')
  })

  test('type gen for non generic', async () => {
    const res = parseMoveType('xyz')

    assert(res.qname === 'xyz')
    assert(res.typeArgs.length === 0)
  })

  test('test depended types', async () => {
    const typeString =
      '0x1::table_with_length::TableWithLength<T0, 0xd5f9f2b1c24faee8f07b790e570c75dfa1b7d8c1e9a60162fbd92ade03ea29e4::iterable_table::IterableValue<T0, T1>>'
    const res = parseMoveType(typeString)

    const deps = res.dependedTypes()
    assert(deps.length === 2)
    assert(
      deps[0] === '0xd5f9f2b1c24faee8f07b790e570c75dfa1b7d8c1e9a60162fbd92ade03ea29e4::iterable_table::IterableValue'
    )
    assert(deps[1] === '0x1::table_with_length::TableWithLength')

    const computedTypeString = res.getSignature()
    assert(computedTypeString === typeString)
  })
  // test('type type gen', async () => {
  //
  //   const res = parseGenericType('x<g1<a,g2<c,d>>,b,g3<a,b>,e>')
  //   console.log(res)
  //
  //   assert(res.symbol === 'x')
  //   assert(res.typeParams[0].typeParams[1].symbol === "g2")
  //   assert(res.typeParams[0].typeParams[1].typeParams[1].symbol === "d")
  // })
})
