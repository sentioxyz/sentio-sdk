import { TypeDescriptor } from './types.js'
import { normalizeToJSName, SPLITTER, VECTOR_STR } from './utils.js'

export function generateTypeForDescriptor(type: TypeDescriptor, currentAddress: string, addressType: string): string {
  if (type.qname.startsWith('&')) {
    throw Error('Unexpected &')
  }
  if (type.reference) {
    return addressType
  }

  switch (type.qname) {
    case 'signer': // TODO check this
    case 'address':
    case 'Address':
      return addressType
    case '0x2::object::ID':
    case '0x2::coin::Coin':
      return 'string'
    case '0x1::string::String':
      return 'string'
    case 'bool':
    case 'Bool':
      return 'Boolean'
    case 'u8':
    case 'U8':
    case 'u16':
    case 'U16':
    case 'u32':
    case 'U32':
      return 'number'
    case 'u64':
    case 'U64':
    case 'u128':
    case 'U128':
    case 'u256':
    case 'U256':
      return 'bigint'
  }

  if (type.qname.toLowerCase() === VECTOR_STR) {
    // vector<u8> as hex string
    const elementTypeQname = type.typeArgs[0].qname
    if (elementTypeQname === 'u8' || elementTypeQname === 'U8') {
      return 'string'
    }
    if (elementTypeQname.startsWith('T') && !elementTypeQname.includes(SPLITTER)) {
      return `${elementTypeQname}[] | string`
    }
    return generateTypeForDescriptor(type.typeArgs[0], currentAddress, addressType) + '[]'
  }

  const simpleName = generateSimpleType(type.qname, currentAddress)
  if (simpleName.length === 0) {
    console.error('unexpected error')
  }
  if (simpleName.toLowerCase() === VECTOR_STR || simpleName.toLowerCase().startsWith(VECTOR_STR + SPLITTER)) {
    console.error('unexpected vector type error')
  }
  if (type.typeArgs.length > 0) {
    // return simpleName
    return (
      simpleName +
      '<' +
      type.typeArgs.map((t) => generateTypeForDescriptor(t, currentAddress, addressType)).join(',') +
      '>'
    )
  }
  return simpleName
}

function generateSimpleType(type: string, currentAddress: string): string {
  const parts = type.split(SPLITTER)

  for (let i = 0; i < parts.length; i++) {
    parts[i] = normalizeToJSName(parts[i])
  }

  if (parts.length < 2) {
    return parts[0]
  }
  if (parts[0] === currentAddress) {
    return parts.slice(1).join('.')
  }
  return '_' + parts.join('.')
}
