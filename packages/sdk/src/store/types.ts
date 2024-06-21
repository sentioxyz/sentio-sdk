export type ID = (string | Uint8Array) & { __id__?: void }
export type String = string
export type Int = number & { __int__?: void }
export type Float = number
export type Boolean = boolean
export type Timestamp = Date
export type Bytes = Uint8Array
export type BigInt = bigint

export class Struct<T = unknown, S = unknown> {
  readonly TYPE!: T
  constructor(readonly schema: S) {}
}
export type Infer<T extends Struct<any>> = T['TYPE']
export type ObjectSchema = Record<string, Struct<any, any>>

export function object<S extends ObjectSchema>(schema: S): Struct<ObjectType<S>, S> {
  return new Struct(schema ?? null)
}

export type Simplify<T> = T extends any[] | Date ? T : { [K in keyof T]: T[K] } & NonNullable<unknown>

export type ObjectType<S extends ObjectSchema> = Simplify<{ [K in keyof S]: Infer<S[K]> }>

const StringStruct = new Struct<string, null>(null)

const UU = object({
  test: StringStruct
})
