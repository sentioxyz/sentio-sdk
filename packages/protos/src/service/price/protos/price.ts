/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";
import { Timestamp } from "../../../google/protobuf/timestamp.js";
import { CoinID } from "../../common/protos/common.js";

export interface GetPriceRequest {
  timestamp: Date | undefined;
  coinId: CoinID | undefined;
}

export interface GetPriceResponse {
  price: number;
  timestamp: Date | undefined;
}

export interface BatchGetPricesRequest {
  timestamps: Date[];
  coinIds: CoinID[];
}

export interface BatchGetPricesResponse {
  prices: BatchGetPricesResponse_CoinPrice[];
}

export interface BatchGetPricesResponse_CoinPrice {
  coinId: CoinID | undefined;
  price?: BatchGetPricesResponse_CoinPrice_Price | undefined;
  error?: string | undefined;
}

export interface BatchGetPricesResponse_CoinPrice_Price {
  results: GetPriceResponse[];
}

export interface ListCoinsRequest {
  limit: number;
  offset: number;
  searchQuery: string;
}

export interface ListCoinsResponse {
  coins: CoinID[];
}

function createBaseGetPriceRequest(): GetPriceRequest {
  return { timestamp: undefined, coinId: undefined };
}

export const GetPriceRequest = {
  encode(message: GetPriceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(10).fork()).ldelim();
    }
    if (message.coinId !== undefined) {
      CoinID.encode(message.coinId, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPriceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPriceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 2:
          message.coinId = CoinID.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetPriceRequest {
    return {
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      coinId: isSet(object.coinId) ? CoinID.fromJSON(object.coinId) : undefined,
    };
  },

  toJSON(message: GetPriceRequest): unknown {
    const obj: any = {};
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    message.coinId !== undefined && (obj.coinId = message.coinId ? CoinID.toJSON(message.coinId) : undefined);
    return obj;
  },

  create(base?: DeepPartial<GetPriceRequest>): GetPriceRequest {
    return GetPriceRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetPriceRequest>): GetPriceRequest {
    const message = createBaseGetPriceRequest();
    message.timestamp = object.timestamp ?? undefined;
    message.coinId = (object.coinId !== undefined && object.coinId !== null)
      ? CoinID.fromPartial(object.coinId)
      : undefined;
    return message;
  },
};

function createBaseGetPriceResponse(): GetPriceResponse {
  return { price: 0, timestamp: undefined };
}

export const GetPriceResponse = {
  encode(message: GetPriceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.price !== 0) {
      writer.uint32(9).double(message.price);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPriceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPriceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.price = reader.double();
          break;
        case 2:
          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetPriceResponse {
    return {
      price: isSet(object.price) ? Number(object.price) : 0,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: GetPriceResponse): unknown {
    const obj: any = {};
    message.price !== undefined && (obj.price = message.price);
    message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
    return obj;
  },

  create(base?: DeepPartial<GetPriceResponse>): GetPriceResponse {
    return GetPriceResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetPriceResponse>): GetPriceResponse {
    const message = createBaseGetPriceResponse();
    message.price = object.price ?? 0;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseBatchGetPricesRequest(): BatchGetPricesRequest {
  return { timestamps: [], coinIds: [] };
}

export const BatchGetPricesRequest = {
  encode(message: BatchGetPricesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.timestamps) {
      Timestamp.encode(toTimestamp(v!), writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.coinIds) {
      CoinID.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchGetPricesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamps.push(fromTimestamp(Timestamp.decode(reader, reader.uint32())));
          break;
        case 2:
          message.coinIds.push(CoinID.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesRequest {
    return {
      timestamps: Array.isArray(object?.timestamps) ? object.timestamps.map((e: any) => fromJsonTimestamp(e)) : [],
      coinIds: Array.isArray(object?.coinIds) ? object.coinIds.map((e: any) => CoinID.fromJSON(e)) : [],
    };
  },

  toJSON(message: BatchGetPricesRequest): unknown {
    const obj: any = {};
    if (message.timestamps) {
      obj.timestamps = message.timestamps.map((e) => e.toISOString());
    } else {
      obj.timestamps = [];
    }
    if (message.coinIds) {
      obj.coinIds = message.coinIds.map((e) => e ? CoinID.toJSON(e) : undefined);
    } else {
      obj.coinIds = [];
    }
    return obj;
  },

  create(base?: DeepPartial<BatchGetPricesRequest>): BatchGetPricesRequest {
    return BatchGetPricesRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BatchGetPricesRequest>): BatchGetPricesRequest {
    const message = createBaseBatchGetPricesRequest();
    message.timestamps = object.timestamps?.map((e) => e) || [];
    message.coinIds = object.coinIds?.map((e) => CoinID.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBatchGetPricesResponse(): BatchGetPricesResponse {
  return { prices: [] };
}

export const BatchGetPricesResponse = {
  encode(message: BatchGetPricesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.prices) {
      BatchGetPricesResponse_CoinPrice.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchGetPricesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.prices.push(BatchGetPricesResponse_CoinPrice.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesResponse {
    return {
      prices: Array.isArray(object?.prices)
        ? object.prices.map((e: any) => BatchGetPricesResponse_CoinPrice.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchGetPricesResponse): unknown {
    const obj: any = {};
    if (message.prices) {
      obj.prices = message.prices.map((e) => e ? BatchGetPricesResponse_CoinPrice.toJSON(e) : undefined);
    } else {
      obj.prices = [];
    }
    return obj;
  },

  create(base?: DeepPartial<BatchGetPricesResponse>): BatchGetPricesResponse {
    return BatchGetPricesResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BatchGetPricesResponse>): BatchGetPricesResponse {
    const message = createBaseBatchGetPricesResponse();
    message.prices = object.prices?.map((e) => BatchGetPricesResponse_CoinPrice.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBatchGetPricesResponse_CoinPrice(): BatchGetPricesResponse_CoinPrice {
  return { coinId: undefined, price: undefined, error: undefined };
}

export const BatchGetPricesResponse_CoinPrice = {
  encode(message: BatchGetPricesResponse_CoinPrice, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.coinId !== undefined) {
      CoinID.encode(message.coinId, writer.uint32(10).fork()).ldelim();
    }
    if (message.price !== undefined) {
      BatchGetPricesResponse_CoinPrice_Price.encode(message.price, writer.uint32(18).fork()).ldelim();
    }
    if (message.error !== undefined) {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchGetPricesResponse_CoinPrice {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse_CoinPrice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coinId = CoinID.decode(reader, reader.uint32());
          break;
        case 2:
          message.price = BatchGetPricesResponse_CoinPrice_Price.decode(reader, reader.uint32());
          break;
        case 3:
          message.error = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesResponse_CoinPrice {
    return {
      coinId: isSet(object.coinId) ? CoinID.fromJSON(object.coinId) : undefined,
      price: isSet(object.price) ? BatchGetPricesResponse_CoinPrice_Price.fromJSON(object.price) : undefined,
      error: isSet(object.error) ? String(object.error) : undefined,
    };
  },

  toJSON(message: BatchGetPricesResponse_CoinPrice): unknown {
    const obj: any = {};
    message.coinId !== undefined && (obj.coinId = message.coinId ? CoinID.toJSON(message.coinId) : undefined);
    message.price !== undefined &&
      (obj.price = message.price ? BatchGetPricesResponse_CoinPrice_Price.toJSON(message.price) : undefined);
    message.error !== undefined && (obj.error = message.error);
    return obj;
  },

  create(base?: DeepPartial<BatchGetPricesResponse_CoinPrice>): BatchGetPricesResponse_CoinPrice {
    return BatchGetPricesResponse_CoinPrice.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BatchGetPricesResponse_CoinPrice>): BatchGetPricesResponse_CoinPrice {
    const message = createBaseBatchGetPricesResponse_CoinPrice();
    message.coinId = (object.coinId !== undefined && object.coinId !== null)
      ? CoinID.fromPartial(object.coinId)
      : undefined;
    message.price = (object.price !== undefined && object.price !== null)
      ? BatchGetPricesResponse_CoinPrice_Price.fromPartial(object.price)
      : undefined;
    message.error = object.error ?? undefined;
    return message;
  },
};

function createBaseBatchGetPricesResponse_CoinPrice_Price(): BatchGetPricesResponse_CoinPrice_Price {
  return { results: [] };
}

export const BatchGetPricesResponse_CoinPrice_Price = {
  encode(message: BatchGetPricesResponse_CoinPrice_Price, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.results) {
      GetPriceResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchGetPricesResponse_CoinPrice_Price {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse_CoinPrice_Price();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.results.push(GetPriceResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesResponse_CoinPrice_Price {
    return {
      results: Array.isArray(object?.results) ? object.results.map((e: any) => GetPriceResponse.fromJSON(e)) : [],
    };
  },

  toJSON(message: BatchGetPricesResponse_CoinPrice_Price): unknown {
    const obj: any = {};
    if (message.results) {
      obj.results = message.results.map((e) => e ? GetPriceResponse.toJSON(e) : undefined);
    } else {
      obj.results = [];
    }
    return obj;
  },

  create(base?: DeepPartial<BatchGetPricesResponse_CoinPrice_Price>): BatchGetPricesResponse_CoinPrice_Price {
    return BatchGetPricesResponse_CoinPrice_Price.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<BatchGetPricesResponse_CoinPrice_Price>): BatchGetPricesResponse_CoinPrice_Price {
    const message = createBaseBatchGetPricesResponse_CoinPrice_Price();
    message.results = object.results?.map((e) => GetPriceResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListCoinsRequest(): ListCoinsRequest {
  return { limit: 0, offset: 0, searchQuery: "" };
}

export const ListCoinsRequest = {
  encode(message: ListCoinsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.limit !== 0) {
      writer.uint32(8).int32(message.limit);
    }
    if (message.offset !== 0) {
      writer.uint32(16).int32(message.offset);
    }
    if (message.searchQuery !== "") {
      writer.uint32(26).string(message.searchQuery);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListCoinsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListCoinsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.limit = reader.int32();
          break;
        case 2:
          message.offset = reader.int32();
          break;
        case 3:
          message.searchQuery = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListCoinsRequest {
    return {
      limit: isSet(object.limit) ? Number(object.limit) : 0,
      offset: isSet(object.offset) ? Number(object.offset) : 0,
      searchQuery: isSet(object.searchQuery) ? String(object.searchQuery) : "",
    };
  },

  toJSON(message: ListCoinsRequest): unknown {
    const obj: any = {};
    message.limit !== undefined && (obj.limit = Math.round(message.limit));
    message.offset !== undefined && (obj.offset = Math.round(message.offset));
    message.searchQuery !== undefined && (obj.searchQuery = message.searchQuery);
    return obj;
  },

  create(base?: DeepPartial<ListCoinsRequest>): ListCoinsRequest {
    return ListCoinsRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListCoinsRequest>): ListCoinsRequest {
    const message = createBaseListCoinsRequest();
    message.limit = object.limit ?? 0;
    message.offset = object.offset ?? 0;
    message.searchQuery = object.searchQuery ?? "";
    return message;
  },
};

function createBaseListCoinsResponse(): ListCoinsResponse {
  return { coins: [] };
}

export const ListCoinsResponse = {
  encode(message: ListCoinsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.coins) {
      CoinID.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListCoinsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListCoinsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coins.push(CoinID.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListCoinsResponse {
    return { coins: Array.isArray(object?.coins) ? object.coins.map((e: any) => CoinID.fromJSON(e)) : [] };
  },

  toJSON(message: ListCoinsResponse): unknown {
    const obj: any = {};
    if (message.coins) {
      obj.coins = message.coins.map((e) => e ? CoinID.toJSON(e) : undefined);
    } else {
      obj.coins = [];
    }
    return obj;
  },

  create(base?: DeepPartial<ListCoinsResponse>): ListCoinsResponse {
    return ListCoinsResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListCoinsResponse>): ListCoinsResponse {
    const message = createBaseListCoinsResponse();
    message.coins = object.coins?.map((e) => CoinID.fromPartial(e)) || [];
    return message;
  },
};

export type PriceServiceDefinition = typeof PriceServiceDefinition;
export const PriceServiceDefinition = {
  name: "PriceService",
  fullName: "price_service.PriceService",
  methods: {
    getPrice: {
      name: "GetPrice",
      requestType: GetPriceRequest,
      requestStream: false,
      responseType: GetPriceResponse,
      responseStream: false,
      options: {},
    },
    batchGetPrices: {
      name: "BatchGetPrices",
      requestType: BatchGetPricesRequest,
      requestStream: false,
      responseType: BatchGetPricesResponse,
      responseStream: false,
      options: {},
    },
    listCoins: {
      name: "ListCoins",
      requestType: ListCoinsRequest,
      requestStream: false,
      responseType: ListCoinsResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface PriceServiceImplementation<CallContextExt = {}> {
  getPrice(request: GetPriceRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetPriceResponse>>;
  batchGetPrices(
    request: BatchGetPricesRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<BatchGetPricesResponse>>;
  listCoins(request: ListCoinsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<ListCoinsResponse>>;
}

export interface PriceServiceClient<CallOptionsExt = {}> {
  getPrice(request: DeepPartial<GetPriceRequest>, options?: CallOptions & CallOptionsExt): Promise<GetPriceResponse>;
  batchGetPrices(
    request: DeepPartial<BatchGetPricesRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<BatchGetPricesResponse>;
  listCoins(request: DeepPartial<ListCoinsRequest>, options?: CallOptions & CallOptionsExt): Promise<ListCoinsResponse>;
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
