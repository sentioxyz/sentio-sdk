/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";
import { Empty } from "../../../google/protobuf/empty.js";
import { Timestamp } from "../../../google/protobuf/timestamp.js";

export interface CoinID {
  symbol?: string | undefined;
  address?: CoinID_AddressIdentifier | undefined;
}

export interface CoinID_AddressIdentifier {
  address: string;
  chain: string;
}

export interface GetPriceRequest {
  timestamp: Date | undefined;
  coinId: CoinID | undefined;
  source: string;
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
  chain: string;
}

export interface ListCoinsResponse {
  coins: CoinID[];
  coinAddressesInChain: { [key: string]: CoinID };
}

export interface ListCoinsResponse_CoinAddressesInChainEntry {
  key: string;
  value: CoinID | undefined;
}

export interface CheckLatestPriceResponse {
  prices: CheckLatestPriceResponse_CoinPrice[];
  latestPrice: CheckLatestPriceResponse_CoinPrice | undefined;
}

export interface CheckLatestPriceResponse_CoinPrice {
  coinId: CoinID | undefined;
  price: number;
  timestamp: Date | undefined;
}

export interface BackfillCoinRequest {
  name: string;
  symbol: string;
  chain: string;
  address: string;
  coingeckoId: string;
  decimals: number;
  logoUrl: string;
  projectUrl: string;
  accountAddress: string;
  moduleName: string;
  structName: string;
}

export interface BackfillCoinResponse {
  symbol: string;
  message: string;
}

function createBaseCoinID(): CoinID {
  return { symbol: undefined, address: undefined };
}

export const CoinID = {
  encode(message: CoinID, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.symbol !== undefined) {
      writer.uint32(18).string(message.symbol);
    }
    if (message.address !== undefined) {
      CoinID_AddressIdentifier.encode(message.address, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CoinID {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.symbol = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.address = CoinID_AddressIdentifier.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CoinID {
    return {
      symbol: isSet(object.symbol) ? globalThis.String(object.symbol) : undefined,
      address: isSet(object.address) ? CoinID_AddressIdentifier.fromJSON(object.address) : undefined,
    };
  },

  toJSON(message: CoinID): unknown {
    const obj: any = {};
    if (message.symbol !== undefined) {
      obj.symbol = message.symbol;
    }
    if (message.address !== undefined) {
      obj.address = CoinID_AddressIdentifier.toJSON(message.address);
    }
    return obj;
  },

  create(base?: DeepPartial<CoinID>): CoinID {
    return CoinID.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CoinID>): CoinID {
    const message = createBaseCoinID();
    message.symbol = object.symbol ?? undefined;
    message.address = (object.address !== undefined && object.address !== null)
      ? CoinID_AddressIdentifier.fromPartial(object.address)
      : undefined;
    return message;
  },
};

function createBaseCoinID_AddressIdentifier(): CoinID_AddressIdentifier {
  return { address: "", chain: "" };
}

export const CoinID_AddressIdentifier = {
  encode(message: CoinID_AddressIdentifier, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.chain !== "") {
      writer.uint32(18).string(message.chain);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CoinID_AddressIdentifier {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID_AddressIdentifier();
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

          message.chain = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CoinID_AddressIdentifier {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      chain: isSet(object.chain) ? globalThis.String(object.chain) : "",
    };
  },

  toJSON(message: CoinID_AddressIdentifier): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.chain !== "") {
      obj.chain = message.chain;
    }
    return obj;
  },

  create(base?: DeepPartial<CoinID_AddressIdentifier>): CoinID_AddressIdentifier {
    return CoinID_AddressIdentifier.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CoinID_AddressIdentifier>): CoinID_AddressIdentifier {
    const message = createBaseCoinID_AddressIdentifier();
    message.address = object.address ?? "";
    message.chain = object.chain ?? "";
    return message;
  },
};

function createBaseGetPriceRequest(): GetPriceRequest {
  return { timestamp: undefined, coinId: undefined, source: "" };
}

export const GetPriceRequest = {
  encode(message: GetPriceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(10).fork()).ldelim();
    }
    if (message.coinId !== undefined) {
      CoinID.encode(message.coinId, writer.uint32(18).fork()).ldelim();
    }
    if (message.source !== "") {
      writer.uint32(26).string(message.source);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPriceRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPriceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.coinId = CoinID.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.source = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetPriceRequest {
    return {
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
      coinId: isSet(object.coinId) ? CoinID.fromJSON(object.coinId) : undefined,
      source: isSet(object.source) ? globalThis.String(object.source) : "",
    };
  },

  toJSON(message: GetPriceRequest): unknown {
    const obj: any = {};
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    if (message.coinId !== undefined) {
      obj.coinId = CoinID.toJSON(message.coinId);
    }
    if (message.source !== "") {
      obj.source = message.source;
    }
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
    message.source = object.source ?? "";
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPriceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.price = reader.double();
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

  fromJSON(object: any): GetPriceResponse {
    return {
      price: isSet(object.price) ? globalThis.Number(object.price) : 0,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: GetPriceResponse): unknown {
    const obj: any = {};
    if (message.price !== 0) {
      obj.price = message.price;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.timestamps.push(fromTimestamp(Timestamp.decode(reader, reader.uint32())));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.coinIds.push(CoinID.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesRequest {
    return {
      timestamps: globalThis.Array.isArray(object?.timestamps)
        ? object.timestamps.map((e: any) => fromJsonTimestamp(e))
        : [],
      coinIds: globalThis.Array.isArray(object?.coinIds) ? object.coinIds.map((e: any) => CoinID.fromJSON(e)) : [],
    };
  },

  toJSON(message: BatchGetPricesRequest): unknown {
    const obj: any = {};
    if (message.timestamps?.length) {
      obj.timestamps = message.timestamps.map((e) => e.toISOString());
    }
    if (message.coinIds?.length) {
      obj.coinIds = message.coinIds.map((e) => CoinID.toJSON(e));
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.prices.push(BatchGetPricesResponse_CoinPrice.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesResponse {
    return {
      prices: globalThis.Array.isArray(object?.prices)
        ? object.prices.map((e: any) => BatchGetPricesResponse_CoinPrice.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchGetPricesResponse): unknown {
    const obj: any = {};
    if (message.prices?.length) {
      obj.prices = message.prices.map((e) => BatchGetPricesResponse_CoinPrice.toJSON(e));
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse_CoinPrice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.coinId = CoinID.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.price = BatchGetPricesResponse_CoinPrice_Price.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): BatchGetPricesResponse_CoinPrice {
    return {
      coinId: isSet(object.coinId) ? CoinID.fromJSON(object.coinId) : undefined,
      price: isSet(object.price) ? BatchGetPricesResponse_CoinPrice_Price.fromJSON(object.price) : undefined,
      error: isSet(object.error) ? globalThis.String(object.error) : undefined,
    };
  },

  toJSON(message: BatchGetPricesResponse_CoinPrice): unknown {
    const obj: any = {};
    if (message.coinId !== undefined) {
      obj.coinId = CoinID.toJSON(message.coinId);
    }
    if (message.price !== undefined) {
      obj.price = BatchGetPricesResponse_CoinPrice_Price.toJSON(message.price);
    }
    if (message.error !== undefined) {
      obj.error = message.error;
    }
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchGetPricesResponse_CoinPrice_Price();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.results.push(GetPriceResponse.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchGetPricesResponse_CoinPrice_Price {
    return {
      results: globalThis.Array.isArray(object?.results)
        ? object.results.map((e: any) => GetPriceResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchGetPricesResponse_CoinPrice_Price): unknown {
    const obj: any = {};
    if (message.results?.length) {
      obj.results = message.results.map((e) => GetPriceResponse.toJSON(e));
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
  return { limit: 0, offset: 0, searchQuery: "", chain: "" };
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
    if (message.chain !== "") {
      writer.uint32(34).string(message.chain);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListCoinsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListCoinsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.limit = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.offset = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.searchQuery = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.chain = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListCoinsRequest {
    return {
      limit: isSet(object.limit) ? globalThis.Number(object.limit) : 0,
      offset: isSet(object.offset) ? globalThis.Number(object.offset) : 0,
      searchQuery: isSet(object.searchQuery) ? globalThis.String(object.searchQuery) : "",
      chain: isSet(object.chain) ? globalThis.String(object.chain) : "",
    };
  },

  toJSON(message: ListCoinsRequest): unknown {
    const obj: any = {};
    if (message.limit !== 0) {
      obj.limit = Math.round(message.limit);
    }
    if (message.offset !== 0) {
      obj.offset = Math.round(message.offset);
    }
    if (message.searchQuery !== "") {
      obj.searchQuery = message.searchQuery;
    }
    if (message.chain !== "") {
      obj.chain = message.chain;
    }
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
    message.chain = object.chain ?? "";
    return message;
  },
};

function createBaseListCoinsResponse(): ListCoinsResponse {
  return { coins: [], coinAddressesInChain: {} };
}

export const ListCoinsResponse = {
  encode(message: ListCoinsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.coins) {
      CoinID.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    Object.entries(message.coinAddressesInChain).forEach(([key, value]) => {
      ListCoinsResponse_CoinAddressesInChainEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListCoinsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListCoinsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.coins.push(CoinID.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = ListCoinsResponse_CoinAddressesInChainEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.coinAddressesInChain[entry2.key] = entry2.value;
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

  fromJSON(object: any): ListCoinsResponse {
    return {
      coins: globalThis.Array.isArray(object?.coins) ? object.coins.map((e: any) => CoinID.fromJSON(e)) : [],
      coinAddressesInChain: isObject(object.coinAddressesInChain)
        ? Object.entries(object.coinAddressesInChain).reduce<{ [key: string]: CoinID }>((acc, [key, value]) => {
          acc[key] = CoinID.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: ListCoinsResponse): unknown {
    const obj: any = {};
    if (message.coins?.length) {
      obj.coins = message.coins.map((e) => CoinID.toJSON(e));
    }
    if (message.coinAddressesInChain) {
      const entries = Object.entries(message.coinAddressesInChain);
      if (entries.length > 0) {
        obj.coinAddressesInChain = {};
        entries.forEach(([k, v]) => {
          obj.coinAddressesInChain[k] = CoinID.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<ListCoinsResponse>): ListCoinsResponse {
    return ListCoinsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListCoinsResponse>): ListCoinsResponse {
    const message = createBaseListCoinsResponse();
    message.coins = object.coins?.map((e) => CoinID.fromPartial(e)) || [];
    message.coinAddressesInChain = Object.entries(object.coinAddressesInChain ?? {}).reduce<{ [key: string]: CoinID }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = CoinID.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseListCoinsResponse_CoinAddressesInChainEntry(): ListCoinsResponse_CoinAddressesInChainEntry {
  return { key: "", value: undefined };
}

export const ListCoinsResponse_CoinAddressesInChainEntry = {
  encode(message: ListCoinsResponse_CoinAddressesInChainEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      CoinID.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListCoinsResponse_CoinAddressesInChainEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListCoinsResponse_CoinAddressesInChainEntry();
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

          message.value = CoinID.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListCoinsResponse_CoinAddressesInChainEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? CoinID.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: ListCoinsResponse_CoinAddressesInChainEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = CoinID.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<ListCoinsResponse_CoinAddressesInChainEntry>): ListCoinsResponse_CoinAddressesInChainEntry {
    return ListCoinsResponse_CoinAddressesInChainEntry.fromPartial(base ?? {});
  },
  fromPartial(
    object: DeepPartial<ListCoinsResponse_CoinAddressesInChainEntry>,
  ): ListCoinsResponse_CoinAddressesInChainEntry {
    const message = createBaseListCoinsResponse_CoinAddressesInChainEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? CoinID.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseCheckLatestPriceResponse(): CheckLatestPriceResponse {
  return { prices: [], latestPrice: undefined };
}

export const CheckLatestPriceResponse = {
  encode(message: CheckLatestPriceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.prices) {
      CheckLatestPriceResponse_CoinPrice.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.latestPrice !== undefined) {
      CheckLatestPriceResponse_CoinPrice.encode(message.latestPrice, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CheckLatestPriceResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckLatestPriceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.prices.push(CheckLatestPriceResponse_CoinPrice.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.latestPrice = CheckLatestPriceResponse_CoinPrice.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CheckLatestPriceResponse {
    return {
      prices: globalThis.Array.isArray(object?.prices)
        ? object.prices.map((e: any) => CheckLatestPriceResponse_CoinPrice.fromJSON(e))
        : [],
      latestPrice: isSet(object.latestPrice)
        ? CheckLatestPriceResponse_CoinPrice.fromJSON(object.latestPrice)
        : undefined,
    };
  },

  toJSON(message: CheckLatestPriceResponse): unknown {
    const obj: any = {};
    if (message.prices?.length) {
      obj.prices = message.prices.map((e) => CheckLatestPriceResponse_CoinPrice.toJSON(e));
    }
    if (message.latestPrice !== undefined) {
      obj.latestPrice = CheckLatestPriceResponse_CoinPrice.toJSON(message.latestPrice);
    }
    return obj;
  },

  create(base?: DeepPartial<CheckLatestPriceResponse>): CheckLatestPriceResponse {
    return CheckLatestPriceResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CheckLatestPriceResponse>): CheckLatestPriceResponse {
    const message = createBaseCheckLatestPriceResponse();
    message.prices = object.prices?.map((e) => CheckLatestPriceResponse_CoinPrice.fromPartial(e)) || [];
    message.latestPrice = (object.latestPrice !== undefined && object.latestPrice !== null)
      ? CheckLatestPriceResponse_CoinPrice.fromPartial(object.latestPrice)
      : undefined;
    return message;
  },
};

function createBaseCheckLatestPriceResponse_CoinPrice(): CheckLatestPriceResponse_CoinPrice {
  return { coinId: undefined, price: 0, timestamp: undefined };
}

export const CheckLatestPriceResponse_CoinPrice = {
  encode(message: CheckLatestPriceResponse_CoinPrice, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.coinId !== undefined) {
      CoinID.encode(message.coinId, writer.uint32(10).fork()).ldelim();
    }
    if (message.price !== 0) {
      writer.uint32(17).double(message.price);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CheckLatestPriceResponse_CoinPrice {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckLatestPriceResponse_CoinPrice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.coinId = CoinID.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.price = reader.double();
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): CheckLatestPriceResponse_CoinPrice {
    return {
      coinId: isSet(object.coinId) ? CoinID.fromJSON(object.coinId) : undefined,
      price: isSet(object.price) ? globalThis.Number(object.price) : 0,
      timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
    };
  },

  toJSON(message: CheckLatestPriceResponse_CoinPrice): unknown {
    const obj: any = {};
    if (message.coinId !== undefined) {
      obj.coinId = CoinID.toJSON(message.coinId);
    }
    if (message.price !== 0) {
      obj.price = message.price;
    }
    if (message.timestamp !== undefined) {
      obj.timestamp = message.timestamp.toISOString();
    }
    return obj;
  },

  create(base?: DeepPartial<CheckLatestPriceResponse_CoinPrice>): CheckLatestPriceResponse_CoinPrice {
    return CheckLatestPriceResponse_CoinPrice.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CheckLatestPriceResponse_CoinPrice>): CheckLatestPriceResponse_CoinPrice {
    const message = createBaseCheckLatestPriceResponse_CoinPrice();
    message.coinId = (object.coinId !== undefined && object.coinId !== null)
      ? CoinID.fromPartial(object.coinId)
      : undefined;
    message.price = object.price ?? 0;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
};

function createBaseBackfillCoinRequest(): BackfillCoinRequest {
  return {
    name: "",
    symbol: "",
    chain: "",
    address: "",
    coingeckoId: "",
    decimals: 0,
    logoUrl: "",
    projectUrl: "",
    accountAddress: "",
    moduleName: "",
    structName: "",
  };
}

export const BackfillCoinRequest = {
  encode(message: BackfillCoinRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.symbol !== "") {
      writer.uint32(18).string(message.symbol);
    }
    if (message.chain !== "") {
      writer.uint32(26).string(message.chain);
    }
    if (message.address !== "") {
      writer.uint32(34).string(message.address);
    }
    if (message.coingeckoId !== "") {
      writer.uint32(42).string(message.coingeckoId);
    }
    if (message.decimals !== 0) {
      writer.uint32(48).uint32(message.decimals);
    }
    if (message.logoUrl !== "") {
      writer.uint32(58).string(message.logoUrl);
    }
    if (message.projectUrl !== "") {
      writer.uint32(66).string(message.projectUrl);
    }
    if (message.accountAddress !== "") {
      writer.uint32(74).string(message.accountAddress);
    }
    if (message.moduleName !== "") {
      writer.uint32(82).string(message.moduleName);
    }
    if (message.structName !== "") {
      writer.uint32(90).string(message.structName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BackfillCoinRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBackfillCoinRequest();
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

          message.symbol = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.chain = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.address = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.coingeckoId = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.decimals = reader.uint32();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.projectUrl = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.accountAddress = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.moduleName = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.structName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BackfillCoinRequest {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      symbol: isSet(object.symbol) ? globalThis.String(object.symbol) : "",
      chain: isSet(object.chain) ? globalThis.String(object.chain) : "",
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      coingeckoId: isSet(object.coingeckoId) ? globalThis.String(object.coingeckoId) : "",
      decimals: isSet(object.decimals) ? globalThis.Number(object.decimals) : 0,
      logoUrl: isSet(object.logoUrl) ? globalThis.String(object.logoUrl) : "",
      projectUrl: isSet(object.projectUrl) ? globalThis.String(object.projectUrl) : "",
      accountAddress: isSet(object.accountAddress) ? globalThis.String(object.accountAddress) : "",
      moduleName: isSet(object.moduleName) ? globalThis.String(object.moduleName) : "",
      structName: isSet(object.structName) ? globalThis.String(object.structName) : "",
    };
  },

  toJSON(message: BackfillCoinRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.symbol !== "") {
      obj.symbol = message.symbol;
    }
    if (message.chain !== "") {
      obj.chain = message.chain;
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.coingeckoId !== "") {
      obj.coingeckoId = message.coingeckoId;
    }
    if (message.decimals !== 0) {
      obj.decimals = Math.round(message.decimals);
    }
    if (message.logoUrl !== "") {
      obj.logoUrl = message.logoUrl;
    }
    if (message.projectUrl !== "") {
      obj.projectUrl = message.projectUrl;
    }
    if (message.accountAddress !== "") {
      obj.accountAddress = message.accountAddress;
    }
    if (message.moduleName !== "") {
      obj.moduleName = message.moduleName;
    }
    if (message.structName !== "") {
      obj.structName = message.structName;
    }
    return obj;
  },

  create(base?: DeepPartial<BackfillCoinRequest>): BackfillCoinRequest {
    return BackfillCoinRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BackfillCoinRequest>): BackfillCoinRequest {
    const message = createBaseBackfillCoinRequest();
    message.name = object.name ?? "";
    message.symbol = object.symbol ?? "";
    message.chain = object.chain ?? "";
    message.address = object.address ?? "";
    message.coingeckoId = object.coingeckoId ?? "";
    message.decimals = object.decimals ?? 0;
    message.logoUrl = object.logoUrl ?? "";
    message.projectUrl = object.projectUrl ?? "";
    message.accountAddress = object.accountAddress ?? "";
    message.moduleName = object.moduleName ?? "";
    message.structName = object.structName ?? "";
    return message;
  },
};

function createBaseBackfillCoinResponse(): BackfillCoinResponse {
  return { symbol: "", message: "" };
}

export const BackfillCoinResponse = {
  encode(message: BackfillCoinResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.symbol !== "") {
      writer.uint32(10).string(message.symbol);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BackfillCoinResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBackfillCoinResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.symbol = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BackfillCoinResponse {
    return {
      symbol: isSet(object.symbol) ? globalThis.String(object.symbol) : "",
      message: isSet(object.message) ? globalThis.String(object.message) : "",
    };
  },

  toJSON(message: BackfillCoinResponse): unknown {
    const obj: any = {};
    if (message.symbol !== "") {
      obj.symbol = message.symbol;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create(base?: DeepPartial<BackfillCoinResponse>): BackfillCoinResponse {
    return BackfillCoinResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BackfillCoinResponse>): BackfillCoinResponse {
    const message = createBaseBackfillCoinResponse();
    message.symbol = object.symbol ?? "";
    message.message = object.message ?? "";
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
      options: {
        _unknownFields: {
          8338: [new Uint8Array([0])],
          578365826: [new Uint8Array([16, 18, 14, 47, 97, 112, 105, 47, 118, 49, 47, 112, 114, 105, 99, 101, 115])],
        },
      },
    },
    batchGetPrices: {
      name: "BatchGetPrices",
      requestType: BatchGetPricesRequest,
      requestStream: false,
      responseType: BatchGetPricesResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          8338: [new Uint8Array([0])],
          578365826: [
            new Uint8Array([
              25,
              34,
              20,
              47,
              97,
              112,
              105,
              47,
              118,
              49,
              47,
              112,
              114,
              105,
              99,
              101,
              115,
              47,
              98,
              97,
              116,
              99,
              104,
              58,
              1,
              42,
            ]),
          ],
        },
      },
    },
    listCoins: {
      name: "ListCoins",
      requestType: ListCoinsRequest,
      requestStream: false,
      responseType: ListCoinsResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          8338: [new Uint8Array([16, 42, 14, 80, 114, 105, 99, 101, 76, 105, 115, 116, 67, 111, 105, 110, 115])],
          578365826: [
            new Uint8Array([
              22,
              18,
              20,
              47,
              97,
              112,
              105,
              47,
              118,
              49,
              47,
              112,
              114,
              105,
              99,
              101,
              115,
              47,
              99,
              111,
              105,
              110,
              115,
            ]),
          ],
        },
      },
    },
    checkLatestPrice: {
      name: "CheckLatestPrice",
      requestType: Empty,
      requestStream: false,
      responseType: CheckLatestPriceResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          8338: [new Uint8Array([0])],
          578365826: [
            new Uint8Array([
              29,
              18,
              27,
              47,
              97,
              112,
              105,
              47,
              118,
              49,
              47,
              112,
              114,
              105,
              99,
              101,
              115,
              47,
              99,
              104,
              101,
              99,
              107,
              95,
              108,
              97,
              116,
              101,
              115,
              116,
            ]),
          ],
        },
      },
    },
    backfillCoin: {
      name: "BackfillCoin",
      requestType: BackfillCoinRequest,
      requestStream: false,
      responseType: BackfillCoinResponse,
      responseStream: false,
      options: {
        _unknownFields: {
          578365818: [new Uint8Array([10, 18, 8, 73, 78, 84, 69, 82, 78, 65, 76])],
          578365826: [
            new Uint8Array([
              28,
              34,
              23,
              47,
              97,
              112,
              105,
              47,
              118,
              49,
              47,
              112,
              114,
              105,
              99,
              101,
              115,
              47,
              98,
              97,
              99,
              107,
              102,
              105,
              108,
              108,
              58,
              1,
              42,
            ]),
          ],
        },
      },
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
  checkLatestPrice(
    request: Empty,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<CheckLatestPriceResponse>>;
  backfillCoin(
    request: BackfillCoinRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<BackfillCoinResponse>>;
}

export interface PriceServiceClient<CallOptionsExt = {}> {
  getPrice(request: DeepPartial<GetPriceRequest>, options?: CallOptions & CallOptionsExt): Promise<GetPriceResponse>;
  batchGetPrices(
    request: DeepPartial<BatchGetPricesRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<BatchGetPricesResponse>;
  listCoins(request: DeepPartial<ListCoinsRequest>, options?: CallOptions & CallOptionsExt): Promise<ListCoinsResponse>;
  checkLatestPrice(
    request: DeepPartial<Empty>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<CheckLatestPriceResponse>;
  backfillCoin(
    request: DeepPartial<BackfillCoinRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<BackfillCoinResponse>;
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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
