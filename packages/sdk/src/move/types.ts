import { SPLITTER, VECTOR_STR } from './utils.js'

export type DecodedStruct<B, T> = B & {
  /**
   * decoded data using ABI, undefined if there is decoding error, usually because the ABI/data mismatch
   */
  data_decoded: T
  type_arguments: string[]
}

export class TypeDescriptor<T = any> {
  qname: string
  reference: boolean
  mutable: boolean
  typeArgs: TypeDescriptor[]

  constructor(symbol: string, typeParams?: TypeDescriptor[]) {
    this.qname = symbol
    this.reference = false
    this.mutable = false
    this.typeArgs = typeParams || []
  }

  apply(...typeArgs: TypeDescriptor[]): TypeDescriptor {
    const newObj = this.clone()
    newObj.typeArgs = typeArgs
    return newObj
  }

  clone(): this {
    const newObj = new TypeDescriptor(this.qname, this.typeArgs)
    newObj.reference = this.reference
    newObj.mutable = this.mutable
    return newObj as any
  }

  // compare qname without consider case for system type
  compareQname(t: TypeDescriptor): boolean {
    let t1 = this.qname
    if (BUILTIN_TYPES_SET.has(this.qname.toLowerCase())) {
      t1 = this.qname.toLowerCase()
    }
    let t2 = t.qname
    if (BUILTIN_TYPES_SET.has(t.qname.toLowerCase())) {
      t2 = t.qname
    }
    return t1 === t2
  }

  getSignature(): string {
    if (this.typeArgs.length > 0) {
      return this.qname + '<' + this.typeArgs.map((t) => t.getSignature()).join(', ') + '>'
    }
    return this.qname
  }

  // Replace T0, T1 with more concrete type
  applyTypeArgs(ctx: Map<string, TypeDescriptor>): TypeDescriptor {
    const replace = ctx.get(this.qname)
    if (replace) {
      return replace
    }
    if (ctx.size === 0 || this.typeArgs.length === 0) {
      return this
    }

    const typeArgs: TypeDescriptor[] = []
    for (const arg of this.typeArgs) {
      const replace = ctx.get(arg.qname)
      if (replace) {
        typeArgs.push(replace)
      } else {
        typeArgs.push(arg.applyTypeArgs(ctx))
      }
    }
    return new TypeDescriptor(this.qname, typeArgs)
  }

  // all depended types including itself, not include system type
  dependedTypes(): string[] {
    if (this.qname.startsWith('&')) {
      console.error('Not expected &')
      return []
    }
    if (this.reference) {
      return []
    }
    if (BUILTIN_TYPES_SET.has(this.qname.toLowerCase())) {
      return []
    }
    switch (this.qname) {
      case 'signer':
      case '0x1::string::String':
        return []
    }

    // Type parameters are not depended
    if (this.qname.indexOf(SPLITTER) == -1) {
      if (this.qname.startsWith('T')) {
        return []
      }
    }

    const types = new Set<string>()
    for (const param of this.typeArgs) {
      param.dependedTypes().forEach((t) => types.add(t))
    }

    if (this.qname !== VECTOR_STR) {
      types.add(this.qname)
    }

    return Array.from(types)
  }
}

export function parseMoveType(type: string): TypeDescriptor {
  const stack: TypeDescriptor[] = [new TypeDescriptor('')]
  let buffer = []

  // xxx:asdf<g1<a,<c,d>>, b, g2<a,b>, e>
  for (let i = 0; i < type.length; i++) {
    const ch = type[i]
    if (ch === ' ') {
      continue
    }
    if (ch === '<') {
      // const symbol = type.slice(symbolStart, i)
      // symbolStart =
      const symbol = buffer.join('')
      buffer = []
      stack[stack.length - 1].qname = symbol
      adjustType(stack[stack.length - 1])
      stack.push(new TypeDescriptor(''))
      continue
    }
    if (ch === '>' || ch === ',') {
      const typeParam = stack.pop()
      if (!typeParam) {
        throw Error('Unexpected stack size')
      }
      if (buffer.length > 0) {
        typeParam.qname = buffer.join('')
        buffer = []
      }
      adjustType(typeParam)
      stack[stack.length - 1].typeArgs.push(typeParam)
      if (ch === ',') {
        stack.push(new TypeDescriptor(''))
      }
      continue
    }
    buffer.push(ch)
  }

  if (buffer.length > 0) {
    stack[stack.length - 1].qname = buffer.join('')
  }
  adjustType(stack[stack.length - 1])

  const res = stack.pop()
  if (!res || stack.length > 0) {
    throw Error('Unexpected stack size')
  }
  return res
}

function adjustType(type: TypeDescriptor) {
  if (type.qname.startsWith('&')) {
    type.reference = true
    type.qname = type.qname.slice(1)
  }
  if (type.qname.startsWith('mut')) {
    type.mutable = true
    type.qname = type.qname.slice(3)
  }
}

export const ANY_TYPE = new TypeDescriptor<any>('any')

export function vectorType<T>(t: TypeDescriptor<T> = ANY_TYPE): TypeDescriptor<T[]> {
  return BUILTIN_TYPES.VECTOR_TYPE_ANY.apply(t)
}

export const BUILTIN_TYPES = {
  ADDRESS_TYPE: new TypeDescriptor<string>('address'),
  // export const Address = new TypeDescriptor<string>("Address")

  VECTOR_TYPE_ANY: new TypeDescriptor<any[]>('vector'),
  VECTOR_TYPE: vectorType,

  BOOL_TYPE: new TypeDescriptor<number>('bool'),

  U8_TYPE: new TypeDescriptor<number>('u8'),
  // export const U8 = new TypeDescriptor<number>("U8")
  U16_TYPE: new TypeDescriptor<number>('u16'),
  // export const U16 = new TypeDescriptor<number>("U16")
  U32_TYPE: new TypeDescriptor<number>('u32'),
  // export const U32 = new TypeDescriptor<number>("U32")
  U64_TYPE: new TypeDescriptor<number>('u64'),
  // export const U64 = new TypeDescriptor<number>("U64")
  U128_TYPE: new TypeDescriptor<number>('u128'),
  // export const U128 = new TypeDescriptor<number>("U128")
  U256_TYPE: new TypeDescriptor<number>('u256'),
  // export const U256 = new TypeDescriptor<number>("U256")
}

const BUILTIN_TYPES_SET = new Set(
  Object.values(BUILTIN_TYPES).flatMap((t) => {
    if (typeof t === 'object') {
      return [t.qname.toLowerCase()]
    }
    return []
  })
)

/**
 *
 * @param matcher
 * @param type
 */
export function matchType(matcher: TypeDescriptor, type: TypeDescriptor): boolean {
  if (matcher.qname === 'any') {
    return true
  }
  if (!matcher.compareQname(type)) {
    return false
  }
  for (const [idx, matcherTarg] of matcher.typeArgs.entries()) {
    const targ = type.typeArgs[idx]
    if (!matchType(matcherTarg, targ)) {
      return false
    }
  }
  return true
}
