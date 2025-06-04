/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";
import { Empty } from "../../google/protobuf/empty.js";
import { ListValue, Struct } from "../../google/protobuf/struct.js";
import { Timestamp } from "../../google/protobuf/timestamp.js";
import {
  BigInteger,
  CoinID,
  RichStruct,
  RichStructList,
  RichValue,
  RichValueList,
} from "../../service/common/protos/common.js";

export enum MetricType {
  UNKNOWN_TYPE = 0,
  COUNTER = 1,
  GAUGE = 2,
  HISTOGRAM = 3,
  UNRECOGNIZED = -1,
}

export function metricTypeFromJSON(object: any): MetricType {
  switch (object) {
    case 0:
    case "UNKNOWN_TYPE":
      return MetricType.UNKNOWN_TYPE;
    case 1:
    case "COUNTER":
      return MetricType.COUNTER;
    case 2:
    case "GAUGE":
      return MetricType.GAUGE;
    case 3:
    case "HISTOGRAM":
      return MetricType.HISTOGRAM;
    case -1:
    case "UNRECOGNIZED":
    default:
      return MetricType.UNRECOGNIZED;
  }
}

export function metricTypeToJSON(object: MetricType): string {
  switch (object) {
    case MetricType.UNKNOWN_TYPE:
      return "UNKNOWN_TYPE";
    case MetricType.COUNTER:
      return "COUNTER";
    case MetricType.GAUGE:
      return "GAUGE";
    case MetricType.HISTOGRAM:
      return "HISTOGRAM";
    case MetricType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum AggregationType {
  COUNT = 0,
  SUM = 1,
  AVG = 2,
  MIN = 3,
  MAX = 4,
  LAST = 5,
  UNRECOGNIZED = -1,
}

export function aggregationTypeFromJSON(object: any): AggregationType {
  switch (object) {
    case 0:
    case "COUNT":
      return AggregationType.COUNT;
    case 1:
    case "SUM":
      return AggregationType.SUM;
    case 2:
    case "AVG":
      return AggregationType.AVG;
    case 3:
    case "MIN":
      return AggregationType.MIN;
    case 4:
    case "MAX":
      return AggregationType.MAX;
    case 5:
    case "LAST":
      return AggregationType.LAST;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AggregationType.UNRECOGNIZED;
  }
}

export function aggregationTypeToJSON(object: AggregationType): string {
  switch (object) {
    case AggregationType.COUNT:
      return "COUNT";
    case AggregationType.SUM:
      return "SUM";
    case AggregationType.AVG:
      return "AVG";
    case AggregationType.MIN:
      return "MIN";
    case AggregationType.MAX:
      return "MAX";
    case AggregationType.LAST:
      return "LAST";
    case AggregationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum MoveOwnerType {
  ADDRESS = 0,
  OBJECT = 1,
  WRAPPED_OBJECT = 2,
  TYPE = 3,
  UNRECOGNIZED = -1,
}

export function moveOwnerTypeFromJSON(object: any): MoveOwnerType {
  switch (object) {
    case 0:
    case "ADDRESS":
      return MoveOwnerType.ADDRESS;
    case 1:
    case "OBJECT":
      return MoveOwnerType.OBJECT;
    case 2:
    case "WRAPPED_OBJECT":
      return MoveOwnerType.WRAPPED_OBJECT;
    case 3:
    case "TYPE":
      return MoveOwnerType.TYPE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return MoveOwnerType.UNRECOGNIZED;
  }
}

export function moveOwnerTypeToJSON(object: MoveOwnerType): string {
  switch (object) {
    case MoveOwnerType.ADDRESS:
      return "ADDRESS";
    case MoveOwnerType.OBJECT:
      return "OBJECT";
    case MoveOwnerType.WRAPPED_OBJECT:
      return "WRAPPED_OBJECT";
    case MoveOwnerType.TYPE:
      return "TYPE";
    case MoveOwnerType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum AddressType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
  UNRECOGNIZED = -1,
}

export function addressTypeFromJSON(object: any): AddressType {
  switch (object) {
    case 0:
    case "ERC20":
      return AddressType.ERC20;
    case 1:
    case "ERC721":
      return AddressType.ERC721;
    case 2:
    case "ERC1155":
      return AddressType.ERC1155;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AddressType.UNRECOGNIZED;
  }
}

export function addressTypeToJSON(object: AddressType): string {
  switch (object) {
    case AddressType.ERC20:
      return "ERC20";
    case AddressType.ERC721:
      return "ERC721";
    case AddressType.ERC1155:
      return "ERC1155";
    case AddressType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum HandlerType {
  UNKNOWN = 0,
  ETH_LOG = 1,
  ETH_BLOCK = 2,
  ETH_TRACE = 5,
  ETH_TRANSACTION = 11,
  SOL_INSTRUCTION = 4,
  APT_EVENT = 6,
  APT_CALL = 7,
  APT_RESOURCE = 8,
  SUI_EVENT = 3,
  SUI_CALL = 9,
  SUI_OBJECT = 10,
  SUI_OBJECT_CHANGE = 12,
  FUEL_CALL = 13,
  FUEL_RECEIPT = 19,
  FUEL_TRANSACTION = 20,
  FUEL_BLOCK = 17,
  COSMOS_CALL = 14,
  STARKNET_EVENT = 15,
  BTC_TRANSACTION = 16,
  BTC_BLOCK = 18,
  UNRECOGNIZED = -1,
}

export function handlerTypeFromJSON(object: any): HandlerType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return HandlerType.UNKNOWN;
    case 1:
    case "ETH_LOG":
      return HandlerType.ETH_LOG;
    case 2:
    case "ETH_BLOCK":
      return HandlerType.ETH_BLOCK;
    case 5:
    case "ETH_TRACE":
      return HandlerType.ETH_TRACE;
    case 11:
    case "ETH_TRANSACTION":
      return HandlerType.ETH_TRANSACTION;
    case 4:
    case "SOL_INSTRUCTION":
      return HandlerType.SOL_INSTRUCTION;
    case 6:
    case "APT_EVENT":
      return HandlerType.APT_EVENT;
    case 7:
    case "APT_CALL":
      return HandlerType.APT_CALL;
    case 8:
    case "APT_RESOURCE":
      return HandlerType.APT_RESOURCE;
    case 3:
    case "SUI_EVENT":
      return HandlerType.SUI_EVENT;
    case 9:
    case "SUI_CALL":
      return HandlerType.SUI_CALL;
    case 10:
    case "SUI_OBJECT":
      return HandlerType.SUI_OBJECT;
    case 12:
    case "SUI_OBJECT_CHANGE":
      return HandlerType.SUI_OBJECT_CHANGE;
    case 13:
    case "FUEL_CALL":
      return HandlerType.FUEL_CALL;
    case 19:
    case "FUEL_RECEIPT":
      return HandlerType.FUEL_RECEIPT;
    case 20:
    case "FUEL_TRANSACTION":
      return HandlerType.FUEL_TRANSACTION;
    case 17:
    case "FUEL_BLOCK":
      return HandlerType.FUEL_BLOCK;
    case 14:
    case "COSMOS_CALL":
      return HandlerType.COSMOS_CALL;
    case 15:
    case "STARKNET_EVENT":
      return HandlerType.STARKNET_EVENT;
    case 16:
    case "BTC_TRANSACTION":
      return HandlerType.BTC_TRANSACTION;
    case 18:
    case "BTC_BLOCK":
      return HandlerType.BTC_BLOCK;
    case -1:
    case "UNRECOGNIZED":
    default:
      return HandlerType.UNRECOGNIZED;
  }
}

export function handlerTypeToJSON(object: HandlerType): string {
  switch (object) {
    case HandlerType.UNKNOWN:
      return "UNKNOWN";
    case HandlerType.ETH_LOG:
      return "ETH_LOG";
    case HandlerType.ETH_BLOCK:
      return "ETH_BLOCK";
    case HandlerType.ETH_TRACE:
      return "ETH_TRACE";
    case HandlerType.ETH_TRANSACTION:
      return "ETH_TRANSACTION";
    case HandlerType.SOL_INSTRUCTION:
      return "SOL_INSTRUCTION";
    case HandlerType.APT_EVENT:
      return "APT_EVENT";
    case HandlerType.APT_CALL:
      return "APT_CALL";
    case HandlerType.APT_RESOURCE:
      return "APT_RESOURCE";
    case HandlerType.SUI_EVENT:
      return "SUI_EVENT";
    case HandlerType.SUI_CALL:
      return "SUI_CALL";
    case HandlerType.SUI_OBJECT:
      return "SUI_OBJECT";
    case HandlerType.SUI_OBJECT_CHANGE:
      return "SUI_OBJECT_CHANGE";
    case HandlerType.FUEL_CALL:
      return "FUEL_CALL";
    case HandlerType.FUEL_RECEIPT:
      return "FUEL_RECEIPT";
    case HandlerType.FUEL_TRANSACTION:
      return "FUEL_TRANSACTION";
    case HandlerType.FUEL_BLOCK:
      return "FUEL_BLOCK";
    case HandlerType.COSMOS_CALL:
      return "COSMOS_CALL";
    case HandlerType.STARKNET_EVENT:
      return "STARKNET_EVENT";
    case HandlerType.BTC_TRANSACTION:
      return "BTC_TRANSACTION";
    case HandlerType.BTC_BLOCK:
      return "BTC_BLOCK";
    case HandlerType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
  UNRECOGNIZED = -1,
}

export function logLevelFromJSON(object: any): LogLevel {
  switch (object) {
    case 0:
    case "DEBUG":
      return LogLevel.DEBUG;
    case 1:
    case "INFO":
      return LogLevel.INFO;
    case 2:
    case "WARNING":
      return LogLevel.WARNING;
    case 3:
    case "ERROR":
      return LogLevel.ERROR;
    case 4:
    case "CRITICAL":
      return LogLevel.CRITICAL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return LogLevel.UNRECOGNIZED;
  }
}

export function logLevelToJSON(object: LogLevel): string {
  switch (object) {
    case LogLevel.DEBUG:
      return "DEBUG";
    case LogLevel.INFO:
      return "INFO";
    case LogLevel.WARNING:
      return "WARNING";
    case LogLevel.ERROR:
      return "ERROR";
    case LogLevel.CRITICAL:
      return "CRITICAL";
    case LogLevel.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface ProjectConfig {
  name: string;
  version: string;
}

export interface ExecutionConfig {
  sequential: boolean;
  forceExactBlockTime: boolean;
  processBindingTimeout: number;
  skipStartBlockValidation: boolean;
  rpcRetryTimes: number;
  ethAbiDecoderConfig?: ExecutionConfig_DecoderWorkerConfig | undefined;
}

export interface ExecutionConfig_DecoderWorkerConfig {
  enabled: boolean;
  workerCount?: number | undefined;
  skipWhenDecodeFailed?: boolean | undefined;
}

export interface ProcessConfigRequest {
}

export interface ProcessConfigResponse {
  config: ProjectConfig | undefined;
  executionConfig: ExecutionConfig | undefined;
  contractConfigs: ContractConfig[];
  templateInstances: TemplateInstance[];
  accountConfigs: AccountConfig[];
  metricConfigs: MetricConfig[];
  eventTrackingConfigs: EventTrackingConfig[];
  exportConfigs: ExportConfig[];
  eventLogConfigs: EventLogConfig[];
  dbSchema: DataBaseSchema | undefined;
}

export interface ContractConfig {
  contract: ContractInfo | undefined;
  intervalConfigs: OnIntervalConfig[];
  moveIntervalConfigs: MoveOnIntervalConfig[];
  logConfigs: LogHandlerConfig[];
  traceConfigs: TraceHandlerConfig[];
  transactionConfig: TransactionHandlerConfig[];
  moveEventConfigs: MoveEventHandlerConfig[];
  moveCallConfigs: MoveCallHandlerConfig[];
  moveResourceChangeConfigs: MoveResourceChangeConfig[];
  /** @deprecated */
  fuelCallConfigs: FuelCallHandlerConfig[];
  fuelTransactionConfigs: FuelTransactionHandlerConfig[];
  assetConfigs: FuelAssetHandlerConfig[];
  /** @deprecated */
  fuelLogConfigs: FuelLogHandlerConfig[];
  fuelReceiptConfigs: FuelReceiptHandlerConfig[];
  cosmosLogConfigs: CosmosLogHandlerConfig[];
  starknetEventConfigs: StarknetEventHandlerConfig[];
  btcTransactionConfigs: BTCTransactionHandlerConfig[];
  instructionConfig: InstructionHandlerConfig | undefined;
  startBlock: bigint;
  endBlock: bigint;
  processorType: string;
}

export interface DataBaseSchema {
  gqlSchema: string;
}

export interface TotalPerEntityAggregation {
}

export enum TotalPerEntityAggregation_Type {
  AVG = 0,
  MEDIAN = 1,
  UNRECOGNIZED = -1,
}

export function totalPerEntityAggregation_TypeFromJSON(object: any): TotalPerEntityAggregation_Type {
  switch (object) {
    case 0:
    case "AVG":
      return TotalPerEntityAggregation_Type.AVG;
    case 1:
    case "MEDIAN":
      return TotalPerEntityAggregation_Type.MEDIAN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return TotalPerEntityAggregation_Type.UNRECOGNIZED;
  }
}

export function totalPerEntityAggregation_TypeToJSON(object: TotalPerEntityAggregation_Type): string {
  switch (object) {
    case TotalPerEntityAggregation_Type.AVG:
      return "AVG";
    case TotalPerEntityAggregation_Type.MEDIAN:
      return "MEDIAN";
    case TotalPerEntityAggregation_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface RetentionConfig {
  retentionEventName: string;
  days: number;
}

export interface EventTrackingConfig {
  eventName: string;
  totalByDay: boolean;
  unique: boolean;
  totalPerEntity: TotalPerEntityAggregation | undefined;
  distinctAggregationByDays: number[];
  retentionConfig: RetentionConfig | undefined;
}

export interface ExportConfig {
  name: string;
  channel: string;
}

export interface MetricConfig {
  name: string;
  description: string;
  unit: string;
  sparse: boolean;
  persistentBetweenVersion: boolean;
  type: MetricType;
  aggregationConfig: AggregationConfig | undefined;
}

export interface EventLogConfig {
  name: string;
  fields: EventLogConfig_Field[];
}

export enum EventLogConfig_BasicFieldType {
  STRING = 0,
  DOUBLE = 1,
  BOOL = 2,
  TIMESTAMP = 3,
  BIG_INTEGER = 4,
  BIG_DECIMAL = 5,
  UNRECOGNIZED = -1,
}

export function eventLogConfig_BasicFieldTypeFromJSON(object: any): EventLogConfig_BasicFieldType {
  switch (object) {
    case 0:
    case "STRING":
      return EventLogConfig_BasicFieldType.STRING;
    case 1:
    case "DOUBLE":
      return EventLogConfig_BasicFieldType.DOUBLE;
    case 2:
    case "BOOL":
      return EventLogConfig_BasicFieldType.BOOL;
    case 3:
    case "TIMESTAMP":
      return EventLogConfig_BasicFieldType.TIMESTAMP;
    case 4:
    case "BIG_INTEGER":
      return EventLogConfig_BasicFieldType.BIG_INTEGER;
    case 5:
    case "BIG_DECIMAL":
      return EventLogConfig_BasicFieldType.BIG_DECIMAL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return EventLogConfig_BasicFieldType.UNRECOGNIZED;
  }
}

export function eventLogConfig_BasicFieldTypeToJSON(object: EventLogConfig_BasicFieldType): string {
  switch (object) {
    case EventLogConfig_BasicFieldType.STRING:
      return "STRING";
    case EventLogConfig_BasicFieldType.DOUBLE:
      return "DOUBLE";
    case EventLogConfig_BasicFieldType.BOOL:
      return "BOOL";
    case EventLogConfig_BasicFieldType.TIMESTAMP:
      return "TIMESTAMP";
    case EventLogConfig_BasicFieldType.BIG_INTEGER:
      return "BIG_INTEGER";
    case EventLogConfig_BasicFieldType.BIG_DECIMAL:
      return "BIG_DECIMAL";
    case EventLogConfig_BasicFieldType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface EventLogConfig_StructFieldType {
  fields: EventLogConfig_Field[];
}

export interface EventLogConfig_Field {
  name: string;
  basicType?: EventLogConfig_BasicFieldType | undefined;
  coinType?: CoinID | undefined;
  structType?: EventLogConfig_StructFieldType | undefined;
}

export interface AggregationConfig {
  intervalInMinutes: number[];
  types: AggregationType[];
  discardOrigin: boolean;
}

export interface AccountConfig {
  chainId: string;
  address: string;
  startBlock: bigint;
  endBlock: bigint;
  intervalConfigs: OnIntervalConfig[];
  /** @deprecated */
  aptosIntervalConfigs: AptosOnIntervalConfig[];
  moveIntervalConfigs: MoveOnIntervalConfig[];
  moveCallConfigs: MoveCallHandlerConfig[];
  moveResourceChangeConfigs: MoveResourceChangeConfig[];
  logConfigs: LogHandlerConfig[];
}

export interface HandleInterval {
  recentInterval: number;
  backfillInterval: number;
}

export interface OnIntervalConfig {
  handlerId: number;
  minutes: number;
  minutesInterval?: HandleInterval | undefined;
  slot: number;
  slotInterval?: HandleInterval | undefined;
  fetchConfig: EthFetchConfig | undefined;
  handlerName: string;
}

export interface AptosOnIntervalConfig {
  intervalConfig: OnIntervalConfig | undefined;
  type: string;
}

export interface MoveOnIntervalConfig {
  intervalConfig: OnIntervalConfig | undefined;
  type: string;
  ownerType: MoveOwnerType;
  resourceFetchConfig: MoveAccountFetchConfig | undefined;
  fetchConfig: MoveFetchConfig | undefined;
}

export interface ContractInfo {
  name: string;
  chainId: string;
  address: string;
  abi: string;
}

export interface TemplateInstance {
  contract: ContractInfo | undefined;
  startBlock: bigint;
  endBlock: bigint;
  templateId: number;
  baseLabels: { [key: string]: any } | undefined;
}

export interface StartRequest {
  templateInstances: TemplateInstance[];
}

export interface BlockHandlerConfig {
  handlerId: number;
}

export interface EthFetchConfig {
  transaction: boolean;
  transactionReceipt: boolean;
  transactionReceiptLogs: boolean;
  block: boolean;
  trace: boolean;
}

export interface TraceHandlerConfig {
  signature: string;
  handlerId: number;
  fetchConfig: EthFetchConfig | undefined;
  handlerName: string;
}

export interface TransactionHandlerConfig {
  handlerId: number;
  fetchConfig: EthFetchConfig | undefined;
  handlerName: string;
}

export interface LogHandlerConfig {
  filters: LogFilter[];
  handlerId: number;
  fetchConfig: EthFetchConfig | undefined;
  handlerName: string;
}

export interface FuelAssetHandlerConfig {
  filters: FuelAssetHandlerConfig_AssetFilter[];
  handlerId: number;
  handlerName: string;
}

export interface FuelAssetHandlerConfig_AssetFilter {
  assetId?: string | undefined;
  fromAddress?: string | undefined;
  toAddress?: string | undefined;
}

export interface FuelLogHandlerConfig {
  logIds: string[];
  handlerId: number;
  handlerName: string;
}

export interface FuelReceiptHandlerConfig {
  log?: FuelReceiptHandlerConfig_Log | undefined;
  transfer?: FuelReceiptHandlerConfig_Transfer | undefined;
  handlerId: number;
  handlerName: string;
}

export interface FuelReceiptHandlerConfig_Transfer {
  assetId: string;
  from: string;
  to: string;
}

export interface FuelReceiptHandlerConfig_Log {
  logIds: string[];
}

export interface CosmosLogHandlerConfig {
  logFilters: string[];
  handlerId: number;
  handlerName: string;
}

export interface LogFilter {
  topics: Topic[];
  address?: string | undefined;
  addressType?: AddressType | undefined;
}

export interface InstructionHandlerConfig {
  innerInstruction: boolean;
  parsedInstruction: boolean;
  rawDataInstruction: boolean;
}

export interface ResourceConfig {
  moveTypePrefix: string;
}

export interface MoveFetchConfig {
  resourceChanges: boolean;
  allEvents: boolean;
  inputs: boolean;
  resourceConfig?: ResourceConfig | undefined;
  supportMultisigFunc?: boolean | undefined;
  includeFailedTransaction?: boolean | undefined;
}

export interface MoveAccountFetchConfig {
  owned: boolean;
}

export interface MoveEventHandlerConfig {
  filters: MoveEventFilter[];
  handlerId: number;
  fetchConfig: MoveFetchConfig | undefined;
  handlerName: string;
}

export interface MoveEventFilter {
  type: string;
  account: string;
  eventAccount: string;
}

export interface MoveCallHandlerConfig {
  filters: MoveCallFilter[];
  handlerId: number;
  fetchConfig: MoveFetchConfig | undefined;
  handlerName: string;
}

export interface MoveResourceChangeConfig {
  type: string;
  includeDeleted: boolean;
  handlerId: number;
  handlerName: string;
}

export interface MoveCallFilter {
  function: string;
  typeArguments: string[];
  withTypeArguments: boolean;
  includeFailed: boolean;
  publicKeyPrefix: string;
  fromAndToAddress?: MoveCallFilter_FromAndToAddress | undefined;
}

export interface MoveCallFilter_FromAndToAddress {
  from: string;
  to: string;
}

export interface StarknetEventHandlerConfig {
  filters: StarknetEventFilter[];
  handlerId: number;
  handlerName: string;
}

export interface BTCTransactionHandlerConfig {
  filters: BTCTransactionFilter[];
  handlerId: number;
  handlerName: string;
}

export interface BTCTransactionFilter {
  inputFilter: BTCTransactionFilter_VinFilter | undefined;
  outputFilter: BTCTransactionFilter_VOutFilter | undefined;
  filter: BTCTransactionFilter_Filter[];
}

export interface BTCTransactionFilter_Condition {
  eq?: RichValue | undefined;
  gt?: RichValue | undefined;
  gte?: RichValue | undefined;
  lt?: RichValue | undefined;
  lte?: RichValue | undefined;
  ne?: RichValue | undefined;
  prefix?: string | undefined;
  contains?: string | undefined;
  notContains?: string | undefined;
  lengthEq?: number | undefined;
  lengthGt?: number | undefined;
  lengthLt?: number | undefined;
  hasAny?: RichValueList | undefined;
  hasAll?: RichValueList | undefined;
  in?: RichValueList | undefined;
}

export interface BTCTransactionFilter_Filter {
  conditions: { [key: string]: BTCTransactionFilter_Condition };
}

export interface BTCTransactionFilter_Filter_ConditionsEntry {
  key: string;
  value: BTCTransactionFilter_Condition | undefined;
}

export interface BTCTransactionFilter_Filters {
  filters: BTCTransactionFilter_Filter[];
}

export interface BTCTransactionFilter_VinFilter {
  filters: BTCTransactionFilter_Filters | undefined;
  preVOut: BTCTransactionFilter_Filter | undefined;
  preTransaction: BTCTransactionFilter | undefined;
}

export interface BTCTransactionFilter_VOutFilter {
  filters: BTCTransactionFilter_Filters | undefined;
}

export interface StarknetEventFilter {
  address: string;
  keys: string[];
}

export interface FuelCallFilter {
  function: string;
  includeFailed: boolean;
}

export interface FuelCallHandlerConfig {
  filters: FuelCallFilter[];
  handlerId: number;
  handlerName: string;
}

export interface FuelTransactionHandlerConfig {
  handlerId: number;
  handlerName: string;
}

export interface Topic {
  hashes: string[];
}

export interface ProcessBindingsRequest {
  bindings: DataBinding[];
}

export interface ProcessBindingResponse {
  result:
    | ProcessResult
    | undefined;
  /** @deprecated */
  configUpdated: boolean;
}

export interface ProcessStreamRequest {
  processId: number;
  binding?: DataBinding | undefined;
  dbResult?: DBResponse | undefined;
}

export interface ProcessStreamResponse {
  processId: number;
  dbRequest?: DBRequest | undefined;
  result?: ProcessResult | undefined;
}

export interface PreprocessStreamRequest {
  processId: number;
  bindings?: PreprocessStreamRequest_DataBindings | undefined;
  dbResult?: DBResponse | undefined;
}

export interface PreprocessStreamRequest_DataBindings {
  bindings: DataBinding[];
}

export interface PreprocessStreamResponse {
  processId: number;
  dbRequest: DBRequest | undefined;
}

export interface DBResponse {
  opId: bigint;
  data?: { [key: string]: any } | undefined;
  list?: Array<any> | undefined;
  error?: string | undefined;
  entities?: RichStructList | undefined;
  entityList?: EntityList | undefined;
  nextCursor?: string | undefined;
}

export interface Entity {
  entity: string;
  genBlockNumber: bigint;
  genBlockChain: string;
  genBlockTime: Date | undefined;
  data: RichStruct | undefined;
}

export interface EntityList {
  entities: Entity[];
}

export interface EntityUpdateData {
  fields: { [key: string]: EntityUpdateData_FieldValue };
}

export enum EntityUpdateData_Operator {
  SET = 0,
  ADD = 1,
  MULTIPLY = 2,
  UNRECOGNIZED = -1,
}

export function entityUpdateData_OperatorFromJSON(object: any): EntityUpdateData_Operator {
  switch (object) {
    case 0:
    case "SET":
      return EntityUpdateData_Operator.SET;
    case 1:
    case "ADD":
      return EntityUpdateData_Operator.ADD;
    case 2:
    case "MULTIPLY":
      return EntityUpdateData_Operator.MULTIPLY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return EntityUpdateData_Operator.UNRECOGNIZED;
  }
}

export function entityUpdateData_OperatorToJSON(object: EntityUpdateData_Operator): string {
  switch (object) {
    case EntityUpdateData_Operator.SET:
      return "SET";
    case EntityUpdateData_Operator.ADD:
      return "ADD";
    case EntityUpdateData_Operator.MULTIPLY:
      return "MULTIPLY";
    case EntityUpdateData_Operator.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface EntityUpdateData_FieldValue {
  value: RichValue | undefined;
  op: EntityUpdateData_Operator;
}

export interface EntityUpdateData_FieldsEntry {
  key: string;
  value: EntityUpdateData_FieldValue | undefined;
}

export interface DBRequest {
  opId: bigint;
  get?: DBRequest_DBGet | undefined;
  upsert?: DBRequest_DBUpsert | undefined;
  update?: DBRequest_DBUpdate | undefined;
  delete?: DBRequest_DBDelete | undefined;
  list?: DBRequest_DBList | undefined;
}

export enum DBRequest_DBOperator {
  EQ = 0,
  NE = 1,
  GT = 2,
  GE = 3,
  LT = 4,
  LE = 5,
  IN = 6,
  NOT_IN = 7,
  LIKE = 8,
  NOT_LIKE = 9,
  HAS_ALL = 10,
  HAS_ANY = 11,
  UNRECOGNIZED = -1,
}

export function dBRequest_DBOperatorFromJSON(object: any): DBRequest_DBOperator {
  switch (object) {
    case 0:
    case "EQ":
      return DBRequest_DBOperator.EQ;
    case 1:
    case "NE":
      return DBRequest_DBOperator.NE;
    case 2:
    case "GT":
      return DBRequest_DBOperator.GT;
    case 3:
    case "GE":
      return DBRequest_DBOperator.GE;
    case 4:
    case "LT":
      return DBRequest_DBOperator.LT;
    case 5:
    case "LE":
      return DBRequest_DBOperator.LE;
    case 6:
    case "IN":
      return DBRequest_DBOperator.IN;
    case 7:
    case "NOT_IN":
      return DBRequest_DBOperator.NOT_IN;
    case 8:
    case "LIKE":
      return DBRequest_DBOperator.LIKE;
    case 9:
    case "NOT_LIKE":
      return DBRequest_DBOperator.NOT_LIKE;
    case 10:
    case "HAS_ALL":
      return DBRequest_DBOperator.HAS_ALL;
    case 11:
    case "HAS_ANY":
      return DBRequest_DBOperator.HAS_ANY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DBRequest_DBOperator.UNRECOGNIZED;
  }
}

export function dBRequest_DBOperatorToJSON(object: DBRequest_DBOperator): string {
  switch (object) {
    case DBRequest_DBOperator.EQ:
      return "EQ";
    case DBRequest_DBOperator.NE:
      return "NE";
    case DBRequest_DBOperator.GT:
      return "GT";
    case DBRequest_DBOperator.GE:
      return "GE";
    case DBRequest_DBOperator.LT:
      return "LT";
    case DBRequest_DBOperator.LE:
      return "LE";
    case DBRequest_DBOperator.IN:
      return "IN";
    case DBRequest_DBOperator.NOT_IN:
      return "NOT_IN";
    case DBRequest_DBOperator.LIKE:
      return "LIKE";
    case DBRequest_DBOperator.NOT_LIKE:
      return "NOT_LIKE";
    case DBRequest_DBOperator.HAS_ALL:
      return "HAS_ALL";
    case DBRequest_DBOperator.HAS_ANY:
      return "HAS_ANY";
    case DBRequest_DBOperator.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface DBRequest_DBGet {
  entity: string;
  id: string;
}

export interface DBRequest_DBList {
  entity: string;
  filters: DBRequest_DBFilter[];
  cursor: string;
  pageSize?: number | undefined;
}

export interface DBRequest_DBUpsert {
  entity: string[];
  id: string[];
  data: { [key: string]: any }[];
  entityData: RichStruct[];
}

export interface DBRequest_DBUpdate {
  entity: string[];
  id: string[];
  entityData: EntityUpdateData[];
}

export interface DBRequest_DBDelete {
  entity: string[];
  id: string[];
}

export interface DBRequest_DBFilter {
  field: string;
  op: DBRequest_DBOperator;
  value: RichValueList | undefined;
}

export interface Data {
  ethLog?: Data_EthLog | undefined;
  ethBlock?: Data_EthBlock | undefined;
  ethTransaction?: Data_EthTransaction | undefined;
  ethTrace?: Data_EthTrace | undefined;
  solInstruction?: Data_SolInstruction | undefined;
  aptEvent?: Data_AptEvent | undefined;
  aptCall?: Data_AptCall | undefined;
  aptResource?: Data_AptResource | undefined;
  suiEvent?: Data_SuiEvent | undefined;
  suiCall?: Data_SuiCall | undefined;
  suiObject?: Data_SuiObject | undefined;
  suiObjectChange?: Data_SuiObjectChange | undefined;
  fuelLog?:
    | Data_FuelReceipt
    | undefined;
  /** @deprecated */
  fuelCall?: Data_FuelCall | undefined;
  fuelTransaction?: Data_FuelTransaction | undefined;
  fuelBlock?: Data_FuelBlock | undefined;
  cosmosCall?: Data_CosmosCall | undefined;
  starknetEvents?: Data_StarknetEvent | undefined;
  btcTransaction?: Data_BTCTransaction | undefined;
  btcBlock?: Data_BTCBlock | undefined;
}

export interface Data_EthLog {
  log: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  transaction?: { [key: string]: any } | undefined;
  transactionReceipt?: { [key: string]: any } | undefined;
  block?: { [key: string]: any } | undefined;
  rawLog: string;
  rawTransaction?: string | undefined;
  rawTransactionReceipt?: string | undefined;
  rawBlock?: string | undefined;
}

export interface Data_EthBlock {
  block: { [key: string]: any } | undefined;
}

export interface Data_EthTransaction {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  transactionReceipt?: { [key: string]: any } | undefined;
  block?: { [key: string]: any } | undefined;
  trace?: { [key: string]: any } | undefined;
  rawTransaction: string;
  rawTransactionReceipt?: string | undefined;
  rawBlock?: string | undefined;
  rawTrace?: string | undefined;
}

export interface Data_EthTrace {
  trace: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  transaction?: { [key: string]: any } | undefined;
  transactionReceipt?: { [key: string]: any } | undefined;
  block?: { [key: string]: any } | undefined;
}

export interface Data_SolInstruction {
  instructionData: string;
  slot: bigint;
  programAccountId: string;
  accounts: string[];
  parsed?: { [key: string]: any } | undefined;
}

export interface Data_AptEvent {
  rawEvent: string;
  eventIndex: number;
  /** @deprecated */
  transaction: { [key: string]: any } | undefined;
  rawTransaction: string;
}

export interface Data_AptCall {
  /** @deprecated */
  transaction: { [key: string]: any } | undefined;
  rawTransaction: string;
}

export interface Data_AptResource {
  /** @deprecated */
  resources: { [key: string]: any }[];
  version: bigint;
  timestampMicros: bigint;
  rawResources: string[];
}

export interface Data_SuiEvent {
  /** @deprecated */
  transaction: { [key: string]: any } | undefined;
  rawEvent: string;
  rawTransaction: string;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiCall {
  /** @deprecated */
  transaction: { [key: string]: any } | undefined;
  rawTransaction: string;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiObject {
  /** @deprecated */
  objects: { [key: string]: any }[];
  /** @deprecated */
  self?: { [key: string]: any } | undefined;
  rawObjects: string[];
  rawSelf?: string | undefined;
  objectId: string;
  objectVersion: bigint;
  objectDigest: string;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiObjectChange {
  /** @deprecated */
  changes: { [key: string]: any }[];
  rawChanges: string[];
  timestamp: Date | undefined;
  txDigest: string;
  slot: bigint;
}

export interface Data_FuelReceipt {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  receiptIndex: bigint;
}

export interface Data_FuelTransaction {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

/** @deprecated */
export interface Data_FuelCall {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface Data_FuelBlock {
  block: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface Data_CosmosCall {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface Data_StarknetEvent {
  result: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface Data_BTCTransaction {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface Data_BTCBlock {
  block: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
}

export interface DataBinding {
  data: Data | undefined;
  handlerType: HandlerType;
  handlerIds: number[];
}

export interface StateResult {
  configUpdated: boolean;
  error?: string | undefined;
}

export interface ProcessResult {
  gauges: GaugeResult[];
  counters: CounterResult[];
  /** @deprecated */
  logs: LogResult[];
  events: EventTrackingResult[];
  exports: ExportResult[];
  states: StateResult | undefined;
}

export interface EthCallParam {
  context: EthCallContext | undefined;
  calldata: string;
}

export interface EthCallContext {
  chainId: string;
  address: string;
  blockTag: string;
}

export interface PreprocessResult {
  ethCallParams: EthCallParam[];
}

export interface PreparedData {
  ethCallResults: { [key: string]: string };
}

export interface PreparedData_EthCallResultsEntry {
  key: string;
  value: string;
}

export interface RecordMetaData {
  address: string;
  contractName: string;
  blockNumber: bigint;
  transactionHash: string;
  chainId: string;
  transactionIndex: number;
  logIndex: number;
  name: string;
  labels: { [key: string]: string };
}

export interface RecordMetaData_LabelsEntry {
  key: string;
  value: string;
}

export interface MetricValue {
  bigDecimal?: string | undefined;
  doubleValue?: number | undefined;
  bigInteger?: BigInteger | undefined;
}

export interface RuntimeInfo {
  from: HandlerType;
}

export interface GaugeResult {
  metadata: RecordMetaData | undefined;
  metricValue: MetricValue | undefined;
  runtimeInfo: RuntimeInfo | undefined;
}

export interface CounterResult {
  metadata: RecordMetaData | undefined;
  metricValue: MetricValue | undefined;
  add: boolean;
  runtimeInfo: RuntimeInfo | undefined;
}

/** @deprecated */
export interface LogResult {
  metadata: RecordMetaData | undefined;
  level: LogLevel;
  message: string;
  /** @deprecated */
  attributes: string;
  attributes2: { [key: string]: any } | undefined;
  runtimeInfo: RuntimeInfo | undefined;
}

export interface EventTrackingResult {
  metadata: RecordMetaData | undefined;
  distinctEntityId: string;
  attributes: { [key: string]: any } | undefined;
  severity: LogLevel;
  message: string;
  runtimeInfo: RuntimeInfo | undefined;
  attributes2: RichStruct | undefined;
  noMetric: boolean;
}

export interface ExportResult {
  metadata: RecordMetaData | undefined;
  payload: string;
  runtimeInfo: RuntimeInfo | undefined;
}

function createBaseProjectConfig(): ProjectConfig {
  return { name: "", version: "" };
}

export const ProjectConfig = {
  encode(message: ProjectConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.version !== "") {
      writer.uint32(26).string(message.version);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProjectConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.version = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProjectConfig {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      version: isSet(object.version) ? globalThis.String(object.version) : "",
    };
  },

  toJSON(message: ProjectConfig): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.version !== "") {
      obj.version = message.version;
    }
    return obj;
  },

  create(base?: DeepPartial<ProjectConfig>): ProjectConfig {
    return ProjectConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProjectConfig>): ProjectConfig {
    const message = createBaseProjectConfig();
    message.name = object.name ?? "";
    message.version = object.version ?? "";
    return message;
  },
};

function createBaseExecutionConfig(): ExecutionConfig {
  return {
    sequential: false,
    forceExactBlockTime: false,
    processBindingTimeout: 0,
    skipStartBlockValidation: false,
    rpcRetryTimes: 0,
    ethAbiDecoderConfig: undefined,
  };
}

export const ExecutionConfig = {
  encode(message: ExecutionConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequential !== false) {
      writer.uint32(8).bool(message.sequential);
    }
    if (message.forceExactBlockTime !== false) {
      writer.uint32(16).bool(message.forceExactBlockTime);
    }
    if (message.processBindingTimeout !== 0) {
      writer.uint32(24).int32(message.processBindingTimeout);
    }
    if (message.skipStartBlockValidation !== false) {
      writer.uint32(32).bool(message.skipStartBlockValidation);
    }
    if (message.rpcRetryTimes !== 0) {
      writer.uint32(40).int32(message.rpcRetryTimes);
    }
    if (message.ethAbiDecoderConfig !== undefined) {
      ExecutionConfig_DecoderWorkerConfig.encode(message.ethAbiDecoderConfig, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExecutionConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecutionConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.sequential = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.forceExactBlockTime = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.processBindingTimeout = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.skipStartBlockValidation = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.rpcRetryTimes = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.ethAbiDecoderConfig = ExecutionConfig_DecoderWorkerConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ExecutionConfig {
    return {
      sequential: isSet(object.sequential) ? globalThis.Boolean(object.sequential) : false,
      forceExactBlockTime: isSet(object.forceExactBlockTime) ? globalThis.Boolean(object.forceExactBlockTime) : false,
      processBindingTimeout: isSet(object.processBindingTimeout) ? globalThis.Number(object.processBindingTimeout) : 0,
      skipStartBlockValidation: isSet(object.skipStartBlockValidation)
        ? globalThis.Boolean(object.skipStartBlockValidation)
        : false,
      rpcRetryTimes: isSet(object.rpcRetryTimes) ? globalThis.Number(object.rpcRetryTimes) : 0,
      ethAbiDecoderConfig: isSet(object.ethAbiDecoderConfig)
        ? ExecutionConfig_DecoderWorkerConfig.fromJSON(object.ethAbiDecoderConfig)
        : undefined,
    };
  },

  toJSON(message: ExecutionConfig): unknown {
    const obj: any = {};
    if (message.sequential !== false) {
      obj.sequential = message.sequential;
    }
    if (message.forceExactBlockTime !== false) {
      obj.forceExactBlockTime = message.forceExactBlockTime;
    }
    if (message.processBindingTimeout !== 0) {
      obj.processBindingTimeout = Math.round(message.processBindingTimeout);
    }
    if (message.skipStartBlockValidation !== false) {
      obj.skipStartBlockValidation = message.skipStartBlockValidation;
    }
    if (message.rpcRetryTimes !== 0) {
      obj.rpcRetryTimes = Math.round(message.rpcRetryTimes);
    }
    if (message.ethAbiDecoderConfig !== undefined) {
      obj.ethAbiDecoderConfig = ExecutionConfig_DecoderWorkerConfig.toJSON(message.ethAbiDecoderConfig);
    }
    return obj;
  },

  create(base?: DeepPartial<ExecutionConfig>): ExecutionConfig {
    return ExecutionConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExecutionConfig>): ExecutionConfig {
    const message = createBaseExecutionConfig();
    message.sequential = object.sequential ?? false;
    message.forceExactBlockTime = object.forceExactBlockTime ?? false;
    message.processBindingTimeout = object.processBindingTimeout ?? 0;
    message.skipStartBlockValidation = object.skipStartBlockValidation ?? false;
    message.rpcRetryTimes = object.rpcRetryTimes ?? 0;
    message.ethAbiDecoderConfig = (object.ethAbiDecoderConfig !== undefined && object.ethAbiDecoderConfig !== null)
      ? ExecutionConfig_DecoderWorkerConfig.fromPartial(object.ethAbiDecoderConfig)
      : undefined;
    return message;
  },
};

function createBaseExecutionConfig_DecoderWorkerConfig(): ExecutionConfig_DecoderWorkerConfig {
  return { enabled: false, workerCount: undefined, skipWhenDecodeFailed: undefined };
}

export const ExecutionConfig_DecoderWorkerConfig = {
  encode(message: ExecutionConfig_DecoderWorkerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enabled !== false) {
      writer.uint32(8).bool(message.enabled);
    }
    if (message.workerCount !== undefined) {
      writer.uint32(16).int32(message.workerCount);
    }
    if (message.skipWhenDecodeFailed !== undefined) {
      writer.uint32(24).bool(message.skipWhenDecodeFailed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExecutionConfig_DecoderWorkerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecutionConfig_DecoderWorkerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enabled = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.workerCount = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.skipWhenDecodeFailed = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ExecutionConfig_DecoderWorkerConfig {
    return {
      enabled: isSet(object.enabled) ? globalThis.Boolean(object.enabled) : false,
      workerCount: isSet(object.workerCount) ? globalThis.Number(object.workerCount) : undefined,
      skipWhenDecodeFailed: isSet(object.skipWhenDecodeFailed)
        ? globalThis.Boolean(object.skipWhenDecodeFailed)
        : undefined,
    };
  },

  toJSON(message: ExecutionConfig_DecoderWorkerConfig): unknown {
    const obj: any = {};
    if (message.enabled !== false) {
      obj.enabled = message.enabled;
    }
    if (message.workerCount !== undefined) {
      obj.workerCount = Math.round(message.workerCount);
    }
    if (message.skipWhenDecodeFailed !== undefined) {
      obj.skipWhenDecodeFailed = message.skipWhenDecodeFailed;
    }
    return obj;
  },

  create(base?: DeepPartial<ExecutionConfig_DecoderWorkerConfig>): ExecutionConfig_DecoderWorkerConfig {
    return ExecutionConfig_DecoderWorkerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExecutionConfig_DecoderWorkerConfig>): ExecutionConfig_DecoderWorkerConfig {
    const message = createBaseExecutionConfig_DecoderWorkerConfig();
    message.enabled = object.enabled ?? false;
    message.workerCount = object.workerCount ?? undefined;
    message.skipWhenDecodeFailed = object.skipWhenDecodeFailed ?? undefined;
    return message;
  },
};

function createBaseProcessConfigRequest(): ProcessConfigRequest {
  return {};
}

export const ProcessConfigRequest = {
  encode(_: ProcessConfigRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessConfigRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessConfigRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ProcessConfigRequest {
    return {};
  },

  toJSON(_: ProcessConfigRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<ProcessConfigRequest>): ProcessConfigRequest {
    return ProcessConfigRequest.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<ProcessConfigRequest>): ProcessConfigRequest {
    const message = createBaseProcessConfigRequest();
    return message;
  },
};

function createBaseProcessConfigResponse(): ProcessConfigResponse {
  return {
    config: undefined,
    executionConfig: undefined,
    contractConfigs: [],
    templateInstances: [],
    accountConfigs: [],
    metricConfigs: [],
    eventTrackingConfigs: [],
    exportConfigs: [],
    eventLogConfigs: [],
    dbSchema: undefined,
  };
}

export const ProcessConfigResponse = {
  encode(message: ProcessConfigResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      ProjectConfig.encode(message.config, writer.uint32(10).fork()).ldelim();
    }
    if (message.executionConfig !== undefined) {
      ExecutionConfig.encode(message.executionConfig, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.contractConfigs) {
      ContractConfig.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.templateInstances) {
      TemplateInstance.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.accountConfigs) {
      AccountConfig.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.metricConfigs) {
      MetricConfig.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.eventTrackingConfigs) {
      EventTrackingConfig.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.exportConfigs) {
      ExportConfig.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.eventLogConfigs) {
      EventLogConfig.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    if (message.dbSchema !== undefined) {
      DataBaseSchema.encode(message.dbSchema, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessConfigResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessConfigResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.config = ProjectConfig.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.executionConfig = ExecutionConfig.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.contractConfigs.push(ContractConfig.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.templateInstances.push(TemplateInstance.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.accountConfigs.push(AccountConfig.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.metricConfigs.push(MetricConfig.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.eventTrackingConfigs.push(EventTrackingConfig.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.exportConfigs.push(ExportConfig.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.eventLogConfigs.push(EventLogConfig.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.dbSchema = DataBaseSchema.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessConfigResponse {
    return {
      config: isSet(object.config) ? ProjectConfig.fromJSON(object.config) : undefined,
      executionConfig: isSet(object.executionConfig) ? ExecutionConfig.fromJSON(object.executionConfig) : undefined,
      contractConfigs: globalThis.Array.isArray(object?.contractConfigs)
        ? object.contractConfigs.map((e: any) => ContractConfig.fromJSON(e))
        : [],
      templateInstances: globalThis.Array.isArray(object?.templateInstances)
        ? object.templateInstances.map((e: any) => TemplateInstance.fromJSON(e))
        : [],
      accountConfigs: globalThis.Array.isArray(object?.accountConfigs)
        ? object.accountConfigs.map((e: any) => AccountConfig.fromJSON(e))
        : [],
      metricConfigs: globalThis.Array.isArray(object?.metricConfigs)
        ? object.metricConfigs.map((e: any) => MetricConfig.fromJSON(e))
        : [],
      eventTrackingConfigs: globalThis.Array.isArray(object?.eventTrackingConfigs)
        ? object.eventTrackingConfigs.map((e: any) => EventTrackingConfig.fromJSON(e))
        : [],
      exportConfigs: globalThis.Array.isArray(object?.exportConfigs)
        ? object.exportConfigs.map((e: any) => ExportConfig.fromJSON(e))
        : [],
      eventLogConfigs: globalThis.Array.isArray(object?.eventLogConfigs)
        ? object.eventLogConfigs.map((e: any) => EventLogConfig.fromJSON(e))
        : [],
      dbSchema: isSet(object.dbSchema) ? DataBaseSchema.fromJSON(object.dbSchema) : undefined,
    };
  },

  toJSON(message: ProcessConfigResponse): unknown {
    const obj: any = {};
    if (message.config !== undefined) {
      obj.config = ProjectConfig.toJSON(message.config);
    }
    if (message.executionConfig !== undefined) {
      obj.executionConfig = ExecutionConfig.toJSON(message.executionConfig);
    }
    if (message.contractConfigs?.length) {
      obj.contractConfigs = message.contractConfigs.map((e) => ContractConfig.toJSON(e));
    }
    if (message.templateInstances?.length) {
      obj.templateInstances = message.templateInstances.map((e) => TemplateInstance.toJSON(e));
    }
    if (message.accountConfigs?.length) {
      obj.accountConfigs = message.accountConfigs.map((e) => AccountConfig.toJSON(e));
    }
    if (message.metricConfigs?.length) {
      obj.metricConfigs = message.metricConfigs.map((e) => MetricConfig.toJSON(e));
    }
    if (message.eventTrackingConfigs?.length) {
      obj.eventTrackingConfigs = message.eventTrackingConfigs.map((e) => EventTrackingConfig.toJSON(e));
    }
    if (message.exportConfigs?.length) {
      obj.exportConfigs = message.exportConfigs.map((e) => ExportConfig.toJSON(e));
    }
    if (message.eventLogConfigs?.length) {
      obj.eventLogConfigs = message.eventLogConfigs.map((e) => EventLogConfig.toJSON(e));
    }
    if (message.dbSchema !== undefined) {
      obj.dbSchema = DataBaseSchema.toJSON(message.dbSchema);
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessConfigResponse>): ProcessConfigResponse {
    return ProcessConfigResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessConfigResponse>): ProcessConfigResponse {
    const message = createBaseProcessConfigResponse();
    message.config = (object.config !== undefined && object.config !== null)
      ? ProjectConfig.fromPartial(object.config)
      : undefined;
    message.executionConfig = (object.executionConfig !== undefined && object.executionConfig !== null)
      ? ExecutionConfig.fromPartial(object.executionConfig)
      : undefined;
    message.contractConfigs = object.contractConfigs?.map((e) => ContractConfig.fromPartial(e)) || [];
    message.templateInstances = object.templateInstances?.map((e) => TemplateInstance.fromPartial(e)) || [];
    message.accountConfigs = object.accountConfigs?.map((e) => AccountConfig.fromPartial(e)) || [];
    message.metricConfigs = object.metricConfigs?.map((e) => MetricConfig.fromPartial(e)) || [];
    message.eventTrackingConfigs = object.eventTrackingConfigs?.map((e) => EventTrackingConfig.fromPartial(e)) || [];
    message.exportConfigs = object.exportConfigs?.map((e) => ExportConfig.fromPartial(e)) || [];
    message.eventLogConfigs = object.eventLogConfigs?.map((e) => EventLogConfig.fromPartial(e)) || [];
    message.dbSchema = (object.dbSchema !== undefined && object.dbSchema !== null)
      ? DataBaseSchema.fromPartial(object.dbSchema)
      : undefined;
    return message;
  },
};

function createBaseContractConfig(): ContractConfig {
  return {
    contract: undefined,
    intervalConfigs: [],
    moveIntervalConfigs: [],
    logConfigs: [],
    traceConfigs: [],
    transactionConfig: [],
    moveEventConfigs: [],
    moveCallConfigs: [],
    moveResourceChangeConfigs: [],
    fuelCallConfigs: [],
    fuelTransactionConfigs: [],
    assetConfigs: [],
    fuelLogConfigs: [],
    fuelReceiptConfigs: [],
    cosmosLogConfigs: [],
    starknetEventConfigs: [],
    btcTransactionConfigs: [],
    instructionConfig: undefined,
    startBlock: BigInt("0"),
    endBlock: BigInt("0"),
    processorType: "",
  };
}

export const ContractConfig = {
  encode(message: ContractConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.contract !== undefined) {
      ContractInfo.encode(message.contract, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.intervalConfigs) {
      OnIntervalConfig.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.moveIntervalConfigs) {
      MoveOnIntervalConfig.encode(v!, writer.uint32(154).fork()).ldelim();
    }
    for (const v of message.logConfigs) {
      LogHandlerConfig.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.traceConfigs) {
      TraceHandlerConfig.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.transactionConfig) {
      TransactionHandlerConfig.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.moveEventConfigs) {
      MoveEventHandlerConfig.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.moveCallConfigs) {
      MoveCallHandlerConfig.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.moveResourceChangeConfigs) {
      MoveResourceChangeConfig.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    for (const v of message.fuelCallConfigs) {
      FuelCallHandlerConfig.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    for (const v of message.fuelTransactionConfigs) {
      FuelTransactionHandlerConfig.encode(v!, writer.uint32(162).fork()).ldelim();
    }
    for (const v of message.assetConfigs) {
      FuelAssetHandlerConfig.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    for (const v of message.fuelLogConfigs) {
      FuelLogHandlerConfig.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    for (const v of message.fuelReceiptConfigs) {
      FuelReceiptHandlerConfig.encode(v!, writer.uint32(170).fork()).ldelim();
    }
    for (const v of message.cosmosLogConfigs) {
      CosmosLogHandlerConfig.encode(v!, writer.uint32(130).fork()).ldelim();
    }
    for (const v of message.starknetEventConfigs) {
      StarknetEventHandlerConfig.encode(v!, writer.uint32(138).fork()).ldelim();
    }
    for (const v of message.btcTransactionConfigs) {
      BTCTransactionHandlerConfig.encode(v!, writer.uint32(146).fork()).ldelim();
    }
    if (message.instructionConfig !== undefined) {
      InstructionHandlerConfig.encode(message.instructionConfig, writer.uint32(50).fork()).ldelim();
    }
    if (message.startBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.startBlock) !== message.startBlock) {
        throw new globalThis.Error("value provided for field message.startBlock of type uint64 too large");
      }
      writer.uint32(32).uint64(message.startBlock.toString());
    }
    if (message.endBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.endBlock) !== message.endBlock) {
        throw new globalThis.Error("value provided for field message.endBlock of type uint64 too large");
      }
      writer.uint32(40).uint64(message.endBlock.toString());
    }
    if (message.processorType !== "") {
      writer.uint32(66).string(message.processorType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContractConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.contract = ContractInfo.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.intervalConfigs.push(OnIntervalConfig.decode(reader, reader.uint32()));
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.moveIntervalConfigs.push(MoveOnIntervalConfig.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.logConfigs.push(LogHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.traceConfigs.push(TraceHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.transactionConfig.push(TransactionHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.moveEventConfigs.push(MoveEventHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.moveCallConfigs.push(MoveCallHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.moveResourceChangeConfigs.push(MoveResourceChangeConfig.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.fuelCallConfigs.push(FuelCallHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.fuelTransactionConfigs.push(FuelTransactionHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.assetConfigs.push(FuelAssetHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.fuelLogConfigs.push(FuelLogHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.fuelReceiptConfigs.push(FuelReceiptHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.cosmosLogConfigs.push(CosmosLogHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.starknetEventConfigs.push(StarknetEventHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.btcTransactionConfigs.push(BTCTransactionHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.instructionConfig = InstructionHandlerConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.startBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.endBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.processorType = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ContractConfig {
    return {
      contract: isSet(object.contract) ? ContractInfo.fromJSON(object.contract) : undefined,
      intervalConfigs: globalThis.Array.isArray(object?.intervalConfigs)
        ? object.intervalConfigs.map((e: any) => OnIntervalConfig.fromJSON(e))
        : [],
      moveIntervalConfigs: globalThis.Array.isArray(object?.moveIntervalConfigs)
        ? object.moveIntervalConfigs.map((e: any) => MoveOnIntervalConfig.fromJSON(e))
        : [],
      logConfigs: globalThis.Array.isArray(object?.logConfigs)
        ? object.logConfigs.map((e: any) => LogHandlerConfig.fromJSON(e))
        : [],
      traceConfigs: globalThis.Array.isArray(object?.traceConfigs)
        ? object.traceConfigs.map((e: any) => TraceHandlerConfig.fromJSON(e))
        : [],
      transactionConfig: globalThis.Array.isArray(object?.transactionConfig)
        ? object.transactionConfig.map((e: any) => TransactionHandlerConfig.fromJSON(e))
        : [],
      moveEventConfigs: globalThis.Array.isArray(object?.moveEventConfigs)
        ? object.moveEventConfigs.map((e: any) => MoveEventHandlerConfig.fromJSON(e))
        : [],
      moveCallConfigs: globalThis.Array.isArray(object?.moveCallConfigs)
        ? object.moveCallConfigs.map((e: any) => MoveCallHandlerConfig.fromJSON(e))
        : [],
      moveResourceChangeConfigs: globalThis.Array.isArray(object?.moveResourceChangeConfigs)
        ? object.moveResourceChangeConfigs.map((e: any) => MoveResourceChangeConfig.fromJSON(e))
        : [],
      fuelCallConfigs: globalThis.Array.isArray(object?.fuelCallConfigs)
        ? object.fuelCallConfigs.map((e: any) => FuelCallHandlerConfig.fromJSON(e))
        : [],
      fuelTransactionConfigs: globalThis.Array.isArray(object?.fuelTransactionConfigs)
        ? object.fuelTransactionConfigs.map((e: any) => FuelTransactionHandlerConfig.fromJSON(e))
        : [],
      assetConfigs: globalThis.Array.isArray(object?.assetConfigs)
        ? object.assetConfigs.map((e: any) => FuelAssetHandlerConfig.fromJSON(e))
        : [],
      fuelLogConfigs: globalThis.Array.isArray(object?.fuelLogConfigs)
        ? object.fuelLogConfigs.map((e: any) => FuelLogHandlerConfig.fromJSON(e))
        : [],
      fuelReceiptConfigs: globalThis.Array.isArray(object?.fuelReceiptConfigs)
        ? object.fuelReceiptConfigs.map((e: any) => FuelReceiptHandlerConfig.fromJSON(e))
        : [],
      cosmosLogConfigs: globalThis.Array.isArray(object?.cosmosLogConfigs)
        ? object.cosmosLogConfigs.map((e: any) => CosmosLogHandlerConfig.fromJSON(e))
        : [],
      starknetEventConfigs: globalThis.Array.isArray(object?.starknetEventConfigs)
        ? object.starknetEventConfigs.map((e: any) => StarknetEventHandlerConfig.fromJSON(e))
        : [],
      btcTransactionConfigs: globalThis.Array.isArray(object?.btcTransactionConfigs)
        ? object.btcTransactionConfigs.map((e: any) => BTCTransactionHandlerConfig.fromJSON(e))
        : [],
      instructionConfig: isSet(object.instructionConfig)
        ? InstructionHandlerConfig.fromJSON(object.instructionConfig)
        : undefined,
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      endBlock: isSet(object.endBlock) ? BigInt(object.endBlock) : BigInt("0"),
      processorType: isSet(object.processorType) ? globalThis.String(object.processorType) : "",
    };
  },

  toJSON(message: ContractConfig): unknown {
    const obj: any = {};
    if (message.contract !== undefined) {
      obj.contract = ContractInfo.toJSON(message.contract);
    }
    if (message.intervalConfigs?.length) {
      obj.intervalConfigs = message.intervalConfigs.map((e) => OnIntervalConfig.toJSON(e));
    }
    if (message.moveIntervalConfigs?.length) {
      obj.moveIntervalConfigs = message.moveIntervalConfigs.map((e) => MoveOnIntervalConfig.toJSON(e));
    }
    if (message.logConfigs?.length) {
      obj.logConfigs = message.logConfigs.map((e) => LogHandlerConfig.toJSON(e));
    }
    if (message.traceConfigs?.length) {
      obj.traceConfigs = message.traceConfigs.map((e) => TraceHandlerConfig.toJSON(e));
    }
    if (message.transactionConfig?.length) {
      obj.transactionConfig = message.transactionConfig.map((e) => TransactionHandlerConfig.toJSON(e));
    }
    if (message.moveEventConfigs?.length) {
      obj.moveEventConfigs = message.moveEventConfigs.map((e) => MoveEventHandlerConfig.toJSON(e));
    }
    if (message.moveCallConfigs?.length) {
      obj.moveCallConfigs = message.moveCallConfigs.map((e) => MoveCallHandlerConfig.toJSON(e));
    }
    if (message.moveResourceChangeConfigs?.length) {
      obj.moveResourceChangeConfigs = message.moveResourceChangeConfigs.map((e) => MoveResourceChangeConfig.toJSON(e));
    }
    if (message.fuelCallConfigs?.length) {
      obj.fuelCallConfigs = message.fuelCallConfigs.map((e) => FuelCallHandlerConfig.toJSON(e));
    }
    if (message.fuelTransactionConfigs?.length) {
      obj.fuelTransactionConfigs = message.fuelTransactionConfigs.map((e) => FuelTransactionHandlerConfig.toJSON(e));
    }
    if (message.assetConfigs?.length) {
      obj.assetConfigs = message.assetConfigs.map((e) => FuelAssetHandlerConfig.toJSON(e));
    }
    if (message.fuelLogConfigs?.length) {
      obj.fuelLogConfigs = message.fuelLogConfigs.map((e) => FuelLogHandlerConfig.toJSON(e));
    }
    if (message.fuelReceiptConfigs?.length) {
      obj.fuelReceiptConfigs = message.fuelReceiptConfigs.map((e) => FuelReceiptHandlerConfig.toJSON(e));
    }
    if (message.cosmosLogConfigs?.length) {
      obj.cosmosLogConfigs = message.cosmosLogConfigs.map((e) => CosmosLogHandlerConfig.toJSON(e));
    }
    if (message.starknetEventConfigs?.length) {
      obj.starknetEventConfigs = message.starknetEventConfigs.map((e) => StarknetEventHandlerConfig.toJSON(e));
    }
    if (message.btcTransactionConfigs?.length) {
      obj.btcTransactionConfigs = message.btcTransactionConfigs.map((e) => BTCTransactionHandlerConfig.toJSON(e));
    }
    if (message.instructionConfig !== undefined) {
      obj.instructionConfig = InstructionHandlerConfig.toJSON(message.instructionConfig);
    }
    if (message.startBlock !== BigInt("0")) {
      obj.startBlock = message.startBlock.toString();
    }
    if (message.endBlock !== BigInt("0")) {
      obj.endBlock = message.endBlock.toString();
    }
    if (message.processorType !== "") {
      obj.processorType = message.processorType;
    }
    return obj;
  },

  create(base?: DeepPartial<ContractConfig>): ContractConfig {
    return ContractConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ContractConfig>): ContractConfig {
    const message = createBaseContractConfig();
    message.contract = (object.contract !== undefined && object.contract !== null)
      ? ContractInfo.fromPartial(object.contract)
      : undefined;
    message.intervalConfigs = object.intervalConfigs?.map((e) => OnIntervalConfig.fromPartial(e)) || [];
    message.moveIntervalConfigs = object.moveIntervalConfigs?.map((e) => MoveOnIntervalConfig.fromPartial(e)) || [];
    message.logConfigs = object.logConfigs?.map((e) => LogHandlerConfig.fromPartial(e)) || [];
    message.traceConfigs = object.traceConfigs?.map((e) => TraceHandlerConfig.fromPartial(e)) || [];
    message.transactionConfig = object.transactionConfig?.map((e) => TransactionHandlerConfig.fromPartial(e)) || [];
    message.moveEventConfigs = object.moveEventConfigs?.map((e) => MoveEventHandlerConfig.fromPartial(e)) || [];
    message.moveCallConfigs = object.moveCallConfigs?.map((e) => MoveCallHandlerConfig.fromPartial(e)) || [];
    message.moveResourceChangeConfigs =
      object.moveResourceChangeConfigs?.map((e) => MoveResourceChangeConfig.fromPartial(e)) || [];
    message.fuelCallConfigs = object.fuelCallConfigs?.map((e) => FuelCallHandlerConfig.fromPartial(e)) || [];
    message.fuelTransactionConfigs =
      object.fuelTransactionConfigs?.map((e) => FuelTransactionHandlerConfig.fromPartial(e)) || [];
    message.assetConfigs = object.assetConfigs?.map((e) => FuelAssetHandlerConfig.fromPartial(e)) || [];
    message.fuelLogConfigs = object.fuelLogConfigs?.map((e) => FuelLogHandlerConfig.fromPartial(e)) || [];
    message.fuelReceiptConfigs = object.fuelReceiptConfigs?.map((e) => FuelReceiptHandlerConfig.fromPartial(e)) || [];
    message.cosmosLogConfigs = object.cosmosLogConfigs?.map((e) => CosmosLogHandlerConfig.fromPartial(e)) || [];
    message.starknetEventConfigs = object.starknetEventConfigs?.map((e) => StarknetEventHandlerConfig.fromPartial(e)) ||
      [];
    message.btcTransactionConfigs =
      object.btcTransactionConfigs?.map((e) => BTCTransactionHandlerConfig.fromPartial(e)) || [];
    message.instructionConfig = (object.instructionConfig !== undefined && object.instructionConfig !== null)
      ? InstructionHandlerConfig.fromPartial(object.instructionConfig)
      : undefined;
    message.startBlock = object.startBlock ?? BigInt("0");
    message.endBlock = object.endBlock ?? BigInt("0");
    message.processorType = object.processorType ?? "";
    return message;
  },
};

function createBaseDataBaseSchema(): DataBaseSchema {
  return { gqlSchema: "" };
}

export const DataBaseSchema = {
  encode(message: DataBaseSchema, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gqlSchema !== "") {
      writer.uint32(10).string(message.gqlSchema);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataBaseSchema {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataBaseSchema();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gqlSchema = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DataBaseSchema {
    return { gqlSchema: isSet(object.gqlSchema) ? globalThis.String(object.gqlSchema) : "" };
  },

  toJSON(message: DataBaseSchema): unknown {
    const obj: any = {};
    if (message.gqlSchema !== "") {
      obj.gqlSchema = message.gqlSchema;
    }
    return obj;
  },

  create(base?: DeepPartial<DataBaseSchema>): DataBaseSchema {
    return DataBaseSchema.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DataBaseSchema>): DataBaseSchema {
    const message = createBaseDataBaseSchema();
    message.gqlSchema = object.gqlSchema ?? "";
    return message;
  },
};

function createBaseTotalPerEntityAggregation(): TotalPerEntityAggregation {
  return {};
}

export const TotalPerEntityAggregation = {
  encode(_: TotalPerEntityAggregation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TotalPerEntityAggregation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTotalPerEntityAggregation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): TotalPerEntityAggregation {
    return {};
  },

  toJSON(_: TotalPerEntityAggregation): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<TotalPerEntityAggregation>): TotalPerEntityAggregation {
    return TotalPerEntityAggregation.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<TotalPerEntityAggregation>): TotalPerEntityAggregation {
    const message = createBaseTotalPerEntityAggregation();
    return message;
  },
};

function createBaseRetentionConfig(): RetentionConfig {
  return { retentionEventName: "", days: 0 };
}

export const RetentionConfig = {
  encode(message: RetentionConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.retentionEventName !== "") {
      writer.uint32(18).string(message.retentionEventName);
    }
    if (message.days !== 0) {
      writer.uint32(24).int32(message.days);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetentionConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.retentionEventName = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.days = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetentionConfig {
    return {
      retentionEventName: isSet(object.retentionEventName) ? globalThis.String(object.retentionEventName) : "",
      days: isSet(object.days) ? globalThis.Number(object.days) : 0,
    };
  },

  toJSON(message: RetentionConfig): unknown {
    const obj: any = {};
    if (message.retentionEventName !== "") {
      obj.retentionEventName = message.retentionEventName;
    }
    if (message.days !== 0) {
      obj.days = Math.round(message.days);
    }
    return obj;
  },

  create(base?: DeepPartial<RetentionConfig>): RetentionConfig {
    return RetentionConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RetentionConfig>): RetentionConfig {
    const message = createBaseRetentionConfig();
    message.retentionEventName = object.retentionEventName ?? "";
    message.days = object.days ?? 0;
    return message;
  },
};

function createBaseEventTrackingConfig(): EventTrackingConfig {
  return {
    eventName: "",
    totalByDay: false,
    unique: false,
    totalPerEntity: undefined,
    distinctAggregationByDays: [],
    retentionConfig: undefined,
  };
}

export const EventTrackingConfig = {
  encode(message: EventTrackingConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventName !== "") {
      writer.uint32(10).string(message.eventName);
    }
    if (message.totalByDay !== false) {
      writer.uint32(16).bool(message.totalByDay);
    }
    if (message.unique !== false) {
      writer.uint32(24).bool(message.unique);
    }
    if (message.totalPerEntity !== undefined) {
      TotalPerEntityAggregation.encode(message.totalPerEntity, writer.uint32(34).fork()).ldelim();
    }
    writer.uint32(42).fork();
    for (const v of message.distinctAggregationByDays) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.retentionConfig !== undefined) {
      RetentionConfig.encode(message.retentionConfig, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventTrackingConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTrackingConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eventName = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.totalByDay = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.unique = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.totalPerEntity = TotalPerEntityAggregation.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag === 40) {
            message.distinctAggregationByDays.push(reader.int32());

            continue;
          }

          if (tag === 42) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.distinctAggregationByDays.push(reader.int32());
            }

            continue;
          }

          break;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.retentionConfig = RetentionConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventTrackingConfig {
    return {
      eventName: isSet(object.eventName) ? globalThis.String(object.eventName) : "",
      totalByDay: isSet(object.totalByDay) ? globalThis.Boolean(object.totalByDay) : false,
      unique: isSet(object.unique) ? globalThis.Boolean(object.unique) : false,
      totalPerEntity: isSet(object.totalPerEntity)
        ? TotalPerEntityAggregation.fromJSON(object.totalPerEntity)
        : undefined,
      distinctAggregationByDays: globalThis.Array.isArray(object?.distinctAggregationByDays)
        ? object.distinctAggregationByDays.map((e: any) => globalThis.Number(e))
        : [],
      retentionConfig: isSet(object.retentionConfig) ? RetentionConfig.fromJSON(object.retentionConfig) : undefined,
    };
  },

  toJSON(message: EventTrackingConfig): unknown {
    const obj: any = {};
    if (message.eventName !== "") {
      obj.eventName = message.eventName;
    }
    if (message.totalByDay !== false) {
      obj.totalByDay = message.totalByDay;
    }
    if (message.unique !== false) {
      obj.unique = message.unique;
    }
    if (message.totalPerEntity !== undefined) {
      obj.totalPerEntity = TotalPerEntityAggregation.toJSON(message.totalPerEntity);
    }
    if (message.distinctAggregationByDays?.length) {
      obj.distinctAggregationByDays = message.distinctAggregationByDays.map((e) => Math.round(e));
    }
    if (message.retentionConfig !== undefined) {
      obj.retentionConfig = RetentionConfig.toJSON(message.retentionConfig);
    }
    return obj;
  },

  create(base?: DeepPartial<EventTrackingConfig>): EventTrackingConfig {
    return EventTrackingConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventTrackingConfig>): EventTrackingConfig {
    const message = createBaseEventTrackingConfig();
    message.eventName = object.eventName ?? "";
    message.totalByDay = object.totalByDay ?? false;
    message.unique = object.unique ?? false;
    message.totalPerEntity = (object.totalPerEntity !== undefined && object.totalPerEntity !== null)
      ? TotalPerEntityAggregation.fromPartial(object.totalPerEntity)
      : undefined;
    message.distinctAggregationByDays = object.distinctAggregationByDays?.map((e) => e) || [];
    message.retentionConfig = (object.retentionConfig !== undefined && object.retentionConfig !== null)
      ? RetentionConfig.fromPartial(object.retentionConfig)
      : undefined;
    return message;
  },
};

function createBaseExportConfig(): ExportConfig {
  return { name: "", channel: "" };
}

export const ExportConfig = {
  encode(message: ExportConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.channel !== "") {
      writer.uint32(18).string(message.channel);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExportConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExportConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.channel = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ExportConfig {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      channel: isSet(object.channel) ? globalThis.String(object.channel) : "",
    };
  },

  toJSON(message: ExportConfig): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.channel !== "") {
      obj.channel = message.channel;
    }
    return obj;
  },

  create(base?: DeepPartial<ExportConfig>): ExportConfig {
    return ExportConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExportConfig>): ExportConfig {
    const message = createBaseExportConfig();
    message.name = object.name ?? "";
    message.channel = object.channel ?? "";
    return message;
  },
};

function createBaseMetricConfig(): MetricConfig {
  return {
    name: "",
    description: "",
    unit: "",
    sparse: false,
    persistentBetweenVersion: false,
    type: 0,
    aggregationConfig: undefined,
  };
}

export const MetricConfig = {
  encode(message: MetricConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.unit !== "") {
      writer.uint32(18).string(message.unit);
    }
    if (message.sparse !== false) {
      writer.uint32(32).bool(message.sparse);
    }
    if (message.persistentBetweenVersion !== false) {
      writer.uint32(40).bool(message.persistentBetweenVersion);
    }
    if (message.type !== 0) {
      writer.uint32(56).int32(message.type);
    }
    if (message.aggregationConfig !== undefined) {
      AggregationConfig.encode(message.aggregationConfig, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MetricConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetricConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.unit = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.sparse = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.persistentBetweenVersion = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.aggregationConfig = AggregationConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MetricConfig {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
      unit: isSet(object.unit) ? globalThis.String(object.unit) : "",
      sparse: isSet(object.sparse) ? globalThis.Boolean(object.sparse) : false,
      persistentBetweenVersion: isSet(object.persistentBetweenVersion)
        ? globalThis.Boolean(object.persistentBetweenVersion)
        : false,
      type: isSet(object.type) ? metricTypeFromJSON(object.type) : 0,
      aggregationConfig: isSet(object.aggregationConfig)
        ? AggregationConfig.fromJSON(object.aggregationConfig)
        : undefined,
    };
  },

  toJSON(message: MetricConfig): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    if (message.unit !== "") {
      obj.unit = message.unit;
    }
    if (message.sparse !== false) {
      obj.sparse = message.sparse;
    }
    if (message.persistentBetweenVersion !== false) {
      obj.persistentBetweenVersion = message.persistentBetweenVersion;
    }
    if (message.type !== 0) {
      obj.type = metricTypeToJSON(message.type);
    }
    if (message.aggregationConfig !== undefined) {
      obj.aggregationConfig = AggregationConfig.toJSON(message.aggregationConfig);
    }
    return obj;
  },

  create(base?: DeepPartial<MetricConfig>): MetricConfig {
    return MetricConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MetricConfig>): MetricConfig {
    const message = createBaseMetricConfig();
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.unit = object.unit ?? "";
    message.sparse = object.sparse ?? false;
    message.persistentBetweenVersion = object.persistentBetweenVersion ?? false;
    message.type = object.type ?? 0;
    message.aggregationConfig = (object.aggregationConfig !== undefined && object.aggregationConfig !== null)
      ? AggregationConfig.fromPartial(object.aggregationConfig)
      : undefined;
    return message;
  },
};

function createBaseEventLogConfig(): EventLogConfig {
  return { name: "", fields: [] };
}

export const EventLogConfig = {
  encode(message: EventLogConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    for (const v of message.fields) {
      EventLogConfig_Field.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fields.push(EventLogConfig_Field.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      fields: globalThis.Array.isArray(object?.fields)
        ? object.fields.map((e: any) => EventLogConfig_Field.fromJSON(e))
        : [],
    };
  },

  toJSON(message: EventLogConfig): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.fields?.length) {
      obj.fields = message.fields.map((e) => EventLogConfig_Field.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogConfig>): EventLogConfig {
    return EventLogConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogConfig>): EventLogConfig {
    const message = createBaseEventLogConfig();
    message.name = object.name ?? "";
    message.fields = object.fields?.map((e) => EventLogConfig_Field.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEventLogConfig_StructFieldType(): EventLogConfig_StructFieldType {
  return { fields: [] };
}

export const EventLogConfig_StructFieldType = {
  encode(message: EventLogConfig_StructFieldType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.fields) {
      EventLogConfig_Field.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogConfig_StructFieldType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig_StructFieldType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fields.push(EventLogConfig_Field.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig_StructFieldType {
    return {
      fields: globalThis.Array.isArray(object?.fields)
        ? object.fields.map((e: any) => EventLogConfig_Field.fromJSON(e))
        : [],
    };
  },

  toJSON(message: EventLogConfig_StructFieldType): unknown {
    const obj: any = {};
    if (message.fields?.length) {
      obj.fields = message.fields.map((e) => EventLogConfig_Field.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogConfig_StructFieldType>): EventLogConfig_StructFieldType {
    return EventLogConfig_StructFieldType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogConfig_StructFieldType>): EventLogConfig_StructFieldType {
    const message = createBaseEventLogConfig_StructFieldType();
    message.fields = object.fields?.map((e) => EventLogConfig_Field.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEventLogConfig_Field(): EventLogConfig_Field {
  return { name: "", basicType: undefined, coinType: undefined, structType: undefined };
}

export const EventLogConfig_Field = {
  encode(message: EventLogConfig_Field, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.basicType !== undefined) {
      writer.uint32(16).int32(message.basicType);
    }
    if (message.coinType !== undefined) {
      CoinID.encode(message.coinType, writer.uint32(26).fork()).ldelim();
    }
    if (message.structType !== undefined) {
      EventLogConfig_StructFieldType.encode(message.structType, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogConfig_Field {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig_Field();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.basicType = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.coinType = CoinID.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.structType = EventLogConfig_StructFieldType.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig_Field {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      basicType: isSet(object.basicType) ? eventLogConfig_BasicFieldTypeFromJSON(object.basicType) : undefined,
      coinType: isSet(object.coinType) ? CoinID.fromJSON(object.coinType) : undefined,
      structType: isSet(object.structType) ? EventLogConfig_StructFieldType.fromJSON(object.structType) : undefined,
    };
  },

  toJSON(message: EventLogConfig_Field): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.basicType !== undefined) {
      obj.basicType = eventLogConfig_BasicFieldTypeToJSON(message.basicType);
    }
    if (message.coinType !== undefined) {
      obj.coinType = CoinID.toJSON(message.coinType);
    }
    if (message.structType !== undefined) {
      obj.structType = EventLogConfig_StructFieldType.toJSON(message.structType);
    }
    return obj;
  },

  create(base?: DeepPartial<EventLogConfig_Field>): EventLogConfig_Field {
    return EventLogConfig_Field.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogConfig_Field>): EventLogConfig_Field {
    const message = createBaseEventLogConfig_Field();
    message.name = object.name ?? "";
    message.basicType = object.basicType ?? undefined;
    message.coinType = (object.coinType !== undefined && object.coinType !== null)
      ? CoinID.fromPartial(object.coinType)
      : undefined;
    message.structType = (object.structType !== undefined && object.structType !== null)
      ? EventLogConfig_StructFieldType.fromPartial(object.structType)
      : undefined;
    return message;
  },
};

function createBaseAggregationConfig(): AggregationConfig {
  return { intervalInMinutes: [], types: [], discardOrigin: false };
}

export const AggregationConfig = {
  encode(message: AggregationConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.intervalInMinutes) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(18).fork();
    for (const v of message.types) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.discardOrigin !== false) {
      writer.uint32(24).bool(message.discardOrigin);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AggregationConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAggregationConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.intervalInMinutes.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.intervalInMinutes.push(reader.int32());
            }

            continue;
          }

          break;
        case 2:
          if (tag === 16) {
            message.types.push(reader.int32() as any);

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.types.push(reader.int32() as any);
            }

            continue;
          }

          break;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.discardOrigin = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AggregationConfig {
    return {
      intervalInMinutes: globalThis.Array.isArray(object?.intervalInMinutes)
        ? object.intervalInMinutes.map((e: any) => globalThis.Number(e))
        : [],
      types: globalThis.Array.isArray(object?.types) ? object.types.map((e: any) => aggregationTypeFromJSON(e)) : [],
      discardOrigin: isSet(object.discardOrigin) ? globalThis.Boolean(object.discardOrigin) : false,
    };
  },

  toJSON(message: AggregationConfig): unknown {
    const obj: any = {};
    if (message.intervalInMinutes?.length) {
      obj.intervalInMinutes = message.intervalInMinutes.map((e) => Math.round(e));
    }
    if (message.types?.length) {
      obj.types = message.types.map((e) => aggregationTypeToJSON(e));
    }
    if (message.discardOrigin !== false) {
      obj.discardOrigin = message.discardOrigin;
    }
    return obj;
  },

  create(base?: DeepPartial<AggregationConfig>): AggregationConfig {
    return AggregationConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AggregationConfig>): AggregationConfig {
    const message = createBaseAggregationConfig();
    message.intervalInMinutes = object.intervalInMinutes?.map((e) => e) || [];
    message.types = object.types?.map((e) => e) || [];
    message.discardOrigin = object.discardOrigin ?? false;
    return message;
  },
};

function createBaseAccountConfig(): AccountConfig {
  return {
    chainId: "",
    address: "",
    startBlock: BigInt("0"),
    endBlock: BigInt("0"),
    intervalConfigs: [],
    aptosIntervalConfigs: [],
    moveIntervalConfigs: [],
    moveCallConfigs: [],
    moveResourceChangeConfigs: [],
    logConfigs: [],
  };
}

export const AccountConfig = {
  encode(message: AccountConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    if (message.startBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.startBlock) !== message.startBlock) {
        throw new globalThis.Error("value provided for field message.startBlock of type uint64 too large");
      }
      writer.uint32(24).uint64(message.startBlock.toString());
    }
    if (message.endBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.endBlock) !== message.endBlock) {
        throw new globalThis.Error("value provided for field message.endBlock of type uint64 too large");
      }
      writer.uint32(80).uint64(message.endBlock.toString());
    }
    for (const v of message.intervalConfigs) {
      OnIntervalConfig.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.aptosIntervalConfigs) {
      AptosOnIntervalConfig.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.moveIntervalConfigs) {
      MoveOnIntervalConfig.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.moveCallConfigs) {
      MoveCallHandlerConfig.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.moveResourceChangeConfigs) {
      MoveResourceChangeConfig.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.logConfigs) {
      LogHandlerConfig.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccountConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccountConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.startBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.endBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.intervalConfigs.push(OnIntervalConfig.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.aptosIntervalConfigs.push(AptosOnIntervalConfig.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.moveIntervalConfigs.push(MoveOnIntervalConfig.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.moveCallConfigs.push(MoveCallHandlerConfig.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.moveResourceChangeConfigs.push(MoveResourceChangeConfig.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.logConfigs.push(LogHandlerConfig.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AccountConfig {
    return {
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      endBlock: isSet(object.endBlock) ? BigInt(object.endBlock) : BigInt("0"),
      intervalConfigs: globalThis.Array.isArray(object?.intervalConfigs)
        ? object.intervalConfigs.map((e: any) => OnIntervalConfig.fromJSON(e))
        : [],
      aptosIntervalConfigs: globalThis.Array.isArray(object?.aptosIntervalConfigs)
        ? object.aptosIntervalConfigs.map((e: any) => AptosOnIntervalConfig.fromJSON(e))
        : [],
      moveIntervalConfigs: globalThis.Array.isArray(object?.moveIntervalConfigs)
        ? object.moveIntervalConfigs.map((e: any) => MoveOnIntervalConfig.fromJSON(e))
        : [],
      moveCallConfigs: globalThis.Array.isArray(object?.moveCallConfigs)
        ? object.moveCallConfigs.map((e: any) => MoveCallHandlerConfig.fromJSON(e))
        : [],
      moveResourceChangeConfigs: globalThis.Array.isArray(object?.moveResourceChangeConfigs)
        ? object.moveResourceChangeConfigs.map((e: any) => MoveResourceChangeConfig.fromJSON(e))
        : [],
      logConfigs: globalThis.Array.isArray(object?.logConfigs)
        ? object.logConfigs.map((e: any) => LogHandlerConfig.fromJSON(e))
        : [],
    };
  },

  toJSON(message: AccountConfig): unknown {
    const obj: any = {};
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.startBlock !== BigInt("0")) {
      obj.startBlock = message.startBlock.toString();
    }
    if (message.endBlock !== BigInt("0")) {
      obj.endBlock = message.endBlock.toString();
    }
    if (message.intervalConfigs?.length) {
      obj.intervalConfigs = message.intervalConfigs.map((e) => OnIntervalConfig.toJSON(e));
    }
    if (message.aptosIntervalConfigs?.length) {
      obj.aptosIntervalConfigs = message.aptosIntervalConfigs.map((e) => AptosOnIntervalConfig.toJSON(e));
    }
    if (message.moveIntervalConfigs?.length) {
      obj.moveIntervalConfigs = message.moveIntervalConfigs.map((e) => MoveOnIntervalConfig.toJSON(e));
    }
    if (message.moveCallConfigs?.length) {
      obj.moveCallConfigs = message.moveCallConfigs.map((e) => MoveCallHandlerConfig.toJSON(e));
    }
    if (message.moveResourceChangeConfigs?.length) {
      obj.moveResourceChangeConfigs = message.moveResourceChangeConfigs.map((e) => MoveResourceChangeConfig.toJSON(e));
    }
    if (message.logConfigs?.length) {
      obj.logConfigs = message.logConfigs.map((e) => LogHandlerConfig.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<AccountConfig>): AccountConfig {
    return AccountConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AccountConfig>): AccountConfig {
    const message = createBaseAccountConfig();
    message.chainId = object.chainId ?? "";
    message.address = object.address ?? "";
    message.startBlock = object.startBlock ?? BigInt("0");
    message.endBlock = object.endBlock ?? BigInt("0");
    message.intervalConfigs = object.intervalConfigs?.map((e) => OnIntervalConfig.fromPartial(e)) || [];
    message.aptosIntervalConfigs = object.aptosIntervalConfigs?.map((e) => AptosOnIntervalConfig.fromPartial(e)) || [];
    message.moveIntervalConfigs = object.moveIntervalConfigs?.map((e) => MoveOnIntervalConfig.fromPartial(e)) || [];
    message.moveCallConfigs = object.moveCallConfigs?.map((e) => MoveCallHandlerConfig.fromPartial(e)) || [];
    message.moveResourceChangeConfigs =
      object.moveResourceChangeConfigs?.map((e) => MoveResourceChangeConfig.fromPartial(e)) || [];
    message.logConfigs = object.logConfigs?.map((e) => LogHandlerConfig.fromPartial(e)) || [];
    return message;
  },
};

function createBaseHandleInterval(): HandleInterval {
  return { recentInterval: 0, backfillInterval: 0 };
}

export const HandleInterval = {
  encode(message: HandleInterval, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.recentInterval !== 0) {
      writer.uint32(8).int32(message.recentInterval);
    }
    if (message.backfillInterval !== 0) {
      writer.uint32(16).int32(message.backfillInterval);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HandleInterval {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHandleInterval();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.recentInterval = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.backfillInterval = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): HandleInterval {
    return {
      recentInterval: isSet(object.recentInterval) ? globalThis.Number(object.recentInterval) : 0,
      backfillInterval: isSet(object.backfillInterval) ? globalThis.Number(object.backfillInterval) : 0,
    };
  },

  toJSON(message: HandleInterval): unknown {
    const obj: any = {};
    if (message.recentInterval !== 0) {
      obj.recentInterval = Math.round(message.recentInterval);
    }
    if (message.backfillInterval !== 0) {
      obj.backfillInterval = Math.round(message.backfillInterval);
    }
    return obj;
  },

  create(base?: DeepPartial<HandleInterval>): HandleInterval {
    return HandleInterval.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<HandleInterval>): HandleInterval {
    const message = createBaseHandleInterval();
    message.recentInterval = object.recentInterval ?? 0;
    message.backfillInterval = object.backfillInterval ?? 0;
    return message;
  },
};

function createBaseOnIntervalConfig(): OnIntervalConfig {
  return {
    handlerId: 0,
    minutes: 0,
    minutesInterval: undefined,
    slot: 0,
    slotInterval: undefined,
    fetchConfig: undefined,
    handlerName: "",
  };
}

export const OnIntervalConfig = {
  encode(message: OnIntervalConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.handlerId !== 0) {
      writer.uint32(8).int32(message.handlerId);
    }
    if (message.minutes !== 0) {
      writer.uint32(16).int32(message.minutes);
    }
    if (message.minutesInterval !== undefined) {
      HandleInterval.encode(message.minutesInterval, writer.uint32(34).fork()).ldelim();
    }
    if (message.slot !== 0) {
      writer.uint32(24).int32(message.slot);
    }
    if (message.slotInterval !== undefined) {
      HandleInterval.encode(message.slotInterval, writer.uint32(42).fork()).ldelim();
    }
    if (message.fetchConfig !== undefined) {
      EthFetchConfig.encode(message.fetchConfig, writer.uint32(50).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(58).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OnIntervalConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.minutes = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.minutesInterval = HandleInterval.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.slot = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.slotInterval = HandleInterval.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): OnIntervalConfig {
    return {
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      minutes: isSet(object.minutes) ? globalThis.Number(object.minutes) : 0,
      minutesInterval: isSet(object.minutesInterval) ? HandleInterval.fromJSON(object.minutesInterval) : undefined,
      slot: isSet(object.slot) ? globalThis.Number(object.slot) : 0,
      slotInterval: isSet(object.slotInterval) ? HandleInterval.fromJSON(object.slotInterval) : undefined,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: OnIntervalConfig): unknown {
    const obj: any = {};
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.minutes !== 0) {
      obj.minutes = Math.round(message.minutes);
    }
    if (message.minutesInterval !== undefined) {
      obj.minutesInterval = HandleInterval.toJSON(message.minutesInterval);
    }
    if (message.slot !== 0) {
      obj.slot = Math.round(message.slot);
    }
    if (message.slotInterval !== undefined) {
      obj.slotInterval = HandleInterval.toJSON(message.slotInterval);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = EthFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<OnIntervalConfig>): OnIntervalConfig {
    return OnIntervalConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<OnIntervalConfig>): OnIntervalConfig {
    const message = createBaseOnIntervalConfig();
    message.handlerId = object.handlerId ?? 0;
    message.minutes = object.minutes ?? 0;
    message.minutesInterval = (object.minutesInterval !== undefined && object.minutesInterval !== null)
      ? HandleInterval.fromPartial(object.minutesInterval)
      : undefined;
    message.slot = object.slot ?? 0;
    message.slotInterval = (object.slotInterval !== undefined && object.slotInterval !== null)
      ? HandleInterval.fromPartial(object.slotInterval)
      : undefined;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? EthFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseAptosOnIntervalConfig(): AptosOnIntervalConfig {
  return { intervalConfig: undefined, type: "" };
}

export const AptosOnIntervalConfig = {
  encode(message: AptosOnIntervalConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.intervalConfig !== undefined) {
      OnIntervalConfig.encode(message.intervalConfig, writer.uint32(10).fork()).ldelim();
    }
    if (message.type !== "") {
      writer.uint32(18).string(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosOnIntervalConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.intervalConfig = OnIntervalConfig.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.type = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AptosOnIntervalConfig {
    return {
      intervalConfig: isSet(object.intervalConfig) ? OnIntervalConfig.fromJSON(object.intervalConfig) : undefined,
      type: isSet(object.type) ? globalThis.String(object.type) : "",
    };
  },

  toJSON(message: AptosOnIntervalConfig): unknown {
    const obj: any = {};
    if (message.intervalConfig !== undefined) {
      obj.intervalConfig = OnIntervalConfig.toJSON(message.intervalConfig);
    }
    if (message.type !== "") {
      obj.type = message.type;
    }
    return obj;
  },

  create(base?: DeepPartial<AptosOnIntervalConfig>): AptosOnIntervalConfig {
    return AptosOnIntervalConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AptosOnIntervalConfig>): AptosOnIntervalConfig {
    const message = createBaseAptosOnIntervalConfig();
    message.intervalConfig = (object.intervalConfig !== undefined && object.intervalConfig !== null)
      ? OnIntervalConfig.fromPartial(object.intervalConfig)
      : undefined;
    message.type = object.type ?? "";
    return message;
  },
};

function createBaseMoveOnIntervalConfig(): MoveOnIntervalConfig {
  return { intervalConfig: undefined, type: "", ownerType: 0, resourceFetchConfig: undefined, fetchConfig: undefined };
}

export const MoveOnIntervalConfig = {
  encode(message: MoveOnIntervalConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.intervalConfig !== undefined) {
      OnIntervalConfig.encode(message.intervalConfig, writer.uint32(10).fork()).ldelim();
    }
    if (message.type !== "") {
      writer.uint32(18).string(message.type);
    }
    if (message.ownerType !== 0) {
      writer.uint32(24).int32(message.ownerType);
    }
    if (message.resourceFetchConfig !== undefined) {
      MoveAccountFetchConfig.encode(message.resourceFetchConfig, writer.uint32(34).fork()).ldelim();
    }
    if (message.fetchConfig !== undefined) {
      MoveFetchConfig.encode(message.fetchConfig, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveOnIntervalConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.intervalConfig = OnIntervalConfig.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.type = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.ownerType = reader.int32() as any;
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.resourceFetchConfig = MoveAccountFetchConfig.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.fetchConfig = MoveFetchConfig.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveOnIntervalConfig {
    return {
      intervalConfig: isSet(object.intervalConfig) ? OnIntervalConfig.fromJSON(object.intervalConfig) : undefined,
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      ownerType: isSet(object.ownerType) ? moveOwnerTypeFromJSON(object.ownerType) : 0,
      resourceFetchConfig: isSet(object.resourceFetchConfig)
        ? MoveAccountFetchConfig.fromJSON(object.resourceFetchConfig)
        : undefined,
      fetchConfig: isSet(object.fetchConfig) ? MoveFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: MoveOnIntervalConfig): unknown {
    const obj: any = {};
    if (message.intervalConfig !== undefined) {
      obj.intervalConfig = OnIntervalConfig.toJSON(message.intervalConfig);
    }
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.ownerType !== 0) {
      obj.ownerType = moveOwnerTypeToJSON(message.ownerType);
    }
    if (message.resourceFetchConfig !== undefined) {
      obj.resourceFetchConfig = MoveAccountFetchConfig.toJSON(message.resourceFetchConfig);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = MoveFetchConfig.toJSON(message.fetchConfig);
    }
    return obj;
  },

  create(base?: DeepPartial<MoveOnIntervalConfig>): MoveOnIntervalConfig {
    return MoveOnIntervalConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveOnIntervalConfig>): MoveOnIntervalConfig {
    const message = createBaseMoveOnIntervalConfig();
    message.intervalConfig = (object.intervalConfig !== undefined && object.intervalConfig !== null)
      ? OnIntervalConfig.fromPartial(object.intervalConfig)
      : undefined;
    message.type = object.type ?? "";
    message.ownerType = object.ownerType ?? 0;
    message.resourceFetchConfig = (object.resourceFetchConfig !== undefined && object.resourceFetchConfig !== null)
      ? MoveAccountFetchConfig.fromPartial(object.resourceFetchConfig)
      : undefined;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? MoveFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    return message;
  },
};

function createBaseContractInfo(): ContractInfo {
  return { name: "", chainId: "", address: "", abi: "" };
}

export const ContractInfo = {
  encode(message: ContractInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.chainId !== "") {
      writer.uint32(18).string(message.chainId);
    }
    if (message.address !== "") {
      writer.uint32(26).string(message.address);
    }
    if (message.abi !== "") {
      writer.uint32(34).string(message.abi);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContractInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.address = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.abi = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ContractInfo {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      abi: isSet(object.abi) ? globalThis.String(object.abi) : "",
    };
  },

  toJSON(message: ContractInfo): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.abi !== "") {
      obj.abi = message.abi;
    }
    return obj;
  },

  create(base?: DeepPartial<ContractInfo>): ContractInfo {
    return ContractInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ContractInfo>): ContractInfo {
    const message = createBaseContractInfo();
    message.name = object.name ?? "";
    message.chainId = object.chainId ?? "";
    message.address = object.address ?? "";
    message.abi = object.abi ?? "";
    return message;
  },
};

function createBaseTemplateInstance(): TemplateInstance {
  return { contract: undefined, startBlock: BigInt("0"), endBlock: BigInt("0"), templateId: 0, baseLabels: undefined };
}

export const TemplateInstance = {
  encode(message: TemplateInstance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.contract !== undefined) {
      ContractInfo.encode(message.contract, writer.uint32(10).fork()).ldelim();
    }
    if (message.startBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.startBlock) !== message.startBlock) {
        throw new globalThis.Error("value provided for field message.startBlock of type uint64 too large");
      }
      writer.uint32(16).uint64(message.startBlock.toString());
    }
    if (message.endBlock !== BigInt("0")) {
      if (BigInt.asUintN(64, message.endBlock) !== message.endBlock) {
        throw new globalThis.Error("value provided for field message.endBlock of type uint64 too large");
      }
      writer.uint32(24).uint64(message.endBlock.toString());
    }
    if (message.templateId !== 0) {
      writer.uint32(32).int32(message.templateId);
    }
    if (message.baseLabels !== undefined) {
      Struct.encode(Struct.wrap(message.baseLabels), writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TemplateInstance {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTemplateInstance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.contract = ContractInfo.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.startBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.endBlock = longToBigint(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.templateId = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.baseLabels = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TemplateInstance {
    return {
      contract: isSet(object.contract) ? ContractInfo.fromJSON(object.contract) : undefined,
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      endBlock: isSet(object.endBlock) ? BigInt(object.endBlock) : BigInt("0"),
      templateId: isSet(object.templateId) ? globalThis.Number(object.templateId) : 0,
      baseLabels: isObject(object.baseLabels) ? object.baseLabels : undefined,
    };
  },

  toJSON(message: TemplateInstance): unknown {
    const obj: any = {};
    if (message.contract !== undefined) {
      obj.contract = ContractInfo.toJSON(message.contract);
    }
    if (message.startBlock !== BigInt("0")) {
      obj.startBlock = message.startBlock.toString();
    }
    if (message.endBlock !== BigInt("0")) {
      obj.endBlock = message.endBlock.toString();
    }
    if (message.templateId !== 0) {
      obj.templateId = Math.round(message.templateId);
    }
    if (message.baseLabels !== undefined) {
      obj.baseLabels = message.baseLabels;
    }
    return obj;
  },

  create(base?: DeepPartial<TemplateInstance>): TemplateInstance {
    return TemplateInstance.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TemplateInstance>): TemplateInstance {
    const message = createBaseTemplateInstance();
    message.contract = (object.contract !== undefined && object.contract !== null)
      ? ContractInfo.fromPartial(object.contract)
      : undefined;
    message.startBlock = object.startBlock ?? BigInt("0");
    message.endBlock = object.endBlock ?? BigInt("0");
    message.templateId = object.templateId ?? 0;
    message.baseLabels = object.baseLabels ?? undefined;
    return message;
  },
};

function createBaseStartRequest(): StartRequest {
  return { templateInstances: [] };
}

export const StartRequest = {
  encode(message: StartRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.templateInstances) {
      TemplateInstance.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.templateInstances.push(TemplateInstance.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StartRequest {
    return {
      templateInstances: globalThis.Array.isArray(object?.templateInstances)
        ? object.templateInstances.map((e: any) => TemplateInstance.fromJSON(e))
        : [],
    };
  },

  toJSON(message: StartRequest): unknown {
    const obj: any = {};
    if (message.templateInstances?.length) {
      obj.templateInstances = message.templateInstances.map((e) => TemplateInstance.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<StartRequest>): StartRequest {
    return StartRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StartRequest>): StartRequest {
    const message = createBaseStartRequest();
    message.templateInstances = object.templateInstances?.map((e) => TemplateInstance.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBlockHandlerConfig(): BlockHandlerConfig {
  return { handlerId: 0 };
}

export const BlockHandlerConfig = {
  encode(message: BlockHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.handlerId !== 0) {
      writer.uint32(8).int32(message.handlerId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BlockHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BlockHandlerConfig {
    return { handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0 };
  },

  toJSON(message: BlockHandlerConfig): unknown {
    const obj: any = {};
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    return obj;
  },

  create(base?: DeepPartial<BlockHandlerConfig>): BlockHandlerConfig {
    return BlockHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BlockHandlerConfig>): BlockHandlerConfig {
    const message = createBaseBlockHandlerConfig();
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseEthFetchConfig(): EthFetchConfig {
  return { transaction: false, transactionReceipt: false, transactionReceiptLogs: false, block: false, trace: false };
}

export const EthFetchConfig = {
  encode(message: EthFetchConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== false) {
      writer.uint32(8).bool(message.transaction);
    }
    if (message.transactionReceipt !== false) {
      writer.uint32(16).bool(message.transactionReceipt);
    }
    if (message.transactionReceiptLogs !== false) {
      writer.uint32(40).bool(message.transactionReceiptLogs);
    }
    if (message.block !== false) {
      writer.uint32(24).bool(message.block);
    }
    if (message.trace !== false) {
      writer.uint32(32).bool(message.trace);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EthFetchConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEthFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.transaction = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.transactionReceipt = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.transactionReceiptLogs = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.block = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.trace = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EthFetchConfig {
    return {
      transaction: isSet(object.transaction) ? globalThis.Boolean(object.transaction) : false,
      transactionReceipt: isSet(object.transactionReceipt) ? globalThis.Boolean(object.transactionReceipt) : false,
      transactionReceiptLogs: isSet(object.transactionReceiptLogs)
        ? globalThis.Boolean(object.transactionReceiptLogs)
        : false,
      block: isSet(object.block) ? globalThis.Boolean(object.block) : false,
      trace: isSet(object.trace) ? globalThis.Boolean(object.trace) : false,
    };
  },

  toJSON(message: EthFetchConfig): unknown {
    const obj: any = {};
    if (message.transaction !== false) {
      obj.transaction = message.transaction;
    }
    if (message.transactionReceipt !== false) {
      obj.transactionReceipt = message.transactionReceipt;
    }
    if (message.transactionReceiptLogs !== false) {
      obj.transactionReceiptLogs = message.transactionReceiptLogs;
    }
    if (message.block !== false) {
      obj.block = message.block;
    }
    if (message.trace !== false) {
      obj.trace = message.trace;
    }
    return obj;
  },

  create(base?: DeepPartial<EthFetchConfig>): EthFetchConfig {
    return EthFetchConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EthFetchConfig>): EthFetchConfig {
    const message = createBaseEthFetchConfig();
    message.transaction = object.transaction ?? false;
    message.transactionReceipt = object.transactionReceipt ?? false;
    message.transactionReceiptLogs = object.transactionReceiptLogs ?? false;
    message.block = object.block ?? false;
    message.trace = object.trace ?? false;
    return message;
  },
};

function createBaseTraceHandlerConfig(): TraceHandlerConfig {
  return { signature: "", handlerId: 0, fetchConfig: undefined, handlerName: "" };
}

export const TraceHandlerConfig = {
  encode(message: TraceHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signature !== "") {
      writer.uint32(10).string(message.signature);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      EthFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TraceHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTraceHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.signature = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TraceHandlerConfig {
    return {
      signature: isSet(object.signature) ? globalThis.String(object.signature) : "",
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: TraceHandlerConfig): unknown {
    const obj: any = {};
    if (message.signature !== "") {
      obj.signature = message.signature;
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = EthFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<TraceHandlerConfig>): TraceHandlerConfig {
    return TraceHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TraceHandlerConfig>): TraceHandlerConfig {
    const message = createBaseTraceHandlerConfig();
    message.signature = object.signature ?? "";
    message.handlerId = object.handlerId ?? 0;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? EthFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseTransactionHandlerConfig(): TransactionHandlerConfig {
  return { handlerId: 0, fetchConfig: undefined, handlerName: "" };
}

export const TransactionHandlerConfig = {
  encode(message: TransactionHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.handlerId !== 0) {
      writer.uint32(8).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      EthFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TransactionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TransactionHandlerConfig {
    return {
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: TransactionHandlerConfig): unknown {
    const obj: any = {};
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = EthFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<TransactionHandlerConfig>): TransactionHandlerConfig {
    return TransactionHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TransactionHandlerConfig>): TransactionHandlerConfig {
    const message = createBaseTransactionHandlerConfig();
    message.handlerId = object.handlerId ?? 0;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? EthFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseLogHandlerConfig(): LogHandlerConfig {
  return { filters: [], handlerId: 0, fetchConfig: undefined, handlerName: "" };
}

export const LogHandlerConfig = {
  encode(message: LogHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      LogFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      EthFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(LogFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LogHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters) ? object.filters.map((e: any) => LogFilter.fromJSON(e)) : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: LogHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => LogFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = EthFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<LogHandlerConfig>): LogHandlerConfig {
    return LogHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LogHandlerConfig>): LogHandlerConfig {
    const message = createBaseLogHandlerConfig();
    message.filters = object.filters?.map((e) => LogFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? EthFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseFuelAssetHandlerConfig(): FuelAssetHandlerConfig {
  return { filters: [], handlerId: 0, handlerName: "" };
}

export const FuelAssetHandlerConfig = {
  encode(message: FuelAssetHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      FuelAssetHandlerConfig_AssetFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelAssetHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelAssetHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(FuelAssetHandlerConfig_AssetFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelAssetHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => FuelAssetHandlerConfig_AssetFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: FuelAssetHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => FuelAssetHandlerConfig_AssetFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelAssetHandlerConfig>): FuelAssetHandlerConfig {
    return FuelAssetHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelAssetHandlerConfig>): FuelAssetHandlerConfig {
    const message = createBaseFuelAssetHandlerConfig();
    message.filters = object.filters?.map((e) => FuelAssetHandlerConfig_AssetFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseFuelAssetHandlerConfig_AssetFilter(): FuelAssetHandlerConfig_AssetFilter {
  return { assetId: undefined, fromAddress: undefined, toAddress: undefined };
}

export const FuelAssetHandlerConfig_AssetFilter = {
  encode(message: FuelAssetHandlerConfig_AssetFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.assetId !== undefined) {
      writer.uint32(10).string(message.assetId);
    }
    if (message.fromAddress !== undefined) {
      writer.uint32(18).string(message.fromAddress);
    }
    if (message.toAddress !== undefined) {
      writer.uint32(26).string(message.toAddress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelAssetHandlerConfig_AssetFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelAssetHandlerConfig_AssetFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.assetId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fromAddress = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.toAddress = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelAssetHandlerConfig_AssetFilter {
    return {
      assetId: isSet(object.assetId) ? globalThis.String(object.assetId) : undefined,
      fromAddress: isSet(object.fromAddress) ? globalThis.String(object.fromAddress) : undefined,
      toAddress: isSet(object.toAddress) ? globalThis.String(object.toAddress) : undefined,
    };
  },

  toJSON(message: FuelAssetHandlerConfig_AssetFilter): unknown {
    const obj: any = {};
    if (message.assetId !== undefined) {
      obj.assetId = message.assetId;
    }
    if (message.fromAddress !== undefined) {
      obj.fromAddress = message.fromAddress;
    }
    if (message.toAddress !== undefined) {
      obj.toAddress = message.toAddress;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelAssetHandlerConfig_AssetFilter>): FuelAssetHandlerConfig_AssetFilter {
    return FuelAssetHandlerConfig_AssetFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelAssetHandlerConfig_AssetFilter>): FuelAssetHandlerConfig_AssetFilter {
    const message = createBaseFuelAssetHandlerConfig_AssetFilter();
    message.assetId = object.assetId ?? undefined;
    message.fromAddress = object.fromAddress ?? undefined;
    message.toAddress = object.toAddress ?? undefined;
    return message;
  },
};

function createBaseFuelLogHandlerConfig(): FuelLogHandlerConfig {
  return { logIds: [], handlerId: 0, handlerName: "" };
}

export const FuelLogHandlerConfig = {
  encode(message: FuelLogHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.logIds) {
      writer.uint32(10).string(v!);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelLogHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelLogHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.logIds.push(reader.string());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelLogHandlerConfig {
    return {
      logIds: globalThis.Array.isArray(object?.logIds) ? object.logIds.map((e: any) => globalThis.String(e)) : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: FuelLogHandlerConfig): unknown {
    const obj: any = {};
    if (message.logIds?.length) {
      obj.logIds = message.logIds;
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelLogHandlerConfig>): FuelLogHandlerConfig {
    return FuelLogHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelLogHandlerConfig>): FuelLogHandlerConfig {
    const message = createBaseFuelLogHandlerConfig();
    message.logIds = object.logIds?.map((e) => e) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseFuelReceiptHandlerConfig(): FuelReceiptHandlerConfig {
  return { log: undefined, transfer: undefined, handlerId: 0, handlerName: "" };
}

export const FuelReceiptHandlerConfig = {
  encode(message: FuelReceiptHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.log !== undefined) {
      FuelReceiptHandlerConfig_Log.encode(message.log, writer.uint32(10).fork()).ldelim();
    }
    if (message.transfer !== undefined) {
      FuelReceiptHandlerConfig_Transfer.encode(message.transfer, writer.uint32(18).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(24).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelReceiptHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelReceiptHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.log = FuelReceiptHandlerConfig_Log.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.transfer = FuelReceiptHandlerConfig_Transfer.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelReceiptHandlerConfig {
    return {
      log: isSet(object.log) ? FuelReceiptHandlerConfig_Log.fromJSON(object.log) : undefined,
      transfer: isSet(object.transfer) ? FuelReceiptHandlerConfig_Transfer.fromJSON(object.transfer) : undefined,
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: FuelReceiptHandlerConfig): unknown {
    const obj: any = {};
    if (message.log !== undefined) {
      obj.log = FuelReceiptHandlerConfig_Log.toJSON(message.log);
    }
    if (message.transfer !== undefined) {
      obj.transfer = FuelReceiptHandlerConfig_Transfer.toJSON(message.transfer);
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelReceiptHandlerConfig>): FuelReceiptHandlerConfig {
    return FuelReceiptHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelReceiptHandlerConfig>): FuelReceiptHandlerConfig {
    const message = createBaseFuelReceiptHandlerConfig();
    message.log = (object.log !== undefined && object.log !== null)
      ? FuelReceiptHandlerConfig_Log.fromPartial(object.log)
      : undefined;
    message.transfer = (object.transfer !== undefined && object.transfer !== null)
      ? FuelReceiptHandlerConfig_Transfer.fromPartial(object.transfer)
      : undefined;
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseFuelReceiptHandlerConfig_Transfer(): FuelReceiptHandlerConfig_Transfer {
  return { assetId: "", from: "", to: "" };
}

export const FuelReceiptHandlerConfig_Transfer = {
  encode(message: FuelReceiptHandlerConfig_Transfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.assetId !== "") {
      writer.uint32(34).string(message.assetId);
    }
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.to !== "") {
      writer.uint32(18).string(message.to);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelReceiptHandlerConfig_Transfer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelReceiptHandlerConfig_Transfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.assetId = reader.string();
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.to = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelReceiptHandlerConfig_Transfer {
    return {
      assetId: isSet(object.assetId) ? globalThis.String(object.assetId) : "",
      from: isSet(object.from) ? globalThis.String(object.from) : "",
      to: isSet(object.to) ? globalThis.String(object.to) : "",
    };
  },

  toJSON(message: FuelReceiptHandlerConfig_Transfer): unknown {
    const obj: any = {};
    if (message.assetId !== "") {
      obj.assetId = message.assetId;
    }
    if (message.from !== "") {
      obj.from = message.from;
    }
    if (message.to !== "") {
      obj.to = message.to;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelReceiptHandlerConfig_Transfer>): FuelReceiptHandlerConfig_Transfer {
    return FuelReceiptHandlerConfig_Transfer.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelReceiptHandlerConfig_Transfer>): FuelReceiptHandlerConfig_Transfer {
    const message = createBaseFuelReceiptHandlerConfig_Transfer();
    message.assetId = object.assetId ?? "";
    message.from = object.from ?? "";
    message.to = object.to ?? "";
    return message;
  },
};

function createBaseFuelReceiptHandlerConfig_Log(): FuelReceiptHandlerConfig_Log {
  return { logIds: [] };
}

export const FuelReceiptHandlerConfig_Log = {
  encode(message: FuelReceiptHandlerConfig_Log, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.logIds) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelReceiptHandlerConfig_Log {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelReceiptHandlerConfig_Log();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.logIds.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelReceiptHandlerConfig_Log {
    return {
      logIds: globalThis.Array.isArray(object?.logIds) ? object.logIds.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: FuelReceiptHandlerConfig_Log): unknown {
    const obj: any = {};
    if (message.logIds?.length) {
      obj.logIds = message.logIds;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelReceiptHandlerConfig_Log>): FuelReceiptHandlerConfig_Log {
    return FuelReceiptHandlerConfig_Log.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelReceiptHandlerConfig_Log>): FuelReceiptHandlerConfig_Log {
    const message = createBaseFuelReceiptHandlerConfig_Log();
    message.logIds = object.logIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseCosmosLogHandlerConfig(): CosmosLogHandlerConfig {
  return { logFilters: [], handlerId: 0, handlerName: "" };
}

export const CosmosLogHandlerConfig = {
  encode(message: CosmosLogHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.logFilters) {
      writer.uint32(10).string(v!);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CosmosLogHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmosLogHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.logFilters.push(reader.string());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CosmosLogHandlerConfig {
    return {
      logFilters: globalThis.Array.isArray(object?.logFilters)
        ? object.logFilters.map((e: any) => globalThis.String(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: CosmosLogHandlerConfig): unknown {
    const obj: any = {};
    if (message.logFilters?.length) {
      obj.logFilters = message.logFilters;
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<CosmosLogHandlerConfig>): CosmosLogHandlerConfig {
    return CosmosLogHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CosmosLogHandlerConfig>): CosmosLogHandlerConfig {
    const message = createBaseCosmosLogHandlerConfig();
    message.logFilters = object.logFilters?.map((e) => e) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseLogFilter(): LogFilter {
  return { topics: [], address: undefined, addressType: undefined };
}

export const LogFilter = {
  encode(message: LogFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.topics) {
      Topic.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.address !== undefined) {
      writer.uint32(18).string(message.address);
    }
    if (message.addressType !== undefined) {
      writer.uint32(24).int32(message.addressType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.topics.push(Topic.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.addressType = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LogFilter {
    return {
      topics: globalThis.Array.isArray(object?.topics) ? object.topics.map((e: any) => Topic.fromJSON(e)) : [],
      address: isSet(object.address) ? globalThis.String(object.address) : undefined,
      addressType: isSet(object.addressType) ? addressTypeFromJSON(object.addressType) : undefined,
    };
  },

  toJSON(message: LogFilter): unknown {
    const obj: any = {};
    if (message.topics?.length) {
      obj.topics = message.topics.map((e) => Topic.toJSON(e));
    }
    if (message.address !== undefined) {
      obj.address = message.address;
    }
    if (message.addressType !== undefined) {
      obj.addressType = addressTypeToJSON(message.addressType);
    }
    return obj;
  },

  create(base?: DeepPartial<LogFilter>): LogFilter {
    return LogFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LogFilter>): LogFilter {
    const message = createBaseLogFilter();
    message.topics = object.topics?.map((e) => Topic.fromPartial(e)) || [];
    message.address = object.address ?? undefined;
    message.addressType = object.addressType ?? undefined;
    return message;
  },
};

function createBaseInstructionHandlerConfig(): InstructionHandlerConfig {
  return { innerInstruction: false, parsedInstruction: false, rawDataInstruction: false };
}

export const InstructionHandlerConfig = {
  encode(message: InstructionHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.innerInstruction !== false) {
      writer.uint32(8).bool(message.innerInstruction);
    }
    if (message.parsedInstruction !== false) {
      writer.uint32(16).bool(message.parsedInstruction);
    }
    if (message.rawDataInstruction !== false) {
      writer.uint32(24).bool(message.rawDataInstruction);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstructionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstructionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.innerInstruction = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.parsedInstruction = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.rawDataInstruction = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): InstructionHandlerConfig {
    return {
      innerInstruction: isSet(object.innerInstruction) ? globalThis.Boolean(object.innerInstruction) : false,
      parsedInstruction: isSet(object.parsedInstruction) ? globalThis.Boolean(object.parsedInstruction) : false,
      rawDataInstruction: isSet(object.rawDataInstruction) ? globalThis.Boolean(object.rawDataInstruction) : false,
    };
  },

  toJSON(message: InstructionHandlerConfig): unknown {
    const obj: any = {};
    if (message.innerInstruction !== false) {
      obj.innerInstruction = message.innerInstruction;
    }
    if (message.parsedInstruction !== false) {
      obj.parsedInstruction = message.parsedInstruction;
    }
    if (message.rawDataInstruction !== false) {
      obj.rawDataInstruction = message.rawDataInstruction;
    }
    return obj;
  },

  create(base?: DeepPartial<InstructionHandlerConfig>): InstructionHandlerConfig {
    return InstructionHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<InstructionHandlerConfig>): InstructionHandlerConfig {
    const message = createBaseInstructionHandlerConfig();
    message.innerInstruction = object.innerInstruction ?? false;
    message.parsedInstruction = object.parsedInstruction ?? false;
    message.rawDataInstruction = object.rawDataInstruction ?? false;
    return message;
  },
};

function createBaseResourceConfig(): ResourceConfig {
  return { moveTypePrefix: "" };
}

export const ResourceConfig = {
  encode(message: ResourceConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.moveTypePrefix !== "") {
      writer.uint32(10).string(message.moveTypePrefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.moveTypePrefix = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ResourceConfig {
    return { moveTypePrefix: isSet(object.moveTypePrefix) ? globalThis.String(object.moveTypePrefix) : "" };
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {};
    if (message.moveTypePrefix !== "") {
      obj.moveTypePrefix = message.moveTypePrefix;
    }
    return obj;
  },

  create(base?: DeepPartial<ResourceConfig>): ResourceConfig {
    return ResourceConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ResourceConfig>): ResourceConfig {
    const message = createBaseResourceConfig();
    message.moveTypePrefix = object.moveTypePrefix ?? "";
    return message;
  },
};

function createBaseMoveFetchConfig(): MoveFetchConfig {
  return {
    resourceChanges: false,
    allEvents: false,
    inputs: false,
    resourceConfig: undefined,
    supportMultisigFunc: undefined,
    includeFailedTransaction: undefined,
  };
}

export const MoveFetchConfig = {
  encode(message: MoveFetchConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.resourceChanges !== false) {
      writer.uint32(8).bool(message.resourceChanges);
    }
    if (message.allEvents !== false) {
      writer.uint32(16).bool(message.allEvents);
    }
    if (message.inputs !== false) {
      writer.uint32(32).bool(message.inputs);
    }
    if (message.resourceConfig !== undefined) {
      ResourceConfig.encode(message.resourceConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.supportMultisigFunc !== undefined) {
      writer.uint32(40).bool(message.supportMultisigFunc);
    }
    if (message.includeFailedTransaction !== undefined) {
      writer.uint32(48).bool(message.includeFailedTransaction);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveFetchConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.resourceChanges = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.allEvents = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.inputs = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.resourceConfig = ResourceConfig.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.supportMultisigFunc = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.includeFailedTransaction = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveFetchConfig {
    return {
      resourceChanges: isSet(object.resourceChanges) ? globalThis.Boolean(object.resourceChanges) : false,
      allEvents: isSet(object.allEvents) ? globalThis.Boolean(object.allEvents) : false,
      inputs: isSet(object.inputs) ? globalThis.Boolean(object.inputs) : false,
      resourceConfig: isSet(object.resourceConfig) ? ResourceConfig.fromJSON(object.resourceConfig) : undefined,
      supportMultisigFunc: isSet(object.supportMultisigFunc)
        ? globalThis.Boolean(object.supportMultisigFunc)
        : undefined,
      includeFailedTransaction: isSet(object.includeFailedTransaction)
        ? globalThis.Boolean(object.includeFailedTransaction)
        : undefined,
    };
  },

  toJSON(message: MoveFetchConfig): unknown {
    const obj: any = {};
    if (message.resourceChanges !== false) {
      obj.resourceChanges = message.resourceChanges;
    }
    if (message.allEvents !== false) {
      obj.allEvents = message.allEvents;
    }
    if (message.inputs !== false) {
      obj.inputs = message.inputs;
    }
    if (message.resourceConfig !== undefined) {
      obj.resourceConfig = ResourceConfig.toJSON(message.resourceConfig);
    }
    if (message.supportMultisigFunc !== undefined) {
      obj.supportMultisigFunc = message.supportMultisigFunc;
    }
    if (message.includeFailedTransaction !== undefined) {
      obj.includeFailedTransaction = message.includeFailedTransaction;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveFetchConfig>): MoveFetchConfig {
    return MoveFetchConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveFetchConfig>): MoveFetchConfig {
    const message = createBaseMoveFetchConfig();
    message.resourceChanges = object.resourceChanges ?? false;
    message.allEvents = object.allEvents ?? false;
    message.inputs = object.inputs ?? false;
    message.resourceConfig = (object.resourceConfig !== undefined && object.resourceConfig !== null)
      ? ResourceConfig.fromPartial(object.resourceConfig)
      : undefined;
    message.supportMultisigFunc = object.supportMultisigFunc ?? undefined;
    message.includeFailedTransaction = object.includeFailedTransaction ?? undefined;
    return message;
  },
};

function createBaseMoveAccountFetchConfig(): MoveAccountFetchConfig {
  return { owned: false };
}

export const MoveAccountFetchConfig = {
  encode(message: MoveAccountFetchConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.owned !== false) {
      writer.uint32(8).bool(message.owned);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveAccountFetchConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveAccountFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.owned = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveAccountFetchConfig {
    return { owned: isSet(object.owned) ? globalThis.Boolean(object.owned) : false };
  },

  toJSON(message: MoveAccountFetchConfig): unknown {
    const obj: any = {};
    if (message.owned !== false) {
      obj.owned = message.owned;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveAccountFetchConfig>): MoveAccountFetchConfig {
    return MoveAccountFetchConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveAccountFetchConfig>): MoveAccountFetchConfig {
    const message = createBaseMoveAccountFetchConfig();
    message.owned = object.owned ?? false;
    return message;
  },
};

function createBaseMoveEventHandlerConfig(): MoveEventHandlerConfig {
  return { filters: [], handlerId: 0, fetchConfig: undefined, handlerName: "" };
}

export const MoveEventHandlerConfig = {
  encode(message: MoveEventHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      MoveEventFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      MoveFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveEventHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveEventHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(MoveEventFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fetchConfig = MoveFetchConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveEventHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => MoveEventFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? MoveFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: MoveEventHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => MoveEventFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = MoveFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveEventHandlerConfig>): MoveEventHandlerConfig {
    return MoveEventHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveEventHandlerConfig>): MoveEventHandlerConfig {
    const message = createBaseMoveEventHandlerConfig();
    message.filters = object.filters?.map((e) => MoveEventFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? MoveFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseMoveEventFilter(): MoveEventFilter {
  return { type: "", account: "", eventAccount: "" };
}

export const MoveEventFilter = {
  encode(message: MoveEventFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.account !== "") {
      writer.uint32(18).string(message.account);
    }
    if (message.eventAccount !== "") {
      writer.uint32(26).string(message.eventAccount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveEventFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveEventFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.account = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.eventAccount = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveEventFilter {
    return {
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      account: isSet(object.account) ? globalThis.String(object.account) : "",
      eventAccount: isSet(object.eventAccount) ? globalThis.String(object.eventAccount) : "",
    };
  },

  toJSON(message: MoveEventFilter): unknown {
    const obj: any = {};
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.account !== "") {
      obj.account = message.account;
    }
    if (message.eventAccount !== "") {
      obj.eventAccount = message.eventAccount;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveEventFilter>): MoveEventFilter {
    return MoveEventFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveEventFilter>): MoveEventFilter {
    const message = createBaseMoveEventFilter();
    message.type = object.type ?? "";
    message.account = object.account ?? "";
    message.eventAccount = object.eventAccount ?? "";
    return message;
  },
};

function createBaseMoveCallHandlerConfig(): MoveCallHandlerConfig {
  return { filters: [], handlerId: 0, fetchConfig: undefined, handlerName: "" };
}

export const MoveCallHandlerConfig = {
  encode(message: MoveCallHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      MoveCallFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      MoveFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.handlerName !== "") {
      writer.uint32(34).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveCallHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(MoveCallFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fetchConfig = MoveFetchConfig.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveCallHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => MoveCallFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? MoveFetchConfig.fromJSON(object.fetchConfig) : undefined,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: MoveCallHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => MoveCallFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      obj.fetchConfig = MoveFetchConfig.toJSON(message.fetchConfig);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveCallHandlerConfig>): MoveCallHandlerConfig {
    return MoveCallHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveCallHandlerConfig>): MoveCallHandlerConfig {
    const message = createBaseMoveCallHandlerConfig();
    message.filters = object.filters?.map((e) => MoveCallFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? MoveFetchConfig.fromPartial(object.fetchConfig)
      : undefined;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseMoveResourceChangeConfig(): MoveResourceChangeConfig {
  return { type: "", includeDeleted: false, handlerId: 0, handlerName: "" };
}

export const MoveResourceChangeConfig = {
  encode(message: MoveResourceChangeConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.includeDeleted !== false) {
      writer.uint32(32).bool(message.includeDeleted);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveResourceChangeConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveResourceChangeConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.type = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.includeDeleted = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveResourceChangeConfig {
    return {
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      includeDeleted: isSet(object.includeDeleted) ? globalThis.Boolean(object.includeDeleted) : false,
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: MoveResourceChangeConfig): unknown {
    const obj: any = {};
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.includeDeleted !== false) {
      obj.includeDeleted = message.includeDeleted;
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveResourceChangeConfig>): MoveResourceChangeConfig {
    return MoveResourceChangeConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveResourceChangeConfig>): MoveResourceChangeConfig {
    const message = createBaseMoveResourceChangeConfig();
    message.type = object.type ?? "";
    message.includeDeleted = object.includeDeleted ?? false;
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseMoveCallFilter(): MoveCallFilter {
  return {
    function: "",
    typeArguments: [],
    withTypeArguments: false,
    includeFailed: false,
    publicKeyPrefix: "",
    fromAndToAddress: undefined,
  };
}

export const MoveCallFilter = {
  encode(message: MoveCallFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.function !== "") {
      writer.uint32(10).string(message.function);
    }
    for (const v of message.typeArguments) {
      writer.uint32(18).string(v!);
    }
    if (message.withTypeArguments !== false) {
      writer.uint32(24).bool(message.withTypeArguments);
    }
    if (message.includeFailed !== false) {
      writer.uint32(32).bool(message.includeFailed);
    }
    if (message.publicKeyPrefix !== "") {
      writer.uint32(42).string(message.publicKeyPrefix);
    }
    if (message.fromAndToAddress !== undefined) {
      MoveCallFilter_FromAndToAddress.encode(message.fromAndToAddress, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveCallFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.function = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.typeArguments.push(reader.string());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.withTypeArguments = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.includeFailed = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.publicKeyPrefix = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.fromAndToAddress = MoveCallFilter_FromAndToAddress.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveCallFilter {
    return {
      function: isSet(object.function) ? globalThis.String(object.function) : "",
      typeArguments: globalThis.Array.isArray(object?.typeArguments)
        ? object.typeArguments.map((e: any) => globalThis.String(e))
        : [],
      withTypeArguments: isSet(object.withTypeArguments) ? globalThis.Boolean(object.withTypeArguments) : false,
      includeFailed: isSet(object.includeFailed) ? globalThis.Boolean(object.includeFailed) : false,
      publicKeyPrefix: isSet(object.publicKeyPrefix) ? globalThis.String(object.publicKeyPrefix) : "",
      fromAndToAddress: isSet(object.fromAndToAddress)
        ? MoveCallFilter_FromAndToAddress.fromJSON(object.fromAndToAddress)
        : undefined,
    };
  },

  toJSON(message: MoveCallFilter): unknown {
    const obj: any = {};
    if (message.function !== "") {
      obj.function = message.function;
    }
    if (message.typeArguments?.length) {
      obj.typeArguments = message.typeArguments;
    }
    if (message.withTypeArguments !== false) {
      obj.withTypeArguments = message.withTypeArguments;
    }
    if (message.includeFailed !== false) {
      obj.includeFailed = message.includeFailed;
    }
    if (message.publicKeyPrefix !== "") {
      obj.publicKeyPrefix = message.publicKeyPrefix;
    }
    if (message.fromAndToAddress !== undefined) {
      obj.fromAndToAddress = MoveCallFilter_FromAndToAddress.toJSON(message.fromAndToAddress);
    }
    return obj;
  },

  create(base?: DeepPartial<MoveCallFilter>): MoveCallFilter {
    return MoveCallFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveCallFilter>): MoveCallFilter {
    const message = createBaseMoveCallFilter();
    message.function = object.function ?? "";
    message.typeArguments = object.typeArguments?.map((e) => e) || [];
    message.withTypeArguments = object.withTypeArguments ?? false;
    message.includeFailed = object.includeFailed ?? false;
    message.publicKeyPrefix = object.publicKeyPrefix ?? "";
    message.fromAndToAddress = (object.fromAndToAddress !== undefined && object.fromAndToAddress !== null)
      ? MoveCallFilter_FromAndToAddress.fromPartial(object.fromAndToAddress)
      : undefined;
    return message;
  },
};

function createBaseMoveCallFilter_FromAndToAddress(): MoveCallFilter_FromAndToAddress {
  return { from: "", to: "" };
}

export const MoveCallFilter_FromAndToAddress = {
  encode(message: MoveCallFilter_FromAndToAddress, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.to !== "") {
      writer.uint32(18).string(message.to);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveCallFilter_FromAndToAddress {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallFilter_FromAndToAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.to = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MoveCallFilter_FromAndToAddress {
    return {
      from: isSet(object.from) ? globalThis.String(object.from) : "",
      to: isSet(object.to) ? globalThis.String(object.to) : "",
    };
  },

  toJSON(message: MoveCallFilter_FromAndToAddress): unknown {
    const obj: any = {};
    if (message.from !== "") {
      obj.from = message.from;
    }
    if (message.to !== "") {
      obj.to = message.to;
    }
    return obj;
  },

  create(base?: DeepPartial<MoveCallFilter_FromAndToAddress>): MoveCallFilter_FromAndToAddress {
    return MoveCallFilter_FromAndToAddress.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MoveCallFilter_FromAndToAddress>): MoveCallFilter_FromAndToAddress {
    const message = createBaseMoveCallFilter_FromAndToAddress();
    message.from = object.from ?? "";
    message.to = object.to ?? "";
    return message;
  },
};

function createBaseStarknetEventHandlerConfig(): StarknetEventHandlerConfig {
  return { filters: [], handlerId: 0, handlerName: "" };
}

export const StarknetEventHandlerConfig = {
  encode(message: StarknetEventHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      StarknetEventFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StarknetEventHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStarknetEventHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(StarknetEventFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StarknetEventHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => StarknetEventFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: StarknetEventHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => StarknetEventFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<StarknetEventHandlerConfig>): StarknetEventHandlerConfig {
    return StarknetEventHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StarknetEventHandlerConfig>): StarknetEventHandlerConfig {
    const message = createBaseStarknetEventHandlerConfig();
    message.filters = object.filters?.map((e) => StarknetEventFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseBTCTransactionHandlerConfig(): BTCTransactionHandlerConfig {
  return { filters: [], handlerId: 0, handlerName: "" };
}

export const BTCTransactionHandlerConfig = {
  encode(message: BTCTransactionHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      BTCTransactionFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(BTCTransactionFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => BTCTransactionFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: BTCTransactionHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => BTCTransactionFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionHandlerConfig>): BTCTransactionHandlerConfig {
    return BTCTransactionHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionHandlerConfig>): BTCTransactionHandlerConfig {
    const message = createBaseBTCTransactionHandlerConfig();
    message.filters = object.filters?.map((e) => BTCTransactionFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseBTCTransactionFilter(): BTCTransactionFilter {
  return { inputFilter: undefined, outputFilter: undefined, filter: [] };
}

export const BTCTransactionFilter = {
  encode(message: BTCTransactionFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.inputFilter !== undefined) {
      BTCTransactionFilter_VinFilter.encode(message.inputFilter, writer.uint32(10).fork()).ldelim();
    }
    if (message.outputFilter !== undefined) {
      BTCTransactionFilter_VOutFilter.encode(message.outputFilter, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.filter) {
      BTCTransactionFilter_Filter.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.inputFilter = BTCTransactionFilter_VinFilter.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.outputFilter = BTCTransactionFilter_VOutFilter.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.filter.push(BTCTransactionFilter_Filter.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter {
    return {
      inputFilter: isSet(object.inputFilter) ? BTCTransactionFilter_VinFilter.fromJSON(object.inputFilter) : undefined,
      outputFilter: isSet(object.outputFilter)
        ? BTCTransactionFilter_VOutFilter.fromJSON(object.outputFilter)
        : undefined,
      filter: globalThis.Array.isArray(object?.filter)
        ? object.filter.map((e: any) => BTCTransactionFilter_Filter.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BTCTransactionFilter): unknown {
    const obj: any = {};
    if (message.inputFilter !== undefined) {
      obj.inputFilter = BTCTransactionFilter_VinFilter.toJSON(message.inputFilter);
    }
    if (message.outputFilter !== undefined) {
      obj.outputFilter = BTCTransactionFilter_VOutFilter.toJSON(message.outputFilter);
    }
    if (message.filter?.length) {
      obj.filter = message.filter.map((e) => BTCTransactionFilter_Filter.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter>): BTCTransactionFilter {
    return BTCTransactionFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter>): BTCTransactionFilter {
    const message = createBaseBTCTransactionFilter();
    message.inputFilter = (object.inputFilter !== undefined && object.inputFilter !== null)
      ? BTCTransactionFilter_VinFilter.fromPartial(object.inputFilter)
      : undefined;
    message.outputFilter = (object.outputFilter !== undefined && object.outputFilter !== null)
      ? BTCTransactionFilter_VOutFilter.fromPartial(object.outputFilter)
      : undefined;
    message.filter = object.filter?.map((e) => BTCTransactionFilter_Filter.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBTCTransactionFilter_Condition(): BTCTransactionFilter_Condition {
  return {
    eq: undefined,
    gt: undefined,
    gte: undefined,
    lt: undefined,
    lte: undefined,
    ne: undefined,
    prefix: undefined,
    contains: undefined,
    notContains: undefined,
    lengthEq: undefined,
    lengthGt: undefined,
    lengthLt: undefined,
    hasAny: undefined,
    hasAll: undefined,
    in: undefined,
  };
}

export const BTCTransactionFilter_Condition = {
  encode(message: BTCTransactionFilter_Condition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eq !== undefined) {
      RichValue.encode(message.eq, writer.uint32(10).fork()).ldelim();
    }
    if (message.gt !== undefined) {
      RichValue.encode(message.gt, writer.uint32(18).fork()).ldelim();
    }
    if (message.gte !== undefined) {
      RichValue.encode(message.gte, writer.uint32(26).fork()).ldelim();
    }
    if (message.lt !== undefined) {
      RichValue.encode(message.lt, writer.uint32(34).fork()).ldelim();
    }
    if (message.lte !== undefined) {
      RichValue.encode(message.lte, writer.uint32(42).fork()).ldelim();
    }
    if (message.ne !== undefined) {
      RichValue.encode(message.ne, writer.uint32(50).fork()).ldelim();
    }
    if (message.prefix !== undefined) {
      writer.uint32(58).string(message.prefix);
    }
    if (message.contains !== undefined) {
      writer.uint32(66).string(message.contains);
    }
    if (message.notContains !== undefined) {
      writer.uint32(74).string(message.notContains);
    }
    if (message.lengthEq !== undefined) {
      writer.uint32(80).int32(message.lengthEq);
    }
    if (message.lengthGt !== undefined) {
      writer.uint32(88).int32(message.lengthGt);
    }
    if (message.lengthLt !== undefined) {
      writer.uint32(96).int32(message.lengthLt);
    }
    if (message.hasAny !== undefined) {
      RichValueList.encode(message.hasAny, writer.uint32(106).fork()).ldelim();
    }
    if (message.hasAll !== undefined) {
      RichValueList.encode(message.hasAll, writer.uint32(114).fork()).ldelim();
    }
    if (message.in !== undefined) {
      RichValueList.encode(message.in, writer.uint32(122).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_Condition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_Condition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eq = RichValue.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.gt = RichValue.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.gte = RichValue.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.lt = RichValue.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.lte = RichValue.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.ne = RichValue.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.prefix = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.contains = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.notContains = reader.string();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.lengthEq = reader.int32();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.lengthGt = reader.int32();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.lengthLt = reader.int32();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.hasAny = RichValueList.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.hasAll = RichValueList.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.in = RichValueList.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_Condition {
    return {
      eq: isSet(object.eq) ? RichValue.fromJSON(object.eq) : undefined,
      gt: isSet(object.gt) ? RichValue.fromJSON(object.gt) : undefined,
      gte: isSet(object.gte) ? RichValue.fromJSON(object.gte) : undefined,
      lt: isSet(object.lt) ? RichValue.fromJSON(object.lt) : undefined,
      lte: isSet(object.lte) ? RichValue.fromJSON(object.lte) : undefined,
      ne: isSet(object.ne) ? RichValue.fromJSON(object.ne) : undefined,
      prefix: isSet(object.prefix) ? globalThis.String(object.prefix) : undefined,
      contains: isSet(object.contains) ? globalThis.String(object.contains) : undefined,
      notContains: isSet(object.notContains) ? globalThis.String(object.notContains) : undefined,
      lengthEq: isSet(object.lengthEq) ? globalThis.Number(object.lengthEq) : undefined,
      lengthGt: isSet(object.lengthGt) ? globalThis.Number(object.lengthGt) : undefined,
      lengthLt: isSet(object.lengthLt) ? globalThis.Number(object.lengthLt) : undefined,
      hasAny: isSet(object.hasAny) ? RichValueList.fromJSON(object.hasAny) : undefined,
      hasAll: isSet(object.hasAll) ? RichValueList.fromJSON(object.hasAll) : undefined,
      in: isSet(object.in) ? RichValueList.fromJSON(object.in) : undefined,
    };
  },

  toJSON(message: BTCTransactionFilter_Condition): unknown {
    const obj: any = {};
    if (message.eq !== undefined) {
      obj.eq = RichValue.toJSON(message.eq);
    }
    if (message.gt !== undefined) {
      obj.gt = RichValue.toJSON(message.gt);
    }
    if (message.gte !== undefined) {
      obj.gte = RichValue.toJSON(message.gte);
    }
    if (message.lt !== undefined) {
      obj.lt = RichValue.toJSON(message.lt);
    }
    if (message.lte !== undefined) {
      obj.lte = RichValue.toJSON(message.lte);
    }
    if (message.ne !== undefined) {
      obj.ne = RichValue.toJSON(message.ne);
    }
    if (message.prefix !== undefined) {
      obj.prefix = message.prefix;
    }
    if (message.contains !== undefined) {
      obj.contains = message.contains;
    }
    if (message.notContains !== undefined) {
      obj.notContains = message.notContains;
    }
    if (message.lengthEq !== undefined) {
      obj.lengthEq = Math.round(message.lengthEq);
    }
    if (message.lengthGt !== undefined) {
      obj.lengthGt = Math.round(message.lengthGt);
    }
    if (message.lengthLt !== undefined) {
      obj.lengthLt = Math.round(message.lengthLt);
    }
    if (message.hasAny !== undefined) {
      obj.hasAny = RichValueList.toJSON(message.hasAny);
    }
    if (message.hasAll !== undefined) {
      obj.hasAll = RichValueList.toJSON(message.hasAll);
    }
    if (message.in !== undefined) {
      obj.in = RichValueList.toJSON(message.in);
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_Condition>): BTCTransactionFilter_Condition {
    return BTCTransactionFilter_Condition.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter_Condition>): BTCTransactionFilter_Condition {
    const message = createBaseBTCTransactionFilter_Condition();
    message.eq = (object.eq !== undefined && object.eq !== null) ? RichValue.fromPartial(object.eq) : undefined;
    message.gt = (object.gt !== undefined && object.gt !== null) ? RichValue.fromPartial(object.gt) : undefined;
    message.gte = (object.gte !== undefined && object.gte !== null) ? RichValue.fromPartial(object.gte) : undefined;
    message.lt = (object.lt !== undefined && object.lt !== null) ? RichValue.fromPartial(object.lt) : undefined;
    message.lte = (object.lte !== undefined && object.lte !== null) ? RichValue.fromPartial(object.lte) : undefined;
    message.ne = (object.ne !== undefined && object.ne !== null) ? RichValue.fromPartial(object.ne) : undefined;
    message.prefix = object.prefix ?? undefined;
    message.contains = object.contains ?? undefined;
    message.notContains = object.notContains ?? undefined;
    message.lengthEq = object.lengthEq ?? undefined;
    message.lengthGt = object.lengthGt ?? undefined;
    message.lengthLt = object.lengthLt ?? undefined;
    message.hasAny = (object.hasAny !== undefined && object.hasAny !== null)
      ? RichValueList.fromPartial(object.hasAny)
      : undefined;
    message.hasAll = (object.hasAll !== undefined && object.hasAll !== null)
      ? RichValueList.fromPartial(object.hasAll)
      : undefined;
    message.in = (object.in !== undefined && object.in !== null) ? RichValueList.fromPartial(object.in) : undefined;
    return message;
  },
};

function createBaseBTCTransactionFilter_Filter(): BTCTransactionFilter_Filter {
  return { conditions: {} };
}

export const BTCTransactionFilter_Filter = {
  encode(message: BTCTransactionFilter_Filter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.conditions).forEach(([key, value]) => {
      BTCTransactionFilter_Filter_ConditionsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_Filter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_Filter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = BTCTransactionFilter_Filter_ConditionsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.conditions[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_Filter {
    return {
      conditions: isObject(object.conditions)
        ? Object.entries(object.conditions).reduce<{ [key: string]: BTCTransactionFilter_Condition }>(
          (acc, [key, value]) => {
            acc[key] = BTCTransactionFilter_Condition.fromJSON(value);
            return acc;
          },
          {},
        )
        : {},
    };
  },

  toJSON(message: BTCTransactionFilter_Filter): unknown {
    const obj: any = {};
    if (message.conditions) {
      const entries = Object.entries(message.conditions);
      if (entries.length > 0) {
        obj.conditions = {};
        entries.forEach(([k, v]) => {
          obj.conditions[k] = BTCTransactionFilter_Condition.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_Filter>): BTCTransactionFilter_Filter {
    return BTCTransactionFilter_Filter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter_Filter>): BTCTransactionFilter_Filter {
    const message = createBaseBTCTransactionFilter_Filter();
    message.conditions = Object.entries(object.conditions ?? {}).reduce<
      { [key: string]: BTCTransactionFilter_Condition }
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = BTCTransactionFilter_Condition.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseBTCTransactionFilter_Filter_ConditionsEntry(): BTCTransactionFilter_Filter_ConditionsEntry {
  return { key: "", value: undefined };
}

export const BTCTransactionFilter_Filter_ConditionsEntry = {
  encode(message: BTCTransactionFilter_Filter_ConditionsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      BTCTransactionFilter_Condition.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_Filter_ConditionsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_Filter_ConditionsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = BTCTransactionFilter_Condition.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_Filter_ConditionsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? BTCTransactionFilter_Condition.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: BTCTransactionFilter_Filter_ConditionsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = BTCTransactionFilter_Condition.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_Filter_ConditionsEntry>): BTCTransactionFilter_Filter_ConditionsEntry {
    return BTCTransactionFilter_Filter_ConditionsEntry.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<BTCTransactionFilter_Filter_ConditionsEntry>,
  ): BTCTransactionFilter_Filter_ConditionsEntry {
    const message = createBaseBTCTransactionFilter_Filter_ConditionsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? BTCTransactionFilter_Condition.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseBTCTransactionFilter_Filters(): BTCTransactionFilter_Filters {
  return { filters: [] };
}

export const BTCTransactionFilter_Filters = {
  encode(message: BTCTransactionFilter_Filters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      BTCTransactionFilter_Filter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_Filters {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_Filters();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(BTCTransactionFilter_Filter.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_Filters {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => BTCTransactionFilter_Filter.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BTCTransactionFilter_Filters): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => BTCTransactionFilter_Filter.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_Filters>): BTCTransactionFilter_Filters {
    return BTCTransactionFilter_Filters.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter_Filters>): BTCTransactionFilter_Filters {
    const message = createBaseBTCTransactionFilter_Filters();
    message.filters = object.filters?.map((e) => BTCTransactionFilter_Filter.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBTCTransactionFilter_VinFilter(): BTCTransactionFilter_VinFilter {
  return { filters: undefined, preVOut: undefined, preTransaction: undefined };
}

export const BTCTransactionFilter_VinFilter = {
  encode(message: BTCTransactionFilter_VinFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.filters !== undefined) {
      BTCTransactionFilter_Filters.encode(message.filters, writer.uint32(10).fork()).ldelim();
    }
    if (message.preVOut !== undefined) {
      BTCTransactionFilter_Filter.encode(message.preVOut, writer.uint32(18).fork()).ldelim();
    }
    if (message.preTransaction !== undefined) {
      BTCTransactionFilter.encode(message.preTransaction, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_VinFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_VinFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters = BTCTransactionFilter_Filters.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.preVOut = BTCTransactionFilter_Filter.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.preTransaction = BTCTransactionFilter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_VinFilter {
    return {
      filters: isSet(object.filters) ? BTCTransactionFilter_Filters.fromJSON(object.filters) : undefined,
      preVOut: isSet(object.preVOut) ? BTCTransactionFilter_Filter.fromJSON(object.preVOut) : undefined,
      preTransaction: isSet(object.preTransaction) ? BTCTransactionFilter.fromJSON(object.preTransaction) : undefined,
    };
  },

  toJSON(message: BTCTransactionFilter_VinFilter): unknown {
    const obj: any = {};
    if (message.filters !== undefined) {
      obj.filters = BTCTransactionFilter_Filters.toJSON(message.filters);
    }
    if (message.preVOut !== undefined) {
      obj.preVOut = BTCTransactionFilter_Filter.toJSON(message.preVOut);
    }
    if (message.preTransaction !== undefined) {
      obj.preTransaction = BTCTransactionFilter.toJSON(message.preTransaction);
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_VinFilter>): BTCTransactionFilter_VinFilter {
    return BTCTransactionFilter_VinFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter_VinFilter>): BTCTransactionFilter_VinFilter {
    const message = createBaseBTCTransactionFilter_VinFilter();
    message.filters = (object.filters !== undefined && object.filters !== null)
      ? BTCTransactionFilter_Filters.fromPartial(object.filters)
      : undefined;
    message.preVOut = (object.preVOut !== undefined && object.preVOut !== null)
      ? BTCTransactionFilter_Filter.fromPartial(object.preVOut)
      : undefined;
    message.preTransaction = (object.preTransaction !== undefined && object.preTransaction !== null)
      ? BTCTransactionFilter.fromPartial(object.preTransaction)
      : undefined;
    return message;
  },
};

function createBaseBTCTransactionFilter_VOutFilter(): BTCTransactionFilter_VOutFilter {
  return { filters: undefined };
}

export const BTCTransactionFilter_VOutFilter = {
  encode(message: BTCTransactionFilter_VOutFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.filters !== undefined) {
      BTCTransactionFilter_Filters.encode(message.filters, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BTCTransactionFilter_VOutFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCTransactionFilter_VOutFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters = BTCTransactionFilter_Filters.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BTCTransactionFilter_VOutFilter {
    return { filters: isSet(object.filters) ? BTCTransactionFilter_Filters.fromJSON(object.filters) : undefined };
  },

  toJSON(message: BTCTransactionFilter_VOutFilter): unknown {
    const obj: any = {};
    if (message.filters !== undefined) {
      obj.filters = BTCTransactionFilter_Filters.toJSON(message.filters);
    }
    return obj;
  },

  create(base?: DeepPartial<BTCTransactionFilter_VOutFilter>): BTCTransactionFilter_VOutFilter {
    return BTCTransactionFilter_VOutFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BTCTransactionFilter_VOutFilter>): BTCTransactionFilter_VOutFilter {
    const message = createBaseBTCTransactionFilter_VOutFilter();
    message.filters = (object.filters !== undefined && object.filters !== null)
      ? BTCTransactionFilter_Filters.fromPartial(object.filters)
      : undefined;
    return message;
  },
};

function createBaseStarknetEventFilter(): StarknetEventFilter {
  return { address: "", keys: [] };
}

export const StarknetEventFilter = {
  encode(message: StarknetEventFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    for (const v of message.keys) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StarknetEventFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStarknetEventFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.keys.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StarknetEventFilter {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      keys: globalThis.Array.isArray(object?.keys) ? object.keys.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: StarknetEventFilter): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.keys?.length) {
      obj.keys = message.keys;
    }
    return obj;
  },

  create(base?: DeepPartial<StarknetEventFilter>): StarknetEventFilter {
    return StarknetEventFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StarknetEventFilter>): StarknetEventFilter {
    const message = createBaseStarknetEventFilter();
    message.address = object.address ?? "";
    message.keys = object.keys?.map((e) => e) || [];
    return message;
  },
};

function createBaseFuelCallFilter(): FuelCallFilter {
  return { function: "", includeFailed: false };
}

export const FuelCallFilter = {
  encode(message: FuelCallFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.function !== "") {
      writer.uint32(10).string(message.function);
    }
    if (message.includeFailed !== false) {
      writer.uint32(16).bool(message.includeFailed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelCallFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelCallFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.function = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.includeFailed = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelCallFilter {
    return {
      function: isSet(object.function) ? globalThis.String(object.function) : "",
      includeFailed: isSet(object.includeFailed) ? globalThis.Boolean(object.includeFailed) : false,
    };
  },

  toJSON(message: FuelCallFilter): unknown {
    const obj: any = {};
    if (message.function !== "") {
      obj.function = message.function;
    }
    if (message.includeFailed !== false) {
      obj.includeFailed = message.includeFailed;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelCallFilter>): FuelCallFilter {
    return FuelCallFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelCallFilter>): FuelCallFilter {
    const message = createBaseFuelCallFilter();
    message.function = object.function ?? "";
    message.includeFailed = object.includeFailed ?? false;
    return message;
  },
};

function createBaseFuelCallHandlerConfig(): FuelCallHandlerConfig {
  return { filters: [], handlerId: 0, handlerName: "" };
}

export const FuelCallHandlerConfig = {
  encode(message: FuelCallHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.filters) {
      FuelCallFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(26).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelCallHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelCallHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filters.push(FuelCallFilter.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelCallHandlerConfig {
    return {
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => FuelCallFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: FuelCallHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => FuelCallFilter.toJSON(e));
    }
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelCallHandlerConfig>): FuelCallHandlerConfig {
    return FuelCallHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelCallHandlerConfig>): FuelCallHandlerConfig {
    const message = createBaseFuelCallHandlerConfig();
    message.filters = object.filters?.map((e) => FuelCallFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseFuelTransactionHandlerConfig(): FuelTransactionHandlerConfig {
  return { handlerId: 0, handlerName: "" };
}

export const FuelTransactionHandlerConfig = {
  encode(message: FuelTransactionHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.handlerId !== 0) {
      writer.uint32(8).int32(message.handlerId);
    }
    if (message.handlerName !== "") {
      writer.uint32(18).string(message.handlerName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuelTransactionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuelTransactionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.handlerId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.handlerName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuelTransactionHandlerConfig {
    return {
      handlerId: isSet(object.handlerId) ? globalThis.Number(object.handlerId) : 0,
      handlerName: isSet(object.handlerName) ? globalThis.String(object.handlerName) : "",
    };
  },

  toJSON(message: FuelTransactionHandlerConfig): unknown {
    const obj: any = {};
    if (message.handlerId !== 0) {
      obj.handlerId = Math.round(message.handlerId);
    }
    if (message.handlerName !== "") {
      obj.handlerName = message.handlerName;
    }
    return obj;
  },

  create(base?: DeepPartial<FuelTransactionHandlerConfig>): FuelTransactionHandlerConfig {
    return FuelTransactionHandlerConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FuelTransactionHandlerConfig>): FuelTransactionHandlerConfig {
    const message = createBaseFuelTransactionHandlerConfig();
    message.handlerId = object.handlerId ?? 0;
    message.handlerName = object.handlerName ?? "";
    return message;
  },
};

function createBaseTopic(): Topic {
  return { hashes: [] };
}

export const Topic = {
  encode(message: Topic, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.hashes) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Topic {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTopic();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.hashes.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Topic {
    return {
      hashes: globalThis.Array.isArray(object?.hashes) ? object.hashes.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: Topic): unknown {
    const obj: any = {};
    if (message.hashes?.length) {
      obj.hashes = message.hashes;
    }
    return obj;
  },

  create(base?: DeepPartial<Topic>): Topic {
    return Topic.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Topic>): Topic {
    const message = createBaseTopic();
    message.hashes = object.hashes?.map((e) => e) || [];
    return message;
  },
};

function createBaseProcessBindingsRequest(): ProcessBindingsRequest {
  return { bindings: [] };
}

export const ProcessBindingsRequest = {
  encode(message: ProcessBindingsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.bindings) {
      DataBinding.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessBindingsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBindingsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.bindings.push(DataBinding.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessBindingsRequest {
    return {
      bindings: globalThis.Array.isArray(object?.bindings)
        ? object.bindings.map((e: any) => DataBinding.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessBindingsRequest): unknown {
    const obj: any = {};
    if (message.bindings?.length) {
      obj.bindings = message.bindings.map((e) => DataBinding.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessBindingsRequest>): ProcessBindingsRequest {
    return ProcessBindingsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessBindingsRequest>): ProcessBindingsRequest {
    const message = createBaseProcessBindingsRequest();
    message.bindings = object.bindings?.map((e) => DataBinding.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProcessBindingResponse(): ProcessBindingResponse {
  return { result: undefined, configUpdated: false };
}

export const ProcessBindingResponse = {
  encode(message: ProcessBindingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result !== undefined) {
      ProcessResult.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    if (message.configUpdated !== false) {
      writer.uint32(32).bool(message.configUpdated);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessBindingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBindingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.result = ProcessResult.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.configUpdated = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessBindingResponse {
    return {
      result: isSet(object.result) ? ProcessResult.fromJSON(object.result) : undefined,
      configUpdated: isSet(object.configUpdated) ? globalThis.Boolean(object.configUpdated) : false,
    };
  },

  toJSON(message: ProcessBindingResponse): unknown {
    const obj: any = {};
    if (message.result !== undefined) {
      obj.result = ProcessResult.toJSON(message.result);
    }
    if (message.configUpdated !== false) {
      obj.configUpdated = message.configUpdated;
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessBindingResponse>): ProcessBindingResponse {
    return ProcessBindingResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessBindingResponse>): ProcessBindingResponse {
    const message = createBaseProcessBindingResponse();
    message.result = (object.result !== undefined && object.result !== null)
      ? ProcessResult.fromPartial(object.result)
      : undefined;
    message.configUpdated = object.configUpdated ?? false;
    return message;
  },
};

function createBaseProcessStreamRequest(): ProcessStreamRequest {
  return { processId: 0, binding: undefined, dbResult: undefined };
}

export const ProcessStreamRequest = {
  encode(message: ProcessStreamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.processId !== 0) {
      writer.uint32(8).int32(message.processId);
    }
    if (message.binding !== undefined) {
      DataBinding.encode(message.binding, writer.uint32(18).fork()).ldelim();
    }
    if (message.dbResult !== undefined) {
      DBResponse.encode(message.dbResult, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessStreamRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessStreamRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.processId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.binding = DataBinding.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.dbResult = DBResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessStreamRequest {
    return {
      processId: isSet(object.processId) ? globalThis.Number(object.processId) : 0,
      binding: isSet(object.binding) ? DataBinding.fromJSON(object.binding) : undefined,
      dbResult: isSet(object.dbResult) ? DBResponse.fromJSON(object.dbResult) : undefined,
    };
  },

  toJSON(message: ProcessStreamRequest): unknown {
    const obj: any = {};
    if (message.processId !== 0) {
      obj.processId = Math.round(message.processId);
    }
    if (message.binding !== undefined) {
      obj.binding = DataBinding.toJSON(message.binding);
    }
    if (message.dbResult !== undefined) {
      obj.dbResult = DBResponse.toJSON(message.dbResult);
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessStreamRequest>): ProcessStreamRequest {
    return ProcessStreamRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessStreamRequest>): ProcessStreamRequest {
    const message = createBaseProcessStreamRequest();
    message.processId = object.processId ?? 0;
    message.binding = (object.binding !== undefined && object.binding !== null)
      ? DataBinding.fromPartial(object.binding)
      : undefined;
    message.dbResult = (object.dbResult !== undefined && object.dbResult !== null)
      ? DBResponse.fromPartial(object.dbResult)
      : undefined;
    return message;
  },
};

function createBaseProcessStreamResponse(): ProcessStreamResponse {
  return { processId: 0, dbRequest: undefined, result: undefined };
}

export const ProcessStreamResponse = {
  encode(message: ProcessStreamResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.processId !== 0) {
      writer.uint32(8).int32(message.processId);
    }
    if (message.dbRequest !== undefined) {
      DBRequest.encode(message.dbRequest, writer.uint32(18).fork()).ldelim();
    }
    if (message.result !== undefined) {
      ProcessResult.encode(message.result, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessStreamResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessStreamResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.processId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.dbRequest = DBRequest.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.result = ProcessResult.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessStreamResponse {
    return {
      processId: isSet(object.processId) ? globalThis.Number(object.processId) : 0,
      dbRequest: isSet(object.dbRequest) ? DBRequest.fromJSON(object.dbRequest) : undefined,
      result: isSet(object.result) ? ProcessResult.fromJSON(object.result) : undefined,
    };
  },

  toJSON(message: ProcessStreamResponse): unknown {
    const obj: any = {};
    if (message.processId !== 0) {
      obj.processId = Math.round(message.processId);
    }
    if (message.dbRequest !== undefined) {
      obj.dbRequest = DBRequest.toJSON(message.dbRequest);
    }
    if (message.result !== undefined) {
      obj.result = ProcessResult.toJSON(message.result);
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessStreamResponse>): ProcessStreamResponse {
    return ProcessStreamResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessStreamResponse>): ProcessStreamResponse {
    const message = createBaseProcessStreamResponse();
    message.processId = object.processId ?? 0;
    message.dbRequest = (object.dbRequest !== undefined && object.dbRequest !== null)
      ? DBRequest.fromPartial(object.dbRequest)
      : undefined;
    message.result = (object.result !== undefined && object.result !== null)
      ? ProcessResult.fromPartial(object.result)
      : undefined;
    return message;
  },
};

function createBasePreprocessStreamRequest(): PreprocessStreamRequest {
  return { processId: 0, bindings: undefined, dbResult: undefined };
}

export const PreprocessStreamRequest = {
  encode(message: PreprocessStreamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.processId !== 0) {
      writer.uint32(8).int32(message.processId);
    }
    if (message.bindings !== undefined) {
      PreprocessStreamRequest_DataBindings.encode(message.bindings, writer.uint32(18).fork()).ldelim();
    }
    if (message.dbResult !== undefined) {
      DBResponse.encode(message.dbResult, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreprocessStreamRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreprocessStreamRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.processId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.bindings = PreprocessStreamRequest_DataBindings.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.dbResult = DBResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreprocessStreamRequest {
    return {
      processId: isSet(object.processId) ? globalThis.Number(object.processId) : 0,
      bindings: isSet(object.bindings) ? PreprocessStreamRequest_DataBindings.fromJSON(object.bindings) : undefined,
      dbResult: isSet(object.dbResult) ? DBResponse.fromJSON(object.dbResult) : undefined,
    };
  },

  toJSON(message: PreprocessStreamRequest): unknown {
    const obj: any = {};
    if (message.processId !== 0) {
      obj.processId = Math.round(message.processId);
    }
    if (message.bindings !== undefined) {
      obj.bindings = PreprocessStreamRequest_DataBindings.toJSON(message.bindings);
    }
    if (message.dbResult !== undefined) {
      obj.dbResult = DBResponse.toJSON(message.dbResult);
    }
    return obj;
  },

  create(base?: DeepPartial<PreprocessStreamRequest>): PreprocessStreamRequest {
    return PreprocessStreamRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreprocessStreamRequest>): PreprocessStreamRequest {
    const message = createBasePreprocessStreamRequest();
    message.processId = object.processId ?? 0;
    message.bindings = (object.bindings !== undefined && object.bindings !== null)
      ? PreprocessStreamRequest_DataBindings.fromPartial(object.bindings)
      : undefined;
    message.dbResult = (object.dbResult !== undefined && object.dbResult !== null)
      ? DBResponse.fromPartial(object.dbResult)
      : undefined;
    return message;
  },
};

function createBasePreprocessStreamRequest_DataBindings(): PreprocessStreamRequest_DataBindings {
  return { bindings: [] };
}

export const PreprocessStreamRequest_DataBindings = {
  encode(message: PreprocessStreamRequest_DataBindings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.bindings) {
      DataBinding.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreprocessStreamRequest_DataBindings {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreprocessStreamRequest_DataBindings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.bindings.push(DataBinding.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreprocessStreamRequest_DataBindings {
    return {
      bindings: globalThis.Array.isArray(object?.bindings)
        ? object.bindings.map((e: any) => DataBinding.fromJSON(e))
        : [],
    };
  },

  toJSON(message: PreprocessStreamRequest_DataBindings): unknown {
    const obj: any = {};
    if (message.bindings?.length) {
      obj.bindings = message.bindings.map((e) => DataBinding.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<PreprocessStreamRequest_DataBindings>): PreprocessStreamRequest_DataBindings {
    return PreprocessStreamRequest_DataBindings.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreprocessStreamRequest_DataBindings>): PreprocessStreamRequest_DataBindings {
    const message = createBasePreprocessStreamRequest_DataBindings();
    message.bindings = object.bindings?.map((e) => DataBinding.fromPartial(e)) || [];
    return message;
  },
};

function createBasePreprocessStreamResponse(): PreprocessStreamResponse {
  return { processId: 0, dbRequest: undefined };
}

export const PreprocessStreamResponse = {
  encode(message: PreprocessStreamResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.processId !== 0) {
      writer.uint32(8).int32(message.processId);
    }
    if (message.dbRequest !== undefined) {
      DBRequest.encode(message.dbRequest, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreprocessStreamResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreprocessStreamResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.processId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.dbRequest = DBRequest.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreprocessStreamResponse {
    return {
      processId: isSet(object.processId) ? globalThis.Number(object.processId) : 0,
      dbRequest: isSet(object.dbRequest) ? DBRequest.fromJSON(object.dbRequest) : undefined,
    };
  },

  toJSON(message: PreprocessStreamResponse): unknown {
    const obj: any = {};
    if (message.processId !== 0) {
      obj.processId = Math.round(message.processId);
    }
    if (message.dbRequest !== undefined) {
      obj.dbRequest = DBRequest.toJSON(message.dbRequest);
    }
    return obj;
  },

  create(base?: DeepPartial<PreprocessStreamResponse>): PreprocessStreamResponse {
    return PreprocessStreamResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreprocessStreamResponse>): PreprocessStreamResponse {
    const message = createBasePreprocessStreamResponse();
    message.processId = object.processId ?? 0;
    message.dbRequest = (object.dbRequest !== undefined && object.dbRequest !== null)
      ? DBRequest.fromPartial(object.dbRequest)
      : undefined;
    return message;
  },
};

function createBaseDBResponse(): DBResponse {
  return {
    opId: BigInt("0"),
    data: undefined,
    list: undefined,
    error: undefined,
    entities: undefined,
    entityList: undefined,
    nextCursor: undefined,
  };
}

export const DBResponse = {
  encode(message: DBResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.opId !== BigInt("0")) {
      if (BigInt.asUintN(64, message.opId) !== message.opId) {
        throw new globalThis.Error("value provided for field message.opId of type uint64 too large");
      }
      writer.uint32(8).uint64(message.opId.toString());
    }
    if (message.data !== undefined) {
      Struct.encode(Struct.wrap(message.data), writer.uint32(18).fork()).ldelim();
    }
    if (message.list !== undefined) {
      ListValue.encode(ListValue.wrap(message.list), writer.uint32(34).fork()).ldelim();
    }
    if (message.error !== undefined) {
      writer.uint32(26).string(message.error);
    }
    if (message.entities !== undefined) {
      RichStructList.encode(message.entities, writer.uint32(50).fork()).ldelim();
    }
    if (message.entityList !== undefined) {
      EntityList.encode(message.entityList, writer.uint32(58).fork()).ldelim();
    }
    if (message.nextCursor !== undefined) {
      writer.uint32(42).string(message.nextCursor);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.opId = longToBigint(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.data = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.list = ListValue.unwrap(ListValue.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.error = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.entities = RichStructList.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.entityList = EntityList.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.nextCursor = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBResponse {
    return {
      opId: isSet(object.opId) ? BigInt(object.opId) : BigInt("0"),
      data: isObject(object.data) ? object.data : undefined,
      list: globalThis.Array.isArray(object.list) ? [...object.list] : undefined,
      error: isSet(object.error) ? globalThis.String(object.error) : undefined,
      entities: isSet(object.entities) ? RichStructList.fromJSON(object.entities) : undefined,
      entityList: isSet(object.entityList) ? EntityList.fromJSON(object.entityList) : undefined,
      nextCursor: isSet(object.nextCursor) ? globalThis.String(object.nextCursor) : undefined,
    };
  },

  toJSON(message: DBResponse): unknown {
    const obj: any = {};
    if (message.opId !== BigInt("0")) {
      obj.opId = message.opId.toString();
    }
    if (message.data !== undefined) {
      obj.data = message.data;
    }
    if (message.list !== undefined) {
      obj.list = message.list;
    }
    if (message.error !== undefined) {
      obj.error = message.error;
    }
    if (message.entities !== undefined) {
      obj.entities = RichStructList.toJSON(message.entities);
    }
    if (message.entityList !== undefined) {
      obj.entityList = EntityList.toJSON(message.entityList);
    }
    if (message.nextCursor !== undefined) {
      obj.nextCursor = message.nextCursor;
    }
    return obj;
  },

  create(base?: DeepPartial<DBResponse>): DBResponse {
    return DBResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBResponse>): DBResponse {
    const message = createBaseDBResponse();
    message.opId = object.opId ?? BigInt("0");
    message.data = object.data ?? undefined;
    message.list = object.list ?? undefined;
    message.error = object.error ?? undefined;
    message.entities = (object.entities !== undefined && object.entities !== null)
      ? RichStructList.fromPartial(object.entities)
      : undefined;
    message.entityList = (object.entityList !== undefined && object.entityList !== null)
      ? EntityList.fromPartial(object.entityList)
      : undefined;
    message.nextCursor = object.nextCursor ?? undefined;
    return message;
  },
};

function createBaseEntity(): Entity {
  return { entity: "", genBlockNumber: BigInt("0"), genBlockChain: "", genBlockTime: undefined, data: undefined };
}

export const Entity = {
  encode(message: Entity, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.entity !== "") {
      writer.uint32(10).string(message.entity);
    }
    if (message.genBlockNumber !== BigInt("0")) {
      if (BigInt.asUintN(64, message.genBlockNumber) !== message.genBlockNumber) {
        throw new globalThis.Error("value provided for field message.genBlockNumber of type uint64 too large");
      }
      writer.uint32(16).uint64(message.genBlockNumber.toString());
    }
    if (message.genBlockChain !== "") {
      writer.uint32(26).string(message.genBlockChain);
    }
    if (message.genBlockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.genBlockTime), writer.uint32(34).fork()).ldelim();
    }
    if (message.data !== undefined) {
      RichStruct.encode(message.data, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Entity {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.genBlockNumber = longToBigint(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.genBlockChain = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.genBlockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.data = RichStruct.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Entity {
    return {
      entity: isSet(object.entity) ? globalThis.String(object.entity) : "",
      genBlockNumber: isSet(object.genBlockNumber) ? BigInt(object.genBlockNumber) : BigInt("0"),
      genBlockChain: isSet(object.genBlockChain) ? globalThis.String(object.genBlockChain) : "",
      genBlockTime: isSet(object.genBlockTime) ? fromJsonTimestamp(object.genBlockTime) : undefined,
      data: isSet(object.data) ? RichStruct.fromJSON(object.data) : undefined,
    };
  },

  toJSON(message: Entity): unknown {
    const obj: any = {};
    if (message.entity !== "") {
      obj.entity = message.entity;
    }
    if (message.genBlockNumber !== BigInt("0")) {
      obj.genBlockNumber = message.genBlockNumber.toString();
    }
    if (message.genBlockChain !== "") {
      obj.genBlockChain = message.genBlockChain;
    }
    if (message.genBlockTime !== undefined) {
      obj.genBlockTime = message.genBlockTime.toISOString();
    }
    if (message.data !== undefined) {
      obj.data = RichStruct.toJSON(message.data);
    }
    return obj;
  },

  create(base?: DeepPartial<Entity>): Entity {
    return Entity.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Entity>): Entity {
    const message = createBaseEntity();
    message.entity = object.entity ?? "";
    message.genBlockNumber = object.genBlockNumber ?? BigInt("0");
    message.genBlockChain = object.genBlockChain ?? "";
    message.genBlockTime = object.genBlockTime ?? undefined;
    message.data = (object.data !== undefined && object.data !== null)
      ? RichStruct.fromPartial(object.data)
      : undefined;
    return message;
  },
};

function createBaseEntityList(): EntityList {
  return { entities: [] };
}

export const EntityList = {
  encode(message: EntityList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.entities) {
      Entity.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntityList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntityList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entities.push(Entity.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntityList {
    return {
      entities: globalThis.Array.isArray(object?.entities) ? object.entities.map((e: any) => Entity.fromJSON(e)) : [],
    };
  },

  toJSON(message: EntityList): unknown {
    const obj: any = {};
    if (message.entities?.length) {
      obj.entities = message.entities.map((e) => Entity.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<EntityList>): EntityList {
    return EntityList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EntityList>): EntityList {
    const message = createBaseEntityList();
    message.entities = object.entities?.map((e) => Entity.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEntityUpdateData(): EntityUpdateData {
  return { fields: {} };
}

export const EntityUpdateData = {
  encode(message: EntityUpdateData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.fields).forEach(([key, value]) => {
      EntityUpdateData_FieldsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntityUpdateData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntityUpdateData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = EntityUpdateData_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.fields[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntityUpdateData {
    return {
      fields: isObject(object.fields)
        ? Object.entries(object.fields).reduce<{ [key: string]: EntityUpdateData_FieldValue }>((acc, [key, value]) => {
          acc[key] = EntityUpdateData_FieldValue.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: EntityUpdateData): unknown {
    const obj: any = {};
    if (message.fields) {
      const entries = Object.entries(message.fields);
      if (entries.length > 0) {
        obj.fields = {};
        entries.forEach(([k, v]) => {
          obj.fields[k] = EntityUpdateData_FieldValue.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<EntityUpdateData>): EntityUpdateData {
    return EntityUpdateData.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EntityUpdateData>): EntityUpdateData {
    const message = createBaseEntityUpdateData();
    message.fields = Object.entries(object.fields ?? {}).reduce<{ [key: string]: EntityUpdateData_FieldValue }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = EntityUpdateData_FieldValue.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseEntityUpdateData_FieldValue(): EntityUpdateData_FieldValue {
  return { value: undefined, op: 0 };
}

export const EntityUpdateData_FieldValue = {
  encode(message: EntityUpdateData_FieldValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== undefined) {
      RichValue.encode(message.value, writer.uint32(10).fork()).ldelim();
    }
    if (message.op !== 0) {
      writer.uint32(16).int32(message.op);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntityUpdateData_FieldValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntityUpdateData_FieldValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = RichValue.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.op = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntityUpdateData_FieldValue {
    return {
      value: isSet(object.value) ? RichValue.fromJSON(object.value) : undefined,
      op: isSet(object.op) ? entityUpdateData_OperatorFromJSON(object.op) : 0,
    };
  },

  toJSON(message: EntityUpdateData_FieldValue): unknown {
    const obj: any = {};
    if (message.value !== undefined) {
      obj.value = RichValue.toJSON(message.value);
    }
    if (message.op !== 0) {
      obj.op = entityUpdateData_OperatorToJSON(message.op);
    }
    return obj;
  },

  create(base?: DeepPartial<EntityUpdateData_FieldValue>): EntityUpdateData_FieldValue {
    return EntityUpdateData_FieldValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EntityUpdateData_FieldValue>): EntityUpdateData_FieldValue {
    const message = createBaseEntityUpdateData_FieldValue();
    message.value = (object.value !== undefined && object.value !== null)
      ? RichValue.fromPartial(object.value)
      : undefined;
    message.op = object.op ?? 0;
    return message;
  },
};

function createBaseEntityUpdateData_FieldsEntry(): EntityUpdateData_FieldsEntry {
  return { key: "", value: undefined };
}

export const EntityUpdateData_FieldsEntry = {
  encode(message: EntityUpdateData_FieldsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      EntityUpdateData_FieldValue.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntityUpdateData_FieldsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntityUpdateData_FieldsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = EntityUpdateData_FieldValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntityUpdateData_FieldsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? EntityUpdateData_FieldValue.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: EntityUpdateData_FieldsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = EntityUpdateData_FieldValue.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<EntityUpdateData_FieldsEntry>): EntityUpdateData_FieldsEntry {
    return EntityUpdateData_FieldsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EntityUpdateData_FieldsEntry>): EntityUpdateData_FieldsEntry {
    const message = createBaseEntityUpdateData_FieldsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? EntityUpdateData_FieldValue.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseDBRequest(): DBRequest {
  return {
    opId: BigInt("0"),
    get: undefined,
    upsert: undefined,
    update: undefined,
    delete: undefined,
    list: undefined,
  };
}

export const DBRequest = {
  encode(message: DBRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.opId !== BigInt("0")) {
      if (BigInt.asUintN(64, message.opId) !== message.opId) {
        throw new globalThis.Error("value provided for field message.opId of type uint64 too large");
      }
      writer.uint32(8).uint64(message.opId.toString());
    }
    if (message.get !== undefined) {
      DBRequest_DBGet.encode(message.get, writer.uint32(18).fork()).ldelim();
    }
    if (message.upsert !== undefined) {
      DBRequest_DBUpsert.encode(message.upsert, writer.uint32(26).fork()).ldelim();
    }
    if (message.update !== undefined) {
      DBRequest_DBUpdate.encode(message.update, writer.uint32(50).fork()).ldelim();
    }
    if (message.delete !== undefined) {
      DBRequest_DBDelete.encode(message.delete, writer.uint32(34).fork()).ldelim();
    }
    if (message.list !== undefined) {
      DBRequest_DBList.encode(message.list, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.opId = longToBigint(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.get = DBRequest_DBGet.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.upsert = DBRequest_DBUpsert.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.update = DBRequest_DBUpdate.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.delete = DBRequest_DBDelete.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.list = DBRequest_DBList.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest {
    return {
      opId: isSet(object.opId) ? BigInt(object.opId) : BigInt("0"),
      get: isSet(object.get) ? DBRequest_DBGet.fromJSON(object.get) : undefined,
      upsert: isSet(object.upsert) ? DBRequest_DBUpsert.fromJSON(object.upsert) : undefined,
      update: isSet(object.update) ? DBRequest_DBUpdate.fromJSON(object.update) : undefined,
      delete: isSet(object.delete) ? DBRequest_DBDelete.fromJSON(object.delete) : undefined,
      list: isSet(object.list) ? DBRequest_DBList.fromJSON(object.list) : undefined,
    };
  },

  toJSON(message: DBRequest): unknown {
    const obj: any = {};
    if (message.opId !== BigInt("0")) {
      obj.opId = message.opId.toString();
    }
    if (message.get !== undefined) {
      obj.get = DBRequest_DBGet.toJSON(message.get);
    }
    if (message.upsert !== undefined) {
      obj.upsert = DBRequest_DBUpsert.toJSON(message.upsert);
    }
    if (message.update !== undefined) {
      obj.update = DBRequest_DBUpdate.toJSON(message.update);
    }
    if (message.delete !== undefined) {
      obj.delete = DBRequest_DBDelete.toJSON(message.delete);
    }
    if (message.list !== undefined) {
      obj.list = DBRequest_DBList.toJSON(message.list);
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest>): DBRequest {
    return DBRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest>): DBRequest {
    const message = createBaseDBRequest();
    message.opId = object.opId ?? BigInt("0");
    message.get = (object.get !== undefined && object.get !== null)
      ? DBRequest_DBGet.fromPartial(object.get)
      : undefined;
    message.upsert = (object.upsert !== undefined && object.upsert !== null)
      ? DBRequest_DBUpsert.fromPartial(object.upsert)
      : undefined;
    message.update = (object.update !== undefined && object.update !== null)
      ? DBRequest_DBUpdate.fromPartial(object.update)
      : undefined;
    message.delete = (object.delete !== undefined && object.delete !== null)
      ? DBRequest_DBDelete.fromPartial(object.delete)
      : undefined;
    message.list = (object.list !== undefined && object.list !== null)
      ? DBRequest_DBList.fromPartial(object.list)
      : undefined;
    return message;
  },
};

function createBaseDBRequest_DBGet(): DBRequest_DBGet {
  return { entity: "", id: "" };
}

export const DBRequest_DBGet = {
  encode(message: DBRequest_DBGet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.entity !== "") {
      writer.uint32(10).string(message.entity);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBGet {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBGet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBGet {
    return {
      entity: isSet(object.entity) ? globalThis.String(object.entity) : "",
      id: isSet(object.id) ? globalThis.String(object.id) : "",
    };
  },

  toJSON(message: DBRequest_DBGet): unknown {
    const obj: any = {};
    if (message.entity !== "") {
      obj.entity = message.entity;
    }
    if (message.id !== "") {
      obj.id = message.id;
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBGet>): DBRequest_DBGet {
    return DBRequest_DBGet.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBGet>): DBRequest_DBGet {
    const message = createBaseDBRequest_DBGet();
    message.entity = object.entity ?? "";
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseDBRequest_DBList(): DBRequest_DBList {
  return { entity: "", filters: [], cursor: "", pageSize: undefined };
}

export const DBRequest_DBList = {
  encode(message: DBRequest_DBList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.entity !== "") {
      writer.uint32(10).string(message.entity);
    }
    for (const v of message.filters) {
      DBRequest_DBFilter.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.cursor !== "") {
      writer.uint32(42).string(message.cursor);
    }
    if (message.pageSize !== undefined) {
      writer.uint32(48).uint32(message.pageSize);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBList {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.filters.push(DBRequest_DBFilter.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.cursor = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.pageSize = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBList {
    return {
      entity: isSet(object.entity) ? globalThis.String(object.entity) : "",
      filters: globalThis.Array.isArray(object?.filters)
        ? object.filters.map((e: any) => DBRequest_DBFilter.fromJSON(e))
        : [],
      cursor: isSet(object.cursor) ? globalThis.String(object.cursor) : "",
      pageSize: isSet(object.pageSize) ? globalThis.Number(object.pageSize) : undefined,
    };
  },

  toJSON(message: DBRequest_DBList): unknown {
    const obj: any = {};
    if (message.entity !== "") {
      obj.entity = message.entity;
    }
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => DBRequest_DBFilter.toJSON(e));
    }
    if (message.cursor !== "") {
      obj.cursor = message.cursor;
    }
    if (message.pageSize !== undefined) {
      obj.pageSize = Math.round(message.pageSize);
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBList>): DBRequest_DBList {
    return DBRequest_DBList.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBList>): DBRequest_DBList {
    const message = createBaseDBRequest_DBList();
    message.entity = object.entity ?? "";
    message.filters = object.filters?.map((e) => DBRequest_DBFilter.fromPartial(e)) || [];
    message.cursor = object.cursor ?? "";
    message.pageSize = object.pageSize ?? undefined;
    return message;
  },
};

function createBaseDBRequest_DBUpsert(): DBRequest_DBUpsert {
  return { entity: [], id: [], data: [], entityData: [] };
}

export const DBRequest_DBUpsert = {
  encode(message: DBRequest_DBUpsert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.entity) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.id) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.data) {
      Struct.encode(Struct.wrap(v!), writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.entityData) {
      RichStruct.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBUpsert {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBUpsert();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.data.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.entityData.push(RichStruct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBUpsert {
    return {
      entity: globalThis.Array.isArray(object?.entity) ? object.entity.map((e: any) => globalThis.String(e)) : [],
      id: globalThis.Array.isArray(object?.id) ? object.id.map((e: any) => globalThis.String(e)) : [],
      data: globalThis.Array.isArray(object?.data) ? [...object.data] : [],
      entityData: globalThis.Array.isArray(object?.entityData)
        ? object.entityData.map((e: any) => RichStruct.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DBRequest_DBUpsert): unknown {
    const obj: any = {};
    if (message.entity?.length) {
      obj.entity = message.entity;
    }
    if (message.id?.length) {
      obj.id = message.id;
    }
    if (message.data?.length) {
      obj.data = message.data;
    }
    if (message.entityData?.length) {
      obj.entityData = message.entityData.map((e) => RichStruct.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBUpsert>): DBRequest_DBUpsert {
    return DBRequest_DBUpsert.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBUpsert>): DBRequest_DBUpsert {
    const message = createBaseDBRequest_DBUpsert();
    message.entity = object.entity?.map((e) => e) || [];
    message.id = object.id?.map((e) => e) || [];
    message.data = object.data?.map((e) => e) || [];
    message.entityData = object.entityData?.map((e) => RichStruct.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDBRequest_DBUpdate(): DBRequest_DBUpdate {
  return { entity: [], id: [], entityData: [] };
}

export const DBRequest_DBUpdate = {
  encode(message: DBRequest_DBUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.entity) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.id) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.entityData) {
      EntityUpdateData.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.entityData.push(EntityUpdateData.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBUpdate {
    return {
      entity: globalThis.Array.isArray(object?.entity) ? object.entity.map((e: any) => globalThis.String(e)) : [],
      id: globalThis.Array.isArray(object?.id) ? object.id.map((e: any) => globalThis.String(e)) : [],
      entityData: globalThis.Array.isArray(object?.entityData)
        ? object.entityData.map((e: any) => EntityUpdateData.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DBRequest_DBUpdate): unknown {
    const obj: any = {};
    if (message.entity?.length) {
      obj.entity = message.entity;
    }
    if (message.id?.length) {
      obj.id = message.id;
    }
    if (message.entityData?.length) {
      obj.entityData = message.entityData.map((e) => EntityUpdateData.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBUpdate>): DBRequest_DBUpdate {
    return DBRequest_DBUpdate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBUpdate>): DBRequest_DBUpdate {
    const message = createBaseDBRequest_DBUpdate();
    message.entity = object.entity?.map((e) => e) || [];
    message.id = object.id?.map((e) => e) || [];
    message.entityData = object.entityData?.map((e) => EntityUpdateData.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDBRequest_DBDelete(): DBRequest_DBDelete {
  return { entity: [], id: [] };
}

export const DBRequest_DBDelete = {
  encode(message: DBRequest_DBDelete, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.entity) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.id) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBDelete {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBDelete();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.entity.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.id.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBDelete {
    return {
      entity: globalThis.Array.isArray(object?.entity) ? object.entity.map((e: any) => globalThis.String(e)) : [],
      id: globalThis.Array.isArray(object?.id) ? object.id.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: DBRequest_DBDelete): unknown {
    const obj: any = {};
    if (message.entity?.length) {
      obj.entity = message.entity;
    }
    if (message.id?.length) {
      obj.id = message.id;
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBDelete>): DBRequest_DBDelete {
    return DBRequest_DBDelete.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBDelete>): DBRequest_DBDelete {
    const message = createBaseDBRequest_DBDelete();
    message.entity = object.entity?.map((e) => e) || [];
    message.id = object.id?.map((e) => e) || [];
    return message;
  },
};

function createBaseDBRequest_DBFilter(): DBRequest_DBFilter {
  return { field: "", op: 0, value: undefined };
}

export const DBRequest_DBFilter = {
  encode(message: DBRequest_DBFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.field !== "") {
      writer.uint32(10).string(message.field);
    }
    if (message.op !== 0) {
      writer.uint32(16).int32(message.op);
    }
    if (message.value !== undefined) {
      RichValueList.encode(message.value, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DBRequest_DBFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDBRequest_DBFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.field = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.op = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.value = RichValueList.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DBRequest_DBFilter {
    return {
      field: isSet(object.field) ? globalThis.String(object.field) : "",
      op: isSet(object.op) ? dBRequest_DBOperatorFromJSON(object.op) : 0,
      value: isSet(object.value) ? RichValueList.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: DBRequest_DBFilter): unknown {
    const obj: any = {};
    if (message.field !== "") {
      obj.field = message.field;
    }
    if (message.op !== 0) {
      obj.op = dBRequest_DBOperatorToJSON(message.op);
    }
    if (message.value !== undefined) {
      obj.value = RichValueList.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<DBRequest_DBFilter>): DBRequest_DBFilter {
    return DBRequest_DBFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DBRequest_DBFilter>): DBRequest_DBFilter {
    const message = createBaseDBRequest_DBFilter();
    message.field = object.field ?? "";
    message.op = object.op ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? RichValueList.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseData(): Data {
  return {
    ethLog: undefined,
    ethBlock: undefined,
    ethTransaction: undefined,
    ethTrace: undefined,
    solInstruction: undefined,
    aptEvent: undefined,
    aptCall: undefined,
    aptResource: undefined,
    suiEvent: undefined,
    suiCall: undefined,
    suiObject: undefined,
    suiObjectChange: undefined,
    fuelLog: undefined,
    fuelCall: undefined,
    fuelTransaction: undefined,
    fuelBlock: undefined,
    cosmosCall: undefined,
    starknetEvents: undefined,
    btcTransaction: undefined,
    btcBlock: undefined,
  };
}

export const Data = {
  encode(message: Data, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ethLog !== undefined) {
      Data_EthLog.encode(message.ethLog, writer.uint32(18).fork()).ldelim();
    }
    if (message.ethBlock !== undefined) {
      Data_EthBlock.encode(message.ethBlock, writer.uint32(26).fork()).ldelim();
    }
    if (message.ethTransaction !== undefined) {
      Data_EthTransaction.encode(message.ethTransaction, writer.uint32(34).fork()).ldelim();
    }
    if (message.ethTrace !== undefined) {
      Data_EthTrace.encode(message.ethTrace, writer.uint32(42).fork()).ldelim();
    }
    if (message.solInstruction !== undefined) {
      Data_SolInstruction.encode(message.solInstruction, writer.uint32(50).fork()).ldelim();
    }
    if (message.aptEvent !== undefined) {
      Data_AptEvent.encode(message.aptEvent, writer.uint32(58).fork()).ldelim();
    }
    if (message.aptCall !== undefined) {
      Data_AptCall.encode(message.aptCall, writer.uint32(66).fork()).ldelim();
    }
    if (message.aptResource !== undefined) {
      Data_AptResource.encode(message.aptResource, writer.uint32(74).fork()).ldelim();
    }
    if (message.suiEvent !== undefined) {
      Data_SuiEvent.encode(message.suiEvent, writer.uint32(82).fork()).ldelim();
    }
    if (message.suiCall !== undefined) {
      Data_SuiCall.encode(message.suiCall, writer.uint32(90).fork()).ldelim();
    }
    if (message.suiObject !== undefined) {
      Data_SuiObject.encode(message.suiObject, writer.uint32(98).fork()).ldelim();
    }
    if (message.suiObjectChange !== undefined) {
      Data_SuiObjectChange.encode(message.suiObjectChange, writer.uint32(106).fork()).ldelim();
    }
    if (message.fuelLog !== undefined) {
      Data_FuelReceipt.encode(message.fuelLog, writer.uint32(162).fork()).ldelim();
    }
    if (message.fuelCall !== undefined) {
      Data_FuelCall.encode(message.fuelCall, writer.uint32(114).fork()).ldelim();
    }
    if (message.fuelTransaction !== undefined) {
      Data_FuelTransaction.encode(message.fuelTransaction, writer.uint32(170).fork()).ldelim();
    }
    if (message.fuelBlock !== undefined) {
      Data_FuelBlock.encode(message.fuelBlock, writer.uint32(146).fork()).ldelim();
    }
    if (message.cosmosCall !== undefined) {
      Data_CosmosCall.encode(message.cosmosCall, writer.uint32(122).fork()).ldelim();
    }
    if (message.starknetEvents !== undefined) {
      Data_StarknetEvent.encode(message.starknetEvents, writer.uint32(130).fork()).ldelim();
    }
    if (message.btcTransaction !== undefined) {
      Data_BTCTransaction.encode(message.btcTransaction, writer.uint32(138).fork()).ldelim();
    }
    if (message.btcBlock !== undefined) {
      Data_BTCBlock.encode(message.btcBlock, writer.uint32(154).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ethLog = Data_EthLog.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.ethBlock = Data_EthBlock.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.ethTransaction = Data_EthTransaction.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.ethTrace = Data_EthTrace.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.solInstruction = Data_SolInstruction.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.aptEvent = Data_AptEvent.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.aptCall = Data_AptCall.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.aptResource = Data_AptResource.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.suiEvent = Data_SuiEvent.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.suiCall = Data_SuiCall.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.suiObject = Data_SuiObject.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.suiObjectChange = Data_SuiObjectChange.decode(reader, reader.uint32());
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.fuelLog = Data_FuelReceipt.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.fuelCall = Data_FuelCall.decode(reader, reader.uint32());
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.fuelTransaction = Data_FuelTransaction.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.fuelBlock = Data_FuelBlock.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.cosmosCall = Data_CosmosCall.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.starknetEvents = Data_StarknetEvent.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.btcTransaction = Data_BTCTransaction.decode(reader, reader.uint32());
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.btcBlock = Data_BTCBlock.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data {
    return {
      ethLog: isSet(object.ethLog) ? Data_EthLog.fromJSON(object.ethLog) : undefined,
      ethBlock: isSet(object.ethBlock) ? Data_EthBlock.fromJSON(object.ethBlock) : undefined,
      ethTransaction: isSet(object.ethTransaction) ? Data_EthTransaction.fromJSON(object.ethTransaction) : undefined,
      ethTrace: isSet(object.ethTrace) ? Data_EthTrace.fromJSON(object.ethTrace) : undefined,
      solInstruction: isSet(object.solInstruction) ? Data_SolInstruction.fromJSON(object.solInstruction) : undefined,
      aptEvent: isSet(object.aptEvent) ? Data_AptEvent.fromJSON(object.aptEvent) : undefined,
      aptCall: isSet(object.aptCall) ? Data_AptCall.fromJSON(object.aptCall) : undefined,
      aptResource: isSet(object.aptResource) ? Data_AptResource.fromJSON(object.aptResource) : undefined,
      suiEvent: isSet(object.suiEvent) ? Data_SuiEvent.fromJSON(object.suiEvent) : undefined,
      suiCall: isSet(object.suiCall) ? Data_SuiCall.fromJSON(object.suiCall) : undefined,
      suiObject: isSet(object.suiObject) ? Data_SuiObject.fromJSON(object.suiObject) : undefined,
      suiObjectChange: isSet(object.suiObjectChange)
        ? Data_SuiObjectChange.fromJSON(object.suiObjectChange)
        : undefined,
      fuelLog: isSet(object.fuelLog) ? Data_FuelReceipt.fromJSON(object.fuelLog) : undefined,
      fuelCall: isSet(object.fuelCall) ? Data_FuelCall.fromJSON(object.fuelCall) : undefined,
      fuelTransaction: isSet(object.fuelTransaction)
        ? Data_FuelTransaction.fromJSON(object.fuelTransaction)
        : undefined,
      fuelBlock: isSet(object.fuelBlock) ? Data_FuelBlock.fromJSON(object.fuelBlock) : undefined,
      cosmosCall: isSet(object.cosmosCall) ? Data_CosmosCall.fromJSON(object.cosmosCall) : undefined,
      starknetEvents: isSet(object.starknetEvents) ? Data_StarknetEvent.fromJSON(object.starknetEvents) : undefined,
      btcTransaction: isSet(object.btcTransaction) ? Data_BTCTransaction.fromJSON(object.btcTransaction) : undefined,
      btcBlock: isSet(object.btcBlock) ? Data_BTCBlock.fromJSON(object.btcBlock) : undefined,
    };
  },

  toJSON(message: Data): unknown {
    const obj: any = {};
    if (message.ethLog !== undefined) {
      obj.ethLog = Data_EthLog.toJSON(message.ethLog);
    }
    if (message.ethBlock !== undefined) {
      obj.ethBlock = Data_EthBlock.toJSON(message.ethBlock);
    }
    if (message.ethTransaction !== undefined) {
      obj.ethTransaction = Data_EthTransaction.toJSON(message.ethTransaction);
    }
    if (message.ethTrace !== undefined) {
      obj.ethTrace = Data_EthTrace.toJSON(message.ethTrace);
    }
    if (message.solInstruction !== undefined) {
      obj.solInstruction = Data_SolInstruction.toJSON(message.solInstruction);
    }
    if (message.aptEvent !== undefined) {
      obj.aptEvent = Data_AptEvent.toJSON(message.aptEvent);
    }
    if (message.aptCall !== undefined) {
      obj.aptCall = Data_AptCall.toJSON(message.aptCall);
    }
    if (message.aptResource !== undefined) {
      obj.aptResource = Data_AptResource.toJSON(message.aptResource);
    }
    if (message.suiEvent !== undefined) {
      obj.suiEvent = Data_SuiEvent.toJSON(message.suiEvent);
    }
    if (message.suiCall !== undefined) {
      obj.suiCall = Data_SuiCall.toJSON(message.suiCall);
    }
    if (message.suiObject !== undefined) {
      obj.suiObject = Data_SuiObject.toJSON(message.suiObject);
    }
    if (message.suiObjectChange !== undefined) {
      obj.suiObjectChange = Data_SuiObjectChange.toJSON(message.suiObjectChange);
    }
    if (message.fuelLog !== undefined) {
      obj.fuelLog = Data_FuelReceipt.toJSON(message.fuelLog);
    }
    if (message.fuelCall !== undefined) {
      obj.fuelCall = Data_FuelCall.toJSON(message.fuelCall);
    }
    if (message.fuelTransaction !== undefined) {
      obj.fuelTransaction = Data_FuelTransaction.toJSON(message.fuelTransaction);
    }
    if (message.fuelBlock !== undefined) {
      obj.fuelBlock = Data_FuelBlock.toJSON(message.fuelBlock);
    }
    if (message.cosmosCall !== undefined) {
      obj.cosmosCall = Data_CosmosCall.toJSON(message.cosmosCall);
    }
    if (message.starknetEvents !== undefined) {
      obj.starknetEvents = Data_StarknetEvent.toJSON(message.starknetEvents);
    }
    if (message.btcTransaction !== undefined) {
      obj.btcTransaction = Data_BTCTransaction.toJSON(message.btcTransaction);
    }
    if (message.btcBlock !== undefined) {
      obj.btcBlock = Data_BTCBlock.toJSON(message.btcBlock);
    }
    return obj;
  },

  create(base?: DeepPartial<Data>): Data {
    return Data.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data>): Data {
    const message = createBaseData();
    message.ethLog = (object.ethLog !== undefined && object.ethLog !== null)
      ? Data_EthLog.fromPartial(object.ethLog)
      : undefined;
    message.ethBlock = (object.ethBlock !== undefined && object.ethBlock !== null)
      ? Data_EthBlock.fromPartial(object.ethBlock)
      : undefined;
    message.ethTransaction = (object.ethTransaction !== undefined && object.ethTransaction !== null)
      ? Data_EthTransaction.fromPartial(object.ethTransaction)
      : undefined;
    message.ethTrace = (object.ethTrace !== undefined && object.ethTrace !== null)
      ? Data_EthTrace.fromPartial(object.ethTrace)
      : undefined;
    message.solInstruction = (object.solInstruction !== undefined && object.solInstruction !== null)
      ? Data_SolInstruction.fromPartial(object.solInstruction)
      : undefined;
    message.aptEvent = (object.aptEvent !== undefined && object.aptEvent !== null)
      ? Data_AptEvent.fromPartial(object.aptEvent)
      : undefined;
    message.aptCall = (object.aptCall !== undefined && object.aptCall !== null)
      ? Data_AptCall.fromPartial(object.aptCall)
      : undefined;
    message.aptResource = (object.aptResource !== undefined && object.aptResource !== null)
      ? Data_AptResource.fromPartial(object.aptResource)
      : undefined;
    message.suiEvent = (object.suiEvent !== undefined && object.suiEvent !== null)
      ? Data_SuiEvent.fromPartial(object.suiEvent)
      : undefined;
    message.suiCall = (object.suiCall !== undefined && object.suiCall !== null)
      ? Data_SuiCall.fromPartial(object.suiCall)
      : undefined;
    message.suiObject = (object.suiObject !== undefined && object.suiObject !== null)
      ? Data_SuiObject.fromPartial(object.suiObject)
      : undefined;
    message.suiObjectChange = (object.suiObjectChange !== undefined && object.suiObjectChange !== null)
      ? Data_SuiObjectChange.fromPartial(object.suiObjectChange)
      : undefined;
    message.fuelLog = (object.fuelLog !== undefined && object.fuelLog !== null)
      ? Data_FuelReceipt.fromPartial(object.fuelLog)
      : undefined;
    message.fuelCall = (object.fuelCall !== undefined && object.fuelCall !== null)
      ? Data_FuelCall.fromPartial(object.fuelCall)
      : undefined;
    message.fuelTransaction = (object.fuelTransaction !== undefined && object.fuelTransaction !== null)
      ? Data_FuelTransaction.fromPartial(object.fuelTransaction)
      : undefined;
    message.fuelBlock = (object.fuelBlock !== undefined && object.fuelBlock !== null)
      ? Data_FuelBlock.fromPartial(object.fuelBlock)
      : undefined;
    message.cosmosCall = (object.cosmosCall !== undefined && object.cosmosCall !== null)
      ? Data_CosmosCall.fromPartial(object.cosmosCall)
      : undefined;
    message.starknetEvents = (object.starknetEvents !== undefined && object.starknetEvents !== null)
      ? Data_StarknetEvent.fromPartial(object.starknetEvents)
      : undefined;
    message.btcTransaction = (object.btcTransaction !== undefined && object.btcTransaction !== null)
      ? Data_BTCTransaction.fromPartial(object.btcTransaction)
      : undefined;
    message.btcBlock = (object.btcBlock !== undefined && object.btcBlock !== null)
      ? Data_BTCBlock.fromPartial(object.btcBlock)
      : undefined;
    return message;
  },
};

function createBaseData_EthLog(): Data_EthLog {
  return {
    log: undefined,
    timestamp: undefined,
    transaction: undefined,
    transactionReceipt: undefined,
    block: undefined,
    rawLog: "",
    rawTransaction: undefined,
    rawTransactionReceipt: undefined,
    rawBlock: undefined,
  };
}

export const Data_EthLog = {
  encode(message: Data_EthLog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.log !== undefined) {
      Struct.encode(Struct.wrap(message.log), writer.uint32(26).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(34).fork()).ldelim();
    }
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    if (message.transactionReceipt !== undefined) {
      Struct.encode(Struct.wrap(message.transactionReceipt), writer.uint32(42).fork()).ldelim();
    }
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(50).fork()).ldelim();
    }
    if (message.rawLog !== "") {
      writer.uint32(58).string(message.rawLog);
    }
    if (message.rawTransaction !== undefined) {
      writer.uint32(66).string(message.rawTransaction);
    }
    if (message.rawTransactionReceipt !== undefined) {
      writer.uint32(74).string(message.rawTransactionReceipt);
    }
    if (message.rawBlock !== undefined) {
      writer.uint32(82).string(message.rawBlock);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthLog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthLog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          message.log = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.rawLog = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.rawTransactionReceipt = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.rawBlock = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_EthLog {
    return {
      log: isObject(object.log) ? object.log : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      transactionReceipt: isObject(object.transactionReceipt) ? object.transactionReceipt : undefined,
      block: isObject(object.block) ? object.block : undefined,
      rawLog: isSet(object.rawLog) ? globalThis.String(object.rawLog) : "",
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : undefined,
      rawTransactionReceipt: isSet(object.rawTransactionReceipt)
        ? globalThis.String(object.rawTransactionReceipt)
        : undefined,
      rawBlock: isSet(object.rawBlock) ? globalThis.String(object.rawBlock) : undefined,
    };
  },

  toJSON(message: Data_EthLog): unknown {
    const obj: any = {};
    if (message.log !== undefined) {
      obj.log = message.log;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.transactionReceipt !== undefined) {
      obj.transactionReceipt = message.transactionReceipt;
    }
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    if (message.rawLog !== "") {
      obj.rawLog = message.rawLog;
    }
    if (message.rawTransaction !== undefined) {
      obj.rawTransaction = message.rawTransaction;
    }
    if (message.rawTransactionReceipt !== undefined) {
      obj.rawTransactionReceipt = message.rawTransactionReceipt;
    }
    if (message.rawBlock !== undefined) {
      obj.rawBlock = message.rawBlock;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_EthLog>): Data_EthLog {
    return Data_EthLog.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_EthLog>): Data_EthLog {
    const message = createBaseData_EthLog();
    message.log = object.log ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.transaction = object.transaction ?? undefined;
    message.transactionReceipt = object.transactionReceipt ?? undefined;
    message.block = object.block ?? undefined;
    message.rawLog = object.rawLog ?? "";
    message.rawTransaction = object.rawTransaction ?? undefined;
    message.rawTransactionReceipt = object.rawTransactionReceipt ?? undefined;
    message.rawBlock = object.rawBlock ?? undefined;
    return message;
  },
};

function createBaseData_EthBlock(): Data_EthBlock {
  return { block: undefined };
}

export const Data_EthBlock = {
  encode(message: Data_EthBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthBlock {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_EthBlock {
    return { block: isObject(object.block) ? object.block : undefined };
  },

  toJSON(message: Data_EthBlock): unknown {
    const obj: any = {};
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_EthBlock>): Data_EthBlock {
    return Data_EthBlock.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_EthBlock>): Data_EthBlock {
    const message = createBaseData_EthBlock();
    message.block = object.block ?? undefined;
    return message;
  },
};

function createBaseData_EthTransaction(): Data_EthTransaction {
  return {
    transaction: undefined,
    timestamp: undefined,
    transactionReceipt: undefined,
    block: undefined,
    trace: undefined,
    rawTransaction: "",
    rawTransactionReceipt: undefined,
    rawBlock: undefined,
    rawTrace: undefined,
  };
}

export const Data_EthTransaction = {
  encode(message: Data_EthTransaction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(42).fork()).ldelim();
    }
    if (message.transactionReceipt !== undefined) {
      Struct.encode(Struct.wrap(message.transactionReceipt), writer.uint32(26).fork()).ldelim();
    }
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(50).fork()).ldelim();
    }
    if (message.trace !== undefined) {
      Struct.encode(Struct.wrap(message.trace), writer.uint32(58).fork()).ldelim();
    }
    if (message.rawTransaction !== "") {
      writer.uint32(66).string(message.rawTransaction);
    }
    if (message.rawTransactionReceipt !== undefined) {
      writer.uint32(74).string(message.rawTransactionReceipt);
    }
    if (message.rawBlock !== undefined) {
      writer.uint32(82).string(message.rawBlock);
    }
    if (message.rawTrace !== undefined) {
      writer.uint32(90).string(message.rawTrace);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthTransaction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.trace = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.rawTransactionReceipt = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.rawBlock = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.rawTrace = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_EthTransaction {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      transactionReceipt: isObject(object.transactionReceipt) ? object.transactionReceipt : undefined,
      block: isObject(object.block) ? object.block : undefined,
      trace: isObject(object.trace) ? object.trace : undefined,
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : "",
      rawTransactionReceipt: isSet(object.rawTransactionReceipt)
        ? globalThis.String(object.rawTransactionReceipt)
        : undefined,
      rawBlock: isSet(object.rawBlock) ? globalThis.String(object.rawBlock) : undefined,
      rawTrace: isSet(object.rawTrace) ? globalThis.String(object.rawTrace) : undefined,
    };
  },

  toJSON(message: Data_EthTransaction): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.transactionReceipt !== undefined) {
      obj.transactionReceipt = message.transactionReceipt;
    }
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    if (message.trace !== undefined) {
      obj.trace = message.trace;
    }
    if (message.rawTransaction !== "") {
      obj.rawTransaction = message.rawTransaction;
    }
    if (message.rawTransactionReceipt !== undefined) {
      obj.rawTransactionReceipt = message.rawTransactionReceipt;
    }
    if (message.rawBlock !== undefined) {
      obj.rawBlock = message.rawBlock;
    }
    if (message.rawTrace !== undefined) {
      obj.rawTrace = message.rawTrace;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_EthTransaction>): Data_EthTransaction {
    return Data_EthTransaction.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_EthTransaction>): Data_EthTransaction {
    const message = createBaseData_EthTransaction();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.transactionReceipt = object.transactionReceipt ?? undefined;
    message.block = object.block ?? undefined;
    message.trace = object.trace ?? undefined;
    message.rawTransaction = object.rawTransaction ?? "";
    message.rawTransactionReceipt = object.rawTransactionReceipt ?? undefined;
    message.rawBlock = object.rawBlock ?? undefined;
    message.rawTrace = object.rawTrace ?? undefined;
    return message;
  },
};

function createBaseData_EthTrace(): Data_EthTrace {
  return {
    trace: undefined,
    timestamp: undefined,
    transaction: undefined,
    transactionReceipt: undefined,
    block: undefined,
  };
}

export const Data_EthTrace = {
  encode(message: Data_EthTrace, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.trace !== undefined) {
      Struct.encode(Struct.wrap(message.trace), writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(42).fork()).ldelim();
    }
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    if (message.transactionReceipt !== undefined) {
      Struct.encode(Struct.wrap(message.transactionReceipt), writer.uint32(26).fork()).ldelim();
    }
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthTrace {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthTrace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.trace = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_EthTrace {
    return {
      trace: isObject(object.trace) ? object.trace : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      transactionReceipt: isObject(object.transactionReceipt) ? object.transactionReceipt : undefined,
      block: isObject(object.block) ? object.block : undefined,
    };
  },

  toJSON(message: Data_EthTrace): unknown {
    const obj: any = {};
    if (message.trace !== undefined) {
      obj.trace = message.trace;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.transactionReceipt !== undefined) {
      obj.transactionReceipt = message.transactionReceipt;
    }
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_EthTrace>): Data_EthTrace {
    return Data_EthTrace.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_EthTrace>): Data_EthTrace {
    const message = createBaseData_EthTrace();
    message.trace = object.trace ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.transaction = object.transaction ?? undefined;
    message.transactionReceipt = object.transactionReceipt ?? undefined;
    message.block = object.block ?? undefined;
    return message;
  },
};

function createBaseData_SolInstruction(): Data_SolInstruction {
  return { instructionData: "", slot: BigInt("0"), programAccountId: "", accounts: [], parsed: undefined };
}

export const Data_SolInstruction = {
  encode(message: Data_SolInstruction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.instructionData !== "") {
      writer.uint32(10).string(message.instructionData);
    }
    if (message.slot !== BigInt("0")) {
      if (BigInt.asUintN(64, message.slot) !== message.slot) {
        throw new globalThis.Error("value provided for field message.slot of type uint64 too large");
      }
      writer.uint32(16).uint64(message.slot.toString());
    }
    if (message.programAccountId !== "") {
      writer.uint32(26).string(message.programAccountId);
    }
    for (const v of message.accounts) {
      writer.uint32(42).string(v!);
    }
    if (message.parsed !== undefined) {
      Struct.encode(Struct.wrap(message.parsed), writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SolInstruction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SolInstruction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.instructionData = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.slot = longToBigint(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.programAccountId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.accounts.push(reader.string());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.parsed = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_SolInstruction {
    return {
      instructionData: isSet(object.instructionData) ? globalThis.String(object.instructionData) : "",
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
      programAccountId: isSet(object.programAccountId) ? globalThis.String(object.programAccountId) : "",
      accounts: globalThis.Array.isArray(object?.accounts) ? object.accounts.map((e: any) => globalThis.String(e)) : [],
      parsed: isObject(object.parsed) ? object.parsed : undefined,
    };
  },

  toJSON(message: Data_SolInstruction): unknown {
    const obj: any = {};
    if (message.instructionData !== "") {
      obj.instructionData = message.instructionData;
    }
    if (message.slot !== BigInt("0")) {
      obj.slot = message.slot.toString();
    }
    if (message.programAccountId !== "") {
      obj.programAccountId = message.programAccountId;
    }
    if (message.accounts?.length) {
      obj.accounts = message.accounts;
    }
    if (message.parsed !== undefined) {
      obj.parsed = message.parsed;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_SolInstruction>): Data_SolInstruction {
    return Data_SolInstruction.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_SolInstruction>): Data_SolInstruction {
    const message = createBaseData_SolInstruction();
    message.instructionData = object.instructionData ?? "";
    message.slot = object.slot ?? BigInt("0");
    message.programAccountId = object.programAccountId ?? "";
    message.accounts = object.accounts?.map((e) => e) || [];
    message.parsed = object.parsed ?? undefined;
    return message;
  },
};

function createBaseData_AptEvent(): Data_AptEvent {
  return { rawEvent: "", eventIndex: 0, transaction: undefined, rawTransaction: "" };
}

export const Data_AptEvent = {
  encode(message: Data_AptEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.rawEvent !== "") {
      writer.uint32(10).string(message.rawEvent);
    }
    if (message.eventIndex !== 0) {
      writer.uint32(32).int32(message.eventIndex);
    }
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    if (message.rawTransaction !== "") {
      writer.uint32(26).string(message.rawTransaction);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.rawEvent = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.eventIndex = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_AptEvent {
    return {
      rawEvent: isSet(object.rawEvent) ? globalThis.String(object.rawEvent) : "",
      eventIndex: isSet(object.eventIndex) ? globalThis.Number(object.eventIndex) : 0,
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : "",
    };
  },

  toJSON(message: Data_AptEvent): unknown {
    const obj: any = {};
    if (message.rawEvent !== "") {
      obj.rawEvent = message.rawEvent;
    }
    if (message.eventIndex !== 0) {
      obj.eventIndex = Math.round(message.eventIndex);
    }
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.rawTransaction !== "") {
      obj.rawTransaction = message.rawTransaction;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_AptEvent>): Data_AptEvent {
    return Data_AptEvent.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_AptEvent>): Data_AptEvent {
    const message = createBaseData_AptEvent();
    message.rawEvent = object.rawEvent ?? "";
    message.eventIndex = object.eventIndex ?? 0;
    message.transaction = object.transaction ?? undefined;
    message.rawTransaction = object.rawTransaction ?? "";
    return message;
  },
};

function createBaseData_AptCall(): Data_AptCall {
  return { transaction: undefined, rawTransaction: "" };
}

export const Data_AptCall = {
  encode(message: Data_AptCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    if (message.rawTransaction !== "") {
      writer.uint32(26).string(message.rawTransaction);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptCall {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_AptCall {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : "",
    };
  },

  toJSON(message: Data_AptCall): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.rawTransaction !== "") {
      obj.rawTransaction = message.rawTransaction;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_AptCall>): Data_AptCall {
    return Data_AptCall.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_AptCall>): Data_AptCall {
    const message = createBaseData_AptCall();
    message.transaction = object.transaction ?? undefined;
    message.rawTransaction = object.rawTransaction ?? "";
    return message;
  },
};

function createBaseData_AptResource(): Data_AptResource {
  return { resources: [], version: BigInt("0"), timestampMicros: BigInt("0"), rawResources: [] };
}

export const Data_AptResource = {
  encode(message: Data_AptResource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resources) {
      Struct.encode(Struct.wrap(v!), writer.uint32(34).fork()).ldelim();
    }
    if (message.version !== BigInt("0")) {
      if (BigInt.asIntN(64, message.version) !== message.version) {
        throw new globalThis.Error("value provided for field message.version of type int64 too large");
      }
      writer.uint32(16).int64(message.version.toString());
    }
    if (message.timestampMicros !== BigInt("0")) {
      if (BigInt.asIntN(64, message.timestampMicros) !== message.timestampMicros) {
        throw new globalThis.Error("value provided for field message.timestampMicros of type int64 too large");
      }
      writer.uint32(40).int64(message.timestampMicros.toString());
    }
    for (const v of message.rawResources) {
      writer.uint32(50).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptResource {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptResource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.resources.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.version = longToBigint(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.timestampMicros = longToBigint(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.rawResources.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_AptResource {
    return {
      resources: globalThis.Array.isArray(object?.resources) ? [...object.resources] : [],
      version: isSet(object.version) ? BigInt(object.version) : BigInt("0"),
      timestampMicros: isSet(object.timestampMicros) ? BigInt(object.timestampMicros) : BigInt("0"),
      rawResources: globalThis.Array.isArray(object?.rawResources)
        ? object.rawResources.map((e: any) => globalThis.String(e))
        : [],
    };
  },

  toJSON(message: Data_AptResource): unknown {
    const obj: any = {};
    if (message.resources?.length) {
      obj.resources = message.resources;
    }
    if (message.version !== BigInt("0")) {
      obj.version = message.version.toString();
    }
    if (message.timestampMicros !== BigInt("0")) {
      obj.timestampMicros = message.timestampMicros.toString();
    }
    if (message.rawResources?.length) {
      obj.rawResources = message.rawResources;
    }
    return obj;
  },

  create(base?: DeepPartial<Data_AptResource>): Data_AptResource {
    return Data_AptResource.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_AptResource>): Data_AptResource {
    const message = createBaseData_AptResource();
    message.resources = object.resources?.map((e) => e) || [];
    message.version = object.version ?? BigInt("0");
    message.timestampMicros = object.timestampMicros ?? BigInt("0");
    message.rawResources = object.rawResources?.map((e) => e) || [];
    return message;
  },
};

function createBaseData_SuiEvent(): Data_SuiEvent {
  return { transaction: undefined, rawEvent: "", rawTransaction: "", timestamp: undefined, slot: BigInt("0") };
}

export const Data_SuiEvent = {
  encode(message: Data_SuiEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.rawEvent !== "") {
      writer.uint32(34).string(message.rawEvent);
    }
    if (message.rawTransaction !== "") {
      writer.uint32(42).string(message.rawTransaction);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      if (BigInt.asUintN(64, message.slot) !== message.slot) {
        throw new globalThis.Error("value provided for field message.slot of type uint64 too large");
      }
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.rawEvent = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.slot = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_SuiEvent {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      rawEvent: isSet(object.rawEvent) ? globalThis.String(object.rawEvent) : "",
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : "",
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiEvent): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.rawEvent !== "") {
      obj.rawEvent = message.rawEvent;
    }
    if (message.rawTransaction !== "") {
      obj.rawTransaction = message.rawTransaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.slot !== BigInt("0")) {
      obj.slot = message.slot.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_SuiEvent>): Data_SuiEvent {
    return Data_SuiEvent.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_SuiEvent>): Data_SuiEvent {
    const message = createBaseData_SuiEvent();
    message.transaction = object.transaction ?? undefined;
    message.rawEvent = object.rawEvent ?? "";
    message.rawTransaction = object.rawTransaction ?? "";
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiCall(): Data_SuiCall {
  return { transaction: undefined, rawTransaction: "", timestamp: undefined, slot: BigInt("0") };
}

export const Data_SuiCall = {
  encode(message: Data_SuiCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.rawTransaction !== "") {
      writer.uint32(34).string(message.rawTransaction);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      if (BigInt.asUintN(64, message.slot) !== message.slot) {
        throw new globalThis.Error("value provided for field message.slot of type uint64 too large");
      }
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiCall {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.rawTransaction = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.slot = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_SuiCall {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      rawTransaction: isSet(object.rawTransaction) ? globalThis.String(object.rawTransaction) : "",
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiCall): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.rawTransaction !== "") {
      obj.rawTransaction = message.rawTransaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.slot !== BigInt("0")) {
      obj.slot = message.slot.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_SuiCall>): Data_SuiCall {
    return Data_SuiCall.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_SuiCall>): Data_SuiCall {
    const message = createBaseData_SuiCall();
    message.transaction = object.transaction ?? undefined;
    message.rawTransaction = object.rawTransaction ?? "";
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiObject(): Data_SuiObject {
  return {
    objects: [],
    self: undefined,
    rawObjects: [],
    rawSelf: undefined,
    objectId: "",
    objectVersion: BigInt("0"),
    objectDigest: "",
    timestamp: undefined,
    slot: BigInt("0"),
  };
}

export const Data_SuiObject = {
  encode(message: Data_SuiObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.objects) {
      Struct.encode(Struct.wrap(v!), writer.uint32(10).fork()).ldelim();
    }
    if (message.self !== undefined) {
      Struct.encode(Struct.wrap(message.self), writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.rawObjects) {
      writer.uint32(82).string(v!);
    }
    if (message.rawSelf !== undefined) {
      writer.uint32(74).string(message.rawSelf);
    }
    if (message.objectId !== "") {
      writer.uint32(42).string(message.objectId);
    }
    if (message.objectVersion !== BigInt("0")) {
      if (BigInt.asUintN(64, message.objectVersion) !== message.objectVersion) {
        throw new globalThis.Error("value provided for field message.objectVersion of type uint64 too large");
      }
      writer.uint32(48).uint64(message.objectVersion.toString());
    }
    if (message.objectDigest !== "") {
      writer.uint32(58).string(message.objectDigest);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      if (BigInt.asUintN(64, message.slot) !== message.slot) {
        throw new globalThis.Error("value provided for field message.slot of type uint64 too large");
      }
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiObject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.objects.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.self = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.rawObjects.push(reader.string());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.rawSelf = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.objectId = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.objectVersion = longToBigint(reader.uint64() as Long);
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.objectDigest = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.slot = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_SuiObject {
    return {
      objects: globalThis.Array.isArray(object?.objects) ? [...object.objects] : [],
      self: isObject(object.self) ? object.self : undefined,
      rawObjects: globalThis.Array.isArray(object?.rawObjects)
        ? object.rawObjects.map((e: any) => globalThis.String(e))
        : [],
      rawSelf: isSet(object.rawSelf) ? globalThis.String(object.rawSelf) : undefined,
      objectId: isSet(object.objectId) ? globalThis.String(object.objectId) : "",
      objectVersion: isSet(object.objectVersion) ? BigInt(object.objectVersion) : BigInt("0"),
      objectDigest: isSet(object.objectDigest) ? globalThis.String(object.objectDigest) : "",
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiObject): unknown {
    const obj: any = {};
    if (message.objects?.length) {
      obj.objects = message.objects;
    }
    if (message.self !== undefined) {
      obj.self = message.self;
    }
    if (message.rawObjects?.length) {
      obj.rawObjects = message.rawObjects;
    }
    if (message.rawSelf !== undefined) {
      obj.rawSelf = message.rawSelf;
    }
    if (message.objectId !== "") {
      obj.objectId = message.objectId;
    }
    if (message.objectVersion !== BigInt("0")) {
      obj.objectVersion = message.objectVersion.toString();
    }
    if (message.objectDigest !== "") {
      obj.objectDigest = message.objectDigest;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.slot !== BigInt("0")) {
      obj.slot = message.slot.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_SuiObject>): Data_SuiObject {
    return Data_SuiObject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_SuiObject>): Data_SuiObject {
    const message = createBaseData_SuiObject();
    message.objects = object.objects?.map((e) => e) || [];
    message.self = object.self ?? undefined;
    message.rawObjects = object.rawObjects?.map((e) => e) || [];
    message.rawSelf = object.rawSelf ?? undefined;
    message.objectId = object.objectId ?? "";
    message.objectVersion = object.objectVersion ?? BigInt("0");
    message.objectDigest = object.objectDigest ?? "";
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiObjectChange(): Data_SuiObjectChange {
  return { changes: [], rawChanges: [], timestamp: undefined, txDigest: "", slot: BigInt("0") };
}

export const Data_SuiObjectChange = {
  encode(message: Data_SuiObjectChange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.changes) {
      Struct.encode(Struct.wrap(v!), writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.rawChanges) {
      writer.uint32(42).string(v!);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.txDigest !== "") {
      writer.uint32(34).string(message.txDigest);
    }
    if (message.slot !== BigInt("0")) {
      if (BigInt.asUintN(64, message.slot) !== message.slot) {
        throw new globalThis.Error("value provided for field message.slot of type uint64 too large");
      }
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiObjectChange {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiObjectChange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.changes.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.rawChanges.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.txDigest = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.slot = longToBigint(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_SuiObjectChange {
    return {
      changes: globalThis.Array.isArray(object?.changes) ? [...object.changes] : [],
      rawChanges: globalThis.Array.isArray(object?.rawChanges)
        ? object.rawChanges.map((e: any) => globalThis.String(e))
        : [],
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      txDigest: isSet(object.txDigest) ? globalThis.String(object.txDigest) : "",
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiObjectChange): unknown {
    const obj: any = {};
    if (message.changes?.length) {
      obj.changes = message.changes;
    }
    if (message.rawChanges?.length) {
      obj.rawChanges = message.rawChanges;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.txDigest !== "") {
      obj.txDigest = message.txDigest;
    }
    if (message.slot !== BigInt("0")) {
      obj.slot = message.slot.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_SuiObjectChange>): Data_SuiObjectChange {
    return Data_SuiObjectChange.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_SuiObjectChange>): Data_SuiObjectChange {
    const message = createBaseData_SuiObjectChange();
    message.changes = object.changes?.map((e) => e) || [];
    message.rawChanges = object.rawChanges?.map((e) => e) || [];
    message.timestamp = object.timestamp ?? undefined;
    message.txDigest = object.txDigest ?? "";
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_FuelReceipt(): Data_FuelReceipt {
  return { transaction: undefined, timestamp: undefined, receiptIndex: BigInt("0") };
}

export const Data_FuelReceipt = {
  encode(message: Data_FuelReceipt, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.receiptIndex !== BigInt("0")) {
      if (BigInt.asIntN(64, message.receiptIndex) !== message.receiptIndex) {
        throw new globalThis.Error("value provided for field message.receiptIndex of type int64 too large");
      }
      writer.uint32(24).int64(message.receiptIndex.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_FuelReceipt {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_FuelReceipt();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.receiptIndex = longToBigint(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_FuelReceipt {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      receiptIndex: isSet(object.receiptIndex) ? BigInt(object.receiptIndex) : BigInt("0"),
    };
  },

  toJSON(message: Data_FuelReceipt): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.receiptIndex !== BigInt("0")) {
      obj.receiptIndex = message.receiptIndex.toString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_FuelReceipt>): Data_FuelReceipt {
    return Data_FuelReceipt.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_FuelReceipt>): Data_FuelReceipt {
    const message = createBaseData_FuelReceipt();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.receiptIndex = object.receiptIndex ?? BigInt("0");
    return message;
  },
};

function createBaseData_FuelTransaction(): Data_FuelTransaction {
  return { transaction: undefined, timestamp: undefined };
}

export const Data_FuelTransaction = {
  encode(message: Data_FuelTransaction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_FuelTransaction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_FuelTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_FuelTransaction {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_FuelTransaction): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_FuelTransaction>): Data_FuelTransaction {
    return Data_FuelTransaction.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_FuelTransaction>): Data_FuelTransaction {
    const message = createBaseData_FuelTransaction();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_FuelCall(): Data_FuelCall {
  return { transaction: undefined, timestamp: undefined };
}

export const Data_FuelCall = {
  encode(message: Data_FuelCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_FuelCall {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_FuelCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_FuelCall {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_FuelCall): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_FuelCall>): Data_FuelCall {
    return Data_FuelCall.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_FuelCall>): Data_FuelCall {
    const message = createBaseData_FuelCall();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_FuelBlock(): Data_FuelBlock {
  return { block: undefined, timestamp: undefined };
}

export const Data_FuelBlock = {
  encode(message: Data_FuelBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_FuelBlock {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_FuelBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_FuelBlock {
    return {
      block: isObject(object.block) ? object.block : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_FuelBlock): unknown {
    const obj: any = {};
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_FuelBlock>): Data_FuelBlock {
    return Data_FuelBlock.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_FuelBlock>): Data_FuelBlock {
    const message = createBaseData_FuelBlock();
    message.block = object.block ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_CosmosCall(): Data_CosmosCall {
  return { transaction: undefined, timestamp: undefined };
}

export const Data_CosmosCall = {
  encode(message: Data_CosmosCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_CosmosCall {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_CosmosCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_CosmosCall {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_CosmosCall): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_CosmosCall>): Data_CosmosCall {
    return Data_CosmosCall.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_CosmosCall>): Data_CosmosCall {
    const message = createBaseData_CosmosCall();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_StarknetEvent(): Data_StarknetEvent {
  return { result: undefined, timestamp: undefined };
}

export const Data_StarknetEvent = {
  encode(message: Data_StarknetEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result !== undefined) {
      Struct.encode(Struct.wrap(message.result), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_StarknetEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_StarknetEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.result = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_StarknetEvent {
    return {
      result: isObject(object.result) ? object.result : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_StarknetEvent): unknown {
    const obj: any = {};
    if (message.result !== undefined) {
      obj.result = message.result;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_StarknetEvent>): Data_StarknetEvent {
    return Data_StarknetEvent.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_StarknetEvent>): Data_StarknetEvent {
    const message = createBaseData_StarknetEvent();
    message.result = object.result ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_BTCTransaction(): Data_BTCTransaction {
  return { transaction: undefined, timestamp: undefined };
}

export const Data_BTCTransaction = {
  encode(message: Data_BTCTransaction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_BTCTransaction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_BTCTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_BTCTransaction {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_BTCTransaction): unknown {
    const obj: any = {};
    if (message.transaction !== undefined) {
      obj.transaction = message.transaction;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_BTCTransaction>): Data_BTCTransaction {
    return Data_BTCTransaction.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_BTCTransaction>): Data_BTCTransaction {
    const message = createBaseData_BTCTransaction();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseData_BTCBlock(): Data_BTCBlock {
  return { block: undefined, timestamp: undefined };
}

export const Data_BTCBlock = {
  encode(message: Data_BTCBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.block !== undefined) {
      Struct.encode(Struct.wrap(message.block), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_BTCBlock {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_BTCBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Data_BTCBlock {
    return {
      block: isObject(object.block) ? object.block : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: Data_BTCBlock): unknown {
    const obj: any = {};
    if (message.block !== undefined) {
      obj.block = message.block;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<Data_BTCBlock>): Data_BTCBlock {
    return Data_BTCBlock.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Data_BTCBlock>): Data_BTCBlock {
    const message = createBaseData_BTCBlock();
    message.block = object.block ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseDataBinding(): DataBinding {
  return { data: undefined, handlerType: 0, handlerIds: [] };
}

export const DataBinding = {
  encode(message: DataBinding, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data !== undefined) {
      Data.encode(message.data, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerType !== 0) {
      writer.uint32(24).int32(message.handlerType);
    }
    writer.uint32(34).fork();
    for (const v of message.handlerIds) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataBinding {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataBinding();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.data = Data.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.handlerType = reader.int32() as any;
          continue;
        case 4:
          if (tag === 32) {
            message.handlerIds.push(reader.int32());

            continue;
          }

          if (tag === 34) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.handlerIds.push(reader.int32());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DataBinding {
    return {
      data: isSet(object.data) ? Data.fromJSON(object.data) : undefined,
      handlerType: isSet(object.handlerType) ? handlerTypeFromJSON(object.handlerType) : 0,
      handlerIds: globalThis.Array.isArray(object?.handlerIds)
        ? object.handlerIds.map((e: any) => globalThis.Number(e))
        : [],
    };
  },

  toJSON(message: DataBinding): unknown {
    const obj: any = {};
    if (message.data !== undefined) {
      obj.data = Data.toJSON(message.data);
    }
    if (message.handlerType !== 0) {
      obj.handlerType = handlerTypeToJSON(message.handlerType);
    }
    if (message.handlerIds?.length) {
      obj.handlerIds = message.handlerIds.map((e) => Math.round(e));
    }
    return obj;
  },

  create(base?: DeepPartial<DataBinding>): DataBinding {
    return DataBinding.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DataBinding>): DataBinding {
    const message = createBaseDataBinding();
    message.data = (object.data !== undefined && object.data !== null) ? Data.fromPartial(object.data) : undefined;
    message.handlerType = object.handlerType ?? 0;
    message.handlerIds = object.handlerIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseStateResult(): StateResult {
  return { configUpdated: false, error: undefined };
}

export const StateResult = {
  encode(message: StateResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.configUpdated !== false) {
      writer.uint32(8).bool(message.configUpdated);
    }
    if (message.error !== undefined) {
      writer.uint32(18).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.configUpdated = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StateResult {
    return {
      configUpdated: isSet(object.configUpdated) ? globalThis.Boolean(object.configUpdated) : false,
      error: isSet(object.error) ? globalThis.String(object.error) : undefined,
    };
  },

  toJSON(message: StateResult): unknown {
    const obj: any = {};
    if (message.configUpdated !== false) {
      obj.configUpdated = message.configUpdated;
    }
    if (message.error !== undefined) {
      obj.error = message.error;
    }
    return obj;
  },

  create(base?: DeepPartial<StateResult>): StateResult {
    return StateResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StateResult>): StateResult {
    const message = createBaseStateResult();
    message.configUpdated = object.configUpdated ?? false;
    message.error = object.error ?? undefined;
    return message;
  },
};

function createBaseProcessResult(): ProcessResult {
  return { gauges: [], counters: [], logs: [], events: [], exports: [], states: undefined };
}

export const ProcessResult = {
  encode(message: ProcessResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gauges) {
      GaugeResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.counters) {
      CounterResult.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.logs) {
      LogResult.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.events) {
      EventTrackingResult.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.exports) {
      ExportResult.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.states !== undefined) {
      StateResult.encode(message.states, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gauges.push(GaugeResult.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.counters.push(CounterResult.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.logs.push(LogResult.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.events.push(EventTrackingResult.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.exports.push(ExportResult.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.states = StateResult.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProcessResult {
    return {
      gauges: globalThis.Array.isArray(object?.gauges) ? object.gauges.map((e: any) => GaugeResult.fromJSON(e)) : [],
      counters: globalThis.Array.isArray(object?.counters)
        ? object.counters.map((e: any) => CounterResult.fromJSON(e))
        : [],
      logs: globalThis.Array.isArray(object?.logs) ? object.logs.map((e: any) => LogResult.fromJSON(e)) : [],
      events: globalThis.Array.isArray(object?.events)
        ? object.events.map((e: any) => EventTrackingResult.fromJSON(e))
        : [],
      exports: globalThis.Array.isArray(object?.exports)
        ? object.exports.map((e: any) => ExportResult.fromJSON(e))
        : [],
      states: isSet(object.states) ? StateResult.fromJSON(object.states) : undefined,
    };
  },

  toJSON(message: ProcessResult): unknown {
    const obj: any = {};
    if (message.gauges?.length) {
      obj.gauges = message.gauges.map((e) => GaugeResult.toJSON(e));
    }
    if (message.counters?.length) {
      obj.counters = message.counters.map((e) => CounterResult.toJSON(e));
    }
    if (message.logs?.length) {
      obj.logs = message.logs.map((e) => LogResult.toJSON(e));
    }
    if (message.events?.length) {
      obj.events = message.events.map((e) => EventTrackingResult.toJSON(e));
    }
    if (message.exports?.length) {
      obj.exports = message.exports.map((e) => ExportResult.toJSON(e));
    }
    if (message.states !== undefined) {
      obj.states = StateResult.toJSON(message.states);
    }
    return obj;
  },

  create(base?: DeepPartial<ProcessResult>): ProcessResult {
    return ProcessResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ProcessResult>): ProcessResult {
    const message = createBaseProcessResult();
    message.gauges = object.gauges?.map((e) => GaugeResult.fromPartial(e)) || [];
    message.counters = object.counters?.map((e) => CounterResult.fromPartial(e)) || [];
    message.logs = object.logs?.map((e) => LogResult.fromPartial(e)) || [];
    message.events = object.events?.map((e) => EventTrackingResult.fromPartial(e)) || [];
    message.exports = object.exports?.map((e) => ExportResult.fromPartial(e)) || [];
    message.states = (object.states !== undefined && object.states !== null)
      ? StateResult.fromPartial(object.states)
      : undefined;
    return message;
  },
};

function createBaseEthCallParam(): EthCallParam {
  return { context: undefined, calldata: "" };
}

export const EthCallParam = {
  encode(message: EthCallParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.context !== undefined) {
      EthCallContext.encode(message.context, writer.uint32(10).fork()).ldelim();
    }
    if (message.calldata !== "") {
      writer.uint32(18).string(message.calldata);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EthCallParam {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEthCallParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.context = EthCallContext.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.calldata = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EthCallParam {
    return {
      context: isSet(object.context) ? EthCallContext.fromJSON(object.context) : undefined,
      calldata: isSet(object.calldata) ? globalThis.String(object.calldata) : "",
    };
  },

  toJSON(message: EthCallParam): unknown {
    const obj: any = {};
    if (message.context !== undefined) {
      obj.context = EthCallContext.toJSON(message.context);
    }
    if (message.calldata !== "") {
      obj.calldata = message.calldata;
    }
    return obj;
  },

  create(base?: DeepPartial<EthCallParam>): EthCallParam {
    return EthCallParam.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EthCallParam>): EthCallParam {
    const message = createBaseEthCallParam();
    message.context = (object.context !== undefined && object.context !== null)
      ? EthCallContext.fromPartial(object.context)
      : undefined;
    message.calldata = object.calldata ?? "";
    return message;
  },
};

function createBaseEthCallContext(): EthCallContext {
  return { chainId: "", address: "", blockTag: "" };
}

export const EthCallContext = {
  encode(message: EthCallContext, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    if (message.blockTag !== "") {
      writer.uint32(26).string(message.blockTag);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EthCallContext {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEthCallContext();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.blockTag = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EthCallContext {
    return {
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      blockTag: isSet(object.blockTag) ? globalThis.String(object.blockTag) : "",
    };
  },

  toJSON(message: EthCallContext): unknown {
    const obj: any = {};
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.blockTag !== "") {
      obj.blockTag = message.blockTag;
    }
    return obj;
  },

  create(base?: DeepPartial<EthCallContext>): EthCallContext {
    return EthCallContext.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EthCallContext>): EthCallContext {
    const message = createBaseEthCallContext();
    message.chainId = object.chainId ?? "";
    message.address = object.address ?? "";
    message.blockTag = object.blockTag ?? "";
    return message;
  },
};

function createBasePreprocessResult(): PreprocessResult {
  return { ethCallParams: [] };
}

export const PreprocessResult = {
  encode(message: PreprocessResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.ethCallParams) {
      EthCallParam.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreprocessResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreprocessResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ethCallParams.push(EthCallParam.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreprocessResult {
    return {
      ethCallParams: globalThis.Array.isArray(object?.ethCallParams)
        ? object.ethCallParams.map((e: any) => EthCallParam.fromJSON(e))
        : [],
    };
  },

  toJSON(message: PreprocessResult): unknown {
    const obj: any = {};
    if (message.ethCallParams?.length) {
      obj.ethCallParams = message.ethCallParams.map((e) => EthCallParam.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<PreprocessResult>): PreprocessResult {
    return PreprocessResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreprocessResult>): PreprocessResult {
    const message = createBasePreprocessResult();
    message.ethCallParams = object.ethCallParams?.map((e) => EthCallParam.fromPartial(e)) || [];
    return message;
  },
};

function createBasePreparedData(): PreparedData {
  return { ethCallResults: {} };
}

export const PreparedData = {
  encode(message: PreparedData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.ethCallResults).forEach(([key, value]) => {
      PreparedData_EthCallResultsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreparedData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreparedData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = PreparedData_EthCallResultsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.ethCallResults[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreparedData {
    return {
      ethCallResults: isObject(object.ethCallResults)
        ? Object.entries(object.ethCallResults).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: PreparedData): unknown {
    const obj: any = {};
    if (message.ethCallResults) {
      const entries = Object.entries(message.ethCallResults);
      if (entries.length > 0) {
        obj.ethCallResults = {};
        entries.forEach(([k, v]) => {
          obj.ethCallResults[k] = v;
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<PreparedData>): PreparedData {
    return PreparedData.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreparedData>): PreparedData {
    const message = createBasePreparedData();
    message.ethCallResults = Object.entries(object.ethCallResults ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBasePreparedData_EthCallResultsEntry(): PreparedData_EthCallResultsEntry {
  return { key: "", value: "" };
}

export const PreparedData_EthCallResultsEntry = {
  encode(message: PreparedData_EthCallResultsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PreparedData_EthCallResultsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePreparedData_EthCallResultsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PreparedData_EthCallResultsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: PreparedData_EthCallResultsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<PreparedData_EthCallResultsEntry>): PreparedData_EthCallResultsEntry {
    return PreparedData_EthCallResultsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PreparedData_EthCallResultsEntry>): PreparedData_EthCallResultsEntry {
    const message = createBasePreparedData_EthCallResultsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseRecordMetaData(): RecordMetaData {
  return {
    address: "",
    contractName: "",
    blockNumber: BigInt("0"),
    transactionHash: "",
    chainId: "",
    transactionIndex: 0,
    logIndex: 0,
    name: "",
    labels: {},
  };
}

export const RecordMetaData = {
  encode(message: RecordMetaData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.contractName !== "") {
      writer.uint32(74).string(message.contractName);
    }
    if (message.blockNumber !== BigInt("0")) {
      if (BigInt.asUintN(64, message.blockNumber) !== message.blockNumber) {
        throw new globalThis.Error("value provided for field message.blockNumber of type uint64 too large");
      }
      writer.uint32(16).uint64(message.blockNumber.toString());
    }
    if (message.transactionHash !== "") {
      writer.uint32(50).string(message.transactionHash);
    }
    if (message.chainId !== "") {
      writer.uint32(42).string(message.chainId);
    }
    if (message.transactionIndex !== 0) {
      writer.uint32(24).int32(message.transactionIndex);
    }
    if (message.logIndex !== 0) {
      writer.uint32(32).int32(message.logIndex);
    }
    if (message.name !== "") {
      writer.uint32(82).string(message.name);
    }
    Object.entries(message.labels).forEach(([key, value]) => {
      RecordMetaData_LabelsEntry.encode({ key: key as any, value }, writer.uint32(58).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RecordMetaData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRecordMetaData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.contractName = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.blockNumber = longToBigint(reader.uint64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.transactionHash = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.chainId = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.transactionIndex = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.logIndex = reader.int32();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.name = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          const entry7 = RecordMetaData_LabelsEntry.decode(reader, reader.uint32());
          if (entry7.value !== undefined) {
            message.labels[entry7.key] = entry7.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RecordMetaData {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      contractName: isSet(object.contractName) ? globalThis.String(object.contractName) : "",
      blockNumber: isSet(object.blockNumber) ? BigInt(object.blockNumber) : BigInt("0"),
      transactionHash: isSet(object.transactionHash) ? globalThis.String(object.transactionHash) : "",
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      transactionIndex: isSet(object.transactionIndex) ? globalThis.Number(object.transactionIndex) : 0,
      logIndex: isSet(object.logIndex) ? globalThis.Number(object.logIndex) : 0,
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      labels: isObject(object.labels)
        ? Object.entries(object.labels).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: RecordMetaData): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.contractName !== "") {
      obj.contractName = message.contractName;
    }
    if (message.blockNumber !== BigInt("0")) {
      obj.blockNumber = message.blockNumber.toString();
    }
    if (message.transactionHash !== "") {
      obj.transactionHash = message.transactionHash;
    }
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.transactionIndex !== 0) {
      obj.transactionIndex = Math.round(message.transactionIndex);
    }
    if (message.logIndex !== 0) {
      obj.logIndex = Math.round(message.logIndex);
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.labels) {
      const entries = Object.entries(message.labels);
      if (entries.length > 0) {
        obj.labels = {};
        entries.forEach(([k, v]) => {
          obj.labels[k] = v;
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<RecordMetaData>): RecordMetaData {
    return RecordMetaData.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RecordMetaData>): RecordMetaData {
    const message = createBaseRecordMetaData();
    message.address = object.address ?? "";
    message.contractName = object.contractName ?? "";
    message.blockNumber = object.blockNumber ?? BigInt("0");
    message.transactionHash = object.transactionHash ?? "";
    message.chainId = object.chainId ?? "";
    message.transactionIndex = object.transactionIndex ?? 0;
    message.logIndex = object.logIndex ?? 0;
    message.name = object.name ?? "";
    message.labels = Object.entries(object.labels ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseRecordMetaData_LabelsEntry(): RecordMetaData_LabelsEntry {
  return { key: "", value: "" };
}

export const RecordMetaData_LabelsEntry = {
  encode(message: RecordMetaData_LabelsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RecordMetaData_LabelsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRecordMetaData_LabelsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RecordMetaData_LabelsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: RecordMetaData_LabelsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create(base?: DeepPartial<RecordMetaData_LabelsEntry>): RecordMetaData_LabelsEntry {
    return RecordMetaData_LabelsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RecordMetaData_LabelsEntry>): RecordMetaData_LabelsEntry {
    const message = createBaseRecordMetaData_LabelsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseMetricValue(): MetricValue {
  return { bigDecimal: undefined, doubleValue: undefined, bigInteger: undefined };
}

export const MetricValue = {
  encode(message: MetricValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bigDecimal !== undefined) {
      writer.uint32(10).string(message.bigDecimal);
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(17).double(message.doubleValue);
    }
    if (message.bigInteger !== undefined) {
      BigInteger.encode(message.bigInteger, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MetricValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetricValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.bigDecimal = reader.string();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.doubleValue = reader.double();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.bigInteger = BigInteger.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MetricValue {
    return {
      bigDecimal: isSet(object.bigDecimal) ? globalThis.String(object.bigDecimal) : undefined,
      doubleValue: isSet(object.doubleValue) ? globalThis.Number(object.doubleValue) : undefined,
      bigInteger: isSet(object.bigInteger) ? BigInteger.fromJSON(object.bigInteger) : undefined,
    };
  },

  toJSON(message: MetricValue): unknown {
    const obj: any = {};
    if (message.bigDecimal !== undefined) {
      obj.bigDecimal = message.bigDecimal;
    }
    if (message.doubleValue !== undefined) {
      obj.doubleValue = message.doubleValue;
    }
    if (message.bigInteger !== undefined) {
      obj.bigInteger = BigInteger.toJSON(message.bigInteger);
    }
    return obj;
  },

  create(base?: DeepPartial<MetricValue>): MetricValue {
    return MetricValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MetricValue>): MetricValue {
    const message = createBaseMetricValue();
    message.bigDecimal = object.bigDecimal ?? undefined;
    message.doubleValue = object.doubleValue ?? undefined;
    message.bigInteger = (object.bigInteger !== undefined && object.bigInteger !== null)
      ? BigInteger.fromPartial(object.bigInteger)
      : undefined;
    return message;
  },
};

function createBaseRuntimeInfo(): RuntimeInfo {
  return { from: 0 };
}

export const RuntimeInfo = {
  encode(message: RuntimeInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== 0) {
      writer.uint32(8).int32(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.from = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfo {
    return { from: isSet(object.from) ? handlerTypeFromJSON(object.from) : 0 };
  },

  toJSON(message: RuntimeInfo): unknown {
    const obj: any = {};
    if (message.from !== 0) {
      obj.from = handlerTypeToJSON(message.from);
    }
    return obj;
  },

  create(base?: DeepPartial<RuntimeInfo>): RuntimeInfo {
    return RuntimeInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RuntimeInfo>): RuntimeInfo {
    const message = createBaseRuntimeInfo();
    message.from = object.from ?? 0;
    return message;
  },
};

function createBaseGaugeResult(): GaugeResult {
  return { metadata: undefined, metricValue: undefined, runtimeInfo: undefined };
}

export const GaugeResult = {
  encode(message: GaugeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    if (message.metricValue !== undefined) {
      MetricValue.encode(message.metricValue, writer.uint32(18).fork()).ldelim();
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GaugeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGaugeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.metricValue = MetricValue.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GaugeResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      metricValue: isSet(object.metricValue) ? MetricValue.fromJSON(object.metricValue) : undefined,
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: GaugeResult): unknown {
    const obj: any = {};
    if (message.metadata !== undefined) {
      obj.metadata = RecordMetaData.toJSON(message.metadata);
    }
    if (message.metricValue !== undefined) {
      obj.metricValue = MetricValue.toJSON(message.metricValue);
    }
    if (message.runtimeInfo !== undefined) {
      obj.runtimeInfo = RuntimeInfo.toJSON(message.runtimeInfo);
    }
    return obj;
  },

  create(base?: DeepPartial<GaugeResult>): GaugeResult {
    return GaugeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GaugeResult>): GaugeResult {
    const message = createBaseGaugeResult();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? RecordMetaData.fromPartial(object.metadata)
      : undefined;
    message.metricValue = (object.metricValue !== undefined && object.metricValue !== null)
      ? MetricValue.fromPartial(object.metricValue)
      : undefined;
    message.runtimeInfo = (object.runtimeInfo !== undefined && object.runtimeInfo !== null)
      ? RuntimeInfo.fromPartial(object.runtimeInfo)
      : undefined;
    return message;
  },
};

function createBaseCounterResult(): CounterResult {
  return { metadata: undefined, metricValue: undefined, add: false, runtimeInfo: undefined };
}

export const CounterResult = {
  encode(message: CounterResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    if (message.metricValue !== undefined) {
      MetricValue.encode(message.metricValue, writer.uint32(18).fork()).ldelim();
    }
    if (message.add !== false) {
      writer.uint32(24).bool(message.add);
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CounterResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCounterResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.metricValue = MetricValue.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.add = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CounterResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      metricValue: isSet(object.metricValue) ? MetricValue.fromJSON(object.metricValue) : undefined,
      add: isSet(object.add) ? globalThis.Boolean(object.add) : false,
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: CounterResult): unknown {
    const obj: any = {};
    if (message.metadata !== undefined) {
      obj.metadata = RecordMetaData.toJSON(message.metadata);
    }
    if (message.metricValue !== undefined) {
      obj.metricValue = MetricValue.toJSON(message.metricValue);
    }
    if (message.add !== false) {
      obj.add = message.add;
    }
    if (message.runtimeInfo !== undefined) {
      obj.runtimeInfo = RuntimeInfo.toJSON(message.runtimeInfo);
    }
    return obj;
  },

  create(base?: DeepPartial<CounterResult>): CounterResult {
    return CounterResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CounterResult>): CounterResult {
    const message = createBaseCounterResult();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? RecordMetaData.fromPartial(object.metadata)
      : undefined;
    message.metricValue = (object.metricValue !== undefined && object.metricValue !== null)
      ? MetricValue.fromPartial(object.metricValue)
      : undefined;
    message.add = object.add ?? false;
    message.runtimeInfo = (object.runtimeInfo !== undefined && object.runtimeInfo !== null)
      ? RuntimeInfo.fromPartial(object.runtimeInfo)
      : undefined;
    return message;
  },
};

function createBaseLogResult(): LogResult {
  return { metadata: undefined, level: 0, message: "", attributes: "", attributes2: undefined, runtimeInfo: undefined };
}

export const LogResult = {
  encode(message: LogResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    if (message.level !== 0) {
      writer.uint32(16).int32(message.level);
    }
    if (message.message !== "") {
      writer.uint32(26).string(message.message);
    }
    if (message.attributes !== "") {
      writer.uint32(50).string(message.attributes);
    }
    if (message.attributes2 !== undefined) {
      Struct.encode(Struct.wrap(message.attributes2), writer.uint32(58).fork()).ldelim();
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.level = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.message = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.attributes = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.attributes2 = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LogResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      level: isSet(object.level) ? logLevelFromJSON(object.level) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      attributes: isSet(object.attributes) ? globalThis.String(object.attributes) : "",
      attributes2: isObject(object.attributes2) ? object.attributes2 : undefined,
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: LogResult): unknown {
    const obj: any = {};
    if (message.metadata !== undefined) {
      obj.metadata = RecordMetaData.toJSON(message.metadata);
    }
    if (message.level !== 0) {
      obj.level = logLevelToJSON(message.level);
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.attributes !== "") {
      obj.attributes = message.attributes;
    }
    if (message.attributes2 !== undefined) {
      obj.attributes2 = message.attributes2;
    }
    if (message.runtimeInfo !== undefined) {
      obj.runtimeInfo = RuntimeInfo.toJSON(message.runtimeInfo);
    }
    return obj;
  },

  create(base?: DeepPartial<LogResult>): LogResult {
    return LogResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LogResult>): LogResult {
    const message = createBaseLogResult();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? RecordMetaData.fromPartial(object.metadata)
      : undefined;
    message.level = object.level ?? 0;
    message.message = object.message ?? "";
    message.attributes = object.attributes ?? "";
    message.attributes2 = object.attributes2 ?? undefined;
    message.runtimeInfo = (object.runtimeInfo !== undefined && object.runtimeInfo !== null)
      ? RuntimeInfo.fromPartial(object.runtimeInfo)
      : undefined;
    return message;
  },
};

function createBaseEventTrackingResult(): EventTrackingResult {
  return {
    metadata: undefined,
    distinctEntityId: "",
    attributes: undefined,
    severity: 0,
    message: "",
    runtimeInfo: undefined,
    attributes2: undefined,
    noMetric: false,
  };
}

export const EventTrackingResult = {
  encode(message: EventTrackingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    if (message.distinctEntityId !== "") {
      writer.uint32(18).string(message.distinctEntityId);
    }
    if (message.attributes !== undefined) {
      Struct.encode(Struct.wrap(message.attributes), writer.uint32(50).fork()).ldelim();
    }
    if (message.severity !== 0) {
      writer.uint32(56).int32(message.severity);
    }
    if (message.message !== "") {
      writer.uint32(66).string(message.message);
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(42).fork()).ldelim();
    }
    if (message.attributes2 !== undefined) {
      RichStruct.encode(message.attributes2, writer.uint32(74).fork()).ldelim();
    }
    if (message.noMetric !== false) {
      writer.uint32(24).bool(message.noMetric);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventTrackingResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTrackingResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.distinctEntityId = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.attributes = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.severity = reader.int32() as any;
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.message = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.attributes2 = RichStruct.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.noMetric = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventTrackingResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      distinctEntityId: isSet(object.distinctEntityId) ? globalThis.String(object.distinctEntityId) : "",
      attributes: isObject(object.attributes) ? object.attributes : undefined,
      severity: isSet(object.severity) ? logLevelFromJSON(object.severity) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
      attributes2: isSet(object.attributes2) ? RichStruct.fromJSON(object.attributes2) : undefined,
      noMetric: isSet(object.noMetric) ? globalThis.Boolean(object.noMetric) : false,
    };
  },

  toJSON(message: EventTrackingResult): unknown {
    const obj: any = {};
    if (message.metadata !== undefined) {
      obj.metadata = RecordMetaData.toJSON(message.metadata);
    }
    if (message.distinctEntityId !== "") {
      obj.distinctEntityId = message.distinctEntityId;
    }
    if (message.attributes !== undefined) {
      obj.attributes = message.attributes;
    }
    if (message.severity !== 0) {
      obj.severity = logLevelToJSON(message.severity);
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.runtimeInfo !== undefined) {
      obj.runtimeInfo = RuntimeInfo.toJSON(message.runtimeInfo);
    }
    if (message.attributes2 !== undefined) {
      obj.attributes2 = RichStruct.toJSON(message.attributes2);
    }
    if (message.noMetric !== false) {
      obj.noMetric = message.noMetric;
    }
    return obj;
  },

  create(base?: DeepPartial<EventTrackingResult>): EventTrackingResult {
    return EventTrackingResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventTrackingResult>): EventTrackingResult {
    const message = createBaseEventTrackingResult();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? RecordMetaData.fromPartial(object.metadata)
      : undefined;
    message.distinctEntityId = object.distinctEntityId ?? "";
    message.attributes = object.attributes ?? undefined;
    message.severity = object.severity ?? 0;
    message.message = object.message ?? "";
    message.runtimeInfo = (object.runtimeInfo !== undefined && object.runtimeInfo !== null)
      ? RuntimeInfo.fromPartial(object.runtimeInfo)
      : undefined;
    message.attributes2 = (object.attributes2 !== undefined && object.attributes2 !== null)
      ? RichStruct.fromPartial(object.attributes2)
      : undefined;
    message.noMetric = object.noMetric ?? false;
    return message;
  },
};

function createBaseExportResult(): ExportResult {
  return { metadata: undefined, payload: "", runtimeInfo: undefined };
}

export const ExportResult = {
  encode(message: ExportResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    if (message.payload !== "") {
      writer.uint32(18).string(message.payload);
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExportResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExportResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payload = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ExportResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      payload: isSet(object.payload) ? globalThis.String(object.payload) : "",
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: ExportResult): unknown {
    const obj: any = {};
    if (message.metadata !== undefined) {
      obj.metadata = RecordMetaData.toJSON(message.metadata);
    }
    if (message.payload !== "") {
      obj.payload = message.payload;
    }
    if (message.runtimeInfo !== undefined) {
      obj.runtimeInfo = RuntimeInfo.toJSON(message.runtimeInfo);
    }
    return obj;
  },

  create(base?: DeepPartial<ExportResult>): ExportResult {
    return ExportResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExportResult>): ExportResult {
    const message = createBaseExportResult();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? RecordMetaData.fromPartial(object.metadata)
      : undefined;
    message.payload = object.payload ?? "";
    message.runtimeInfo = (object.runtimeInfo !== undefined && object.runtimeInfo !== null)
      ? RuntimeInfo.fromPartial(object.runtimeInfo)
      : undefined;
    return message;
  },
};

export type ProcessorDefinition = typeof ProcessorDefinition;
export const ProcessorDefinition = {
  name: "Processor",
  fullName: "processor.Processor",
  methods: {
    start: {
      name: "Start",
      requestType: StartRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    stop: {
      name: "Stop",
      requestType: Empty,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    getConfig: {
      name: "GetConfig",
      requestType: ProcessConfigRequest,
      requestStream: false,
      responseType: ProcessConfigResponse,
      responseStream: false,
      options: {},
    },
    processBindings: {
      name: "ProcessBindings",
      requestType: ProcessBindingsRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
      responseStream: false,
      options: {},
    },
    processBindingsStream: {
      name: "ProcessBindingsStream",
      requestType: ProcessStreamRequest,
      requestStream: true,
      responseType: ProcessStreamResponse,
      responseStream: true,
      options: {},
    },
    preprocessBindingsStream: {
      name: "PreprocessBindingsStream",
      requestType: PreprocessStreamRequest,
      requestStream: true,
      responseType: PreprocessStreamResponse,
      responseStream: true,
      options: {},
    },
  },
} as const;

export interface ProcessorServiceImplementation<CallContextExt = {}> {
  start(request: StartRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  stop(request: Empty, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  getConfig(
    request: ProcessConfigRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ProcessConfigResponse>>;
  processBindings(
    request: ProcessBindingsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processBindingsStream(
    request: AsyncIterable<ProcessStreamRequest>,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<ProcessStreamResponse>>;
  preprocessBindingsStream(
    request: AsyncIterable<PreprocessStreamRequest>,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<PreprocessStreamResponse>>;
}

export interface ProcessorClient<CallOptionsExt = {}> {
  start(request: DeepPartial<StartRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  stop(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  getConfig(
    request: DeepPartial<ProcessConfigRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ProcessConfigResponse>;
  processBindings(
    request: DeepPartial<ProcessBindingsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ProcessBindingResponse>;
  processBindingsStream(
    request: AsyncIterable<DeepPartial<ProcessStreamRequest>>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<ProcessStreamResponse>;
  preprocessBindingsStream(
    request: AsyncIterable<DeepPartial<PreprocessStreamRequest>>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<PreprocessStreamResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | bigint | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = BigInt(Math.trunc(date.getTime() / 1_000));
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (globalThis.Number(t.seconds.toString()) || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToBigint(long: Long) {
  return BigInt(long.toString());
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
