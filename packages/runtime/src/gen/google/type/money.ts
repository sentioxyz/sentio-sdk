/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";

export interface Money {
  currencyCode: string;
  units: bigint;
  nanos: number;
}

function createBaseMoney(): Money {
  return { currencyCode: "", units: BigInt("0"), nanos: 0 };
}

export const Money = {
  encode(message: Money, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.currencyCode !== "") {
      writer.uint32(10).string(message.currencyCode);
    }
    if (message.units !== BigInt("0")) {
      if (BigInt.asIntN(64, message.units) !== message.units) {
        throw new globalThis.Error("value provided for field message.units of type int64 too large");
      }
      writer.uint32(16).int64(message.units.toString());
    }
    if (message.nanos !== 0) {
      writer.uint32(24).int32(message.nanos);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Money {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMoney();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.currencyCode = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.units = longToBigint(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.nanos = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Money {
    return {
      currencyCode: isSet(object.currencyCode) ? globalThis.String(object.currencyCode) : "",
      units: isSet(object.units) ? BigInt(object.units) : BigInt("0"),
      nanos: isSet(object.nanos) ? globalThis.Number(object.nanos) : 0,
    };
  },

  toJSON(message: Money): unknown {
    const obj: any = {};
    if (message.currencyCode !== "") {
      obj.currencyCode = message.currencyCode;
    }
    if (message.units !== BigInt("0")) {
      obj.units = message.units.toString();
    }
    if (message.nanos !== 0) {
      obj.nanos = Math.round(message.nanos);
    }
    return obj;
  },

  create(base?: DeepPartial<Money>): Money {
    return Money.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Money>): Money {
    const message = createBaseMoney();
    message.currencyCode = object.currencyCode ?? "";
    message.units = object.units ?? BigInt("0");
    message.nanos = object.nanos ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | bigint | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
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
