/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export interface AptosGetTxnsByFunctionRequest {
  network: string;
  fromVersion: bigint;
  toVersion: bigint;
  function: string;
  matchAll: boolean;
  typedArguments: string[];
}

export interface AptosGetTxnsByVersionRequest {
  network: string;
  fromVersion: bigint;
  toVersion: bigint;
  headerOnly?: boolean | undefined;
}

export interface AptosGetTxnsByEventRequest {
  network: string;
  fromVersion: bigint;
  toVersion: bigint;
  address: string;
  type: string;
  includeAllEvents: boolean;
}

export interface AptosSQLQueryRequest {
  network: string;
  fromVersion: bigint;
  toVersion: bigint;
  sql: string;
  arbitraryRange: boolean;
}

export interface QueryPhaseSummary {
  name: string;
  timeTookMs: bigint;
}

export interface QueryExecutionSummary {
  timeTookMs: bigint;
  resultNumRows?: bigint | undefined;
  resultNumBytes?: bigint | undefined;
  numPartitionsWithMaterializedView?: bigint | undefined;
  numPartitionsWithoutMaterializedView?: bigint | undefined;
  numPartitions?: bigint | undefined;
  phases: QueryPhaseSummary[];
  qcacheSignature?: string | undefined;
  qcacheHit?: boolean | undefined;
}

export interface AptosGetTxnsResponse {
  documents: Uint8Array[];
  executionSummary?: QueryExecutionSummary | undefined;
}

export interface AptosRefreshRequest {
}

export interface VoidResponse {
}

export interface EvmSQLQueryRequest {
  network: string;
  sql: string;
  nocache?: boolean | undefined;
}

export interface EvmGetHeaderRequest {
  network: string;
  fromBlock?: bigint | undefined;
  toBlock?: bigint | undefined;
  blockNumbers: bigint[];
}

export interface EvmQueryResponse {
  rows: Uint8Array[];
  executionSummary?: QueryExecutionSummary | undefined;
}

export interface SuiGetCheckpointTimeRequest {
  network: string;
  checkpointSequenceNumber: bigint;
}

export interface SuiGetCheckpointTimeResponse {
  checkpointTimestampMs?: bigint | undefined;
  transactionMinTimestampMs?: bigint | undefined;
  transactionMaxTimestampMs?: bigint | undefined;
}

export interface RemoteResultRequest {
  token: string;
  position: number;
  keepAlive: boolean;
}

export interface RemoteResultResponse {
  rows: Uint8Array[];
}

function createBaseAptosGetTxnsByFunctionRequest(): AptosGetTxnsByFunctionRequest {
  return {
    network: "",
    fromVersion: BigInt("0"),
    toVersion: BigInt("0"),
    function: "",
    matchAll: false,
    typedArguments: [],
  };
}

export const AptosGetTxnsByFunctionRequest = {
  encode(message: AptosGetTxnsByFunctionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromVersion !== BigInt("0")) {
      writer.uint32(16).uint64(message.fromVersion.toString());
    }
    if (message.toVersion !== BigInt("0")) {
      writer.uint32(24).uint64(message.toVersion.toString());
    }
    if (message.function !== "") {
      writer.uint32(34).string(message.function);
    }
    if (message.matchAll === true) {
      writer.uint32(40).bool(message.matchAll);
    }
    for (const v of message.typedArguments) {
      writer.uint32(50).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosGetTxnsByFunctionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosGetTxnsByFunctionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.fromVersion = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.toVersion = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.function = reader.string();
          break;
        case 5:
          message.matchAll = reader.bool();
          break;
        case 6:
          message.typedArguments.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosGetTxnsByFunctionRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      fromVersion: isSet(object.fromVersion) ? BigInt(object.fromVersion) : BigInt("0"),
      toVersion: isSet(object.toVersion) ? BigInt(object.toVersion) : BigInt("0"),
      function: isSet(object.function) ? String(object.function) : "",
      matchAll: isSet(object.matchAll) ? Boolean(object.matchAll) : false,
      typedArguments: Array.isArray(object?.typedArguments) ? object.typedArguments.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: AptosGetTxnsByFunctionRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined && (obj.fromVersion = message.fromVersion.toString());
    message.toVersion !== undefined && (obj.toVersion = message.toVersion.toString());
    message.function !== undefined && (obj.function = message.function);
    message.matchAll !== undefined && (obj.matchAll = message.matchAll);
    if (message.typedArguments) {
      obj.typedArguments = message.typedArguments.map((e) => e);
    } else {
      obj.typedArguments = [];
    }
    return obj;
  },

  create(base?: DeepPartial<AptosGetTxnsByFunctionRequest>): AptosGetTxnsByFunctionRequest {
    return AptosGetTxnsByFunctionRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AptosGetTxnsByFunctionRequest>): AptosGetTxnsByFunctionRequest {
    const message = createBaseAptosGetTxnsByFunctionRequest();
    message.network = object.network ?? "";
    message.fromVersion = object.fromVersion ?? BigInt("0");
    message.toVersion = object.toVersion ?? BigInt("0");
    message.function = object.function ?? "";
    message.matchAll = object.matchAll ?? false;
    message.typedArguments = object.typedArguments?.map((e) => e) || [];
    return message;
  },
};

function createBaseAptosGetTxnsByVersionRequest(): AptosGetTxnsByVersionRequest {
  return { network: "", fromVersion: BigInt("0"), toVersion: BigInt("0"), headerOnly: undefined };
}

export const AptosGetTxnsByVersionRequest = {
  encode(message: AptosGetTxnsByVersionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromVersion !== BigInt("0")) {
      writer.uint32(16).uint64(message.fromVersion.toString());
    }
    if (message.toVersion !== BigInt("0")) {
      writer.uint32(24).uint64(message.toVersion.toString());
    }
    if (message.headerOnly !== undefined) {
      writer.uint32(32).bool(message.headerOnly);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosGetTxnsByVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosGetTxnsByVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.fromVersion = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.toVersion = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.headerOnly = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosGetTxnsByVersionRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      fromVersion: isSet(object.fromVersion) ? BigInt(object.fromVersion) : BigInt("0"),
      toVersion: isSet(object.toVersion) ? BigInt(object.toVersion) : BigInt("0"),
      headerOnly: isSet(object.headerOnly) ? Boolean(object.headerOnly) : undefined,
    };
  },

  toJSON(message: AptosGetTxnsByVersionRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined && (obj.fromVersion = message.fromVersion.toString());
    message.toVersion !== undefined && (obj.toVersion = message.toVersion.toString());
    message.headerOnly !== undefined && (obj.headerOnly = message.headerOnly);
    return obj;
  },

  create(base?: DeepPartial<AptosGetTxnsByVersionRequest>): AptosGetTxnsByVersionRequest {
    return AptosGetTxnsByVersionRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AptosGetTxnsByVersionRequest>): AptosGetTxnsByVersionRequest {
    const message = createBaseAptosGetTxnsByVersionRequest();
    message.network = object.network ?? "";
    message.fromVersion = object.fromVersion ?? BigInt("0");
    message.toVersion = object.toVersion ?? BigInt("0");
    message.headerOnly = object.headerOnly ?? undefined;
    return message;
  },
};

function createBaseAptosGetTxnsByEventRequest(): AptosGetTxnsByEventRequest {
  return {
    network: "",
    fromVersion: BigInt("0"),
    toVersion: BigInt("0"),
    address: "",
    type: "",
    includeAllEvents: false,
  };
}

export const AptosGetTxnsByEventRequest = {
  encode(message: AptosGetTxnsByEventRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromVersion !== BigInt("0")) {
      writer.uint32(16).uint64(message.fromVersion.toString());
    }
    if (message.toVersion !== BigInt("0")) {
      writer.uint32(24).uint64(message.toVersion.toString());
    }
    if (message.address !== "") {
      writer.uint32(34).string(message.address);
    }
    if (message.type !== "") {
      writer.uint32(42).string(message.type);
    }
    if (message.includeAllEvents === true) {
      writer.uint32(48).bool(message.includeAllEvents);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosGetTxnsByEventRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosGetTxnsByEventRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.fromVersion = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.toVersion = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.address = reader.string();
          break;
        case 5:
          message.type = reader.string();
          break;
        case 6:
          message.includeAllEvents = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosGetTxnsByEventRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      fromVersion: isSet(object.fromVersion) ? BigInt(object.fromVersion) : BigInt("0"),
      toVersion: isSet(object.toVersion) ? BigInt(object.toVersion) : BigInt("0"),
      address: isSet(object.address) ? String(object.address) : "",
      type: isSet(object.type) ? String(object.type) : "",
      includeAllEvents: isSet(object.includeAllEvents) ? Boolean(object.includeAllEvents) : false,
    };
  },

  toJSON(message: AptosGetTxnsByEventRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined && (obj.fromVersion = message.fromVersion.toString());
    message.toVersion !== undefined && (obj.toVersion = message.toVersion.toString());
    message.address !== undefined && (obj.address = message.address);
    message.type !== undefined && (obj.type = message.type);
    message.includeAllEvents !== undefined && (obj.includeAllEvents = message.includeAllEvents);
    return obj;
  },

  create(base?: DeepPartial<AptosGetTxnsByEventRequest>): AptosGetTxnsByEventRequest {
    return AptosGetTxnsByEventRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AptosGetTxnsByEventRequest>): AptosGetTxnsByEventRequest {
    const message = createBaseAptosGetTxnsByEventRequest();
    message.network = object.network ?? "";
    message.fromVersion = object.fromVersion ?? BigInt("0");
    message.toVersion = object.toVersion ?? BigInt("0");
    message.address = object.address ?? "";
    message.type = object.type ?? "";
    message.includeAllEvents = object.includeAllEvents ?? false;
    return message;
  },
};

function createBaseAptosSQLQueryRequest(): AptosSQLQueryRequest {
  return { network: "", fromVersion: BigInt("0"), toVersion: BigInt("0"), sql: "", arbitraryRange: false };
}

export const AptosSQLQueryRequest = {
  encode(message: AptosSQLQueryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromVersion !== BigInt("0")) {
      writer.uint32(16).uint64(message.fromVersion.toString());
    }
    if (message.toVersion !== BigInt("0")) {
      writer.uint32(24).uint64(message.toVersion.toString());
    }
    if (message.sql !== "") {
      writer.uint32(34).string(message.sql);
    }
    if (message.arbitraryRange === true) {
      writer.uint32(40).bool(message.arbitraryRange);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosSQLQueryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosSQLQueryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.fromVersion = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.toVersion = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.sql = reader.string();
          break;
        case 5:
          message.arbitraryRange = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosSQLQueryRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      fromVersion: isSet(object.fromVersion) ? BigInt(object.fromVersion) : BigInt("0"),
      toVersion: isSet(object.toVersion) ? BigInt(object.toVersion) : BigInt("0"),
      sql: isSet(object.sql) ? String(object.sql) : "",
      arbitraryRange: isSet(object.arbitraryRange) ? Boolean(object.arbitraryRange) : false,
    };
  },

  toJSON(message: AptosSQLQueryRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined && (obj.fromVersion = message.fromVersion.toString());
    message.toVersion !== undefined && (obj.toVersion = message.toVersion.toString());
    message.sql !== undefined && (obj.sql = message.sql);
    message.arbitraryRange !== undefined && (obj.arbitraryRange = message.arbitraryRange);
    return obj;
  },

  create(base?: DeepPartial<AptosSQLQueryRequest>): AptosSQLQueryRequest {
    return AptosSQLQueryRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AptosSQLQueryRequest>): AptosSQLQueryRequest {
    const message = createBaseAptosSQLQueryRequest();
    message.network = object.network ?? "";
    message.fromVersion = object.fromVersion ?? BigInt("0");
    message.toVersion = object.toVersion ?? BigInt("0");
    message.sql = object.sql ?? "";
    message.arbitraryRange = object.arbitraryRange ?? false;
    return message;
  },
};

function createBaseQueryPhaseSummary(): QueryPhaseSummary {
  return { name: "", timeTookMs: BigInt("0") };
}

export const QueryPhaseSummary = {
  encode(message: QueryPhaseSummary, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.timeTookMs !== BigInt("0")) {
      writer.uint32(16).uint64(message.timeTookMs.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPhaseSummary {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPhaseSummary();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.timeTookMs = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryPhaseSummary {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      timeTookMs: isSet(object.timeTookMs) ? BigInt(object.timeTookMs) : BigInt("0"),
    };
  },

  toJSON(message: QueryPhaseSummary): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.timeTookMs !== undefined && (obj.timeTookMs = message.timeTookMs.toString());
    return obj;
  },

  create(base?: DeepPartial<QueryPhaseSummary>): QueryPhaseSummary {
    return QueryPhaseSummary.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryPhaseSummary>): QueryPhaseSummary {
    const message = createBaseQueryPhaseSummary();
    message.name = object.name ?? "";
    message.timeTookMs = object.timeTookMs ?? BigInt("0");
    return message;
  },
};

function createBaseQueryExecutionSummary(): QueryExecutionSummary {
  return {
    timeTookMs: BigInt("0"),
    resultNumRows: undefined,
    resultNumBytes: undefined,
    numPartitionsWithMaterializedView: undefined,
    numPartitionsWithoutMaterializedView: undefined,
    numPartitions: undefined,
    phases: [],
    qcacheSignature: undefined,
    qcacheHit: undefined,
  };
}

export const QueryExecutionSummary = {
  encode(message: QueryExecutionSummary, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timeTookMs !== BigInt("0")) {
      writer.uint32(8).uint64(message.timeTookMs.toString());
    }
    if (message.resultNumRows !== undefined) {
      writer.uint32(16).uint64(message.resultNumRows.toString());
    }
    if (message.resultNumBytes !== undefined) {
      writer.uint32(24).uint64(message.resultNumBytes.toString());
    }
    if (message.numPartitionsWithMaterializedView !== undefined) {
      writer.uint32(32).uint64(message.numPartitionsWithMaterializedView.toString());
    }
    if (message.numPartitionsWithoutMaterializedView !== undefined) {
      writer.uint32(40).uint64(message.numPartitionsWithoutMaterializedView.toString());
    }
    if (message.numPartitions !== undefined) {
      writer.uint32(48).uint64(message.numPartitions.toString());
    }
    for (const v of message.phases) {
      QueryPhaseSummary.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.qcacheSignature !== undefined) {
      writer.uint32(66).string(message.qcacheSignature);
    }
    if (message.qcacheHit !== undefined) {
      writer.uint32(72).bool(message.qcacheHit);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryExecutionSummary {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryExecutionSummary();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timeTookMs = longToBigint(reader.uint64() as Long);
          break;
        case 2:
          message.resultNumRows = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.resultNumBytes = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          message.numPartitionsWithMaterializedView = longToBigint(reader.uint64() as Long);
          break;
        case 5:
          message.numPartitionsWithoutMaterializedView = longToBigint(reader.uint64() as Long);
          break;
        case 6:
          message.numPartitions = longToBigint(reader.uint64() as Long);
          break;
        case 7:
          message.phases.push(QueryPhaseSummary.decode(reader, reader.uint32()));
          break;
        case 8:
          message.qcacheSignature = reader.string();
          break;
        case 9:
          message.qcacheHit = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryExecutionSummary {
    return {
      timeTookMs: isSet(object.timeTookMs) ? BigInt(object.timeTookMs) : BigInt("0"),
      resultNumRows: isSet(object.resultNumRows) ? BigInt(object.resultNumRows) : undefined,
      resultNumBytes: isSet(object.resultNumBytes) ? BigInt(object.resultNumBytes) : undefined,
      numPartitionsWithMaterializedView: isSet(object.numPartitionsWithMaterializedView)
        ? BigInt(object.numPartitionsWithMaterializedView)
        : undefined,
      numPartitionsWithoutMaterializedView: isSet(object.numPartitionsWithoutMaterializedView)
        ? BigInt(object.numPartitionsWithoutMaterializedView)
        : undefined,
      numPartitions: isSet(object.numPartitions) ? BigInt(object.numPartitions) : undefined,
      phases: Array.isArray(object?.phases) ? object.phases.map((e: any) => QueryPhaseSummary.fromJSON(e)) : [],
      qcacheSignature: isSet(object.qcacheSignature) ? String(object.qcacheSignature) : undefined,
      qcacheHit: isSet(object.qcacheHit) ? Boolean(object.qcacheHit) : undefined,
    };
  },

  toJSON(message: QueryExecutionSummary): unknown {
    const obj: any = {};
    message.timeTookMs !== undefined && (obj.timeTookMs = message.timeTookMs.toString());
    message.resultNumRows !== undefined && (obj.resultNumRows = message.resultNumRows.toString());
    message.resultNumBytes !== undefined && (obj.resultNumBytes = message.resultNumBytes.toString());
    message.numPartitionsWithMaterializedView !== undefined &&
      (obj.numPartitionsWithMaterializedView = message.numPartitionsWithMaterializedView.toString());
    message.numPartitionsWithoutMaterializedView !== undefined &&
      (obj.numPartitionsWithoutMaterializedView = message.numPartitionsWithoutMaterializedView.toString());
    message.numPartitions !== undefined && (obj.numPartitions = message.numPartitions.toString());
    if (message.phases) {
      obj.phases = message.phases.map((e) => e ? QueryPhaseSummary.toJSON(e) : undefined);
    } else {
      obj.phases = [];
    }
    message.qcacheSignature !== undefined && (obj.qcacheSignature = message.qcacheSignature);
    message.qcacheHit !== undefined && (obj.qcacheHit = message.qcacheHit);
    return obj;
  },

  create(base?: DeepPartial<QueryExecutionSummary>): QueryExecutionSummary {
    return QueryExecutionSummary.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<QueryExecutionSummary>): QueryExecutionSummary {
    const message = createBaseQueryExecutionSummary();
    message.timeTookMs = object.timeTookMs ?? BigInt("0");
    message.resultNumRows = object.resultNumRows ?? undefined;
    message.resultNumBytes = object.resultNumBytes ?? undefined;
    message.numPartitionsWithMaterializedView = object.numPartitionsWithMaterializedView ?? undefined;
    message.numPartitionsWithoutMaterializedView = object.numPartitionsWithoutMaterializedView ?? undefined;
    message.numPartitions = object.numPartitions ?? undefined;
    message.phases = object.phases?.map((e) => QueryPhaseSummary.fromPartial(e)) || [];
    message.qcacheSignature = object.qcacheSignature ?? undefined;
    message.qcacheHit = object.qcacheHit ?? undefined;
    return message;
  },
};

function createBaseAptosGetTxnsResponse(): AptosGetTxnsResponse {
  return { documents: [], executionSummary: undefined };
}

export const AptosGetTxnsResponse = {
  encode(message: AptosGetTxnsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.documents) {
      writer.uint32(10).bytes(v!);
    }
    if (message.executionSummary !== undefined) {
      QueryExecutionSummary.encode(message.executionSummary, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosGetTxnsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosGetTxnsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.documents.push(reader.bytes());
          break;
        case 2:
          message.executionSummary = QueryExecutionSummary.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AptosGetTxnsResponse {
    return {
      documents: Array.isArray(object?.documents) ? object.documents.map((e: any) => bytesFromBase64(e)) : [],
      executionSummary: isSet(object.executionSummary)
        ? QueryExecutionSummary.fromJSON(object.executionSummary)
        : undefined,
    };
  },

  toJSON(message: AptosGetTxnsResponse): unknown {
    const obj: any = {};
    if (message.documents) {
      obj.documents = message.documents.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.documents = [];
    }
    message.executionSummary !== undefined && (obj.executionSummary = message.executionSummary
      ? QueryExecutionSummary.toJSON(message.executionSummary)
      : undefined);
    return obj;
  },

  create(base?: DeepPartial<AptosGetTxnsResponse>): AptosGetTxnsResponse {
    return AptosGetTxnsResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AptosGetTxnsResponse>): AptosGetTxnsResponse {
    const message = createBaseAptosGetTxnsResponse();
    message.documents = object.documents?.map((e) => e) || [];
    message.executionSummary = (object.executionSummary !== undefined && object.executionSummary !== null)
      ? QueryExecutionSummary.fromPartial(object.executionSummary)
      : undefined;
    return message;
  },
};

function createBaseAptosRefreshRequest(): AptosRefreshRequest {
  return {};
}

export const AptosRefreshRequest = {
  encode(_: AptosRefreshRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AptosRefreshRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosRefreshRequest();
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

  fromJSON(_: any): AptosRefreshRequest {
    return {};
  },

  toJSON(_: AptosRefreshRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<AptosRefreshRequest>): AptosRefreshRequest {
    return AptosRefreshRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<AptosRefreshRequest>): AptosRefreshRequest {
    const message = createBaseAptosRefreshRequest();
    return message;
  },
};

function createBaseVoidResponse(): VoidResponse {
  return {};
}

export const VoidResponse = {
  encode(_: VoidResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VoidResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVoidResponse();
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

  fromJSON(_: any): VoidResponse {
    return {};
  },

  toJSON(_: VoidResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<VoidResponse>): VoidResponse {
    return VoidResponse.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<VoidResponse>): VoidResponse {
    const message = createBaseVoidResponse();
    return message;
  },
};

function createBaseEvmSQLQueryRequest(): EvmSQLQueryRequest {
  return { network: "", sql: "", nocache: undefined };
}

export const EvmSQLQueryRequest = {
  encode(message: EvmSQLQueryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.sql !== "") {
      writer.uint32(18).string(message.sql);
    }
    if (message.nocache !== undefined) {
      writer.uint32(24).bool(message.nocache);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmSQLQueryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmSQLQueryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.sql = reader.string();
          break;
        case 3:
          message.nocache = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvmSQLQueryRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      sql: isSet(object.sql) ? String(object.sql) : "",
      nocache: isSet(object.nocache) ? Boolean(object.nocache) : undefined,
    };
  },

  toJSON(message: EvmSQLQueryRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.sql !== undefined && (obj.sql = message.sql);
    message.nocache !== undefined && (obj.nocache = message.nocache);
    return obj;
  },

  create(base?: DeepPartial<EvmSQLQueryRequest>): EvmSQLQueryRequest {
    return EvmSQLQueryRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<EvmSQLQueryRequest>): EvmSQLQueryRequest {
    const message = createBaseEvmSQLQueryRequest();
    message.network = object.network ?? "";
    message.sql = object.sql ?? "";
    message.nocache = object.nocache ?? undefined;
    return message;
  },
};

function createBaseEvmGetHeaderRequest(): EvmGetHeaderRequest {
  return { network: "", fromBlock: undefined, toBlock: undefined, blockNumbers: [] };
}

export const EvmGetHeaderRequest = {
  encode(message: EvmGetHeaderRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromBlock !== undefined) {
      writer.uint32(16).uint64(message.fromBlock.toString());
    }
    if (message.toBlock !== undefined) {
      writer.uint32(24).uint64(message.toBlock.toString());
    }
    writer.uint32(34).fork();
    for (const v of message.blockNumbers) {
      writer.uint64(v.toString());
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmGetHeaderRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmGetHeaderRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.fromBlock = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.toBlock = longToBigint(reader.uint64() as Long);
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.blockNumbers.push(longToBigint(reader.uint64() as Long));
            }
          } else {
            message.blockNumbers.push(longToBigint(reader.uint64() as Long));
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvmGetHeaderRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      fromBlock: isSet(object.fromBlock) ? BigInt(object.fromBlock) : undefined,
      toBlock: isSet(object.toBlock) ? BigInt(object.toBlock) : undefined,
      blockNumbers: Array.isArray(object?.blockNumbers) ? object.blockNumbers.map((e: any) => BigInt(e)) : [],
    };
  },

  toJSON(message: EvmGetHeaderRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromBlock !== undefined && (obj.fromBlock = message.fromBlock.toString());
    message.toBlock !== undefined && (obj.toBlock = message.toBlock.toString());
    if (message.blockNumbers) {
      obj.blockNumbers = message.blockNumbers.map((e) => e.toString());
    } else {
      obj.blockNumbers = [];
    }
    return obj;
  },

  create(base?: DeepPartial<EvmGetHeaderRequest>): EvmGetHeaderRequest {
    return EvmGetHeaderRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<EvmGetHeaderRequest>): EvmGetHeaderRequest {
    const message = createBaseEvmGetHeaderRequest();
    message.network = object.network ?? "";
    message.fromBlock = object.fromBlock ?? undefined;
    message.toBlock = object.toBlock ?? undefined;
    message.blockNumbers = object.blockNumbers?.map((e) => e) || [];
    return message;
  },
};

function createBaseEvmQueryResponse(): EvmQueryResponse {
  return { rows: [], executionSummary: undefined };
}

export const EvmQueryResponse = {
  encode(message: EvmQueryResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.rows) {
      writer.uint32(10).bytes(v!);
    }
    if (message.executionSummary !== undefined) {
      QueryExecutionSummary.encode(message.executionSummary, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvmQueryResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvmQueryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rows.push(reader.bytes());
          break;
        case 2:
          message.executionSummary = QueryExecutionSummary.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvmQueryResponse {
    return {
      rows: Array.isArray(object?.rows) ? object.rows.map((e: any) => bytesFromBase64(e)) : [],
      executionSummary: isSet(object.executionSummary)
        ? QueryExecutionSummary.fromJSON(object.executionSummary)
        : undefined,
    };
  },

  toJSON(message: EvmQueryResponse): unknown {
    const obj: any = {};
    if (message.rows) {
      obj.rows = message.rows.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.rows = [];
    }
    message.executionSummary !== undefined && (obj.executionSummary = message.executionSummary
      ? QueryExecutionSummary.toJSON(message.executionSummary)
      : undefined);
    return obj;
  },

  create(base?: DeepPartial<EvmQueryResponse>): EvmQueryResponse {
    return EvmQueryResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<EvmQueryResponse>): EvmQueryResponse {
    const message = createBaseEvmQueryResponse();
    message.rows = object.rows?.map((e) => e) || [];
    message.executionSummary = (object.executionSummary !== undefined && object.executionSummary !== null)
      ? QueryExecutionSummary.fromPartial(object.executionSummary)
      : undefined;
    return message;
  },
};

function createBaseSuiGetCheckpointTimeRequest(): SuiGetCheckpointTimeRequest {
  return { network: "", checkpointSequenceNumber: BigInt("0") };
}

export const SuiGetCheckpointTimeRequest = {
  encode(message: SuiGetCheckpointTimeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.checkpointSequenceNumber !== BigInt("0")) {
      writer.uint32(16).uint64(message.checkpointSequenceNumber.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SuiGetCheckpointTimeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuiGetCheckpointTimeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.network = reader.string();
          break;
        case 2:
          message.checkpointSequenceNumber = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SuiGetCheckpointTimeRequest {
    return {
      network: isSet(object.network) ? String(object.network) : "",
      checkpointSequenceNumber: isSet(object.checkpointSequenceNumber)
        ? BigInt(object.checkpointSequenceNumber)
        : BigInt("0"),
    };
  },

  toJSON(message: SuiGetCheckpointTimeRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.checkpointSequenceNumber !== undefined &&
      (obj.checkpointSequenceNumber = message.checkpointSequenceNumber.toString());
    return obj;
  },

  create(base?: DeepPartial<SuiGetCheckpointTimeRequest>): SuiGetCheckpointTimeRequest {
    return SuiGetCheckpointTimeRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<SuiGetCheckpointTimeRequest>): SuiGetCheckpointTimeRequest {
    const message = createBaseSuiGetCheckpointTimeRequest();
    message.network = object.network ?? "";
    message.checkpointSequenceNumber = object.checkpointSequenceNumber ?? BigInt("0");
    return message;
  },
};

function createBaseSuiGetCheckpointTimeResponse(): SuiGetCheckpointTimeResponse {
  return {
    checkpointTimestampMs: undefined,
    transactionMinTimestampMs: undefined,
    transactionMaxTimestampMs: undefined,
  };
}

export const SuiGetCheckpointTimeResponse = {
  encode(message: SuiGetCheckpointTimeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.checkpointTimestampMs !== undefined) {
      writer.uint32(8).uint64(message.checkpointTimestampMs.toString());
    }
    if (message.transactionMinTimestampMs !== undefined) {
      writer.uint32(16).uint64(message.transactionMinTimestampMs.toString());
    }
    if (message.transactionMaxTimestampMs !== undefined) {
      writer.uint32(24).uint64(message.transactionMaxTimestampMs.toString());
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SuiGetCheckpointTimeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuiGetCheckpointTimeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpointTimestampMs = longToBigint(reader.uint64() as Long);
          break;
        case 2:
          message.transactionMinTimestampMs = longToBigint(reader.uint64() as Long);
          break;
        case 3:
          message.transactionMaxTimestampMs = longToBigint(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SuiGetCheckpointTimeResponse {
    return {
      checkpointTimestampMs: isSet(object.checkpointTimestampMs) ? BigInt(object.checkpointTimestampMs) : undefined,
      transactionMinTimestampMs: isSet(object.transactionMinTimestampMs)
        ? BigInt(object.transactionMinTimestampMs)
        : undefined,
      transactionMaxTimestampMs: isSet(object.transactionMaxTimestampMs)
        ? BigInt(object.transactionMaxTimestampMs)
        : undefined,
    };
  },

  toJSON(message: SuiGetCheckpointTimeResponse): unknown {
    const obj: any = {};
    message.checkpointTimestampMs !== undefined &&
      (obj.checkpointTimestampMs = message.checkpointTimestampMs.toString());
    message.transactionMinTimestampMs !== undefined &&
      (obj.transactionMinTimestampMs = message.transactionMinTimestampMs.toString());
    message.transactionMaxTimestampMs !== undefined &&
      (obj.transactionMaxTimestampMs = message.transactionMaxTimestampMs.toString());
    return obj;
  },

  create(base?: DeepPartial<SuiGetCheckpointTimeResponse>): SuiGetCheckpointTimeResponse {
    return SuiGetCheckpointTimeResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<SuiGetCheckpointTimeResponse>): SuiGetCheckpointTimeResponse {
    const message = createBaseSuiGetCheckpointTimeResponse();
    message.checkpointTimestampMs = object.checkpointTimestampMs ?? undefined;
    message.transactionMinTimestampMs = object.transactionMinTimestampMs ?? undefined;
    message.transactionMaxTimestampMs = object.transactionMaxTimestampMs ?? undefined;
    return message;
  },
};

function createBaseRemoteResultRequest(): RemoteResultRequest {
  return { token: "", position: 0, keepAlive: false };
}

export const RemoteResultRequest = {
  encode(message: RemoteResultRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.position !== 0) {
      writer.uint32(16).int32(message.position);
    }
    if (message.keepAlive === true) {
      writer.uint32(24).bool(message.keepAlive);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RemoteResultRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoteResultRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.position = reader.int32();
          break;
        case 3:
          message.keepAlive = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RemoteResultRequest {
    return {
      token: isSet(object.token) ? String(object.token) : "",
      position: isSet(object.position) ? Number(object.position) : 0,
      keepAlive: isSet(object.keepAlive) ? Boolean(object.keepAlive) : false,
    };
  },

  toJSON(message: RemoteResultRequest): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    message.position !== undefined && (obj.position = Math.round(message.position));
    message.keepAlive !== undefined && (obj.keepAlive = message.keepAlive);
    return obj;
  },

  create(base?: DeepPartial<RemoteResultRequest>): RemoteResultRequest {
    return RemoteResultRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<RemoteResultRequest>): RemoteResultRequest {
    const message = createBaseRemoteResultRequest();
    message.token = object.token ?? "";
    message.position = object.position ?? 0;
    message.keepAlive = object.keepAlive ?? false;
    return message;
  },
};

function createBaseRemoteResultResponse(): RemoteResultResponse {
  return { rows: [] };
}

export const RemoteResultResponse = {
  encode(message: RemoteResultResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.rows) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RemoteResultResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoteResultResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rows.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RemoteResultResponse {
    return { rows: Array.isArray(object?.rows) ? object.rows.map((e: any) => bytesFromBase64(e)) : [] };
  },

  toJSON(message: RemoteResultResponse): unknown {
    const obj: any = {};
    if (message.rows) {
      obj.rows = message.rows.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.rows = [];
    }
    return obj;
  },

  create(base?: DeepPartial<RemoteResultResponse>): RemoteResultResponse {
    return RemoteResultResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<RemoteResultResponse>): RemoteResultResponse {
    const message = createBaseRemoteResultResponse();
    message.rows = object.rows?.map((e) => e) || [];
    return message;
  },
};

export type AptosQueryDefinition = typeof AptosQueryDefinition;
export const AptosQueryDefinition = {
  name: "AptosQuery",
  fullName: "chainquery.AptosQuery",
  methods: {
    aptosGetTxnsByFunction: {
      name: "AptosGetTxnsByFunction",
      requestType: AptosGetTxnsByFunctionRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: false,
      options: {},
    },
    aptosGetTxnsByFunctionStream: {
      name: "AptosGetTxnsByFunctionStream",
      requestType: AptosGetTxnsByFunctionRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: true,
      options: {},
    },
    aptosGetTxnsByVersion: {
      name: "AptosGetTxnsByVersion",
      requestType: AptosGetTxnsByVersionRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: false,
      options: {},
    },
    aptosGetTxnsByEvent: {
      name: "AptosGetTxnsByEvent",
      requestType: AptosGetTxnsByEventRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: false,
      options: {},
    },
    aptosGetTxnsByEventStream: {
      name: "AptosGetTxnsByEventStream",
      requestType: AptosGetTxnsByEventRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: true,
      options: {},
    },
    aptosRefresh: {
      name: "AptosRefresh",
      requestType: AptosRefreshRequest,
      requestStream: false,
      responseType: VoidResponse,
      responseStream: false,
      options: {},
    },
    aptosSQLQuery: {
      name: "AptosSQLQuery",
      requestType: AptosSQLQueryRequest,
      requestStream: false,
      responseType: AptosGetTxnsResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface AptosQueryServiceImplementation<CallContextExt = {}> {
  aptosGetTxnsByFunction(
    request: AptosGetTxnsByFunctionRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByFunctionStream(
    request: AptosGetTxnsByFunctionRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByVersion(
    request: AptosGetTxnsByVersionRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByEvent(
    request: AptosGetTxnsByEventRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByEventStream(
    request: AptosGetTxnsByEventRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<AptosGetTxnsResponse>>;
  aptosRefresh(request: AptosRefreshRequest, context: CallContext & CallContextExt): Promise<DeepPartial<VoidResponse>>;
  aptosSQLQuery(
    request: AptosSQLQueryRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
}

export interface AptosQueryClient<CallOptionsExt = {}> {
  aptosGetTxnsByFunction(
    request: DeepPartial<AptosGetTxnsByFunctionRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByFunctionStream(
    request: DeepPartial<AptosGetTxnsByFunctionRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<AptosGetTxnsResponse>;
  aptosGetTxnsByVersion(
    request: DeepPartial<AptosGetTxnsByVersionRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByEvent(
    request: DeepPartial<AptosGetTxnsByEventRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByEventStream(
    request: DeepPartial<AptosGetTxnsByEventRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<AptosGetTxnsResponse>;
  aptosRefresh(
    request: DeepPartial<AptosRefreshRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<VoidResponse>;
  aptosSQLQuery(
    request: DeepPartial<AptosSQLQueryRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<AptosGetTxnsResponse>;
}

export type EvmQueryDefinition = typeof EvmQueryDefinition;
export const EvmQueryDefinition = {
  name: "EvmQuery",
  fullName: "chainquery.EvmQuery",
  methods: {
    evmSQLQuery: {
      name: "EvmSQLQuery",
      requestType: EvmSQLQueryRequest,
      requestStream: false,
      responseType: EvmQueryResponse,
      responseStream: true,
      options: {},
    },
    evmGetHeader: {
      name: "EvmGetHeader",
      requestType: EvmGetHeaderRequest,
      requestStream: false,
      responseType: EvmQueryResponse,
      responseStream: false,
      options: {},
    },
    evmHintHeaderCache: {
      name: "EvmHintHeaderCache",
      requestType: EvmGetHeaderRequest,
      requestStream: false,
      responseType: VoidResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface EvmQueryServiceImplementation<CallContextExt = {}> {
  evmSQLQuery(
    request: EvmSQLQueryRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<EvmQueryResponse>>;
  evmGetHeader(
    request: EvmGetHeaderRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<EvmQueryResponse>>;
  evmHintHeaderCache(
    request: EvmGetHeaderRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<VoidResponse>>;
}

export interface EvmQueryClient<CallOptionsExt = {}> {
  evmSQLQuery(
    request: DeepPartial<EvmSQLQueryRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<EvmQueryResponse>;
  evmGetHeader(
    request: DeepPartial<EvmGetHeaderRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<EvmQueryResponse>;
  evmHintHeaderCache(
    request: DeepPartial<EvmGetHeaderRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<VoidResponse>;
}

export type SuiQueryDefinition = typeof SuiQueryDefinition;
export const SuiQueryDefinition = {
  name: "SuiQuery",
  fullName: "chainquery.SuiQuery",
  methods: {
    suiSQLQuery: {
      name: "SuiSQLQuery",
      requestType: EvmSQLQueryRequest,
      requestStream: false,
      responseType: EvmQueryResponse,
      responseStream: true,
      options: {},
    },
    getCheckpointTime: {
      name: "GetCheckpointTime",
      requestType: SuiGetCheckpointTimeRequest,
      requestStream: false,
      responseType: SuiGetCheckpointTimeResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface SuiQueryServiceImplementation<CallContextExt = {}> {
  suiSQLQuery(
    request: EvmSQLQueryRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<EvmQueryResponse>>;
  getCheckpointTime(
    request: SuiGetCheckpointTimeRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<SuiGetCheckpointTimeResponse>>;
}

export interface SuiQueryClient<CallOptionsExt = {}> {
  suiSQLQuery(
    request: DeepPartial<EvmSQLQueryRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<EvmQueryResponse>;
  getCheckpointTime(
    request: DeepPartial<SuiGetCheckpointTimeRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<SuiGetCheckpointTimeResponse>;
}

export type RemoteResultTransferServiceDefinition = typeof RemoteResultTransferServiceDefinition;
export const RemoteResultTransferServiceDefinition = {
  name: "RemoteResultTransferService",
  fullName: "chainquery.RemoteResultTransferService",
  methods: {
    getResult: {
      name: "GetResult",
      requestType: RemoteResultRequest,
      requestStream: false,
      responseType: RemoteResultResponse,
      responseStream: false,
      options: {},
    },
    destroyResult: {
      name: "DestroyResult",
      requestType: RemoteResultRequest,
      requestStream: false,
      responseType: VoidResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface RemoteResultTransferServiceImplementation<CallContextExt = {}> {
  getResult(
    request: RemoteResultRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<RemoteResultResponse>>;
  destroyResult(
    request: RemoteResultRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<VoidResponse>>;
}

export interface RemoteResultTransferServiceClient<CallOptionsExt = {}> {
  getResult(
    request: DeepPartial<RemoteResultRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<RemoteResultResponse>;
  destroyResult(
    request: DeepPartial<RemoteResultRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<VoidResponse>;
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

function longToBigint(long: Long) {
  return BigInt(long.toString());
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
