import { EncodeObject } from "@lbmjs/proto-signing";
import { MsgTransfer } from "lbmjs-types/ibc/applications/transfer/v1/tx";
import { MsgSend } from "lbmjs-types/lbm/bank/v1/tx";
import { MsgWithdrawDelegatorReward } from "lbmjs-types/lbm/distribution/v1/tx";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "lbmjs-types/lbm/gov/v1/tx";
import { MsgDelegate, MsgUndelegate } from "lbmjs-types/lbm/staking/v1/tx";

export interface MsgSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.bank.v1.MsgSend";
  readonly value: Partial<MsgSend>;
}

export function isMsgSendEncodeObject(encodeObject: EncodeObject): encodeObject is MsgSendEncodeObject {
  return (encodeObject as MsgSendEncodeObject).typeUrl === "/lbm.bank.v1.MsgSend";
}

export interface MsgDelegateEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.staking.v1.MsgDelegate";
  readonly value: Partial<MsgDelegate>;
}

export function isMsgDelegateEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgDelegateEncodeObject {
  return (encodeObject as MsgDelegateEncodeObject).typeUrl === "/lbm.staking.v1.MsgDelegate";
}

export interface MsgUndelegateEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.staking.v1.MsgUndelegate";
  readonly value: Partial<MsgUndelegate>;
}

export function isMsgUndelegateEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgUndelegateEncodeObject {
  return (encodeObject as MsgUndelegateEncodeObject).typeUrl === "/lbm.staking.v1.MsgUndelegate";
}

export interface MsgWithdrawDelegatorRewardEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.distribution.v1.MsgWithdrawDelegatorReward";
  readonly value: Partial<MsgWithdrawDelegatorReward>;
}

export function isMsgWithdrawDelegatorRewardEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgWithdrawDelegatorRewardEncodeObject {
  return (
    (encodeObject as MsgWithdrawDelegatorRewardEncodeObject).typeUrl ===
    "/lbm.distribution.v1.MsgWithdrawDelegatorReward"
  );
}

export interface MsgTransferEncodeObject extends EncodeObject {
  readonly typeUrl: "/ibc.applications.transfer.v1.MsgTransfer";
  readonly value: Partial<MsgTransfer>;
}

export function isMsgTransferEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgTransferEncodeObject {
  return (encodeObject as MsgTransferEncodeObject).typeUrl === "/ibc.applications.transfer.v1.MsgTransfer";
}

export interface MsgDepositEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgDeposit";
  readonly value: Partial<MsgDeposit>;
}

export function isMsgDepositEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgSubmitProposalEncodeObject {
  return (encodeObject as MsgDepositEncodeObject).typeUrl === "/lbm.gov.v1.MsgDeposit";
}

export interface MsgSubmitProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgSubmitProposal";
  readonly value: Partial<MsgSubmitProposal>;
}

export function isMsgSubmitProposalEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgSubmitProposalEncodeObject {
  return (encodeObject as MsgSubmitProposalEncodeObject).typeUrl === "/lbm.gov.v1.MsgSubmitProposal";
}

export interface MsgVoteEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgVote";
  readonly value: Partial<MsgVote>;
}

export function isMsgVoteEncodeObject(encodeObject: EncodeObject): encodeObject is MsgVoteEncodeObject {
  return (encodeObject as MsgVoteEncodeObject).typeUrl === "/lbm.gov.v1.MsgVote";
}
