/* eslint-disable */
import { CallContext, CallOptions } from "nice-grpc-common";
import Long from "long";
import { Empty } from "../../google/protobuf/empty";
import _m0 from "protobufjs/minimal";

export enum HandlerType {
  UNKNOWN = 0,
  ETH_LOG = 1,
  BLOCK = 2,
  TRANSACTION = 3,
  INSTRUCTION = 4,
  ETH_TRACE = 5,
  APT_EVENT = 6,
  APT_CALL = 7,
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
    case "BLOCK":
      return HandlerType.BLOCK;
    case 3:
    case "TRANSACTION":
      return HandlerType.TRANSACTION;
    case 4:
    case "INSTRUCTION":
      return HandlerType.INSTRUCTION;
    case 5:
    case "ETH_TRACE":
      return HandlerType.ETH_TRACE;
    case 6:
    case "APT_EVENT":
      return HandlerType.APT_EVENT;
    case 7:
    case "APT_CALL":
      return HandlerType.APT_CALL;
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
    case HandlerType.BLOCK:
      return "BLOCK";
    case HandlerType.TRANSACTION:
      return "TRANSACTION";
    case HandlerType.INSTRUCTION:
      return "INSTRUCTION";
    case HandlerType.ETH_TRACE:
      return "ETH_TRACE";
    case HandlerType.APT_EVENT:
      return "APT_EVENT";
    case HandlerType.APT_CALL:
      return "APT_CALL";
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

export interface ProcessConfigRequest {}

export interface ProcessConfigResponse {
  config: ProjectConfig | undefined;
  contractConfigs: ContractConfig[];
  templateInstances: TemplateInstance[];
  accountConfigs: AccountConfig[];
}

export interface ContractConfig {
  contract: ContractInfo | undefined;
  blockConfigs: BlockHandlerConfig[];
  logConfigs: LogHandlerConfig[];
  traceConfigs: TraceHandlerConfig[];
  aptosEventConfigs: AptosEventHandlerConfig[];
  aptosCallConfigs: AptosCallHandlerConfig[];
  instructionConfig: InstructionHandlerConfig | undefined;
  startBlock: Long;
  endBlock: Long;
  processorType: string;
}

export interface AccountConfig {}

export interface ContractInfo {
  name: string;
  chainId: string;
  address: string;
  abi: string;
}

export interface TemplateInstance {
  contract: ContractInfo | undefined;
  startBlock: Long;
  endBlock: Long;
  templateId: number;
}

export interface StartRequest {
  templateInstances: TemplateInstance[];
}

export interface BlockHandlerConfig {
  handlerId: number;
}

export interface TraceHandlerConfig {
  signature: string;
  handlerId: number;
}

export interface LogHandlerConfig {
  filters: LogFilter[];
  handlerId: number;
}

export interface LogFilter {
  topics: Topic[];
}

export interface InstructionHandlerConfig {
  innerInstruction: boolean;
  parsedInstruction: boolean;
  rawDataInstruction: boolean;
}

export interface AptosEventHandlerConfig {
  filters: AptosEventFilter[];
  handlerId: number;
}

export interface AptosEventFilter {
  type: string;
}

export interface AptosCallHandlerConfig {
  filters: AptosCallFilter[];
  handlerId: number;
}

export interface AptosCallFilter {
  function: string;
  typeArguments: string[];
  withTypeArguments: boolean;
}

export interface Topic {
  hashes: string[];
}

export interface ProcessTransactionsRequest {
  chainId: string;
  transactions: RawTransaction[];
}

export interface ProcessInstructionsRequest {
  instructions: Instruction[];
}

export interface ProcessBlocksRequest {
  blockBindings: BlockBinding[];
}

export interface ProcessBindingsRequest {
  bindings: DataBinding[];
}

export interface ProcessBindingResponse {
  result: ProcessResult | undefined;
  configUpdated: boolean;
}

export interface RawTransaction {
  raw: Uint8Array;
  programAccountId?: string | undefined;
  slot?: Long | undefined;
}

export interface Instruction {
  instructionData: string;
  slot: Long;
  programAccountId: string;
  parsed?: Uint8Array | undefined;
}

export interface Data {
  raw: Uint8Array;
}

export interface DataBinding {
  data: Data | undefined;
  handlerId: number;
  handlerType: HandlerType;
}

export interface BlockBinding {
  block: RawBlock | undefined;
  handlerIds: number[];
}

export interface RawBlock {
  raw: Uint8Array;
}

export interface ProcessResult {
  gauges: GaugeResult[];
  counters: CounterResult[];
  logs: LogResult[];
}

export interface DataDescriptor {
  name: string;
  description: string;
  unit: string;
  sparse: boolean;
}

export interface RecordMetaData {
  address: string;
  contractName: string;
  blockNumber: Long;
  transactionHash: string;
  chainId: string;
  transactionIndex: number;
  logIndex: number;
  dataDescriptor: DataDescriptor | undefined;
  labels: { [key: string]: string };
}

export interface RecordMetaData_LabelsEntry {
  key: string;
  value: string;
}

export interface MetricValue {
  bigDecimal: string | undefined;
  doubleValue: number | undefined;
  bigInteger: BigInteger | undefined;
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

export interface LogResult {
  metadata: RecordMetaData | undefined;
  level: LogLevel;
  message: string;
  attributes: string;
  runtimeInfo: RuntimeInfo | undefined;
}

function createBaseProjectConfig(): ProjectConfig {
  return { name: "", version: "" };
}

export const ProjectConfig = {
  encode(
    message: ProjectConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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

  fromPartial(object: DeepPartial<ProjectConfig>): ProjectConfig {
    const message = createBaseProjectConfig();
    message.name = object.name ?? "";
    message.version = object.version ?? "";
    return message;
  },
};

function createBaseProcessConfigRequest(): ProcessConfigRequest {
  return {};
}

export const ProcessConfigRequest = {
  encode(
    _: ProcessConfigRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessConfigRequest {
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

  fromPartial(_: DeepPartial<ProcessConfigRequest>): ProcessConfigRequest {
    const message = createBaseProcessConfigRequest();
    return message;
  },
};

function createBaseProcessConfigResponse(): ProcessConfigResponse {
  return {
    config: undefined,
    contractConfigs: [],
    templateInstances: [],
    accountConfigs: [],
  };
}

export const ProcessConfigResponse = {
  encode(
    message: ProcessConfigResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.config !== undefined) {
      ProjectConfig.encode(message.config, writer.uint32(10).fork()).ldelim();
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
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessConfigResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessConfigResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.config = ProjectConfig.decode(reader, reader.uint32());
          break;
        case 2:
          message.contractConfigs.push(
            ContractConfig.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.templateInstances.push(
            TemplateInstance.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.accountConfigs.push(
            AccountConfig.decode(reader, reader.uint32())
          );
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
      config: isSet(object.config)
        ? ProjectConfig.fromJSON(object.config)
        : undefined,
      contractConfigs: Array.isArray(object?.contractConfigs)
        ? object.contractConfigs.map((e: any) => ContractConfig.fromJSON(e))
        : [],
      templateInstances: Array.isArray(object?.templateInstances)
        ? object.templateInstances.map((e: any) => TemplateInstance.fromJSON(e))
        : [],
      accountConfigs: Array.isArray(object?.accountConfigs)
        ? object.accountConfigs.map((e: any) => AccountConfig.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessConfigResponse): unknown {
    const obj: any = {};
    message.config !== undefined &&
      (obj.config = message.config
        ? ProjectConfig.toJSON(message.config)
        : undefined);
    if (message.contractConfigs) {
      obj.contractConfigs = message.contractConfigs.map((e) =>
        e ? ContractConfig.toJSON(e) : undefined
      );
    } else {
      obj.contractConfigs = [];
    }
    if (message.templateInstances) {
      obj.templateInstances = message.templateInstances.map((e) =>
        e ? TemplateInstance.toJSON(e) : undefined
      );
    } else {
      obj.templateInstances = [];
    }
    if (message.accountConfigs) {
      obj.accountConfigs = message.accountConfigs.map((e) =>
        e ? AccountConfig.toJSON(e) : undefined
      );
    } else {
      obj.accountConfigs = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ProcessConfigResponse>
  ): ProcessConfigResponse {
    const message = createBaseProcessConfigResponse();
    message.config =
      object.config !== undefined && object.config !== null
        ? ProjectConfig.fromPartial(object.config)
        : undefined;
    message.contractConfigs =
      object.contractConfigs?.map((e) => ContractConfig.fromPartial(e)) || [];
    message.templateInstances =
      object.templateInstances?.map((e) => TemplateInstance.fromPartial(e)) ||
      [];
    message.accountConfigs =
      object.accountConfigs?.map((e) => AccountConfig.fromPartial(e)) || [];
    return message;
  },
};

function createBaseContractConfig(): ContractConfig {
  return {
    contract: undefined,
    blockConfigs: [],
    logConfigs: [],
    traceConfigs: [],
    aptosEventConfigs: [],
    aptosCallConfigs: [],
    instructionConfig: undefined,
    startBlock: Long.UZERO,
    endBlock: Long.UZERO,
    processorType: "",
  };
}

export const ContractConfig = {
  encode(
    message: ContractConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.contract !== undefined) {
      ContractInfo.encode(message.contract, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.blockConfigs) {
      BlockHandlerConfig.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.logConfigs) {
      LogHandlerConfig.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.traceConfigs) {
      TraceHandlerConfig.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.aptosEventConfigs) {
      AptosEventHandlerConfig.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.aptosCallConfigs) {
      AptosCallHandlerConfig.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    if (message.instructionConfig !== undefined) {
      InstructionHandlerConfig.encode(
        message.instructionConfig,
        writer.uint32(50).fork()
      ).ldelim();
    }
    if (!message.startBlock.isZero()) {
      writer.uint32(32).uint64(message.startBlock);
    }
    if (!message.endBlock.isZero()) {
      writer.uint32(40).uint64(message.endBlock);
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
        case 7:
          message.blockConfigs.push(
            BlockHandlerConfig.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.logConfigs.push(
            LogHandlerConfig.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.traceConfigs.push(
            TraceHandlerConfig.decode(reader, reader.uint32())
          );
          break;
        case 9:
          message.aptosEventConfigs.push(
            AptosEventHandlerConfig.decode(reader, reader.uint32())
          );
          break;
        case 10:
          message.aptosCallConfigs.push(
            AptosCallHandlerConfig.decode(reader, reader.uint32())
          );
          break;
        case 6:
          message.instructionConfig = InstructionHandlerConfig.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.startBlock = reader.uint64() as Long;
          break;
        case 5:
          message.endBlock = reader.uint64() as Long;
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
      contract: isSet(object.contract)
        ? ContractInfo.fromJSON(object.contract)
        : undefined,
      blockConfigs: Array.isArray(object?.blockConfigs)
        ? object.blockConfigs.map((e: any) => BlockHandlerConfig.fromJSON(e))
        : [],
      logConfigs: Array.isArray(object?.logConfigs)
        ? object.logConfigs.map((e: any) => LogHandlerConfig.fromJSON(e))
        : [],
      traceConfigs: Array.isArray(object?.traceConfigs)
        ? object.traceConfigs.map((e: any) => TraceHandlerConfig.fromJSON(e))
        : [],
      aptosEventConfigs: Array.isArray(object?.aptosEventConfigs)
        ? object.aptosEventConfigs.map((e: any) =>
            AptosEventHandlerConfig.fromJSON(e)
          )
        : [],
      aptosCallConfigs: Array.isArray(object?.aptosCallConfigs)
        ? object.aptosCallConfigs.map((e: any) =>
            AptosCallHandlerConfig.fromJSON(e)
          )
        : [],
      instructionConfig: isSet(object.instructionConfig)
        ? InstructionHandlerConfig.fromJSON(object.instructionConfig)
        : undefined,
      startBlock: isSet(object.startBlock)
        ? Long.fromValue(object.startBlock)
        : Long.UZERO,
      endBlock: isSet(object.endBlock)
        ? Long.fromValue(object.endBlock)
        : Long.UZERO,
      processorType: isSet(object.processorType)
        ? String(object.processorType)
        : "",
    };
  },

  toJSON(message: ContractConfig): unknown {
    const obj: any = {};
    message.contract !== undefined &&
      (obj.contract = message.contract
        ? ContractInfo.toJSON(message.contract)
        : undefined);
    if (message.blockConfigs) {
      obj.blockConfigs = message.blockConfigs.map((e) =>
        e ? BlockHandlerConfig.toJSON(e) : undefined
      );
    } else {
      obj.blockConfigs = [];
    }
    if (message.logConfigs) {
      obj.logConfigs = message.logConfigs.map((e) =>
        e ? LogHandlerConfig.toJSON(e) : undefined
      );
    } else {
      obj.logConfigs = [];
    }
    if (message.traceConfigs) {
      obj.traceConfigs = message.traceConfigs.map((e) =>
        e ? TraceHandlerConfig.toJSON(e) : undefined
      );
    } else {
      obj.traceConfigs = [];
    }
    if (message.aptosEventConfigs) {
      obj.aptosEventConfigs = message.aptosEventConfigs.map((e) =>
        e ? AptosEventHandlerConfig.toJSON(e) : undefined
      );
    } else {
      obj.aptosEventConfigs = [];
    }
    if (message.aptosCallConfigs) {
      obj.aptosCallConfigs = message.aptosCallConfigs.map((e) =>
        e ? AptosCallHandlerConfig.toJSON(e) : undefined
      );
    } else {
      obj.aptosCallConfigs = [];
    }
    message.instructionConfig !== undefined &&
      (obj.instructionConfig = message.instructionConfig
        ? InstructionHandlerConfig.toJSON(message.instructionConfig)
        : undefined);
    message.startBlock !== undefined &&
      (obj.startBlock = (message.startBlock || Long.UZERO).toString());
    message.endBlock !== undefined &&
      (obj.endBlock = (message.endBlock || Long.UZERO).toString());
    message.processorType !== undefined &&
      (obj.processorType = message.processorType);
    return obj;
  },

  fromPartial(object: DeepPartial<ContractConfig>): ContractConfig {
    const message = createBaseContractConfig();
    message.contract =
      object.contract !== undefined && object.contract !== null
        ? ContractInfo.fromPartial(object.contract)
        : undefined;
    message.blockConfigs =
      object.blockConfigs?.map((e) => BlockHandlerConfig.fromPartial(e)) || [];
    message.logConfigs =
      object.logConfigs?.map((e) => LogHandlerConfig.fromPartial(e)) || [];
    message.traceConfigs =
      object.traceConfigs?.map((e) => TraceHandlerConfig.fromPartial(e)) || [];
    message.aptosEventConfigs =
      object.aptosEventConfigs?.map((e) =>
        AptosEventHandlerConfig.fromPartial(e)
      ) || [];
    message.aptosCallConfigs =
      object.aptosCallConfigs?.map((e) =>
        AptosCallHandlerConfig.fromPartial(e)
      ) || [];
    message.instructionConfig =
      object.instructionConfig !== undefined &&
      object.instructionConfig !== null
        ? InstructionHandlerConfig.fromPartial(object.instructionConfig)
        : undefined;
    message.startBlock =
      object.startBlock !== undefined && object.startBlock !== null
        ? Long.fromValue(object.startBlock)
        : Long.UZERO;
    message.endBlock =
      object.endBlock !== undefined && object.endBlock !== null
        ? Long.fromValue(object.endBlock)
        : Long.UZERO;
    message.processorType = object.processorType ?? "";
    return message;
  },
};

function createBaseAccountConfig(): AccountConfig {
  return {};
}

export const AccountConfig = {
  encode(
    _: AccountConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccountConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccountConfig();
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

  fromJSON(_: any): AccountConfig {
    return {};
  },

  toJSON(_: AccountConfig): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<AccountConfig>): AccountConfig {
    const message = createBaseAccountConfig();
    return message;
  },
};

function createBaseContractInfo(): ContractInfo {
  return { name: "", chainId: "", address: "", abi: "" };
}

export const ContractInfo = {
  encode(
    message: ContractInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
  return {
    contract: undefined,
    startBlock: Long.UZERO,
    endBlock: Long.UZERO,
    templateId: 0,
  };
}

export const TemplateInstance = {
  encode(
    message: TemplateInstance,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.contract !== undefined) {
      ContractInfo.encode(message.contract, writer.uint32(10).fork()).ldelim();
    }
    if (!message.startBlock.isZero()) {
      writer.uint32(16).uint64(message.startBlock);
    }
    if (!message.endBlock.isZero()) {
      writer.uint32(24).uint64(message.endBlock);
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
          message.startBlock = reader.uint64() as Long;
          break;
        case 3:
          message.endBlock = reader.uint64() as Long;
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
      contract: isSet(object.contract)
        ? ContractInfo.fromJSON(object.contract)
        : undefined,
      startBlock: isSet(object.startBlock)
        ? Long.fromValue(object.startBlock)
        : Long.UZERO,
      endBlock: isSet(object.endBlock)
        ? Long.fromValue(object.endBlock)
        : Long.UZERO,
      templateId: isSet(object.templateId) ? Number(object.templateId) : 0,
    };
  },

  toJSON(message: TemplateInstance): unknown {
    const obj: any = {};
    message.contract !== undefined &&
      (obj.contract = message.contract
        ? ContractInfo.toJSON(message.contract)
        : undefined);
    message.startBlock !== undefined &&
      (obj.startBlock = (message.startBlock || Long.UZERO).toString());
    message.endBlock !== undefined &&
      (obj.endBlock = (message.endBlock || Long.UZERO).toString());
    message.templateId !== undefined &&
      (obj.templateId = Math.round(message.templateId));
    return obj;
  },

  fromPartial(object: DeepPartial<TemplateInstance>): TemplateInstance {
    const message = createBaseTemplateInstance();
    message.contract =
      object.contract !== undefined && object.contract !== null
        ? ContractInfo.fromPartial(object.contract)
        : undefined;
    message.startBlock =
      object.startBlock !== undefined && object.startBlock !== null
        ? Long.fromValue(object.startBlock)
        : Long.UZERO;
    message.endBlock =
      object.endBlock !== undefined && object.endBlock !== null
        ? Long.fromValue(object.endBlock)
        : Long.UZERO;
    message.templateId = object.templateId ?? 0;
    return message;
  },
};

function createBaseStartRequest(): StartRequest {
  return { templateInstances: [] };
}

export const StartRequest = {
  encode(
    message: StartRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
          message.templateInstances.push(
            TemplateInstance.decode(reader, reader.uint32())
          );
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
      obj.templateInstances = message.templateInstances.map((e) =>
        e ? TemplateInstance.toJSON(e) : undefined
      );
    } else {
      obj.templateInstances = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<StartRequest>): StartRequest {
    const message = createBaseStartRequest();
    message.templateInstances =
      object.templateInstances?.map((e) => TemplateInstance.fromPartial(e)) ||
      [];
    return message;
  },
};

function createBaseBlockHandlerConfig(): BlockHandlerConfig {
  return { handlerId: 0 };
}

export const BlockHandlerConfig = {
  encode(
    message: BlockHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
    return {
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
    };
  },

  toJSON(message: BlockHandlerConfig): unknown {
    const obj: any = {};
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  fromPartial(object: DeepPartial<BlockHandlerConfig>): BlockHandlerConfig {
    const message = createBaseBlockHandlerConfig();
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseTraceHandlerConfig(): TraceHandlerConfig {
  return { signature: "", handlerId: 0 };
}

export const TraceHandlerConfig = {
  encode(
    message: TraceHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.signature !== "") {
      writer.uint32(10).string(message.signature);
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
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
    };
  },

  toJSON(message: TraceHandlerConfig): unknown {
    const obj: any = {};
    message.signature !== undefined && (obj.signature = message.signature);
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  fromPartial(object: DeepPartial<TraceHandlerConfig>): TraceHandlerConfig {
    const message = createBaseTraceHandlerConfig();
    message.signature = object.signature ?? "";
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseLogHandlerConfig(): LogHandlerConfig {
  return { filters: [], handlerId: 0 };
}

export const LogHandlerConfig = {
  encode(
    message: LogHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.filters) {
      LogFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LogHandlerConfig {
    return {
      filters: Array.isArray(object?.filters)
        ? object.filters.map((e: any) => LogFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
    };
  },

  toJSON(message: LogHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) =>
        e ? LogFilter.toJSON(e) : undefined
      );
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  fromPartial(object: DeepPartial<LogHandlerConfig>): LogHandlerConfig {
    const message = createBaseLogHandlerConfig();
    message.filters =
      object.filters?.map((e) => LogFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseLogFilter(): LogFilter {
  return { topics: [] };
}

export const LogFilter = {
  encode(
    message: LogFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.topics) {
      Topic.encode(v!, writer.uint32(10).fork()).ldelim();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LogFilter {
    return {
      topics: Array.isArray(object?.topics)
        ? object.topics.map((e: any) => Topic.fromJSON(e))
        : [],
    };
  },

  toJSON(message: LogFilter): unknown {
    const obj: any = {};
    if (message.topics) {
      obj.topics = message.topics.map((e) => (e ? Topic.toJSON(e) : undefined));
    } else {
      obj.topics = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<LogFilter>): LogFilter {
    const message = createBaseLogFilter();
    message.topics = object.topics?.map((e) => Topic.fromPartial(e)) || [];
    return message;
  },
};

function createBaseInstructionHandlerConfig(): InstructionHandlerConfig {
  return {
    innerInstruction: false,
    parsedInstruction: false,
    rawDataInstruction: false,
  };
}

export const InstructionHandlerConfig = {
  encode(
    message: InstructionHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): InstructionHandlerConfig {
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
      innerInstruction: isSet(object.innerInstruction)
        ? Boolean(object.innerInstruction)
        : false,
      parsedInstruction: isSet(object.parsedInstruction)
        ? Boolean(object.parsedInstruction)
        : false,
      rawDataInstruction: isSet(object.rawDataInstruction)
        ? Boolean(object.rawDataInstruction)
        : false,
    };
  },

  toJSON(message: InstructionHandlerConfig): unknown {
    const obj: any = {};
    message.innerInstruction !== undefined &&
      (obj.innerInstruction = message.innerInstruction);
    message.parsedInstruction !== undefined &&
      (obj.parsedInstruction = message.parsedInstruction);
    message.rawDataInstruction !== undefined &&
      (obj.rawDataInstruction = message.rawDataInstruction);
    return obj;
  },

  fromPartial(
    object: DeepPartial<InstructionHandlerConfig>
  ): InstructionHandlerConfig {
    const message = createBaseInstructionHandlerConfig();
    message.innerInstruction = object.innerInstruction ?? false;
    message.parsedInstruction = object.parsedInstruction ?? false;
    message.rawDataInstruction = object.rawDataInstruction ?? false;
    return message;
  },
};

function createBaseAptosEventHandlerConfig(): AptosEventHandlerConfig {
  return { filters: [], handlerId: 0 };
}

export const AptosEventHandlerConfig = {
  encode(
    message: AptosEventHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.filters) {
      AptosEventFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosEventHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosEventHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filters.push(
            AptosEventFilter.decode(reader, reader.uint32())
          );
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

  fromJSON(object: any): AptosEventHandlerConfig {
    return {
      filters: Array.isArray(object?.filters)
        ? object.filters.map((e: any) => AptosEventFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
    };
  },

  toJSON(message: AptosEventHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) =>
        e ? AptosEventFilter.toJSON(e) : undefined
      );
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  fromPartial(
    object: DeepPartial<AptosEventHandlerConfig>
  ): AptosEventHandlerConfig {
    const message = createBaseAptosEventHandlerConfig();
    message.filters =
      object.filters?.map((e) => AptosEventFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseAptosEventFilter(): AptosEventFilter {
  return { type: "" };
}

export const AptosEventFilter = {
  encode(
    message: AptosEventFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosEventFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosEventFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosEventFilter {
    return {
      type: isSet(object.type) ? String(object.type) : "",
    };
  },

  toJSON(message: AptosEventFilter): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    return obj;
  },

  fromPartial(object: DeepPartial<AptosEventFilter>): AptosEventFilter {
    const message = createBaseAptosEventFilter();
    message.type = object.type ?? "";
    return message;
  },
};

function createBaseAptosCallHandlerConfig(): AptosCallHandlerConfig {
  return { filters: [], handlerId: 0 };
}

export const AptosCallHandlerConfig = {
  encode(
    message: AptosCallHandlerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.filters) {
      AptosCallFilter.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosCallHandlerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosCallHandlerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filters.push(AptosCallFilter.decode(reader, reader.uint32()));
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

  fromJSON(object: any): AptosCallHandlerConfig {
    return {
      filters: Array.isArray(object?.filters)
        ? object.filters.map((e: any) => AptosCallFilter.fromJSON(e))
        : [],
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
    };
  },

  toJSON(message: AptosCallHandlerConfig): unknown {
    const obj: any = {};
    if (message.filters) {
      obj.filters = message.filters.map((e) =>
        e ? AptosCallFilter.toJSON(e) : undefined
      );
    } else {
      obj.filters = [];
    }
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    return obj;
  },

  fromPartial(
    object: DeepPartial<AptosCallHandlerConfig>
  ): AptosCallHandlerConfig {
    const message = createBaseAptosCallHandlerConfig();
    message.filters =
      object.filters?.map((e) => AptosCallFilter.fromPartial(e)) || [];
    message.handlerId = object.handlerId ?? 0;
    return message;
  },
};

function createBaseAptosCallFilter(): AptosCallFilter {
  return { function: "", typeArguments: [], withTypeArguments: false };
}

export const AptosCallFilter = {
  encode(
    message: AptosCallFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.function !== "") {
      writer.uint32(10).string(message.function);
    }
    for (const v of message.typeArguments) {
      writer.uint32(18).string(v!);
    }
    if (message.withTypeArguments === true) {
      writer.uint32(24).bool(message.withTypeArguments);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosCallFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosCallFilter();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosCallFilter {
    return {
      function: isSet(object.function) ? String(object.function) : "",
      typeArguments: Array.isArray(object?.typeArguments)
        ? object.typeArguments.map((e: any) => String(e))
        : [],
      withTypeArguments: isSet(object.withTypeArguments)
        ? Boolean(object.withTypeArguments)
        : false,
    };
  },

  toJSON(message: AptosCallFilter): unknown {
    const obj: any = {};
    message.function !== undefined && (obj.function = message.function);
    if (message.typeArguments) {
      obj.typeArguments = message.typeArguments.map((e) => e);
    } else {
      obj.typeArguments = [];
    }
    message.withTypeArguments !== undefined &&
      (obj.withTypeArguments = message.withTypeArguments);
    return obj;
  },

  fromPartial(object: DeepPartial<AptosCallFilter>): AptosCallFilter {
    const message = createBaseAptosCallFilter();
    message.function = object.function ?? "";
    message.typeArguments = object.typeArguments?.map((e) => e) || [];
    message.withTypeArguments = object.withTypeArguments ?? false;
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
    return {
      hashes: Array.isArray(object?.hashes)
        ? object.hashes.map((e: any) => String(e))
        : [],
    };
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

  fromPartial(object: DeepPartial<Topic>): Topic {
    const message = createBaseTopic();
    message.hashes = object.hashes?.map((e) => e) || [];
    return message;
  },
};

function createBaseProcessTransactionsRequest(): ProcessTransactionsRequest {
  return { chainId: "", transactions: [] };
}

export const ProcessTransactionsRequest = {
  encode(
    message: ProcessTransactionsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    for (const v of message.transactions) {
      RawTransaction.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessTransactionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessTransactionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.transactions.push(
            RawTransaction.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessTransactionsRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      transactions: Array.isArray(object?.transactions)
        ? object.transactions.map((e: any) => RawTransaction.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessTransactionsRequest): unknown {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    if (message.transactions) {
      obj.transactions = message.transactions.map((e) =>
        e ? RawTransaction.toJSON(e) : undefined
      );
    } else {
      obj.transactions = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ProcessTransactionsRequest>
  ): ProcessTransactionsRequest {
    const message = createBaseProcessTransactionsRequest();
    message.chainId = object.chainId ?? "";
    message.transactions =
      object.transactions?.map((e) => RawTransaction.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProcessInstructionsRequest(): ProcessInstructionsRequest {
  return { instructions: [] };
}

export const ProcessInstructionsRequest = {
  encode(
    message: ProcessInstructionsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.instructions) {
      Instruction.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessInstructionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessInstructionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.instructions.push(
            Instruction.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessInstructionsRequest {
    return {
      instructions: Array.isArray(object?.instructions)
        ? object.instructions.map((e: any) => Instruction.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessInstructionsRequest): unknown {
    const obj: any = {};
    if (message.instructions) {
      obj.instructions = message.instructions.map((e) =>
        e ? Instruction.toJSON(e) : undefined
      );
    } else {
      obj.instructions = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ProcessInstructionsRequest>
  ): ProcessInstructionsRequest {
    const message = createBaseProcessInstructionsRequest();
    message.instructions =
      object.instructions?.map((e) => Instruction.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProcessBlocksRequest(): ProcessBlocksRequest {
  return { blockBindings: [] };
}

export const ProcessBlocksRequest = {
  encode(
    message: ProcessBlocksRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.blockBindings) {
      BlockBinding.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessBlocksRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBlocksRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.blockBindings.push(
            BlockBinding.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessBlocksRequest {
    return {
      blockBindings: Array.isArray(object?.blockBindings)
        ? object.blockBindings.map((e: any) => BlockBinding.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessBlocksRequest): unknown {
    const obj: any = {};
    if (message.blockBindings) {
      obj.blockBindings = message.blockBindings.map((e) =>
        e ? BlockBinding.toJSON(e) : undefined
      );
    } else {
      obj.blockBindings = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<ProcessBlocksRequest>): ProcessBlocksRequest {
    const message = createBaseProcessBlocksRequest();
    message.blockBindings =
      object.blockBindings?.map((e) => BlockBinding.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProcessBindingsRequest(): ProcessBindingsRequest {
  return { bindings: [] };
}

export const ProcessBindingsRequest = {
  encode(
    message: ProcessBindingsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.bindings) {
      DataBinding.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessBindingsRequest {
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
      bindings: Array.isArray(object?.bindings)
        ? object.bindings.map((e: any) => DataBinding.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessBindingsRequest): unknown {
    const obj: any = {};
    if (message.bindings) {
      obj.bindings = message.bindings.map((e) =>
        e ? DataBinding.toJSON(e) : undefined
      );
    } else {
      obj.bindings = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ProcessBindingsRequest>
  ): ProcessBindingsRequest {
    const message = createBaseProcessBindingsRequest();
    message.bindings =
      object.bindings?.map((e) => DataBinding.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProcessBindingResponse(): ProcessBindingResponse {
  return { result: undefined, configUpdated: false };
}

export const ProcessBindingResponse = {
  encode(
    message: ProcessBindingResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.result !== undefined) {
      ProcessResult.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    if (message.configUpdated === true) {
      writer.uint32(32).bool(message.configUpdated);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProcessBindingResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProcessBindingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = ProcessResult.decode(reader, reader.uint32());
          break;
        case 4:
          message.configUpdated = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProcessBindingResponse {
    return {
      result: isSet(object.result)
        ? ProcessResult.fromJSON(object.result)
        : undefined,
      configUpdated: isSet(object.configUpdated)
        ? Boolean(object.configUpdated)
        : false,
    };
  },

  toJSON(message: ProcessBindingResponse): unknown {
    const obj: any = {};
    message.result !== undefined &&
      (obj.result = message.result
        ? ProcessResult.toJSON(message.result)
        : undefined);
    message.configUpdated !== undefined &&
      (obj.configUpdated = message.configUpdated);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ProcessBindingResponse>
  ): ProcessBindingResponse {
    const message = createBaseProcessBindingResponse();
    message.result =
      object.result !== undefined && object.result !== null
        ? ProcessResult.fromPartial(object.result)
        : undefined;
    message.configUpdated = object.configUpdated ?? false;
    return message;
  },
};

function createBaseRawTransaction(): RawTransaction {
  return {
    raw: new Uint8Array(),
    programAccountId: undefined,
    slot: undefined,
  };
}

export const RawTransaction = {
  encode(
    message: RawTransaction,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.raw.length !== 0) {
      writer.uint32(10).bytes(message.raw);
    }
    if (message.programAccountId !== undefined) {
      writer.uint32(18).string(message.programAccountId);
    }
    if (message.slot !== undefined) {
      writer.uint32(24).uint64(message.slot);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RawTransaction {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.raw = reader.bytes();
          break;
        case 2:
          message.programAccountId = reader.string();
          break;
        case 3:
          message.slot = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RawTransaction {
    return {
      raw: isSet(object.raw) ? bytesFromBase64(object.raw) : new Uint8Array(),
      programAccountId: isSet(object.programAccountId)
        ? String(object.programAccountId)
        : undefined,
      slot: isSet(object.slot) ? Long.fromValue(object.slot) : undefined,
    };
  },

  toJSON(message: RawTransaction): unknown {
    const obj: any = {};
    message.raw !== undefined &&
      (obj.raw = base64FromBytes(
        message.raw !== undefined ? message.raw : new Uint8Array()
      ));
    message.programAccountId !== undefined &&
      (obj.programAccountId = message.programAccountId);
    message.slot !== undefined &&
      (obj.slot = (message.slot || undefined).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<RawTransaction>): RawTransaction {
    const message = createBaseRawTransaction();
    message.raw = object.raw ?? new Uint8Array();
    message.programAccountId = object.programAccountId ?? undefined;
    message.slot =
      object.slot !== undefined && object.slot !== null
        ? Long.fromValue(object.slot)
        : undefined;
    return message;
  },
};

function createBaseInstruction(): Instruction {
  return {
    instructionData: "",
    slot: Long.UZERO,
    programAccountId: "",
    parsed: undefined,
  };
}

export const Instruction = {
  encode(
    message: Instruction,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.instructionData !== "") {
      writer.uint32(10).string(message.instructionData);
    }
    if (!message.slot.isZero()) {
      writer.uint32(16).uint64(message.slot);
    }
    if (message.programAccountId !== "") {
      writer.uint32(26).string(message.programAccountId);
    }
    if (message.parsed !== undefined) {
      writer.uint32(34).bytes(message.parsed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Instruction {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstruction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.instructionData = reader.string();
          break;
        case 2:
          message.slot = reader.uint64() as Long;
          break;
        case 3:
          message.programAccountId = reader.string();
          break;
        case 4:
          message.parsed = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Instruction {
    return {
      instructionData: isSet(object.instructionData)
        ? String(object.instructionData)
        : "",
      slot: isSet(object.slot) ? Long.fromValue(object.slot) : Long.UZERO,
      programAccountId: isSet(object.programAccountId)
        ? String(object.programAccountId)
        : "",
      parsed: isSet(object.parsed) ? bytesFromBase64(object.parsed) : undefined,
    };
  },

  toJSON(message: Instruction): unknown {
    const obj: any = {};
    message.instructionData !== undefined &&
      (obj.instructionData = message.instructionData);
    message.slot !== undefined &&
      (obj.slot = (message.slot || Long.UZERO).toString());
    message.programAccountId !== undefined &&
      (obj.programAccountId = message.programAccountId);
    message.parsed !== undefined &&
      (obj.parsed =
        message.parsed !== undefined
          ? base64FromBytes(message.parsed)
          : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Instruction>): Instruction {
    const message = createBaseInstruction();
    message.instructionData = object.instructionData ?? "";
    message.slot =
      object.slot !== undefined && object.slot !== null
        ? Long.fromValue(object.slot)
        : Long.UZERO;
    message.programAccountId = object.programAccountId ?? "";
    message.parsed = object.parsed ?? undefined;
    return message;
  },
};

function createBaseData(): Data {
  return { raw: new Uint8Array() };
}

export const Data = {
  encode(message: Data, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.raw.length !== 0) {
      writer.uint32(10).bytes(message.raw);
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
        case 1:
          message.raw = reader.bytes();
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
      raw: isSet(object.raw) ? bytesFromBase64(object.raw) : new Uint8Array(),
    };
  },

  toJSON(message: Data): unknown {
    const obj: any = {};
    message.raw !== undefined &&
      (obj.raw = base64FromBytes(
        message.raw !== undefined ? message.raw : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<Data>): Data {
    const message = createBaseData();
    message.raw = object.raw ?? new Uint8Array();
    return message;
  },
};

function createBaseDataBinding(): DataBinding {
  return { data: undefined, handlerId: 0, handlerType: 0 };
}

export const DataBinding = {
  encode(
    message: DataBinding,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.data !== undefined) {
      Data.encode(message.data, writer.uint32(10).fork()).ldelim();
    }
    if (message.handlerId !== 0) {
      writer.uint32(16).int32(message.handlerId);
    }
    if (message.handlerType !== 0) {
      writer.uint32(24).int32(message.handlerType);
    }
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
        case 2:
          message.handlerId = reader.int32();
          break;
        case 3:
          message.handlerType = reader.int32() as any;
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
      handlerId: isSet(object.handlerId) ? Number(object.handlerId) : 0,
      handlerType: isSet(object.handlerType)
        ? handlerTypeFromJSON(object.handlerType)
        : 0,
    };
  },

  toJSON(message: DataBinding): unknown {
    const obj: any = {};
    message.data !== undefined &&
      (obj.data = message.data ? Data.toJSON(message.data) : undefined);
    message.handlerId !== undefined &&
      (obj.handlerId = Math.round(message.handlerId));
    message.handlerType !== undefined &&
      (obj.handlerType = handlerTypeToJSON(message.handlerType));
    return obj;
  },

  fromPartial(object: DeepPartial<DataBinding>): DataBinding {
    const message = createBaseDataBinding();
    message.data =
      object.data !== undefined && object.data !== null
        ? Data.fromPartial(object.data)
        : undefined;
    message.handlerId = object.handlerId ?? 0;
    message.handlerType = object.handlerType ?? 0;
    return message;
  },
};

function createBaseBlockBinding(): BlockBinding {
  return { block: undefined, handlerIds: [] };
}

export const BlockBinding = {
  encode(
    message: BlockBinding,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.block !== undefined) {
      RawBlock.encode(message.block, writer.uint32(10).fork()).ldelim();
    }
    writer.uint32(18).fork();
    for (const v of message.handlerIds) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BlockBinding {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockBinding();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.block = RawBlock.decode(reader, reader.uint32());
          break;
        case 2:
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

  fromJSON(object: any): BlockBinding {
    return {
      block: isSet(object.block) ? RawBlock.fromJSON(object.block) : undefined,
      handlerIds: Array.isArray(object?.handlerIds)
        ? object.handlerIds.map((e: any) => Number(e))
        : [],
    };
  },

  toJSON(message: BlockBinding): unknown {
    const obj: any = {};
    message.block !== undefined &&
      (obj.block = message.block ? RawBlock.toJSON(message.block) : undefined);
    if (message.handlerIds) {
      obj.handlerIds = message.handlerIds.map((e) => Math.round(e));
    } else {
      obj.handlerIds = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<BlockBinding>): BlockBinding {
    const message = createBaseBlockBinding();
    message.block =
      object.block !== undefined && object.block !== null
        ? RawBlock.fromPartial(object.block)
        : undefined;
    message.handlerIds = object.handlerIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseRawBlock(): RawBlock {
  return { raw: new Uint8Array() };
}

export const RawBlock = {
  encode(
    message: RawBlock,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.raw.length !== 0) {
      writer.uint32(10).bytes(message.raw);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RawBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.raw = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RawBlock {
    return {
      raw: isSet(object.raw) ? bytesFromBase64(object.raw) : new Uint8Array(),
    };
  },

  toJSON(message: RawBlock): unknown {
    const obj: any = {};
    message.raw !== undefined &&
      (obj.raw = base64FromBytes(
        message.raw !== undefined ? message.raw : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<RawBlock>): RawBlock {
    const message = createBaseRawBlock();
    message.raw = object.raw ?? new Uint8Array();
    return message;
  },
};

function createBaseProcessResult(): ProcessResult {
  return { gauges: [], counters: [], logs: [] };
}

export const ProcessResult = {
  encode(
    message: ProcessResult,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.gauges) {
      GaugeResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.counters) {
      CounterResult.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.logs) {
      LogResult.encode(v!, writer.uint32(26).fork()).ldelim();
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
        case 3:
          message.logs.push(LogResult.decode(reader, reader.uint32()));
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
      gauges: Array.isArray(object?.gauges)
        ? object.gauges.map((e: any) => GaugeResult.fromJSON(e))
        : [],
      counters: Array.isArray(object?.counters)
        ? object.counters.map((e: any) => CounterResult.fromJSON(e))
        : [],
      logs: Array.isArray(object?.logs)
        ? object.logs.map((e: any) => LogResult.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProcessResult): unknown {
    const obj: any = {};
    if (message.gauges) {
      obj.gauges = message.gauges.map((e) =>
        e ? GaugeResult.toJSON(e) : undefined
      );
    } else {
      obj.gauges = [];
    }
    if (message.counters) {
      obj.counters = message.counters.map((e) =>
        e ? CounterResult.toJSON(e) : undefined
      );
    } else {
      obj.counters = [];
    }
    if (message.logs) {
      obj.logs = message.logs.map((e) => (e ? LogResult.toJSON(e) : undefined));
    } else {
      obj.logs = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<ProcessResult>): ProcessResult {
    const message = createBaseProcessResult();
    message.gauges =
      object.gauges?.map((e) => GaugeResult.fromPartial(e)) || [];
    message.counters =
      object.counters?.map((e) => CounterResult.fromPartial(e)) || [];
    message.logs = object.logs?.map((e) => LogResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDataDescriptor(): DataDescriptor {
  return { name: "", description: "", unit: "", sparse: false };
}

export const DataDescriptor = {
  encode(
    message: DataDescriptor,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataDescriptor {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataDescriptor();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataDescriptor {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description) ? String(object.description) : "",
      unit: isSet(object.unit) ? String(object.unit) : "",
      sparse: isSet(object.sparse) ? Boolean(object.sparse) : false,
    };
  },

  toJSON(message: DataDescriptor): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.unit !== undefined && (obj.unit = message.unit);
    message.sparse !== undefined && (obj.sparse = message.sparse);
    return obj;
  },

  fromPartial(object: DeepPartial<DataDescriptor>): DataDescriptor {
    const message = createBaseDataDescriptor();
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.unit = object.unit ?? "";
    message.sparse = object.sparse ?? false;
    return message;
  },
};

function createBaseRecordMetaData(): RecordMetaData {
  return {
    address: "",
    contractName: "",
    blockNumber: Long.UZERO,
    transactionHash: "",
    chainId: "",
    transactionIndex: 0,
    logIndex: 0,
    dataDescriptor: undefined,
    labels: {},
  };
}

export const RecordMetaData = {
  encode(
    message: RecordMetaData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.contractName !== "") {
      writer.uint32(74).string(message.contractName);
    }
    if (!message.blockNumber.isZero()) {
      writer.uint32(16).uint64(message.blockNumber);
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
    if (message.dataDescriptor !== undefined) {
      DataDescriptor.encode(
        message.dataDescriptor,
        writer.uint32(66).fork()
      ).ldelim();
    }
    Object.entries(message.labels).forEach(([key, value]) => {
      RecordMetaData_LabelsEntry.encode(
        { key: key as any, value },
        writer.uint32(58).fork()
      ).ldelim();
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
          message.blockNumber = reader.uint64() as Long;
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
        case 8:
          message.dataDescriptor = DataDescriptor.decode(
            reader,
            reader.uint32()
          );
          break;
        case 7:
          const entry7 = RecordMetaData_LabelsEntry.decode(
            reader,
            reader.uint32()
          );
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
      contractName: isSet(object.contractName)
        ? String(object.contractName)
        : "",
      blockNumber: isSet(object.blockNumber)
        ? Long.fromValue(object.blockNumber)
        : Long.UZERO,
      transactionHash: isSet(object.transactionHash)
        ? String(object.transactionHash)
        : "",
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      transactionIndex: isSet(object.transactionIndex)
        ? Number(object.transactionIndex)
        : 0,
      logIndex: isSet(object.logIndex) ? Number(object.logIndex) : 0,
      dataDescriptor: isSet(object.dataDescriptor)
        ? DataDescriptor.fromJSON(object.dataDescriptor)
        : undefined,
      labels: isObject(object.labels)
        ? Object.entries(object.labels).reduce<{ [key: string]: string }>(
            (acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            },
            {}
          )
        : {},
    };
  },

  toJSON(message: RecordMetaData): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.contractName !== undefined &&
      (obj.contractName = message.contractName);
    message.blockNumber !== undefined &&
      (obj.blockNumber = (message.blockNumber || Long.UZERO).toString());
    message.transactionHash !== undefined &&
      (obj.transactionHash = message.transactionHash);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.transactionIndex !== undefined &&
      (obj.transactionIndex = Math.round(message.transactionIndex));
    message.logIndex !== undefined &&
      (obj.logIndex = Math.round(message.logIndex));
    message.dataDescriptor !== undefined &&
      (obj.dataDescriptor = message.dataDescriptor
        ? DataDescriptor.toJSON(message.dataDescriptor)
        : undefined);
    obj.labels = {};
    if (message.labels) {
      Object.entries(message.labels).forEach(([k, v]) => {
        obj.labels[k] = v;
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<RecordMetaData>): RecordMetaData {
    const message = createBaseRecordMetaData();
    message.address = object.address ?? "";
    message.contractName = object.contractName ?? "";
    message.blockNumber =
      object.blockNumber !== undefined && object.blockNumber !== null
        ? Long.fromValue(object.blockNumber)
        : Long.UZERO;
    message.transactionHash = object.transactionHash ?? "";
    message.chainId = object.chainId ?? "";
    message.transactionIndex = object.transactionIndex ?? 0;
    message.logIndex = object.logIndex ?? 0;
    message.dataDescriptor =
      object.dataDescriptor !== undefined && object.dataDescriptor !== null
        ? DataDescriptor.fromPartial(object.dataDescriptor)
        : undefined;
    message.labels = Object.entries(object.labels ?? {}).reduce<{
      [key: string]: string;
    }>((acc, [key, value]) => {
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
  encode(
    message: RecordMetaData_LabelsEntry,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RecordMetaData_LabelsEntry {
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
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? String(object.value) : "",
    };
  },

  toJSON(message: RecordMetaData_LabelsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordMetaData_LabelsEntry>
  ): RecordMetaData_LabelsEntry {
    const message = createBaseRecordMetaData_LabelsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseMetricValue(): MetricValue {
  return {
    bigDecimal: undefined,
    doubleValue: undefined,
    bigInteger: undefined,
  };
}

export const MetricValue = {
  encode(
    message: MetricValue,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
      bigDecimal: isSet(object.bigDecimal)
        ? String(object.bigDecimal)
        : undefined,
      doubleValue: isSet(object.doubleValue)
        ? Number(object.doubleValue)
        : undefined,
      bigInteger: isSet(object.bigInteger)
        ? BigInteger.fromJSON(object.bigInteger)
        : undefined,
    };
  },

  toJSON(message: MetricValue): unknown {
    const obj: any = {};
    message.bigDecimal !== undefined && (obj.bigDecimal = message.bigDecimal);
    message.doubleValue !== undefined &&
      (obj.doubleValue = message.doubleValue);
    message.bigInteger !== undefined &&
      (obj.bigInteger = message.bigInteger
        ? BigInteger.toJSON(message.bigInteger)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MetricValue>): MetricValue {
    const message = createBaseMetricValue();
    message.bigDecimal = object.bigDecimal ?? undefined;
    message.doubleValue = object.doubleValue ?? undefined;
    message.bigInteger =
      object.bigInteger !== undefined && object.bigInteger !== null
        ? BigInteger.fromPartial(object.bigInteger)
        : undefined;
    return message;
  },
};

function createBaseBigInteger(): BigInteger {
  return { negative: false, data: new Uint8Array() };
}

export const BigInteger = {
  encode(
    message: BigInteger,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
    };
  },

  toJSON(message: BigInteger): unknown {
    const obj: any = {};
    message.negative !== undefined && (obj.negative = message.negative);
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array()
      ));
    return obj;
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
  encode(
    message: RuntimeInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
    return {
      from: isSet(object.from) ? handlerTypeFromJSON(object.from) : 0,
    };
  },

  toJSON(message: RuntimeInfo): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = handlerTypeToJSON(message.from));
    return obj;
  },

  fromPartial(object: DeepPartial<RuntimeInfo>): RuntimeInfo {
    const message = createBaseRuntimeInfo();
    message.from = object.from ?? 0;
    return message;
  },
};

function createBaseGaugeResult(): GaugeResult {
  return {
    metadata: undefined,
    metricValue: undefined,
    runtimeInfo: undefined,
  };
}

export const GaugeResult = {
  encode(
    message: GaugeResult,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(
        message.metadata,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.metricValue !== undefined) {
      MetricValue.encode(
        message.metricValue,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(
        message.runtimeInfo,
        writer.uint32(26).fork()
      ).ldelim();
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
      metadata: isSet(object.metadata)
        ? RecordMetaData.fromJSON(object.metadata)
        : undefined,
      metricValue: isSet(object.metricValue)
        ? MetricValue.fromJSON(object.metricValue)
        : undefined,
      runtimeInfo: isSet(object.runtimeInfo)
        ? RuntimeInfo.fromJSON(object.runtimeInfo)
        : undefined,
    };
  },

  toJSON(message: GaugeResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? RecordMetaData.toJSON(message.metadata)
        : undefined);
    message.metricValue !== undefined &&
      (obj.metricValue = message.metricValue
        ? MetricValue.toJSON(message.metricValue)
        : undefined);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo
        ? RuntimeInfo.toJSON(message.runtimeInfo)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<GaugeResult>): GaugeResult {
    const message = createBaseGaugeResult();
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? RecordMetaData.fromPartial(object.metadata)
        : undefined;
    message.metricValue =
      object.metricValue !== undefined && object.metricValue !== null
        ? MetricValue.fromPartial(object.metricValue)
        : undefined;
    message.runtimeInfo =
      object.runtimeInfo !== undefined && object.runtimeInfo !== null
        ? RuntimeInfo.fromPartial(object.runtimeInfo)
        : undefined;
    return message;
  },
};

function createBaseCounterResult(): CounterResult {
  return {
    metadata: undefined,
    metricValue: undefined,
    add: false,
    runtimeInfo: undefined,
  };
}

export const CounterResult = {
  encode(
    message: CounterResult,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(
        message.metadata,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.metricValue !== undefined) {
      MetricValue.encode(
        message.metricValue,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.add === true) {
      writer.uint32(24).bool(message.add);
    }
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(
        message.runtimeInfo,
        writer.uint32(34).fork()
      ).ldelim();
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
      metadata: isSet(object.metadata)
        ? RecordMetaData.fromJSON(object.metadata)
        : undefined,
      metricValue: isSet(object.metricValue)
        ? MetricValue.fromJSON(object.metricValue)
        : undefined,
      add: isSet(object.add) ? Boolean(object.add) : false,
      runtimeInfo: isSet(object.runtimeInfo)
        ? RuntimeInfo.fromJSON(object.runtimeInfo)
        : undefined,
    };
  },

  toJSON(message: CounterResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? RecordMetaData.toJSON(message.metadata)
        : undefined);
    message.metricValue !== undefined &&
      (obj.metricValue = message.metricValue
        ? MetricValue.toJSON(message.metricValue)
        : undefined);
    message.add !== undefined && (obj.add = message.add);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo
        ? RuntimeInfo.toJSON(message.runtimeInfo)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<CounterResult>): CounterResult {
    const message = createBaseCounterResult();
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? RecordMetaData.fromPartial(object.metadata)
        : undefined;
    message.metricValue =
      object.metricValue !== undefined && object.metricValue !== null
        ? MetricValue.fromPartial(object.metricValue)
        : undefined;
    message.add = object.add ?? false;
    message.runtimeInfo =
      object.runtimeInfo !== undefined && object.runtimeInfo !== null
        ? RuntimeInfo.fromPartial(object.runtimeInfo)
        : undefined;
    return message;
  },
};

function createBaseLogResult(): LogResult {
  return {
    metadata: undefined,
    level: 0,
    message: "",
    attributes: "",
    runtimeInfo: undefined,
  };
}

export const LogResult = {
  encode(
    message: LogResult,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.metadata !== undefined) {
      RecordMetaData.encode(
        message.metadata,
        writer.uint32(10).fork()
      ).ldelim();
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
    if (message.runtimeInfo !== undefined) {
      RuntimeInfo.encode(
        message.runtimeInfo,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLogResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = RecordMetaData.decode(reader, reader.uint32());
          break;
        case 2:
          message.level = reader.int32() as any;
          break;
        case 3:
          message.message = reader.string();
          break;
        case 6:
          message.attributes = reader.string();
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

  fromJSON(object: any): LogResult {
    return {
      metadata: isSet(object.metadata)
        ? RecordMetaData.fromJSON(object.metadata)
        : undefined,
      level: isSet(object.level) ? logLevelFromJSON(object.level) : 0,
      message: isSet(object.message) ? String(object.message) : "",
      attributes: isSet(object.attributes) ? String(object.attributes) : "",
      runtimeInfo: isSet(object.runtimeInfo)
        ? RuntimeInfo.fromJSON(object.runtimeInfo)
        : undefined,
    };
  },

  toJSON(message: LogResult): unknown {
    const obj: any = {};
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? RecordMetaData.toJSON(message.metadata)
        : undefined);
    message.level !== undefined && (obj.level = logLevelToJSON(message.level));
    message.message !== undefined && (obj.message = message.message);
    message.attributes !== undefined && (obj.attributes = message.attributes);
    message.runtimeInfo !== undefined &&
      (obj.runtimeInfo = message.runtimeInfo
        ? RuntimeInfo.toJSON(message.runtimeInfo)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<LogResult>): LogResult {
    const message = createBaseLogResult();
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? RecordMetaData.fromPartial(object.metadata)
        : undefined;
    message.level = object.level ?? 0;
    message.message = object.message ?? "";
    message.attributes = object.attributes ?? "";
    message.runtimeInfo =
      object.runtimeInfo !== undefined && object.runtimeInfo !== null
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
    processLogs: {
      name: "ProcessLogs",
      requestType: ProcessBindingsRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
      responseStream: false,
      options: {},
    },
    processTraces: {
      name: "ProcessTraces",
      requestType: ProcessBindingsRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
      responseStream: false,
      options: {},
    },
    processTransactions: {
      name: "ProcessTransactions",
      requestType: ProcessTransactionsRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
      responseStream: false,
      options: {},
    },
    processInstructions: {
      name: "ProcessInstructions",
      requestType: ProcessInstructionsRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
      responseStream: false,
      options: {},
    },
    processBlocks: {
      name: "ProcessBlocks",
      requestType: ProcessBlocksRequest,
      requestStream: false,
      responseType: ProcessBindingResponse,
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
  },
} as const;

export interface ProcessorServiceImplementation<CallContextExt = {}> {
  start(
    request: StartRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<Empty>>;
  stop(
    request: Empty,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<Empty>>;
  getConfig(
    request: ProcessConfigRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessConfigResponse>>;
  processLogs(
    request: ProcessBindingsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processTraces(
    request: ProcessBindingsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processTransactions(
    request: ProcessTransactionsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processInstructions(
    request: ProcessInstructionsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processBlocks(
    request: ProcessBlocksRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
  processBindings(
    request: ProcessBindingsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<ProcessBindingResponse>>;
}

export interface ProcessorClient<CallOptionsExt = {}> {
  start(
    request: DeepPartial<StartRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<Empty>;
  stop(
    request: DeepPartial<Empty>,
    options?: CallOptions & CallOptionsExt
  ): Promise<Empty>;
  getConfig(
    request: DeepPartial<ProcessConfigRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessConfigResponse>;
  processLogs(
    request: DeepPartial<ProcessBindingsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
  processTraces(
    request: DeepPartial<ProcessBindingsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
  processTransactions(
    request: DeepPartial<ProcessTransactionsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
  processInstructions(
    request: DeepPartial<ProcessInstructionsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
  processBlocks(
    request: DeepPartial<ProcessBlocksRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
  processBindings(
    request: DeepPartial<ProcessBindingsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<ProcessBindingResponse>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

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
