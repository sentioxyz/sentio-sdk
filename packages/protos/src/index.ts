export * from './builtin.js'

export * from './processor/protos/processor_pb.js'

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
  timestampNow,
} from '@bufbuild/protobuf/wkt'

export type {
  CoinID,
  RichStruct,
  RichValue,
  RichValueList,
  RichStructList,
  BigInteger,
  BigDecimal as BigDecimalRichValue,
  TokenAmount,
} from './service/common/protos/common_pb.js'
export {
  CoinIDSchema,
  RichStructSchema,
  RichValueSchema,
  RichValueListSchema,
  RichStructListSchema,
  RichValue_NullValue,
  RichValue_NullValueSchema,
  BigIntegerSchema,
  BigDecimalSchema as BigDecimalRichValueSchema,
  TokenAmountSchema,
} from './service/common/protos/common_pb.js'
