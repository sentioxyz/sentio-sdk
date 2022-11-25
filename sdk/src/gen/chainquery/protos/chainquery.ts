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

export interface QueryExecutionSummary {
  timeTookMs: Long;
}

export interface AptosGetTxnsResponse {
  documents: string[];
  executionSummary?: QueryExecutionSummary | undefined;
}

export interface AptosRefreshRequest {}

export interface VoidResponse {}

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

function createBaseQueryExecutionSummary(): QueryExecutionSummary {
  return { timeTookMs: Long.UZERO };
}

export const QueryExecutionSummary = {
  encode(
    message: QueryExecutionSummary,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.timeTookMs.isZero()) {
      writer.uint32(8).uint64(message.timeTookMs);
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
    };
  },

  toJSON(message: QueryExecutionSummary): unknown {
    const obj: any = {};
    message.timeTookMs !== undefined &&
      (obj.timeTookMs = (message.timeTookMs || Long.UZERO).toString());
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
