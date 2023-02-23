import { SPLITTER, VECTOR_STR } from './utils.js'

export class TypeDescriptor {
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
    switch (this.qname) {
      case 'signer':
      case 'address':
      case 'Address':
      case '0x1::string::String':
      case 'bool':
      case 'Bool':
      case 'u8':
      case 'U8':
      case 'u16':
      case 'U16':
      case 'u32':
      case 'U32':
      case 'u64':
      case 'U64':
      case 'u128':
      case 'U128':
      case 'u256':
      case 'U256':
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
