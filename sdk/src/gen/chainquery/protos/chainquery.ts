/* eslint-disable */
import { CallContext, CallOptions } from "nice-grpc-common";
import Long from "long";
import _m0 from "protobufjs/minimal";

export interface AptosGetTxnsByFunctionRequest {
  network: string;
  fromVersion: Long;
  toVersion: Long;
  function: string;
  matchAll: boolean;
  typedArguments: string[];
}

export interface AptosGetTxnsByVersionRequest {
  network: string;
  fromVersion: Long;
  toVersion: Long;
  headerOnly?: boolean | undefined;
}

export interface AptosGetTxnsByEventRequest {
  network: string;
  fromVersion: Long;
  toVersion: Long;
  address: string;
  type: string;
}

export interface AptosSQLQueryRequest {
  network: string;
  fromVersion: Long;
  toVersion: Long;
  sql: string;
  arbitraryRange: boolean;
}

export interface QueryPhaseSummary {
  name: string;
  timeTookMs: Long;
}

export interface QueryExecutionSummary {
  timeTookMs: Long;
  resultNumRows?: Long | undefined;
  resultNumBytes?: Long | undefined;
  numPartitionsWithMaterializedView?: Long | undefined;
  numPartitionsWithoutMaterializedView?: Long | undefined;
  numPartitions?: Long | undefined;
  phases: QueryPhaseSummary[];
}

export interface AptosGetTxnsResponse {
  documents: string[];
  executionSummary?: QueryExecutionSummary | undefined;
}

export interface AptosRefreshRequest {}

export interface VoidResponse {}

export interface EvmSQLQueryRequest {
  network: string;
  sql: string;
}

export interface EvmGetHeaderRequest {
  network: string;
  fromBlock?: Long | undefined;
  toBlock?: Long | undefined;
  blockNumbers: Long[];
}

export interface EvmQueryResponse {
  rows: string[];
  executionSummary?: QueryExecutionSummary | undefined;
}

function createBaseAptosGetTxnsByFunctionRequest(): AptosGetTxnsByFunctionRequest {
  return {
    network: "",
    fromVersion: Long.UZERO,
    toVersion: Long.UZERO,
    function: "",
    matchAll: false,
    typedArguments: [],
  };
}

export const AptosGetTxnsByFunctionRequest = {
  encode(
    message: AptosGetTxnsByFunctionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (!message.fromVersion.isZero()) {
      writer.uint32(16).uint64(message.fromVersion);
    }
    if (!message.toVersion.isZero()) {
      writer.uint32(24).uint64(message.toVersion);
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

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosGetTxnsByFunctionRequest {
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
          message.fromVersion = reader.uint64() as Long;
          break;
        case 3:
          message.toVersion = reader.uint64() as Long;
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
      fromVersion: isSet(object.fromVersion)
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO,
      toVersion: isSet(object.toVersion)
        ? Long.fromValue(object.toVersion)
        : Long.UZERO,
      function: isSet(object.function) ? String(object.function) : "",
      matchAll: isSet(object.matchAll) ? Boolean(object.matchAll) : false,
      typedArguments: Array.isArray(object?.typedArguments)
        ? object.typedArguments.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: AptosGetTxnsByFunctionRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined &&
      (obj.fromVersion = (message.fromVersion || Long.UZERO).toString());
    message.toVersion !== undefined &&
      (obj.toVersion = (message.toVersion || Long.UZERO).toString());
    message.function !== undefined && (obj.function = message.function);
    message.matchAll !== undefined && (obj.matchAll = message.matchAll);
    if (message.typedArguments) {
      obj.typedArguments = message.typedArguments.map((e) => e);
    } else {
      obj.typedArguments = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<AptosGetTxnsByFunctionRequest>
  ): AptosGetTxnsByFunctionRequest {
    const message = createBaseAptosGetTxnsByFunctionRequest();
    message.network = object.network ?? "";
    message.fromVersion =
      object.fromVersion !== undefined && object.fromVersion !== null
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO;
    message.toVersion =
      object.toVersion !== undefined && object.toVersion !== null
        ? Long.fromValue(object.toVersion)
        : Long.UZERO;
    message.function = object.function ?? "";
    message.matchAll = object.matchAll ?? false;
    message.typedArguments = object.typedArguments?.map((e) => e) || [];
    return message;
  },
};

function createBaseAptosGetTxnsByVersionRequest(): AptosGetTxnsByVersionRequest {
  return {
    network: "",
    fromVersion: Long.UZERO,
    toVersion: Long.UZERO,
    headerOnly: undefined,
  };
}

export const AptosGetTxnsByVersionRequest = {
  encode(
    message: AptosGetTxnsByVersionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (!message.fromVersion.isZero()) {
      writer.uint32(16).uint64(message.fromVersion);
    }
    if (!message.toVersion.isZero()) {
      writer.uint32(24).uint64(message.toVersion);
    }
    if (message.headerOnly !== undefined) {
      writer.uint32(32).bool(message.headerOnly);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosGetTxnsByVersionRequest {
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
          message.fromVersion = reader.uint64() as Long;
          break;
        case 3:
          message.toVersion = reader.uint64() as Long;
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
      fromVersion: isSet(object.fromVersion)
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO,
      toVersion: isSet(object.toVersion)
        ? Long.fromValue(object.toVersion)
        : Long.UZERO,
      headerOnly: isSet(object.headerOnly)
        ? Boolean(object.headerOnly)
        : undefined,
    };
  },

  toJSON(message: AptosGetTxnsByVersionRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined &&
      (obj.fromVersion = (message.fromVersion || Long.UZERO).toString());
    message.toVersion !== undefined &&
      (obj.toVersion = (message.toVersion || Long.UZERO).toString());
    message.headerOnly !== undefined && (obj.headerOnly = message.headerOnly);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AptosGetTxnsByVersionRequest>
  ): AptosGetTxnsByVersionRequest {
    const message = createBaseAptosGetTxnsByVersionRequest();
    message.network = object.network ?? "";
    message.fromVersion =
      object.fromVersion !== undefined && object.fromVersion !== null
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO;
    message.toVersion =
      object.toVersion !== undefined && object.toVersion !== null
        ? Long.fromValue(object.toVersion)
        : Long.UZERO;
    message.headerOnly = object.headerOnly ?? undefined;
    return message;
  },
};

function createBaseAptosGetTxnsByEventRequest(): AptosGetTxnsByEventRequest {
  return {
    network: "",
    fromVersion: Long.UZERO,
    toVersion: Long.UZERO,
    address: "",
    type: "",
  };
}

export const AptosGetTxnsByEventRequest = {
  encode(
    message: AptosGetTxnsByEventRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (!message.fromVersion.isZero()) {
      writer.uint32(16).uint64(message.fromVersion);
    }
    if (!message.toVersion.isZero()) {
      writer.uint32(24).uint64(message.toVersion);
    }
    if (message.address !== "") {
      writer.uint32(34).string(message.address);
    }
    if (message.type !== "") {
      writer.uint32(42).string(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosGetTxnsByEventRequest {
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
          message.fromVersion = reader.uint64() as Long;
          break;
        case 3:
          message.toVersion = reader.uint64() as Long;
          break;
        case 4:
          message.address = reader.string();
          break;
        case 5:
          message.type = reader.string();
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
      fromVersion: isSet(object.fromVersion)
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO,
      toVersion: isSet(object.toVersion)
        ? Long.fromValue(object.toVersion)
        : Long.UZERO,
      address: isSet(object.address) ? String(object.address) : "",
      type: isSet(object.type) ? String(object.type) : "",
    };
  },

  toJSON(message: AptosGetTxnsByEventRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined &&
      (obj.fromVersion = (message.fromVersion || Long.UZERO).toString());
    message.toVersion !== undefined &&
      (obj.toVersion = (message.toVersion || Long.UZERO).toString());
    message.address !== undefined && (obj.address = message.address);
    message.type !== undefined && (obj.type = message.type);
    return obj;
  },

  fromPartial(
    object: DeepPartial<AptosGetTxnsByEventRequest>
  ): AptosGetTxnsByEventRequest {
    const message = createBaseAptosGetTxnsByEventRequest();
    message.network = object.network ?? "";
    message.fromVersion =
      object.fromVersion !== undefined && object.fromVersion !== null
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO;
    message.toVersion =
      object.toVersion !== undefined && object.toVersion !== null
        ? Long.fromValue(object.toVersion)
        : Long.UZERO;
    message.address = object.address ?? "";
    message.type = object.type ?? "";
    return message;
  },
};

function createBaseAptosSQLQueryRequest(): AptosSQLQueryRequest {
  return {
    network: "",
    fromVersion: Long.UZERO,
    toVersion: Long.UZERO,
    sql: "",
    arbitraryRange: false,
  };
}

export const AptosSQLQueryRequest = {
  encode(
    message: AptosSQLQueryRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (!message.fromVersion.isZero()) {
      writer.uint32(16).uint64(message.fromVersion);
    }
    if (!message.toVersion.isZero()) {
      writer.uint32(24).uint64(message.toVersion);
    }
    if (message.sql !== "") {
      writer.uint32(34).string(message.sql);
    }
    if (message.arbitraryRange === true) {
      writer.uint32(40).bool(message.arbitraryRange);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosSQLQueryRequest {
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
          message.fromVersion = reader.uint64() as Long;
          break;
        case 3:
          message.toVersion = reader.uint64() as Long;
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
      fromVersion: isSet(object.fromVersion)
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO,
      toVersion: isSet(object.toVersion)
        ? Long.fromValue(object.toVersion)
        : Long.UZERO,
      sql: isSet(object.sql) ? String(object.sql) : "",
      arbitraryRange: isSet(object.arbitraryRange)
        ? Boolean(object.arbitraryRange)
        : false,
    };
  },

  toJSON(message: AptosSQLQueryRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromVersion !== undefined &&
      (obj.fromVersion = (message.fromVersion || Long.UZERO).toString());
    message.toVersion !== undefined &&
      (obj.toVersion = (message.toVersion || Long.UZERO).toString());
    message.sql !== undefined && (obj.sql = message.sql);
    message.arbitraryRange !== undefined &&
      (obj.arbitraryRange = message.arbitraryRange);
    return obj;
  },

  fromPartial(object: DeepPartial<AptosSQLQueryRequest>): AptosSQLQueryRequest {
    const message = createBaseAptosSQLQueryRequest();
    message.network = object.network ?? "";
    message.fromVersion =
      object.fromVersion !== undefined && object.fromVersion !== null
        ? Long.fromValue(object.fromVersion)
        : Long.UZERO;
    message.toVersion =
      object.toVersion !== undefined && object.toVersion !== null
        ? Long.fromValue(object.toVersion)
        : Long.UZERO;
    message.sql = object.sql ?? "";
    message.arbitraryRange = object.arbitraryRange ?? false;
    return message;
  },
};

function createBaseQueryPhaseSummary(): QueryPhaseSummary {
  return { name: "", timeTookMs: Long.UZERO };
}

export const QueryPhaseSummary = {
  encode(
    message: QueryPhaseSummary,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (!message.timeTookMs.isZero()) {
      writer.uint32(16).uint64(message.timeTookMs);
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
          message.timeTookMs = reader.uint64() as Long;
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
      timeTookMs: isSet(object.timeTookMs)
        ? Long.fromValue(object.timeTookMs)
        : Long.UZERO,
    };
  },

  toJSON(message: QueryPhaseSummary): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.timeTookMs !== undefined &&
      (obj.timeTookMs = (message.timeTookMs || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<QueryPhaseSummary>): QueryPhaseSummary {
    const message = createBaseQueryPhaseSummary();
    message.name = object.name ?? "";
    message.timeTookMs =
      object.timeTookMs !== undefined && object.timeTookMs !== null
        ? Long.fromValue(object.timeTookMs)
        : Long.UZERO;
    return message;
  },
};

function createBaseQueryExecutionSummary(): QueryExecutionSummary {
  return {
    timeTookMs: Long.UZERO,
    resultNumRows: undefined,
    resultNumBytes: undefined,
    numPartitionsWithMaterializedView: undefined,
    numPartitionsWithoutMaterializedView: undefined,
    numPartitions: undefined,
    phases: [],
  };
}

export const QueryExecutionSummary = {
  encode(
    message: QueryExecutionSummary,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.timeTookMs.isZero()) {
      writer.uint32(8).uint64(message.timeTookMs);
    }
    if (message.resultNumRows !== undefined) {
      writer.uint32(16).uint64(message.resultNumRows);
    }
    if (message.resultNumBytes !== undefined) {
      writer.uint32(24).uint64(message.resultNumBytes);
    }
    if (message.numPartitionsWithMaterializedView !== undefined) {
      writer.uint32(32).uint64(message.numPartitionsWithMaterializedView);
    }
    if (message.numPartitionsWithoutMaterializedView !== undefined) {
      writer.uint32(40).uint64(message.numPartitionsWithoutMaterializedView);
    }
    if (message.numPartitions !== undefined) {
      writer.uint32(48).uint64(message.numPartitions);
    }
    for (const v of message.phases) {
      QueryPhaseSummary.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryExecutionSummary {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryExecutionSummary();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timeTookMs = reader.uint64() as Long;
          break;
        case 2:
          message.resultNumRows = reader.uint64() as Long;
          break;
        case 3:
          message.resultNumBytes = reader.uint64() as Long;
          break;
        case 4:
          message.numPartitionsWithMaterializedView = reader.uint64() as Long;
          break;
        case 5:
          message.numPartitionsWithoutMaterializedView =
            reader.uint64() as Long;
          break;
        case 6:
          message.numPartitions = reader.uint64() as Long;
          break;
        case 7:
          message.phases.push(
            QueryPhaseSummary.decode(reader, reader.uint32())
          );
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
      timeTookMs: isSet(object.timeTookMs)
        ? Long.fromValue(object.timeTookMs)
        : Long.UZERO,
      resultNumRows: isSet(object.resultNumRows)
        ? Long.fromValue(object.resultNumRows)
        : undefined,
      resultNumBytes: isSet(object.resultNumBytes)
        ? Long.fromValue(object.resultNumBytes)
        : undefined,
      numPartitionsWithMaterializedView: isSet(
        object.numPartitionsWithMaterializedView
      )
        ? Long.fromValue(object.numPartitionsWithMaterializedView)
        : undefined,
      numPartitionsWithoutMaterializedView: isSet(
        object.numPartitionsWithoutMaterializedView
      )
        ? Long.fromValue(object.numPartitionsWithoutMaterializedView)
        : undefined,
      numPartitions: isSet(object.numPartitions)
        ? Long.fromValue(object.numPartitions)
        : undefined,
      phases: Array.isArray(object?.phases)
        ? object.phases.map((e: any) => QueryPhaseSummary.fromJSON(e))
        : [],
    };
  },

  toJSON(message: QueryExecutionSummary): unknown {
    const obj: any = {};
    message.timeTookMs !== undefined &&
      (obj.timeTookMs = (message.timeTookMs || Long.UZERO).toString());
    message.resultNumRows !== undefined &&
      (obj.resultNumRows = (message.resultNumRows || undefined).toString());
    message.resultNumBytes !== undefined &&
      (obj.resultNumBytes = (message.resultNumBytes || undefined).toString());
    message.numPartitionsWithMaterializedView !== undefined &&
      (obj.numPartitionsWithMaterializedView = (
        message.numPartitionsWithMaterializedView || undefined
      ).toString());
    message.numPartitionsWithoutMaterializedView !== undefined &&
      (obj.numPartitionsWithoutMaterializedView = (
        message.numPartitionsWithoutMaterializedView || undefined
      ).toString());
    message.numPartitions !== undefined &&
      (obj.numPartitions = (message.numPartitions || undefined).toString());
    if (message.phases) {
      obj.phases = message.phases.map((e) =>
        e ? QueryPhaseSummary.toJSON(e) : undefined
      );
    } else {
      obj.phases = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryExecutionSummary>
  ): QueryExecutionSummary {
    const message = createBaseQueryExecutionSummary();
    message.timeTookMs =
      object.timeTookMs !== undefined && object.timeTookMs !== null
        ? Long.fromValue(object.timeTookMs)
        : Long.UZERO;
    message.resultNumRows =
      object.resultNumRows !== undefined && object.resultNumRows !== null
        ? Long.fromValue(object.resultNumRows)
        : undefined;
    message.resultNumBytes =
      object.resultNumBytes !== undefined && object.resultNumBytes !== null
        ? Long.fromValue(object.resultNumBytes)
        : undefined;
    message.numPartitionsWithMaterializedView =
      object.numPartitionsWithMaterializedView !== undefined &&
      object.numPartitionsWithMaterializedView !== null
        ? Long.fromValue(object.numPartitionsWithMaterializedView)
        : undefined;
    message.numPartitionsWithoutMaterializedView =
      object.numPartitionsWithoutMaterializedView !== undefined &&
      object.numPartitionsWithoutMaterializedView !== null
        ? Long.fromValue(object.numPartitionsWithoutMaterializedView)
        : undefined;
    message.numPartitions =
      object.numPartitions !== undefined && object.numPartitions !== null
        ? Long.fromValue(object.numPartitions)
        : undefined;
    message.phases =
      object.phases?.map((e) => QueryPhaseSummary.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAptosGetTxnsResponse(): AptosGetTxnsResponse {
  return { documents: [], executionSummary: undefined };
}

export const AptosGetTxnsResponse = {
  encode(
    message: AptosGetTxnsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.documents) {
      writer.uint32(10).string(v!);
    }
    if (message.executionSummary !== undefined) {
      QueryExecutionSummary.encode(
        message.executionSummary,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AptosGetTxnsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAptosGetTxnsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.documents.push(reader.string());
          break;
        case 2:
          message.executionSummary = QueryExecutionSummary.decode(
            reader,
            reader.uint32()
          );
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
      documents: Array.isArray(object?.documents)
        ? object.documents.map((e: any) => String(e))
        : [],
      executionSummary: isSet(object.executionSummary)
        ? QueryExecutionSummary.fromJSON(object.executionSummary)
        : undefined,
    };
  },

  toJSON(message: AptosGetTxnsResponse): unknown {
    const obj: any = {};
    if (message.documents) {
      obj.documents = message.documents.map((e) => e);
    } else {
      obj.documents = [];
    }
    message.executionSummary !== undefined &&
      (obj.executionSummary = message.executionSummary
        ? QueryExecutionSummary.toJSON(message.executionSummary)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<AptosGetTxnsResponse>): AptosGetTxnsResponse {
    const message = createBaseAptosGetTxnsResponse();
    message.documents = object.documents?.map((e) => e) || [];
    message.executionSummary =
      object.executionSummary !== undefined && object.executionSummary !== null
        ? QueryExecutionSummary.fromPartial(object.executionSummary)
        : undefined;
    return message;
  },
};

function createBaseAptosRefreshRequest(): AptosRefreshRequest {
  return {};
}

export const AptosRefreshRequest = {
  encode(
    _: AptosRefreshRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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

  fromPartial(_: DeepPartial<AptosRefreshRequest>): AptosRefreshRequest {
    const message = createBaseAptosRefreshRequest();
    return message;
  },
};

function createBaseVoidResponse(): VoidResponse {
  return {};
}

export const VoidResponse = {
  encode(
    _: VoidResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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

  fromPartial(_: DeepPartial<VoidResponse>): VoidResponse {
    const message = createBaseVoidResponse();
    return message;
  },
};

function createBaseEvmSQLQueryRequest(): EvmSQLQueryRequest {
  return { network: "", sql: "" };
}

export const EvmSQLQueryRequest = {
  encode(
    message: EvmSQLQueryRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.sql !== "") {
      writer.uint32(18).string(message.sql);
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
    };
  },

  toJSON(message: EvmSQLQueryRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.sql !== undefined && (obj.sql = message.sql);
    return obj;
  },

  fromPartial(object: DeepPartial<EvmSQLQueryRequest>): EvmSQLQueryRequest {
    const message = createBaseEvmSQLQueryRequest();
    message.network = object.network ?? "";
    message.sql = object.sql ?? "";
    return message;
  },
};

function createBaseEvmGetHeaderRequest(): EvmGetHeaderRequest {
  return {
    network: "",
    fromBlock: undefined,
    toBlock: undefined,
    blockNumbers: [],
  };
}

export const EvmGetHeaderRequest = {
  encode(
    message: EvmGetHeaderRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.network !== "") {
      writer.uint32(10).string(message.network);
    }
    if (message.fromBlock !== undefined) {
      writer.uint32(16).uint64(message.fromBlock);
    }
    if (message.toBlock !== undefined) {
      writer.uint32(24).uint64(message.toBlock);
    }
    writer.uint32(34).fork();
    for (const v of message.blockNumbers) {
      writer.uint64(v);
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
          message.fromBlock = reader.uint64() as Long;
          break;
        case 3:
          message.toBlock = reader.uint64() as Long;
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.blockNumbers.push(reader.uint64() as Long);
            }
          } else {
            message.blockNumbers.push(reader.uint64() as Long);
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
      fromBlock: isSet(object.fromBlock)
        ? Long.fromValue(object.fromBlock)
        : undefined,
      toBlock: isSet(object.toBlock)
        ? Long.fromValue(object.toBlock)
        : undefined,
      blockNumbers: Array.isArray(object?.blockNumbers)
        ? object.blockNumbers.map((e: any) => Long.fromValue(e))
        : [],
    };
  },

  toJSON(message: EvmGetHeaderRequest): unknown {
    const obj: any = {};
    message.network !== undefined && (obj.network = message.network);
    message.fromBlock !== undefined &&
      (obj.fromBlock = (message.fromBlock || undefined).toString());
    message.toBlock !== undefined &&
      (obj.toBlock = (message.toBlock || undefined).toString());
    if (message.blockNumbers) {
      obj.blockNumbers = message.blockNumbers.map((e) =>
        (e || Long.UZERO).toString()
      );
    } else {
      obj.blockNumbers = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<EvmGetHeaderRequest>): EvmGetHeaderRequest {
    const message = createBaseEvmGetHeaderRequest();
    message.network = object.network ?? "";
    message.fromBlock =
      object.fromBlock !== undefined && object.fromBlock !== null
        ? Long.fromValue(object.fromBlock)
        : undefined;
    message.toBlock =
      object.toBlock !== undefined && object.toBlock !== null
        ? Long.fromValue(object.toBlock)
        : undefined;
    message.blockNumbers =
      object.blockNumbers?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
};

function createBaseEvmQueryResponse(): EvmQueryResponse {
  return { rows: [], executionSummary: undefined };
}

export const EvmQueryResponse = {
  encode(
    message: EvmQueryResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.rows) {
      writer.uint32(10).string(v!);
    }
    if (message.executionSummary !== undefined) {
      QueryExecutionSummary.encode(
        message.executionSummary,
        writer.uint32(18).fork()
      ).ldelim();
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
          message.rows.push(reader.string());
          break;
        case 2:
          message.executionSummary = QueryExecutionSummary.decode(
            reader,
            reader.uint32()
          );
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
      rows: Array.isArray(object?.rows)
        ? object.rows.map((e: any) => String(e))
        : [],
      executionSummary: isSet(object.executionSummary)
        ? QueryExecutionSummary.fromJSON(object.executionSummary)
        : undefined,
    };
  },

  toJSON(message: EvmQueryResponse): unknown {
    const obj: any = {};
    if (message.rows) {
      obj.rows = message.rows.map((e) => e);
    } else {
      obj.rows = [];
    }
    message.executionSummary !== undefined &&
      (obj.executionSummary = message.executionSummary
        ? QueryExecutionSummary.toJSON(message.executionSummary)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<EvmQueryResponse>): EvmQueryResponse {
    const message = createBaseEvmQueryResponse();
    message.rows = object.rows?.map((e) => e) || [];
    message.executionSummary =
      object.executionSummary !== undefined && object.executionSummary !== null
        ? QueryExecutionSummary.fromPartial(object.executionSummary)
        : undefined;
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
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByFunctionStream(
    request: AptosGetTxnsByFunctionRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByVersion(
    request: AptosGetTxnsByVersionRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByEvent(
    request: AptosGetTxnsByEventRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
  aptosGetTxnsByEventStream(
    request: AptosGetTxnsByEventRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<AptosGetTxnsResponse>>;
  aptosRefresh(
    request: AptosRefreshRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<VoidResponse>>;
  aptosSQLQuery(
    request: AptosSQLQueryRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<AptosGetTxnsResponse>>;
}

export interface AptosQueryClient<CallOptionsExt = {}> {
  aptosGetTxnsByFunction(
    request: DeepPartial<AptosGetTxnsByFunctionRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByFunctionStream(
    request: DeepPartial<AptosGetTxnsByFunctionRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<AptosGetTxnsResponse>;
  aptosGetTxnsByVersion(
    request: DeepPartial<AptosGetTxnsByVersionRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByEvent(
    request: DeepPartial<AptosGetTxnsByEventRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<AptosGetTxnsResponse>;
  aptosGetTxnsByEventStream(
    request: DeepPartial<AptosGetTxnsByEventRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<AptosGetTxnsResponse>;
  aptosRefresh(
    request: DeepPartial<AptosRefreshRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<VoidResponse>;
  aptosSQLQuery(
    request: DeepPartial<AptosSQLQueryRequest>,
    options?: CallOptions & CallOptionsExt
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
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<EvmQueryResponse>>;
  evmGetHeader(
    request: EvmGetHeaderRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<EvmQueryResponse>>;
  evmHintHeaderCache(
    request: EvmGetHeaderRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<VoidResponse>>;
}

export interface EvmQueryClient<CallOptionsExt = {}> {
  evmSQLQuery(
    request: DeepPartial<EvmSQLQueryRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<EvmQueryResponse>;
  evmGetHeader(
    request: DeepPartial<EvmGetHeaderRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<EvmQueryResponse>;
  evmHintHeaderCache(
    request: DeepPartial<EvmGetHeaderRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<VoidResponse>;
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export type ServerStreamingMethodResult<Response> = {
  [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
