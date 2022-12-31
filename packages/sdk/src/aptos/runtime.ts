import { MoveStruct } from 'aptos-sdk/src/generated'

export function decode<T>(struct: MoveStruct, args: any[]): T | undefined {
  if (args.length != struct.fields.length) {
    console.log('type mismatch actually data for', struct.name)
    return undefined
  }
  const res: any = {}
  for (const [i, field] of struct.fields.entries()) {
    res[field.name] = args[i]
  }
  return res as T
}
