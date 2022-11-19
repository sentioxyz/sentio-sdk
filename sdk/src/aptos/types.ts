import { SPLITTER, VECTOR_STR } from './utils'

export class TypeDescriptor {
  // type: string

  // qualified name without type parameters
  qname: string
  // account?: string
  // module?: string

  typeArgs: TypeDescriptor[]

  constructor(symbol: string, typeParams?: TypeDescriptor[]) {
    this.qname = symbol
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
      return []
    }
    switch (this.qname) {
      case 'signer':
      case 'address':
      case '0x1::string::String':
      case 'bool':
      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
      case 'u128':
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
  // type = type.replace('&', '')

  type = type.replaceAll('&mut ', '&')
  type = type.replaceAll('mut ', '')

  // TODO replace ' ' is not exactly safe, need to double check this
  type = type.replaceAll(' ', '')

  const stack: TypeDescriptor[] = [new TypeDescriptor('')]
  let buffer = []

  // xxx:asdf<g1<a,<c,d>>, b, g2<a,b>, e>
  for (let i = 0; i < type.length; i++) {
    const ch = type[i]
    if (ch === '<') {
      // const symbol = type.slice(symbolStart, i)
      // symbolStart =
      const symbol = buffer.join('')
      buffer = []
      stack[stack.length - 1].qname = symbol
      stack.push(new TypeDescriptor(''))
      continue
    }
    if (ch === '>') {
      const typeParam = stack.pop()
      if (!typeParam) {
        throw Error('Uxpectecd stack size')
      }
      if (buffer.length > 0) {
        typeParam.qname = buffer.join('')
        buffer = []
      }
      stack[stack.length - 1].typeArgs.push(typeParam)
      continue
    }
    if (ch === ',') {
      const typeParam = stack.pop()
      if (!typeParam) {
        throw Error('Uxpectecd stack size')
      }
      if (buffer.length > 0) {
        typeParam.qname = buffer.join('')
        buffer = []
      }

      stack[stack.length - 1].typeArgs.push(typeParam)
      // continue parse next param
      stack.push(new TypeDescriptor(''))
      continue
    }

    buffer.push(ch)
  }

  if (buffer.length > 0) {
    stack[stack.length - 1].qname = buffer.join('')
  }

  const res = stack.pop()
  if (!res || stack.length > 0) {
    throw Error('Uxpectecd stack size')
  }
  return res
}
