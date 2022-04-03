import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing";
import {
  MsgBeginRedelegate,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from "lbmjs-types/lbm/staking/v1/tx";

export const stakingTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.staking.v1.MsgBeginRedelegate", MsgBeginRedelegate],
  ["/lbm.staking.v1.MsgCreateValidator", MsgCreateValidator],
  ["/lbm.staking.v1.MsgDelegate", MsgDelegate],
  ["/lbm.staking.v1.MsgEditValidator", MsgEditValidator],
  ["/lbm.staking.v1.MsgUndelegate", MsgUndelegate],
];

export interface MsgDelegateEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.staking.v1.MsgDelegate";
  readonly value: Partial<MsgDelegate>;
}

export function isMsgDelegateEncodeObject(object: EncodeObject): object is MsgDelegateEncodeObject {
  return (object as MsgDelegateEncodeObject).typeUrl === "/lbm.staking.v1.MsgDelegate";
}

export interface MsgUndelegateEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.staking.v1.MsgUndelegate";
  readonly value: Partial<MsgUndelegate>;
}

export function isMsgUndelegateEncodeObject(object: EncodeObject): object is MsgUndelegateEncodeObject {
  return (object as MsgUndelegateEncodeObject).typeUrl === "/lbm.staking.v1.MsgUndelegate";
}
