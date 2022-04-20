import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing";
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "lbmjs-types/lbm/distribution/v1/tx";

export const distributionTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.distribution.v1.MsgFundCommunityPool", MsgFundCommunityPool],
  ["/lbm.distribution.v1.MsgSetWithdrawAddress", MsgSetWithdrawAddress],
  ["/lbm.distribution.v1.MsgWithdrawDelegatorReward", MsgWithdrawDelegatorReward],
  ["/lbm.distribution.v1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission],
];

export interface MsgWithdrawDelegatorRewardEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.distribution.v1.MsgWithdrawDelegatorReward";
  readonly value: Partial<MsgWithdrawDelegatorReward>;
}

export function isMsgWithdrawDelegatorRewardEncodeObject(
  object: EncodeObject,
): object is MsgWithdrawDelegatorRewardEncodeObject {
  return (
    (object as MsgWithdrawDelegatorRewardEncodeObject).typeUrl ===
    "/lbm.distribution.v1.MsgWithdrawDelegatorReward"
  );
}
