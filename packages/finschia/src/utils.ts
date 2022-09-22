import { Uint64 } from "@cosmjs/math";
import Long from "long";

export function longify(value: string | number | Long | Uint64): Long {
  const checkedValue = Uint64.fromString(value.toString());
  return Long.fromBytesBE([...checkedValue.toBytesBigEndian()], true);
}
