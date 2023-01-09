/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../../../google/protobuf/timestamp";

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
}

export interface GetPriceResponse {
  price: number;
  timestamp: Date | undefined;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.symbol = reader.string();
          break;
        case 3:
          message.address = CoinID_AddressIdentifier.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CoinID {
    return {
      symbol: isSet(object.symbol) ? String(object.symbol) : undefined,
      address: isSet(object.address) ? CoinID_AddressIdentifier.fromJSON(object.address) : undefined,
    };
  },

  toJSON(message: CoinID): unknown {
    const obj: any = {};
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.address !== undefined &&
      (obj.address = message.address ? CoinID_AddressIdentifier.toJSON(message.address) : undefined);
    return obj;
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
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinID_AddressIdentifier();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.chain = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CoinID_AddressIdentifier {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      chain: isSet(object.chain) ? String(object.chain) : "",
    };
  },

  toJSON(message: CoinID_AddressIdentifier): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.chain !== undefined && (obj.chain = message.chain);
    return obj;
  },

  fromPartial(object: DeepPartial<CoinID_AddressIdentifier>): CoinID_AddressIdentifier {
    const message = createBaseCoinID_AddressIdentifier();
    message.address = object.address ?? "";
    message.chain = object.chain ?? "";
    return message;
  },
};

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

  fromPartial(object: DeepPartial<GetPriceResponse>): GetPriceResponse {
    const message = createBaseGetPriceResponse();
    message.price = object.price ?? 0;
    message.timestamp = object.timestamp ?? undefined;
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
  },
} as const;

export interface PriceServiceImplementation<CallContextExt = {}> {
  getPrice(request: GetPriceRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetPriceResponse>>;
}

export interface PriceServiceClient<CallOptionsExt = {}> {
  getPrice(request: DeepPartial<GetPriceRequest>, options?: CallOptions & CallOptionsExt): Promise<GetPriceResponse>;
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
