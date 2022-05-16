import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing";
import { MsgDeposit, MsgSubmitProposal, MsgVote, MsgVoteWeighted } from "lbmjs-types/lbm/gov/v1/tx";

export const govTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.gov.v1.MsgDeposit", MsgDeposit],
  ["/lbm.gov.v1.MsgSubmitProposal", MsgSubmitProposal],
  ["/lbm.gov.v1.MsgVote", MsgVote],
  ["/lbm.gov.v1.MsgVoteWeighted", MsgVoteWeighted],
];

export interface MsgDepositEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgDeposit";
  readonly value: Partial<MsgDeposit>;
}

export function isMsgDepositEncodeObject(object: EncodeObject): object is MsgSubmitProposalEncodeObject {
  return (object as MsgDepositEncodeObject).typeUrl === "/lbm.gov.v1.MsgDeposit";
}

export interface MsgSubmitProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgSubmitProposal";
  readonly value: Partial<MsgSubmitProposal>;
}

export function isMsgSubmitProposalEncodeObject(
  object: EncodeObject,
): object is MsgSubmitProposalEncodeObject {
  return (object as MsgSubmitProposalEncodeObject).typeUrl === "/lbm.gov.v1.MsgSubmitProposal";
}

export interface MsgVoteEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgVote";
  readonly value: Partial<MsgVote>;
}

export function isMsgVoteEncodeObject(object: EncodeObject): object is MsgVoteEncodeObject {
  return (object as MsgVoteEncodeObject).typeUrl === "/lbm.gov.v1.MsgVote";
}

export interface MsgVoteWeightedEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.gov.v1.MsgVoteWeighted";
  readonly value: Partial<MsgVoteWeighted>;
}

export function isMsgVoteWeightedEncodeObject(object: EncodeObject): object is MsgVoteWeightedEncodeObject {
  return (object as MsgVoteWeightedEncodeObject).typeUrl === "/lbm.gov.v1.MsgVoteWeighted";
}
