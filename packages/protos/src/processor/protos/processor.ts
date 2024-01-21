/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";
import { Empty } from "../../google/protobuf/empty.js";
import { Struct } from "../../google/protobuf/struct.js";
import { Timestamp } from "../../google/protobuf/timestamp.js";
import { CoinID } from "../../service/common/protos/common.js";

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
}

export interface ContractConfig {
  contract: ContractInfo | undefined;
  intervalConfigs: OnIntervalConfig[];
  logConfigs: LogHandlerConfig[];
  traceConfigs: TraceHandlerConfig[];
  transactionConfig: TransactionHandlerConfig[];
  moveEventConfigs: MoveEventHandlerConfig[];
  moveCallConfigs: MoveCallHandlerConfig[];
  moveResourceChangeConfigs: MoveResourceChangeConfig[];
  instructionConfig: InstructionHandlerConfig | undefined;
  startBlock: bigint;
  endBlock: bigint;
  processorType: string;
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
  intervalConfigs: OnIntervalConfig[];
  moveIntervalConfigs: MoveOnIntervalConfig[];
  moveCallConfigs: MoveCallHandlerConfig[];
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
}

export interface AptosOnIntervalConfig {
  intervalConfig: OnIntervalConfig | undefined;
  type: string;
}

export interface MoveOnIntervalConfig {
  intervalConfig: OnIntervalConfig | undefined;
  type: string;
  ownerType: MoveOwnerType;
  fetchConfig: MoveAccountFetchConfig | undefined;
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
}

export interface TransactionHandlerConfig {
  handlerId: number;
  fetchConfig: EthFetchConfig | undefined;
}

export interface LogHandlerConfig {
  filters: LogFilter[];
  handlerId: number;
  fetchConfig: EthFetchConfig | undefined;
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
  resourceConfig?: ResourceConfig | undefined;
}

export interface MoveAccountFetchConfig {
  owned: boolean;
}

export interface MoveEventHandlerConfig {
  filters: MoveEventFilter[];
  handlerId: number;
  fetchConfig: MoveFetchConfig | undefined;
}

export interface MoveEventFilter {
  type: string;
  account: string;
}

export interface MoveCallHandlerConfig {
  filters: MoveCallFilter[];
  handlerId: number;
  fetchConfig: MoveFetchConfig | undefined;
}

export interface MoveResourceChangeConfig {
  type: string;
  handlerId: number;
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

export interface Topic {
  hashes: string[];
}

export interface ProcessBindingsRequest {
  bindings: DataBinding[];
}

export interface ProcessBindingResponse {
  result: ProcessResult | undefined;
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
}

export interface Data_EthLog {
  log: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  transaction?: { [key: string]: any } | undefined;
  transactionReceipt?: { [key: string]: any } | undefined;
  block?: { [key: string]: any } | undefined;
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
  transaction: { [key: string]: any } | undefined;
}

export interface Data_AptCall {
  transaction: { [key: string]: any } | undefined;
}

export interface Data_AptResource {
  resources: { [key: string]: any }[];
  version: bigint;
  timestampMicros: bigint;
}

export interface Data_SuiEvent {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiCall {
  transaction: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiObject {
  objects: { [key: string]: any }[];
  self?: { [key: string]: any } | undefined;
  timestamp: Date | undefined;
  slot: bigint;
}

export interface Data_SuiObjectChange {
  changes: { [key: string]: any }[];
  timestamp: Date | undefined;
  txDigest: string;
  slot: bigint;
}

export interface DataBinding {
  data: Data | undefined;
  handlerType: HandlerType;
  handlerIds: number[];
}

export interface StateResult {
  configUpdated: boolean;
}

export interface ProcessResult {
  gauges: GaugeResult[];
  counters: CounterResult[];
  events: EventTrackingResult[];
  exports: ExportResult[];
  states: StateResult | undefined;
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

export interface BigInteger {
  negative: boolean;
  data: Uint8Array;
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

export interface EventTrackingResult {
  metadata: RecordMetaData | undefined;
  distinctEntityId: string;
  attributes: { [key: string]: any } | undefined;
  severity: LogLevel;
  message: string;
  runtimeInfo: RuntimeInfo | undefined;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProjectConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 3:
          message.version = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProjectConfig {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      version: isSet(object.version) ? String(object.version) : "",
    };
  },

  toJSON(message: ProjectConfig): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.version !== undefined && (obj.version = message.version);
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
  return { sequential: false };
}

export const ExecutionConfig = {
  encode(message: ExecutionConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequential === true) {
      writer.uint32(8).bool(message.sequential);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExecutionConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecutionConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequential = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExecutionConfig {
    return { sequential: isSet(object.sequential) ? Boolean(object.sequential) : false };
  },

  toJSON(message: ExecutionConfig): unknown {
    const obj: any = {};
    message.sequential !== undefined && (obj.sequential = message.sequential);
    return obj;
  },

  create(base?: DeepPartial<ExecutionConfig>): ExecutionConfig {
    return ExecutionConfig.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ExecutionConfig>): ExecutionConfig {
    const message = createBaseExecutionConfig();
    message.sequential = object.sequential ?? false;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessConfigRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessConfigResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessConfigResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.config = ProjectConfig.decode(reader, reader.uint32());
          break;
        case 9:
          message.executionConfig = ExecutionConfig.decode(reader, reader.uint32());
          break;
        case 2:
          message.contractConfigs.push(ContractConfig.decode(reader, reader.uint32()));
          break;
        case 3:
          message.templateInstances.push(TemplateInstance.decode(reader, reader.uint32()));
          break;
        case 4:
          message.accountConfigs.push(AccountConfig.decode(reader, reader.uint32()));
          break;
        case 5:
          message.metricConfigs.push(MetricConfig.decode(reader, reader.uint32()));
          break;
        case 6:
          message.eventTrackingConfigs.push(EventTrackingConfig.decode(reader, reader.uint32()));
          break;
        case 7:
          message.exportConfigs.push(ExportConfig.decode(reader, reader.uint32()));
          break;
        case 8:
          message.eventLogConfigs.push(EventLogConfig.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessConfigResponse {
    return {
      config: isSet(object.config) ? ProjectConfig.fromJSON(object.config) : undefined,
      executionConfig: isSet(object.executionConfig) ? ExecutionConfig.fromJSON(object.executionConfig) : undefined,
      contractConfigs: Array.isArray(object?.contractConfigs)
        ? object.contractConfigs.map((e: any) => ContractConfig.fromJSON(e))
        : [],
      templateInstances: Array.isArray(object?.templateInstances)
        ? object.templateInstances.map((e: any) => TemplateInstance.fromJSON(e))
        : [],
      accountConfigs: Array.isArray(object?.accountConfigs)
        ? object.accountConfigs.map((e: any) => AccountConfig.fromJSON(e))
        : [],
      metricConfigs: Array.isArray(object?.metricConfigs)
        ? object.metricConfigs.map((e: any) => MetricConfig.fromJSON(e))
        : [],
      eventTrackingConfigs: Array.isArray(object?.eventTrackingConfigs)
        ? object.eventTrackingConfigs.map((e: any) => EventTrackingConfig.fromJSON(e))
        : [],
      exportConfigs: Array.isArray(object?.exportConfigs)
        ? object.exportConfigs.map((e: any) => ExportConfig.fromJSON(e))
        : [],
      eventLogConfigs: Array.isArray(object?.eventLogConfigs)
        ? object.eventLogConfigs.map((e: any) => EventLogConfig.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessConfigResponse): unknown {
    const obj: any = {};
    message.config !== undefined && (obj.config = message.config ? ProjectConfig.toJSON(message.config) : undefined);
    message.executionConfig !== undefined &&
      (obj.executionConfig = message.executionConfig ? ExecutionConfig.toJSON(message.executionConfig) : undefined);
    if (message.contractConfigs) {
      obj.contractConfigs = message.contractConfigs.map((e) => e ? ContractConfig.toJSON(e) : undefined);
    } else {
      obj.contractConfigs = [];
    }
    if (message.templateInstances) {
      obj.templateInstances = message.templateInstances.map((e) => e ? TemplateInstance.toJSON(e) : undefined);
    } else {
      obj.templateInstances = [];
    }
    if (message.accountConfigs) {
      obj.accountConfigs = message.accountConfigs.map((e) => e ? AccountConfig.toJSON(e) : undefined);
    } else {
      obj.accountConfigs = [];
    }
    if (message.metricConfigs) {
      obj.metricConfigs = message.metricConfigs.map((e) => e ? MetricConfig.toJSON(e) : undefined);
    } else {
      obj.metricConfigs = [];
    }
    if (message.eventTrackingConfigs) {
      obj.eventTrackingConfigs = message.eventTrackingConfigs.map((e) => e ? EventTrackingConfig.toJSON(e) : undefined);
    } else {
      obj.eventTrackingConfigs = [];
    }
    if (message.exportConfigs) {
      obj.exportConfigs = message.exportConfigs.map((e) => e ? ExportConfig.toJSON(e) : undefined);
    } else {
      obj.exportConfigs = [];
    }
    if (message.eventLogConfigs) {
      obj.eventLogConfigs = message.eventLogConfigs.map((e) => e ? EventLogConfig.toJSON(e) : undefined);
    } else {
      obj.eventLogConfigs = [];
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
    return message;
  },
};

function createBaseContractConfig(): ContractConfig {
  return {
    contract: undefined,
    intervalConfigs: [],
    logConfigs: [],
    traceConfigs: [],
    transactionConfig: [],
    moveEventConfigs: [],
    moveCallConfigs: [],
    moveResourceChangeConfigs: [],
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
    if (message.instructionConfig !== undefined) {
      InstructionHandlerConfig.encode(message.instructionConfig, writer.uint32(50).fork()).ldelim();
    }
    if (message.startBlock !== BigInt("0")) {
      writer.uint32(32).uint64(message.startBlock.toString());
    }
    if (message.endBlock !== BigInt("0")) {
      writer.uint32(40).uint64(message.endBlock.toString());
    }
    if (message.processorType !== "") {
      writer.uint32(66).string(message.processorType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContractConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contract = ContractInfo.decode(reader, reader.uint32());
          break;
        case 11:
          message.intervalConfigs.push(OnIntervalConfig.decode(reader, reader.uint32()));
          break;
        case 3:
          message.logConfigs.push(LogHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 2:
          message.traceConfigs.push(TraceHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 7:
          message.transactionConfig.push(TransactionHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 9:
          message.moveEventConfigs.push(MoveEventHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 10:
          message.moveCallConfigs.push(MoveCallHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 12:
          message.moveResourceChangeConfigs.push(MoveResourceChangeConfig.decode(reader, reader.uint32()));
          break;
        case 6:
          message.instructionConfig = InstructionHandlerConfig.decode(reader, reader.uint32());
          break;
        case 4:
          message.startBlock = longToBigint(reader.uint64() as Long);
          break;
        case 5:
          message.endBlock = longToBigint(reader.uint64() as Long);
          break;
        case 8:
          message.processorType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContractConfig {
    return {
      contract: isSet(object.contract) ? ContractInfo.fromJSON(object.contract) : undefined,
      intervalConfigs: Array.isArray(object?.intervalConfigs)
        ? object.intervalConfigs.map((e: any) => OnIntervalConfig.fromJSON(e))
        : [],
      logConfigs: Array.isArray(object?.logConfigs)
        ? object.logConfigs.map((e: any) => LogHandlerConfig.fromJSON(e))
        : [],
      traceConfigs: Array.isArray(object?.traceConfigs)
        ? object.traceConfigs.map((e: any) => TraceHandlerConfig.fromJSON(e))
        : [],
      transactionConfig: Array.isArray(object?.transactionConfig)
        ? object.transactionConfig.map((e: any) => TransactionHandlerConfig.fromJSON(e))
        : [],
      moveEventConfigs: Array.isArray(object?.moveEventConfigs)
        ? object.moveEventConfigs.map((e: any) => MoveEventHandlerConfig.fromJSON(e))
        : [],
      moveCallConfigs: Array.isArray(object?.moveCallConfigs)
        ? object.moveCallConfigs.map((e: any) => MoveCallHandlerConfig.fromJSON(e))
        : [],
      moveResourceChangeConfigs: Array.isArray(object?.moveResourceChangeConfigs)
        ? object.moveResourceChangeConfigs.map((e: any) => MoveResourceChangeConfig.fromJSON(e))
        : [],
      instructionConfig: isSet(object.instructionConfig)
        ? InstructionHandlerConfig.fromJSON(object.instructionConfig)
        : undefined,
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      endBlock: isSet(object.endBlock) ? BigInt(object.endBlock) : BigInt("0"),
      processorType: isSet(object.processorType) ? String(object.processorType) : "",
    };
  },

  toJSON(message: ContractConfig): unknown {
    const obj: any = {};
    message.contract !== undefined &&
      (obj.contract = message.contract ? ContractInfo.toJSON(message.contract) : undefined);
    if (message.intervalConfigs) {
      obj.intervalConfigs = message.intervalConfigs.map((e) => e ? OnIntervalConfig.toJSON(e) : undefined);
    } else {
      obj.intervalConfigs = [];
    }
    if (message.logConfigs) {
      obj.logConfigs = message.logConfigs.map((e) => e ? LogHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.logConfigs = [];
    }
    if (message.traceConfigs) {
      obj.traceConfigs = message.traceConfigs.map((e) => e ? TraceHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.traceConfigs = [];
    }
    if (message.transactionConfig) {
      obj.transactionConfig = message.transactionConfig.map((e) => e ? TransactionHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.transactionConfig = [];
    }
    if (message.moveEventConfigs) {
      obj.moveEventConfigs = message.moveEventConfigs.map((e) => e ? MoveEventHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.moveEventConfigs = [];
    }
    if (message.moveCallConfigs) {
      obj.moveCallConfigs = message.moveCallConfigs.map((e) => e ? MoveCallHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.moveCallConfigs = [];
    }
    if (message.moveResourceChangeConfigs) {
      obj.moveResourceChangeConfigs = message.moveResourceChangeConfigs.map((e) =>
        e ? MoveResourceChangeConfig.toJSON(e) : undefined
      );
    } else {
      obj.moveResourceChangeConfigs = [];
    }
    message.instructionConfig !== undefined && (obj.instructionConfig = message.instructionConfig
      ? InstructionHandlerConfig.toJSON(message.instructionConfig)
      : undefined);
    message.startBlock !== undefined && (obj.startBlock = message.startBlock.toString());
    message.endBlock !== undefined && (obj.endBlock = message.endBlock.toString());
    message.processorType !== undefined && (obj.processorType = message.processorType);
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
    message.logConfigs = object.logConfigs?.map((e) => LogHandlerConfig.fromPartial(e)) || [];
    message.traceConfigs = object.traceConfigs?.map((e) => TraceHandlerConfig.fromPartial(e)) || [];
    message.transactionConfig = object.transactionConfig?.map((e) => TransactionHandlerConfig.fromPartial(e)) || [];
    message.moveEventConfigs = object.moveEventConfigs?.map((e) => MoveEventHandlerConfig.fromPartial(e)) || [];
    message.moveCallConfigs = object.moveCallConfigs?.map((e) => MoveCallHandlerConfig.fromPartial(e)) || [];
    message.moveResourceChangeConfigs =
      object.moveResourceChangeConfigs?.map((e) => MoveResourceChangeConfig.fromPartial(e)) || [];
    message.instructionConfig = (object.instructionConfig !== undefined && object.instructionConfig !== null)
      ? InstructionHandlerConfig.fromPartial(object.instructionConfig)
      : undefined;
    message.startBlock = object.startBlock ?? BigInt("0");
    message.endBlock = object.endBlock ?? BigInt("0");
    message.processorType = object.processorType ?? "";
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTotalPerEntityAggregation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetentionConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.retentionEventName = reader.string();
          break;
        case 3:
          message.days = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RetentionConfig {
    return {
      retentionEventName: isSet(object.retentionEventName) ? String(object.retentionEventName) : "",
      days: isSet(object.days) ? Number(object.days) : 0,
    };
  },

  toJSON(message: RetentionConfig): unknown {
    const obj: any = {};
    message.retentionEventName !== undefined && (obj.retentionEventName = message.retentionEventName);
    message.days !== undefined && (obj.days = Math.round(message.days));
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
    if (message.totalByDay === true) {
      writer.uint32(16).bool(message.totalByDay);
    }
    if (message.unique === true) {
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTrackingConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventName = reader.string();
          break;
        case 2:
          message.totalByDay = reader.bool();
          break;
        case 3:
          message.unique = reader.bool();
          break;
        case 4:
          message.totalPerEntity = TotalPerEntityAggregation.decode(reader, reader.uint32());
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.distinctAggregationByDays.push(reader.int32());
            }
          } else {
            message.distinctAggregationByDays.push(reader.int32());
          }
          break;
        case 6:
          message.retentionConfig = RetentionConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventTrackingConfig {
    return {
      eventName: isSet(object.eventName) ? String(object.eventName) : "",
      totalByDay: isSet(object.totalByDay) ? Boolean(object.totalByDay) : false,
      unique: isSet(object.unique) ? Boolean(object.unique) : false,
      totalPerEntity: isSet(object.totalPerEntity)
        ? TotalPerEntityAggregation.fromJSON(object.totalPerEntity)
        : undefined,
      distinctAggregationByDays: Array.isArray(object?.distinctAggregationByDays)
        ? object.distinctAggregationByDays.map((e: any) => Number(e))
        : [],
      retentionConfig: isSet(object.retentionConfig) ? RetentionConfig.fromJSON(object.retentionConfig) : undefined,
    };
  },

  toJSON(message: EventTrackingConfig): unknown {
    const obj: any = {};
    message.eventName !== undefined && (obj.eventName = message.eventName);
    message.totalByDay !== undefined && (obj.totalByDay = message.totalByDay);
    message.unique !== undefined && (obj.unique = message.unique);
    message.totalPerEntity !== undefined && (obj.totalPerEntity = message.totalPerEntity
      ? TotalPerEntityAggregation.toJSON(message.totalPerEntity)
      : undefined);
    if (message.distinctAggregationByDays) {
      obj.distinctAggregationByDays = message.distinctAggregationByDays.map((e) => Math.round(e));
    } else {
      obj.distinctAggregationByDays = [];
    }
    message.retentionConfig !== undefined &&
      (obj.retentionConfig = message.retentionConfig ? RetentionConfig.toJSON(message.retentionConfig) : undefined);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExportConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.channel = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExportConfig {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      channel: isSet(object.channel) ? String(object.channel) : "",
    };
  },

  toJSON(message: ExportConfig): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.channel !== undefined && (obj.channel = message.channel);
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
    if (message.sparse === true) {
      writer.uint32(32).bool(message.sparse);
    }
    if (message.persistentBetweenVersion === true) {
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetricConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 3:
          message.description = reader.string();
          break;
        case 2:
          message.unit = reader.string();
          break;
        case 4:
          message.sparse = reader.bool();
          break;
        case 5:
          message.persistentBetweenVersion = reader.bool();
          break;
        case 7:
          message.type = reader.int32() as any;
          break;
        case 6:
          message.aggregationConfig = AggregationConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MetricConfig {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description) ? String(object.description) : "",
      unit: isSet(object.unit) ? String(object.unit) : "",
      sparse: isSet(object.sparse) ? Boolean(object.sparse) : false,
      persistentBetweenVersion: isSet(object.persistentBetweenVersion)
        ? Boolean(object.persistentBetweenVersion)
        : false,
      type: isSet(object.type) ? metricTypeFromJSON(object.type) : 0,
      aggregationConfig: isSet(object.aggregationConfig)
        ? AggregationConfig.fromJSON(object.aggregationConfig)
        : undefined,
    };
  },

  toJSON(message: MetricConfig): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined && (obj.description = message.description);
    message.unit !== undefined && (obj.unit = message.unit);
    message.sparse !== undefined && (obj.sparse = message.sparse);
    message.persistentBetweenVersion !== undefined && (obj.persistentBetweenVersion = message.persistentBetweenVersion);
    message.type !== undefined && (obj.type = metricTypeToJSON(message.type));
    message.aggregationConfig !== undefined && (obj.aggregationConfig = message.aggregationConfig
      ? AggregationConfig.toJSON(message.aggregationConfig)
      : undefined);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.fields.push(EventLogConfig_Field.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      fields: Array.isArray(object?.fields) ? object.fields.map((e: any) => EventLogConfig_Field.fromJSON(e)) : [],
    };
  },

  toJSON(message: EventLogConfig): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    if (message.fields) {
      obj.fields = message.fields.map((e) => e ? EventLogConfig_Field.toJSON(e) : undefined);
    } else {
      obj.fields = [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig_StructFieldType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.fields.push(EventLogConfig_Field.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig_StructFieldType {
    return {
      fields: Array.isArray(object?.fields) ? object.fields.map((e: any) => EventLogConfig_Field.fromJSON(e)) : [],
    };
  },

  toJSON(message: EventLogConfig_StructFieldType): unknown {
    const obj: any = {};
    if (message.fields) {
      obj.fields = message.fields.map((e) => e ? EventLogConfig_Field.toJSON(e) : undefined);
    } else {
      obj.fields = [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogConfig_Field();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.basicType = reader.int32() as any;
          break;
        case 3:
          message.coinType = CoinID.decode(reader, reader.uint32());
          break;
        case 4:
          message.structType = EventLogConfig_StructFieldType.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventLogConfig_Field {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      basicType: isSet(object.basicType) ? eventLogConfig_BasicFieldTypeFromJSON(object.basicType) : undefined,
      coinType: isSet(object.coinType) ? CoinID.fromJSON(object.coinType) : undefined,
      structType: isSet(object.structType) ? EventLogConfig_StructFieldType.fromJSON(object.structType) : undefined,
    };
  },

  toJSON(message: EventLogConfig_Field): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.basicType !== undefined && (obj.basicType = message.basicType !== undefined
      ? eventLogConfig_BasicFieldTypeToJSON(message.basicType)
      : undefined);
    message.coinType !== undefined && (obj.coinType = message.coinType ? CoinID.toJSON(message.coinType) : undefined);
    message.structType !== undefined &&
      (obj.structType = message.structType ? EventLogConfig_StructFieldType.toJSON(message.structType) : undefined);
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
    if (message.discardOrigin === true) {
      writer.uint32(24).bool(message.discardOrigin);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AggregationConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAggregationConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.intervalInMinutes.push(reader.int32());
            }
          } else {
            message.intervalInMinutes.push(reader.int32());
          }
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.types.push(reader.int32() as any);
            }
          } else {
            message.types.push(reader.int32() as any);
          }
          break;
        case 3:
          message.discardOrigin = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AggregationConfig {
    return {
      intervalInMinutes: Array.isArray(object?.intervalInMinutes)
        ? object.intervalInMinutes.map((e: any) => Number(e))
        : [],
      types: Array.isArray(object?.types) ? object.types.map((e: any) => aggregationTypeFromJSON(e)) : [],
      discardOrigin: isSet(object.discardOrigin) ? Boolean(object.discardOrigin) : false,
    };
  },

  toJSON(message: AggregationConfig): unknown {
    const obj: any = {};
    if (message.intervalInMinutes) {
      obj.intervalInMinutes = message.intervalInMinutes.map((e) => Math.round(e));
    } else {
      obj.intervalInMinutes = [];
    }
    if (message.types) {
      obj.types = message.types.map((e) => aggregationTypeToJSON(e));
    } else {
      obj.types = [];
    }
    message.discardOrigin !== undefined && (obj.discardOrigin = message.discardOrigin);
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
    intervalConfigs: [],
    moveIntervalConfigs: [],
    moveCallConfigs: [],
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
      writer.uint32(24).uint64(message.startBlock.toString());
    }
    for (const v of message.intervalConfigs) {
      OnIntervalConfig.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.moveIntervalConfigs) {
      MoveOnIntervalConfig.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.moveCallConfigs) {
      MoveCallHandlerConfig.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.logConfigs) {
      LogHandlerConfig.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccountConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccountConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.startBlock = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.intervalConfigs.push(OnIntervalConfig.decode(reader, reader.uint32()));
          break;
        case 7:
          message.moveIntervalConfigs.push(MoveOnIntervalConfig.decode(reader, reader.uint32()));
          break;
        case 8:
          message.moveCallConfigs.push(MoveCallHandlerConfig.decode(reader, reader.uint32()));
          break;
        case 6:
          message.logConfigs.push(LogHandlerConfig.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AccountConfig {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      address: isSet(object.address) ? String(object.address) : "",
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      intervalConfigs: Array.isArray(object?.intervalConfigs)
        ? object.intervalConfigs.map((e: any) => OnIntervalConfig.fromJSON(e))
        : [],
      moveIntervalConfigs: Array.isArray(object?.moveIntervalConfigs)
        ? object.moveIntervalConfigs.map((e: any) => MoveOnIntervalConfig.fromJSON(e))
        : [],
      moveCallConfigs: Array.isArray(object?.moveCallConfigs)
        ? object.moveCallConfigs.map((e: any) => MoveCallHandlerConfig.fromJSON(e))
        : [],
      logConfigs: Array.isArray(object?.logConfigs)
        ? object.logConfigs.map((e: any) => LogHandlerConfig.fromJSON(e))
        : [],
    };
  },

  toJSON(message: AccountConfig): unknown {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.address !== undefined && (obj.address = message.address);
    message.startBlock !== undefined && (obj.startBlock = message.startBlock.toString());
    if (message.intervalConfigs) {
      obj.intervalConfigs = message.intervalConfigs.map((e) => e ? OnIntervalConfig.toJSON(e) : undefined);
    } else {
      obj.intervalConfigs = [];
    }
    if (message.moveIntervalConfigs) {
      obj.moveIntervalConfigs = message.moveIntervalConfigs.map((e) => e ? MoveOnIntervalConfig.toJSON(e) : undefined);
    } else {
      obj.moveIntervalConfigs = [];
    }
    if (message.moveCallConfigs) {
      obj.moveCallConfigs = message.moveCallConfigs.map((e) => e ? MoveCallHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.moveCallConfigs = [];
    }
    if (message.logConfigs) {
      obj.logConfigs = message.logConfigs.map((e) => e ? LogHandlerConfig.toJSON(e) : undefined);
    } else {
      obj.logConfigs = [];
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
    message.intervalConfigs = object.intervalConfigs?.map((e) => OnIntervalConfig.fromPartial(e)) || [];
    message.moveIntervalConfigs = object.moveIntervalConfigs?.map((e) => MoveOnIntervalConfig.fromPartial(e)) || [];
    message.moveCallConfigs = object.moveCallConfigs?.map((e) => MoveCallHandlerConfig.fromPartial(e)) || [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHandleInterval();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.recentInterval = reader.int32();
          break;
        case 2:
          message.backfillInterval = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HandleInterval {
    return {
      recentInterval: isSet(object.recentInterval) ? Number(object.recentInterval) : 0,
      backfillInterval: isSet(object.backfillInterval) ? Number(object.backfillInterval) : 0,
    };
  },

  toJSON(message: HandleInterval): unknown {
    const obj: any = {};
    message.recentInterval !== undefined && (obj.recentInterval = Math.round(message.recentInterval));
    message.backfillInterval !== undefined && (obj.backfillInterval = Math.round(message.backfillInterval));
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OnIntervalConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.handlerId = reader.int32();
          break;
        case 2:
          message.minutes = reader.int32();
          break;
        case 4:
          message.minutesInterval = HandleInterval.decode(reader, reader.uint32());
          break;
        case 3:
          message.slot = reader.int32();
          break;
        case 5:
          message.slotInterval = HandleInterval.decode(reader, reader.uint32());
          break;
        case 6:
          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): OnIntervalConfig {
    return {
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      minutes: isSet(object.minutes) ? Number(object.minutes) : 0,
      minutesInterval: isSet(object.minutesInterval) ? HandleInterval.fromJSON(object.minutesInterval) : undefined,
      slot: isSet(object.slot) ? Number(object.slot) : 0,
      slotInterval: isSet(object.slotInterval) ? HandleInterval.fromJSON(object.slotInterval) : undefined,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: OnIntervalConfig): unknown {
    const obj: any = {};
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.minutes !== undefined && (obj.minutes = Math.round(message.minutes));
    message.minutesInterval !== undefined &&
      (obj.minutesInterval = message.minutesInterval ? HandleInterval.toJSON(message.minutesInterval) : undefined);
    message.slot !== undefined && (obj.slot = Math.round(message.slot));
    message.slotInterval !== undefined &&
      (obj.slotInterval = message.slotInterval ? HandleInterval.toJSON(message.slotInterval) : undefined);
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? EthFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.intervalConfig = OnIntervalConfig.decode(reader, reader.uint32());
          break;
        case 2:
          message.type = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosOnIntervalConfig {
    return {
      intervalConfig: isSet(object.intervalConfig) ? OnIntervalConfig.fromJSON(object.intervalConfig) : undefined,
      type: isSet(object.type) ? String(object.type) : "",
    };
  },

  toJSON(message: AptosOnIntervalConfig): unknown {
    const obj: any = {};
    message.intervalConfig !== undefined &&
      (obj.intervalConfig = message.intervalConfig ? OnIntervalConfig.toJSON(message.intervalConfig) : undefined);
    message.type !== undefined && (obj.type = message.type);
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
  return { intervalConfig: undefined, type: "", ownerType: 0, fetchConfig: undefined };
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
    if (message.fetchConfig !== undefined) {
      MoveAccountFetchConfig.encode(message.fetchConfig, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveOnIntervalConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveOnIntervalConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.intervalConfig = OnIntervalConfig.decode(reader, reader.uint32());
          break;
        case 2:
          message.type = reader.string();
          break;
        case 3:
          message.ownerType = reader.int32() as any;
          break;
        case 4:
          message.fetchConfig = MoveAccountFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveOnIntervalConfig {
    return {
      intervalConfig: isSet(object.intervalConfig) ? OnIntervalConfig.fromJSON(object.intervalConfig) : undefined,
      type: isSet(object.type) ? String(object.type) : "",
      ownerType: isSet(object.ownerType) ? moveOwnerTypeFromJSON(object.ownerType) : 0,
      fetchConfig: isSet(object.fetchConfig) ? MoveAccountFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: MoveOnIntervalConfig): unknown {
    const obj: any = {};
    message.intervalConfig !== undefined &&
      (obj.intervalConfig = message.intervalConfig ? OnIntervalConfig.toJSON(message.intervalConfig) : undefined);
    message.type !== undefined && (obj.type = message.type);
    message.ownerType !== undefined && (obj.ownerType = moveOwnerTypeToJSON(message.ownerType));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? MoveAccountFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    message.fetchConfig = (object.fetchConfig !== undefined && object.fetchConfig !== null)
      ? MoveAccountFetchConfig.fromPartial(object.fetchConfig)
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.address = reader.string();
          break;
        case 4:
          message.abi = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContractInfo {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      address: isSet(object.address) ? String(object.address) : "",
      abi: isSet(object.abi) ? String(object.abi) : "",
    };
  },

  toJSON(message: ContractInfo): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.address !== undefined && (obj.address = message.address);
    message.abi !== undefined && (obj.abi = message.abi);
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
  return { contract: undefined, startBlock: BigInt("0"), endBlock: BigInt("0"), templateId: 0 };
}

export const TemplateInstance = {
  encode(message: TemplateInstance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.contract !== undefined) {
      ContractInfo.encode(message.contract, writer.uint32(10).fork()).ldelim();
    }
    if (message.startBlock !== BigInt("0")) {
      writer.uint32(16).uint64(message.startBlock.toString());
    }
    if (message.endBlock !== BigInt("0")) {
      writer.uint32(24).uint64(message.endBlock.toString());
    }
    if (message.templateId !== 0) {
      writer.uint32(32).int32(message.templateId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TemplateInstance {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTemplateInstance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contract = ContractInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.startBlock = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.endBlock = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.templateId = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TemplateInstance {
    return {
      contract: isSet(object.contract) ? ContractInfo.fromJSON(object.contract) : undefined,
      startBlock: isSet(object.startBlock) ? BigInt(object.startBlock) : BigInt("0"),
      endBlock: isSet(object.endBlock) ? BigInt(object.endBlock) : BigInt("0"),
      templateId: isSet(object.templateId) ? Number(object.templateId) : 0,
    };
  },

  toJSON(message: TemplateInstance): unknown {
    const obj: any = {};
    message.contract !== undefined &&
      (obj.contract = message.contract ? ContractInfo.toJSON(message.contract) : undefined);
    message.startBlock !== undefined && (obj.startBlock = message.startBlock.toString());
    message.endBlock !== undefined && (obj.endBlock = message.endBlock.toString());
    message.templateId !== undefined && (obj.templateId = Math.round(message.templateId));
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.templateInstances.push(TemplateInstance.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartRequest {
    return {
      templateInstances: Array.isArray(object?.templateInstances)
        ? object.templateInstances.map((e: any) => TemplateInstance.fromJSON(e))
        : [],
    };
  },

  toJSON(message: StartRequest): unknown {
    const obj: any = {};
    if (message.templateInstances) {
      obj.templateInstances = message.templateInstances.map((e) => e ? TemplateInstance.toJSON(e) : undefined);
    } else {
      obj.templateInstances = [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.handlerId = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BlockHandlerConfig {
    return { handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0 };
  },

  toJSON(message: BlockHandlerConfig): unknown {
    const obj: any = {};
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
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
    if (message.transaction === true) {
      writer.uint32(8).bool(message.transaction);
    }
    if (message.transactionReceipt === true) {
      writer.uint32(16).bool(message.transactionReceipt);
    }
    if (message.transactionReceiptLogs === true) {
      writer.uint32(40).bool(message.transactionReceiptLogs);
    }
    if (message.block === true) {
      writer.uint32(24).bool(message.block);
    }
    if (message.trace === true) {
      writer.uint32(32).bool(message.trace);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EthFetchConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEthFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transaction = reader.bool();
          break;
        case 2:
          message.transactionReceipt = reader.bool();
          break;
        case 5:
          message.transactionReceiptLogs = reader.bool();
          break;
        case 3:
          message.block = reader.bool();
          break;
        case 4:
          message.trace = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EthFetchConfig {
    return {
      transaction: isSet(object.transaction) ? Boolean(object.transaction) : false,
      transactionReceipt: isSet(object.transactionReceipt) ? Boolean(object.transactionReceipt) : false,
      transactionReceiptLogs: isSet(object.transactionReceiptLogs) ? Boolean(object.transactionReceiptLogs) : false,
      block: isSet(object.block) ? Boolean(object.block) : false,
      trace: isSet(object.trace) ? Boolean(object.trace) : false,
    };
  },

  toJSON(message: EthFetchConfig): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.transactionReceipt !== undefined && (obj.transactionReceipt = message.transactionReceipt);
    message.transactionReceiptLogs !== undefined && (obj.transactionReceiptLogs = message.transactionReceiptLogs);
    message.block !== undefined && (obj.block = message.block);
    message.trace !== undefined && (obj.trace = message.trace);
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
  return { signature: "", handlerId: 0, fetchConfig: undefined };
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TraceHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTraceHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signature = reader.string();
          break;
        case 2:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TraceHandlerConfig {
    return {
      signature: isSet(object.signature) ? String(object.signature) : "",
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: TraceHandlerConfig): unknown {
    const obj: any = {};
    message.signature !== undefined && (obj.signature = message.signature);
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? EthFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    return message;
  },
};

function createBaseTransactionHandlerConfig(): TransactionHandlerConfig {
  return { handlerId: 0, fetchConfig: undefined };
}

export const TransactionHandlerConfig = {
  encode(message: TransactionHandlerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.handlerId !== 0) {
      writer.uint32(8).int32(message.handlerId);
    }
    if (message.fetchConfig !== undefined) {
      EthFetchConfig.encode(message.fetchConfig, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TransactionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TransactionHandlerConfig {
    return {
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: TransactionHandlerConfig): unknown {
    const obj: any = {};
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? EthFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    return message;
  },
};

function createBaseLogHandlerConfig(): LogHandlerConfig {
  return { filters: [], handlerId: 0, fetchConfig: undefined };
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filters.push(LogFilter.decode(reader, reader.uint32()));
          break;
        case 2:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.fetchConfig = EthFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LogHandlerConfig {
    return {
      filters: Array.isArray(object?.filters) ? object.filters.map((e: any) => LogFilter.fromJSON(e)) : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? EthFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: LogHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) => e ? LogFilter.toJSON(e) : undefined);
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? EthFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.topics.push(Topic.decode(reader, reader.uint32()));
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.addressType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LogFilter {
    return {
      topics: Array.isArray(object?.topics) ? object.topics.map((e: any) => Topic.fromJSON(e)) : [],
      address: isSet(object.address) ? String(object.address) : undefined,
      addressType: isSet(object.addressType) ? addressTypeFromJSON(object.addressType) : undefined,
    };
  },

  toJSON(message: LogFilter): unknown {
    const obj: any = {};
    if (message.topics) {
      obj.topics = message.topics.map((e) => e ? Topic.toJSON(e) : undefined);
    } else {
      obj.topics = [];
    }
    message.address !== undefined && (obj.address = message.address);
    message.addressType !== undefined &&
      (obj.addressType = message.addressType !== undefined ? addressTypeToJSON(message.addressType) : undefined);
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
    if (message.innerInstruction === true) {
      writer.uint32(8).bool(message.innerInstruction);
    }
    if (message.parsedInstruction === true) {
      writer.uint32(16).bool(message.parsedInstruction);
    }
    if (message.rawDataInstruction === true) {
      writer.uint32(24).bool(message.rawDataInstruction);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstructionHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstructionHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.innerInstruction = reader.bool();
          break;
        case 2:
          message.parsedInstruction = reader.bool();
          break;
        case 3:
          message.rawDataInstruction = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): InstructionHandlerConfig {
    return {
      innerInstruction: isSet(object.innerInstruction) ? Boolean(object.innerInstruction) : false,
      parsedInstruction: isSet(object.parsedInstruction) ? Boolean(object.parsedInstruction) : false,
      rawDataInstruction: isSet(object.rawDataInstruction) ? Boolean(object.rawDataInstruction) : false,
    };
  },

  toJSON(message: InstructionHandlerConfig): unknown {
    const obj: any = {};
    message.innerInstruction !== undefined && (obj.innerInstruction = message.innerInstruction);
    message.parsedInstruction !== undefined && (obj.parsedInstruction = message.parsedInstruction);
    message.rawDataInstruction !== undefined && (obj.rawDataInstruction = message.rawDataInstruction);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.moveTypePrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceConfig {
    return { moveTypePrefix: isSet(object.moveTypePrefix) ? String(object.moveTypePrefix) : "" };
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {};
    message.moveTypePrefix !== undefined && (obj.moveTypePrefix = message.moveTypePrefix);
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
  return { resourceChanges: false, allEvents: false, resourceConfig: undefined };
}

export const MoveFetchConfig = {
  encode(message: MoveFetchConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.resourceChanges === true) {
      writer.uint32(8).bool(message.resourceChanges);
    }
    if (message.allEvents === true) {
      writer.uint32(16).bool(message.allEvents);
    }
    if (message.resourceConfig !== undefined) {
      ResourceConfig.encode(message.resourceConfig, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveFetchConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resourceChanges = reader.bool();
          break;
        case 2:
          message.allEvents = reader.bool();
          break;
        case 3:
          message.resourceConfig = ResourceConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveFetchConfig {
    return {
      resourceChanges: isSet(object.resourceChanges) ? Boolean(object.resourceChanges) : false,
      allEvents: isSet(object.allEvents) ? Boolean(object.allEvents) : false,
      resourceConfig: isSet(object.resourceConfig) ? ResourceConfig.fromJSON(object.resourceConfig) : undefined,
    };
  },

  toJSON(message: MoveFetchConfig): unknown {
    const obj: any = {};
    message.resourceChanges !== undefined && (obj.resourceChanges = message.resourceChanges);
    message.allEvents !== undefined && (obj.allEvents = message.allEvents);
    message.resourceConfig !== undefined &&
      (obj.resourceConfig = message.resourceConfig ? ResourceConfig.toJSON(message.resourceConfig) : undefined);
    return obj;
  },

  create(base?: DeepPartial<MoveFetchConfig>): MoveFetchConfig {
    return MoveFetchConfig.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<MoveFetchConfig>): MoveFetchConfig {
    const message = createBaseMoveFetchConfig();
    message.resourceChanges = object.resourceChanges ?? false;
    message.allEvents = object.allEvents ?? false;
    message.resourceConfig = (object.resourceConfig !== undefined && object.resourceConfig !== null)
      ? ResourceConfig.fromPartial(object.resourceConfig)
      : undefined;
    return message;
  },
};

function createBaseMoveAccountFetchConfig(): MoveAccountFetchConfig {
  return { owned: false };
}

export const MoveAccountFetchConfig = {
  encode(message: MoveAccountFetchConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.owned === true) {
      writer.uint32(8).bool(message.owned);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveAccountFetchConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveAccountFetchConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owned = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveAccountFetchConfig {
    return { owned: isSet(object.owned) ? Boolean(object.owned) : false };
  },

  toJSON(message: MoveAccountFetchConfig): unknown {
    const obj: any = {};
    message.owned !== undefined && (obj.owned = message.owned);
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
  return { filters: [], handlerId: 0, fetchConfig: undefined };
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveEventHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveEventHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filters.push(MoveEventFilter.decode(reader, reader.uint32()));
          break;
        case 2:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.fetchConfig = MoveFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveEventHandlerConfig {
    return {
      filters: Array.isArray(object?.filters) ? object.filters.map((e: any) => MoveEventFilter.fromJSON(e)) : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? MoveFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: MoveEventHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) => e ? MoveEventFilter.toJSON(e) : undefined);
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? MoveFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    return message;
  },
};

function createBaseMoveEventFilter(): MoveEventFilter {
  return { type: "", account: "" };
}

export const MoveEventFilter = {
  encode(message: MoveEventFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.account !== "") {
      writer.uint32(18).string(message.account);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveEventFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveEventFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.account = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveEventFilter {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      account: isSet(object.account) ? String(object.account) : "",
    };
  },

  toJSON(message: MoveEventFilter): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.account !== undefined && (obj.account = message.account);
    return obj;
  },

  create(base?: DeepPartial<MoveEventFilter>): MoveEventFilter {
    return MoveEventFilter.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<MoveEventFilter>): MoveEventFilter {
    const message = createBaseMoveEventFilter();
    message.type = object.type ?? "";
    message.account = object.account ?? "";
    return message;
  },
};

function createBaseMoveCallHandlerConfig(): MoveCallHandlerConfig {
  return { filters: [], handlerId: 0, fetchConfig: undefined };
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveCallHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filters.push(MoveCallFilter.decode(reader, reader.uint32()));
          break;
        case 2:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.fetchConfig = MoveFetchConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveCallHandlerConfig {
    return {
      filters: Array.isArray(object?.filters) ? object.filters.map((e: any) => MoveCallFilter.fromJSON(e)) : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      fetchConfig: isSet(object.fetchConfig) ? MoveFetchConfig.fromJSON(object.fetchConfig) : undefined,
    };
  },

  toJSON(message: MoveCallHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) => e ? MoveCallFilter.toJSON(e) : undefined);
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    message.fetchConfig !== undefined &&
      (obj.fetchConfig = message.fetchConfig ? MoveFetchConfig.toJSON(message.fetchConfig) : undefined);
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
    return message;
  },
};

function createBaseMoveResourceChangeConfig(): MoveResourceChangeConfig {
  return { type: "", handlerId: 0 };
}

export const MoveResourceChangeConfig = {
  encode(message: MoveResourceChangeConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MoveResourceChangeConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveResourceChangeConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.handlerId = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveResourceChangeConfig {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
    };
  },

  toJSON(message: MoveResourceChangeConfig): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.handlerId !== undefined && (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  create(base?: DeepPartial<MoveResourceChangeConfig>): MoveResourceChangeConfig {
    return MoveResourceChangeConfig.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<MoveResourceChangeConfig>): MoveResourceChangeConfig {
    const message = createBaseMoveResourceChangeConfig();
    message.type = object.type ?? "";
    message.handlerId = object.handlerId ?? 0;
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
    if (message.withTypeArguments === true) {
      writer.uint32(24).bool(message.withTypeArguments);
    }
    if (message.includeFailed === true) {
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.function = reader.string();
          break;
        case 2:
          message.typeArguments.push(reader.string());
          break;
        case 3:
          message.withTypeArguments = reader.bool();
          break;
        case 4:
          message.includeFailed = reader.bool();
          break;
        case 5:
          message.publicKeyPrefix = reader.string();
          break;
        case 6:
          message.fromAndToAddress = MoveCallFilter_FromAndToAddress.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveCallFilter {
    return {
      function: isSet(object.function) ? String(object.function) : "",
      typeArguments: Array.isArray(object?.typeArguments) ? object.typeArguments.map((e: any) => String(e)) : [],
      withTypeArguments: isSet(object.withTypeArguments) ? Boolean(object.withTypeArguments) : false,
      includeFailed: isSet(object.includeFailed) ? Boolean(object.includeFailed) : false,
      publicKeyPrefix: isSet(object.publicKeyPrefix) ? String(object.publicKeyPrefix) : "",
      fromAndToAddress: isSet(object.fromAndToAddress)
        ? MoveCallFilter_FromAndToAddress.fromJSON(object.fromAndToAddress)
        : undefined,
    };
  },

  toJSON(message: MoveCallFilter): unknown {
    const obj: any = {};
    message.function !== undefined && (obj.function = message.function);
    if (message.typeArguments) {
      obj.typeArguments = message.typeArguments.map((e) => e);
    } else {
      obj.typeArguments = [];
    }
    message.withTypeArguments !== undefined && (obj.withTypeArguments = message.withTypeArguments);
    message.includeFailed !== undefined && (obj.includeFailed = message.includeFailed);
    message.publicKeyPrefix !== undefined && (obj.publicKeyPrefix = message.publicKeyPrefix);
    message.fromAndToAddress !== undefined && (obj.fromAndToAddress = message.fromAndToAddress
      ? MoveCallFilter_FromAndToAddress.toJSON(message.fromAndToAddress)
      : undefined);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoveCallFilter_FromAndToAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.to = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MoveCallFilter_FromAndToAddress {
    return { from: isSet(object.from) ? String(object.from) : "", to: isSet(object.to) ? String(object.to) : "" };
  },

  toJSON(message: MoveCallFilter_FromAndToAddress): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.to !== undefined && (obj.to = message.to);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTopic();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hashes.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Topic {
    return { hashes: Array.isArray(object?.hashes) ? object.hashes.map((e: any) => String(e)) : [] };
  },

  toJSON(message: Topic): unknown {
    const obj: any = {};
    if (message.hashes) {
      obj.hashes = message.hashes.map((e) => e);
    } else {
      obj.hashes = [];
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBindingsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bindings.push(DataBinding.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessBindingsRequest {
    return {
      bindings: Array.isArray(object?.bindings) ? object.bindings.map((e: any) => DataBinding.fromJSON(e)) : [],
    };
  },

  toJSON(message: ProcessBindingsRequest): unknown {
    const obj: any = {};
    if (message.bindings) {
      obj.bindings = message.bindings.map((e) => e ? DataBinding.toJSON(e) : undefined);
    } else {
      obj.bindings = [];
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
  return { result: undefined };
}

export const ProcessBindingResponse = {
  encode(message: ProcessBindingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result !== undefined) {
      ProcessResult.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProcessBindingResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBindingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = ProcessResult.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessBindingResponse {
    return { result: isSet(object.result) ? ProcessResult.fromJSON(object.result) : undefined };
  },

  toJSON(message: ProcessBindingResponse): unknown {
    const obj: any = {};
    message.result !== undefined && (obj.result = message.result ? ProcessResult.toJSON(message.result) : undefined);
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.ethLog = Data_EthLog.decode(reader, reader.uint32());
          break;
        case 3:
          message.ethBlock = Data_EthBlock.decode(reader, reader.uint32());
          break;
        case 4:
          message.ethTransaction = Data_EthTransaction.decode(reader, reader.uint32());
          break;
        case 5:
          message.ethTrace = Data_EthTrace.decode(reader, reader.uint32());
          break;
        case 6:
          message.solInstruction = Data_SolInstruction.decode(reader, reader.uint32());
          break;
        case 7:
          message.aptEvent = Data_AptEvent.decode(reader, reader.uint32());
          break;
        case 8:
          message.aptCall = Data_AptCall.decode(reader, reader.uint32());
          break;
        case 9:
          message.aptResource = Data_AptResource.decode(reader, reader.uint32());
          break;
        case 10:
          message.suiEvent = Data_SuiEvent.decode(reader, reader.uint32());
          break;
        case 11:
          message.suiCall = Data_SuiCall.decode(reader, reader.uint32());
          break;
        case 12:
          message.suiObject = Data_SuiObject.decode(reader, reader.uint32());
          break;
        case 13:
          message.suiObjectChange = Data_SuiObjectChange.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    };
  },

  toJSON(message: Data): unknown {
    const obj: any = {};
    message.ethLog !== undefined && (obj.ethLog = message.ethLog ? Data_EthLog.toJSON(message.ethLog) : undefined);
    message.ethBlock !== undefined &&
      (obj.ethBlock = message.ethBlock ? Data_EthBlock.toJSON(message.ethBlock) : undefined);
    message.ethTransaction !== undefined &&
      (obj.ethTransaction = message.ethTransaction ? Data_EthTransaction.toJSON(message.ethTransaction) : undefined);
    message.ethTrace !== undefined &&
      (obj.ethTrace = message.ethTrace ? Data_EthTrace.toJSON(message.ethTrace) : undefined);
    message.solInstruction !== undefined &&
      (obj.solInstruction = message.solInstruction ? Data_SolInstruction.toJSON(message.solInstruction) : undefined);
    message.aptEvent !== undefined &&
      (obj.aptEvent = message.aptEvent ? Data_AptEvent.toJSON(message.aptEvent) : undefined);
    message.aptCall !== undefined && (obj.aptCall = message.aptCall ? Data_AptCall.toJSON(message.aptCall) : undefined);
    message.aptResource !== undefined &&
      (obj.aptResource = message.aptResource ? Data_AptResource.toJSON(message.aptResource) : undefined);
    message.suiEvent !== undefined &&
      (obj.suiEvent = message.suiEvent ? Data_SuiEvent.toJSON(message.suiEvent) : undefined);
    message.suiCall !== undefined && (obj.suiCall = message.suiCall ? Data_SuiCall.toJSON(message.suiCall) : undefined);
    message.suiObject !== undefined &&
      (obj.suiObject = message.suiObject ? Data_SuiObject.toJSON(message.suiObject) : undefined);
    message.suiObjectChange !== undefined &&
      (obj.suiObjectChange = message.suiObjectChange
        ? Data_SuiObjectChange.toJSON(message.suiObjectChange)
        : undefined);
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthLog {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthLog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.log = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 4:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 2:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 5:
          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 6:
          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    };
  },

  toJSON(message: Data_EthLog): unknown {
    const obj: any = {};
    message.log !== undefined && (obj.log = message.log);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.transactionReceipt !== undefined && (obj.transactionReceipt = message.transactionReceipt);
    message.block !== undefined && (obj.block = message.block);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_EthBlock {
    return { block: isObject(object.block) ? object.block : undefined };
  },

  toJSON(message: Data_EthBlock): unknown {
    const obj: any = {};
    message.block !== undefined && (obj.block = message.block);
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_EthTransaction {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 5:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 3:
          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 6:
          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 7:
          message.trace = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    };
  },

  toJSON(message: Data_EthTransaction): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.transactionReceipt !== undefined && (obj.transactionReceipt = message.transactionReceipt);
    message.block !== undefined && (obj.block = message.block);
    message.trace !== undefined && (obj.trace = message.trace);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_EthTrace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          message.trace = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 5:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 2:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 3:
          message.transactionReceipt = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 6:
          message.block = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    message.trace !== undefined && (obj.trace = message.trace);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.transactionReceipt !== undefined && (obj.transactionReceipt = message.transactionReceipt);
    message.block !== undefined && (obj.block = message.block);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SolInstruction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.instructionData = reader.string();
          break;
        case 2:
          message.slot = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.programAccountId = reader.string();
          break;
        case 5:
          message.accounts.push(reader.string());
          break;
        case 4:
          message.parsed = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_SolInstruction {
    return {
      instructionData: isSet(object.instructionData) ? String(object.instructionData) : "",
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
      programAccountId: isSet(object.programAccountId) ? String(object.programAccountId) : "",
      accounts: Array.isArray(object?.accounts) ? object.accounts.map((e: any) => String(e)) : [],
      parsed: isObject(object.parsed) ? object.parsed : undefined,
    };
  },

  toJSON(message: Data_SolInstruction): unknown {
    const obj: any = {};
    message.instructionData !== undefined && (obj.instructionData = message.instructionData);
    message.slot !== undefined && (obj.slot = message.slot.toString());
    message.programAccountId !== undefined && (obj.programAccountId = message.programAccountId);
    if (message.accounts) {
      obj.accounts = message.accounts.map((e) => e);
    } else {
      obj.accounts = [];
    }
    message.parsed !== undefined && (obj.parsed = message.parsed);
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
  return { transaction: undefined };
}

export const Data_AptEvent = {
  encode(message: Data_AptEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_AptEvent {
    return { transaction: isObject(object.transaction) ? object.transaction : undefined };
  },

  toJSON(message: Data_AptEvent): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    return obj;
  },

  create(base?: DeepPartial<Data_AptEvent>): Data_AptEvent {
    return Data_AptEvent.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_AptEvent>): Data_AptEvent {
    const message = createBaseData_AptEvent();
    message.transaction = object.transaction ?? undefined;
    return message;
  },
};

function createBaseData_AptCall(): Data_AptCall {
  return { transaction: undefined };
}

export const Data_AptCall = {
  encode(message: Data_AptCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptCall {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_AptCall {
    return { transaction: isObject(object.transaction) ? object.transaction : undefined };
  },

  toJSON(message: Data_AptCall): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    return obj;
  },

  create(base?: DeepPartial<Data_AptCall>): Data_AptCall {
    return Data_AptCall.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_AptCall>): Data_AptCall {
    const message = createBaseData_AptCall();
    message.transaction = object.transaction ?? undefined;
    return message;
  },
};

function createBaseData_AptResource(): Data_AptResource {
  return { resources: [], version: BigInt("0"), timestampMicros: BigInt("0") };
}

export const Data_AptResource = {
  encode(message: Data_AptResource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resources) {
      Struct.encode(Struct.wrap(v!), writer.uint32(34).fork()).ldelim();
    }
    if (message.version !== BigInt("0")) {
      writer.uint32(16).int64(message.version.toString());
    }
    if (message.timestampMicros !== BigInt("0")) {
      writer.uint32(40).int64(message.timestampMicros.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_AptResource {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_AptResource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          message.resources.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          break;
        case 2:
          message.version = longToBigint(reader.int64() as Long);
          break;
        case 5:
          message.timestampMicros = longToBigint(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_AptResource {
    return {
      resources: Array.isArray(object?.resources) ? [...object.resources] : [],
      version: isSet(object.version) ? BigInt(object.version) : BigInt("0"),
      timestampMicros: isSet(object.timestampMicros) ? BigInt(object.timestampMicros) : BigInt("0"),
    };
  },

  toJSON(message: Data_AptResource): unknown {
    const obj: any = {};
    if (message.resources) {
      obj.resources = message.resources.map((e) => e);
    } else {
      obj.resources = [];
    }
    message.version !== undefined && (obj.version = message.version.toString());
    message.timestampMicros !== undefined && (obj.timestampMicros = message.timestampMicros.toString());
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
    return message;
  },
};

function createBaseData_SuiEvent(): Data_SuiEvent {
  return { transaction: undefined, timestamp: undefined, slot: BigInt("0") };
}

export const Data_SuiEvent = {
  encode(message: Data_SuiEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 2:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 3:
          message.slot = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_SuiEvent {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiEvent): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.slot !== undefined && (obj.slot = message.slot.toString());
    return obj;
  },

  create(base?: DeepPartial<Data_SuiEvent>): Data_SuiEvent {
    return Data_SuiEvent.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_SuiEvent>): Data_SuiEvent {
    const message = createBaseData_SuiEvent();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiCall(): Data_SuiCall {
  return { transaction: undefined, timestamp: undefined, slot: BigInt("0") };
}

export const Data_SuiCall = {
  encode(message: Data_SuiCall, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transaction !== undefined) {
      Struct.encode(Struct.wrap(message.transaction), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiCall {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiCall();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transaction = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 2:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 3:
          message.slot = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_SuiCall {
    return {
      transaction: isObject(object.transaction) ? object.transaction : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiCall): unknown {
    const obj: any = {};
    message.transaction !== undefined && (obj.transaction = message.transaction);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.slot !== undefined && (obj.slot = message.slot.toString());
    return obj;
  },

  create(base?: DeepPartial<Data_SuiCall>): Data_SuiCall {
    return Data_SuiCall.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_SuiCall>): Data_SuiCall {
    const message = createBaseData_SuiCall();
    message.transaction = object.transaction ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiObject(): Data_SuiObject {
  return { objects: [], self: undefined, timestamp: undefined, slot: BigInt("0") };
}

export const Data_SuiObject = {
  encode(message: Data_SuiObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.objects) {
      Struct.encode(Struct.wrap(v!), writer.uint32(10).fork()).ldelim();
    }
    if (message.self !== undefined) {
      Struct.encode(Struct.wrap(message.self), writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.slot !== BigInt("0")) {
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.objects.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          break;
        case 4:
          message.self = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 2:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 3:
          message.slot = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_SuiObject {
    return {
      objects: Array.isArray(object?.objects) ? [...object.objects] : [],
      self: isObject(object.self) ? object.self : undefined,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiObject): unknown {
    const obj: any = {};
    if (message.objects) {
      obj.objects = message.objects.map((e) => e);
    } else {
      obj.objects = [];
    }
    message.self !== undefined && (obj.self = message.self);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.slot !== undefined && (obj.slot = message.slot.toString());
    return obj;
  },

  create(base?: DeepPartial<Data_SuiObject>): Data_SuiObject {
    return Data_SuiObject.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_SuiObject>): Data_SuiObject {
    const message = createBaseData_SuiObject();
    message.objects = object.objects?.map((e) => e) || [];
    message.self = object.self ?? undefined;
    message.timestamp = object.timestamp ?? undefined;
    message.slot = object.slot ?? BigInt("0");
    return message;
  },
};

function createBaseData_SuiObjectChange(): Data_SuiObjectChange {
  return { changes: [], timestamp: undefined, txDigest: "", slot: BigInt("0") };
}

export const Data_SuiObjectChange = {
  encode(message: Data_SuiObjectChange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.changes) {
      Struct.encode(Struct.wrap(v!), writer.uint32(10).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    if (message.txDigest !== "") {
      writer.uint32(34).string(message.txDigest);
    }
    if (message.slot !== BigInt("0")) {
      writer.uint32(24).uint64(message.slot.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Data_SuiObjectChange {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData_SuiObjectChange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.changes.push(Struct.unwrap(Struct.decode(reader, reader.uint32())));
          break;
        case 2:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 4:
          message.txDigest = reader.string();
          break;
        case 3:
          message.slot = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Data_SuiObjectChange {
    return {
      changes: Array.isArray(object?.changes) ? [...object.changes] : [],
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      txDigest: isSet(object.txDigest) ? String(object.txDigest) : "",
      slot: isSet(object.slot) ? BigInt(object.slot) : BigInt("0"),
    };
  },

  toJSON(message: Data_SuiObjectChange): unknown {
    const obj: any = {};
    if (message.changes) {
      obj.changes = message.changes.map((e) => e);
    } else {
      obj.changes = [];
    }
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.txDigest !== undefined && (obj.txDigest = message.txDigest);
    message.slot !== undefined && (obj.slot = message.slot.toString());
    return obj;
  },

  create(base?: DeepPartial<Data_SuiObjectChange>): Data_SuiObjectChange {
    return Data_SuiObjectChange.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Data_SuiObjectChange>): Data_SuiObjectChange {
    const message = createBaseData_SuiObjectChange();
    message.changes = object.changes?.map((e) => e) || [];
    message.timestamp = object.timestamp ?? undefined;
    message.txDigest = object.txDigest ?? "";
    message.slot = object.slot ?? BigInt("0");
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataBinding();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data = Data.decode(reader, reader.uint32());
          break;
        case 3:
          message.handlerType = reader.int32() as any;
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.handlerIds.push(reader.int32());
            }
          } else {
            message.handlerIds.push(reader.int32());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataBinding {
    return {
      data: isSet(object.data) ? Data.fromJSON(object.data) : undefined,
      handlerType: isSet(object.handlerType) ? handlerTypeFromJSON(object.handlerType) : 0,
      handlerIds: Array.isArray(object?.handlerIds) ? object.handlerIds.map((e: any) => Number(e)) : [],
    };
  },

  toJSON(message: DataBinding): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = message.data ? Data.toJSON(message.data) : undefined);
    message.handlerType !== undefined && (obj.handlerType = handlerTypeToJSON(message.handlerType));
    if (message.handlerIds) {
      obj.handlerIds = message.handlerIds.map((e) => Math.round(e));
    } else {
      obj.handlerIds = [];
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
  return { configUpdated: false };
}

export const StateResult = {
  encode(message: StateResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.configUpdated === true) {
      writer.uint32(8).bool(message.configUpdated);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.configUpdated = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StateResult {
    return { configUpdated: isSet(object.configUpdated) ? Boolean(object.configUpdated) : false };
  },

  toJSON(message: StateResult): unknown {
    const obj: any = {};
    message.configUpdated !== undefined && (obj.configUpdated = message.configUpdated);
    return obj;
  },

  create(base?: DeepPartial<StateResult>): StateResult {
    return StateResult.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<StateResult>): StateResult {
    const message = createBaseStateResult();
    message.configUpdated = object.configUpdated ?? false;
    return message;
  },
};

function createBaseProcessResult(): ProcessResult {
  return { gauges: [], counters: [], events: [], exports: [], states: undefined };
}

export const ProcessResult = {
  encode(message: ProcessResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gauges) {
      GaugeResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.counters) {
      CounterResult.encode(v!, writer.uint32(18).fork()).ldelim();
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gauges.push(GaugeResult.decode(reader, reader.uint32()));
          break;
        case 2:
          message.counters.push(CounterResult.decode(reader, reader.uint32()));
          break;
        case 4:
          message.events.push(EventTrackingResult.decode(reader, reader.uint32()));
          break;
        case 5:
          message.exports.push(ExportResult.decode(reader, reader.uint32()));
          break;
        case 6:
          message.states = StateResult.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessResult {
    return {
      gauges: Array.isArray(object?.gauges) ? object.gauges.map((e: any) => GaugeResult.fromJSON(e)) : [],
      counters: Array.isArray(object?.counters) ? object.counters.map((e: any) => CounterResult.fromJSON(e)) : [],
      events: Array.isArray(object?.events) ? object.events.map((e: any) => EventTrackingResult.fromJSON(e)) : [],
      exports: Array.isArray(object?.exports) ? object.exports.map((e: any) => ExportResult.fromJSON(e)) : [],
      states: isSet(object.states) ? StateResult.fromJSON(object.states) : undefined,
    };
  },

  toJSON(message: ProcessResult): unknown {
    const obj: any = {};
    if (message.gauges) {
      obj.gauges = message.gauges.map((e) => e ? GaugeResult.toJSON(e) : undefined);
    } else {
      obj.gauges = [];
    }
    if (message.counters) {
      obj.counters = message.counters.map((e) => e ? CounterResult.toJSON(e) : undefined);
    } else {
      obj.counters = [];
    }
    if (message.events) {
      obj.events = message.events.map((e) => e ? EventTrackingResult.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }
    if (message.exports) {
      obj.exports = message.exports.map((e) => e ? ExportResult.toJSON(e) : undefined);
    } else {
      obj.exports = [];
    }
    message.states !== undefined && (obj.states = message.states ? StateResult.toJSON(message.states) : undefined);
    return obj;
  },

  create(base?: DeepPartial<ProcessResult>): ProcessResult {
    return ProcessResult.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ProcessResult>): ProcessResult {
    const message = createBaseProcessResult();
    message.gauges = object.gauges?.map((e) => GaugeResult.fromPartial(e)) || [];
    message.counters = object.counters?.map((e) => CounterResult.fromPartial(e)) || [];
    message.events = object.events?.map((e) => EventTrackingResult.fromPartial(e)) || [];
    message.exports = object.exports?.map((e) => ExportResult.fromPartial(e)) || [];
    message.states = (object.states !== undefined && object.states !== null)
      ? StateResult.fromPartial(object.states)
      : undefined;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRecordMetaData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 9:
          message.contractName = reader.string();
          break;
        case 2:
          message.blockNumber = longToBigint(reader.uint64() as Long);
          break;
        case 6:
          message.transactionHash = reader.string();
          break;
        case 5:
          message.chainId = reader.string();
          break;
        case 3:
          message.transactionIndex = reader.int32();
          break;
        case 4:
          message.logIndex = reader.int32();
          break;
        case 10:
          message.name = reader.string();
          break;
        case 7:
          const entry7 = RecordMetaData_LabelsEntry.decode(reader, reader.uint32());
          if (entry7.value !== undefined) {
            message.labels[entry7.key] = entry7.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordMetaData {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      contractName: isSet(object.contractName) ? String(object.contractName) : "",
      blockNumber: isSet(object.blockNumber) ? BigInt(object.blockNumber) : BigInt("0"),
      transactionHash: isSet(object.transactionHash) ? String(object.transactionHash) : "",
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      transactionIndex: isSet(object.transactionIndex) ? Number(object.transactionIndex) : 0,
      logIndex: isSet(object.logIndex) ? Number(object.logIndex) : 0,
      name: isSet(object.name) ? String(object.name) : "",
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
    message.address !== undefined && (obj.address = message.address);
    message.contractName !== undefined && (obj.contractName = message.contractName);
    message.blockNumber !== undefined && (obj.blockNumber = message.blockNumber.toString());
    message.transactionHash !== undefined && (obj.transactionHash = message.transactionHash);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.transactionIndex !== undefined && (obj.transactionIndex = Math.round(message.transactionIndex));
    message.logIndex !== undefined && (obj.logIndex = Math.round(message.logIndex));
    message.name !== undefined && (obj.name = message.name);
    obj.labels = {};
    if (message.labels) {
      Object.entries(message.labels).forEach(([k, v]) => {
        obj.labels[k] = v;
      });
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
        acc[key] = String(value);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRecordMetaData_LabelsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordMetaData_LabelsEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: RecordMetaData_LabelsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetricValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bigDecimal = reader.string();
          break;
        case 2:
          message.doubleValue = reader.double();
          break;
        case 3:
          message.bigInteger = BigInteger.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MetricValue {
    return {
      bigDecimal: isSet(object.bigDecimal) ? String(object.bigDecimal) : undefined,
      doubleValue: isSet(object.doubleValue) ? Number(object.doubleValue) : undefined,
      bigInteger: isSet(object.bigInteger) ? BigInteger.fromJSON(object.bigInteger) : undefined,
    };
  },

  toJSON(message: MetricValue): unknown {
    const obj: any = {};
    message.bigDecimal !== undefined && (obj.bigDecimal = message.bigDecimal);
    message.doubleValue !== undefined && (obj.doubleValue = message.doubleValue);
    message.bigInteger !== undefined &&
      (obj.bigInteger = message.bigInteger ? BigInteger.toJSON(message.bigInteger) : undefined);
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

function createBaseBigInteger(): BigInteger {
  return { negative: false, data: new Uint8Array() };
}

export const BigInteger = {
  encode(message: BigInteger, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.negative === true) {
      writer.uint32(8).bool(message.negative);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BigInteger {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBigInteger();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.negative = reader.bool();
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BigInteger {
    return {
      negative: isSet(object.negative) ? Boolean(object.negative) : false,
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
    };
  },

  toJSON(message: BigInteger): unknown {
    const obj: any = {};
    message.negative !== undefined && (obj.negative = message.negative);
    message.data !== undefined &&
      (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    return obj;
  },

  create(base?: DeepPartial<BigInteger>): BigInteger {
    return BigInteger.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BigInteger>): BigInteger {
    const message = createBaseBigInteger();
    message.negative = object.negative ?? false;
    message.data = object.data ?? new Uint8Array();
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfo {
    return { from: isSet(object.from) ? handlerTypeFromJSON(object.from) : 0 };
  },

  toJSON(message: RuntimeInfo): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = handlerTypeToJSON(message.from));
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGaugeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          break;
        case 2:
          message.metricValue = MetricValue.decode(reader, reader.uint32());
          break;
        case 3:
          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
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
    message.metadata !== undefined &&
      (obj.metadata = message.metadata ? RecordMetaData.toJSON(message.metadata) : undefined);
    message.metricValue !== undefined &&
      (obj.metricValue = message.metricValue ? MetricValue.toJSON(message.metricValue) : undefined);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo ? RuntimeInfo.toJSON(message.runtimeInfo) : undefined);
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
    if (message.add === true) {
      writer.uint32(24).bool(message.add);
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(message.runtimeInfo, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CounterResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCounterResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          break;
        case 2:
          message.metricValue = MetricValue.decode(reader, reader.uint32());
          break;
        case 3:
          message.add = reader.bool();
          break;
        case 4:
          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CounterResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      metricValue: isSet(object.metricValue) ? MetricValue.fromJSON(object.metricValue) : undefined,
      add: isSet(object.add) ? Boolean(object.add) : false,
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: CounterResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata ? RecordMetaData.toJSON(message.metadata) : undefined);
    message.metricValue !== undefined &&
      (obj.metricValue = message.metricValue ? MetricValue.toJSON(message.metricValue) : undefined);
    message.add !== undefined && (obj.add = message.add);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo ? RuntimeInfo.toJSON(message.runtimeInfo) : undefined);
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

function createBaseEventTrackingResult(): EventTrackingResult {
  return {
    metadata: undefined,
    distinctEntityId: "",
    attributes: undefined,
    severity: 0,
    message: "",
    runtimeInfo: undefined,
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
    if (message.noMetric === true) {
      writer.uint32(24).bool(message.noMetric);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventTrackingResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTrackingResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          break;
        case 2:
          message.distinctEntityId = reader.string();
          break;
        case 6:
          message.attributes = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 7:
          message.severity = reader.int32() as any;
          break;
        case 8:
          message.message = reader.string();
          break;
        case 5:
          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          break;
        case 3:
          message.noMetric = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventTrackingResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      distinctEntityId: isSet(object.distinctEntityId) ? String(object.distinctEntityId) : "",
      attributes: isObject(object.attributes) ? object.attributes : undefined,
      severity: isSet(object.severity) ? logLevelFromJSON(object.severity) : 0,
      message: isSet(object.message) ? String(object.message) : "",
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
      noMetric: isSet(object.noMetric) ? Boolean(object.noMetric) : false,
    };
  },

  toJSON(message: EventTrackingResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata ? RecordMetaData.toJSON(message.metadata) : undefined);
    message.distinctEntityId !== undefined && (obj.distinctEntityId = message.distinctEntityId);
    message.attributes !== undefined && (obj.attributes = message.attributes);
    message.severity !== undefined && (obj.severity = logLevelToJSON(message.severity));
    message.message !== undefined && (obj.message = message.message);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo ? RuntimeInfo.toJSON(message.runtimeInfo) : undefined);
    message.noMetric !== undefined && (obj.noMetric = message.noMetric);
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExportResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          break;
        case 2:
          message.payload = reader.string();
          break;
        case 3:
          message.runtimeInfo = RuntimeInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExportResult {
    return {
      metadata: isSet(object.metadata) ? RecordMetaData.fromJSON(object.metadata) : undefined,
      payload: isSet(object.payload) ? String(object.payload) : "",
      runtimeInfo: isSet(object.runtimeInfo) ? RuntimeInfo.fromJSON(object.runtimeInfo) : undefined,
    };
  },

  toJSON(message: ExportResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata ? RecordMetaData.toJSON(message.metadata) : undefined);
    message.payload !== undefined && (obj.payload = message.payload);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo ? RuntimeInfo.toJSON(message.runtimeInfo) : undefined);
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
      requestType: DataBinding,
      requestStream: true,
      responseType: ProcessBindingResponse,
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
    request: AsyncIterable<DataBinding>,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<ProcessBindingResponse>>;
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
    request: AsyncIterable<DeepPartial<DataBinding>>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<ProcessBindingResponse>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = BigInt(Math.trunc(date.getTime() / 1_000));
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = Number(t.seconds.toString()) * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
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
