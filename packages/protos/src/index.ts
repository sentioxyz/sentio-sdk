export * from './builtin.js'

export * from './processor/protos/processor_pb.js'

// Re-export the common_pb types consumers use, plus the types transitively
// referenced by their oneofs so consumer .d.ts emit stays portable. NOTE: the
// proto `BigDecimal` message is deliberately NOT re-exported under its bare name
// (only as `BigDecimalRichValue`) so it does not collide with the @sentio/bigdecimal
// `BigDecimal` that @sentio/sdk re-exports.
export type {
  CoinID,
  CoinID_AddressIdentifier,
  RichStruct,
  RichValue,
  RichValueList,
  RichStructList,
  BigInteger,
  TokenAmount,
  BigDecimal as BigDecimalRichValue
} from './service/common/protos/common_pb.js'
export {
  CoinIDSchema,
  CoinID_AddressIdentifierSchema,
  RichStructSchema,
  RichValueSchema,
  RichValueListSchema,
  RichStructListSchema,
  RichValue_NullValue,
  RichValue_NullValueSchema,
  BigIntegerSchema,
  TokenAmountSchema,
  BigDecimalSchema as BigDecimalRichValueSchema
} from './service/common/protos/common_pb.js'

// Well-known types are no longer generated locally — protobuf-es provides them.
// The message types are type-only; only the *Schema descriptors and the
// timestamp helpers are runtime values.
export type { Empty, Timestamp, Struct, Value, ListValue } from '@bufbuild/protobuf/wkt'
export {
  EmptySchema,
  TimestampSchema,
  StructSchema,
  ValueSchema,
  ListValueSchema,
  timestampDate,
  timestampFromDate,
  timestampNow
} from '@bufbuild/protobuf/wkt'
