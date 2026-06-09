export * from './builtin.js'

export * from './processor/protos/processor_pb.js'

// Re-export the full common_pb surface so nested types (e.g. CoinID_AddressIdentifier)
// are nameable through @sentio/protos — required for portable .d.ts emit of consumers.
export * from './service/common/protos/common_pb.js'

// processor.proto and common.proto both declare an EventLogConfig; disambiguate the
// star-export collision in favour of processor's (matches the historical surface).
export type { EventLogConfig } from './processor/protos/processor_pb.js'
export { EventLogConfigSchema } from './processor/protos/processor_pb.js'

// Historical alias: common's BigDecimal was exported as BigDecimalRichValue.
export type { BigDecimal as BigDecimalRichValue } from './service/common/protos/common_pb.js'
export { BigDecimalSchema as BigDecimalRichValueSchema } from './service/common/protos/common_pb.js'

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
