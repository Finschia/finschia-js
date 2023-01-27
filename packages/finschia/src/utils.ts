import { Decimal, Uint64 } from "@cosmjs/math";
import { Duration } from "cosmjs-types/google/protobuf/duration";
import Long from "long";

export function longify(value: string | number | Long | Uint64): Long {
  const checkedValue = Uint64.fromString(value.toString());
  return Long.fromBytesBE([...checkedValue.toBytesBigEndian()], true);
}

export function protoDecimalToJson(decimal: string): string {
  const parsed = Decimal.fromAtomics(decimal, 18);
  const [whole, fractional] = parsed.toString().split(".");
  return `${whole}.${(fractional ?? "").padEnd(18, "0")}`;
}

export function jsonDecimalToProto(decimal: string): string {
  const parsed = Decimal.fromUserInput(decimal, 18);
  return parsed.atomics;
}

export function protoDurationToJson(duration: Duration): string {
  const nanoStr = duration.nanos.toString().padStart(9, "0");
  const secondStr = duration.seconds.toString();
  const durationString = secondStr + nanoStr;
  const durationLong = Long.fromString(durationString);
  return durationLong.toString();
}

export function jsonDurationToProto(duration: string): Duration {
  const nanoStr = duration.length > 9 ? duration.slice(duration.length - 9) : duration;
  const secondStr = duration.length > 9 ? duration.slice(0, duration.length - 9) : "0";
  return {
    seconds: Long.fromString(secondStr, true),
    nanos: parseInt(nanoStr, 10),
  };
}
