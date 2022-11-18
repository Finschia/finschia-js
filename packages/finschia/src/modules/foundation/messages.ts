import { Decimal } from "@cosmjs/math";
import { EncodeObject, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Duration } from "cosmjs-types/google/protobuf/duration";
import { ReceiveFromTreasuryAuthorization } from "lbmjs-types/lbm/foundation/v1/authz";
import {
  DecisionPolicyWindows,
  MemberRequest,
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
} from "lbmjs-types/lbm/foundation/v1/foundation";
import {
  Exec,
  MsgExec,
  MsgFundTreasury,
  MsgGovMint,
  MsgGrant,
  MsgLeaveFoundation,
  MsgRevoke,
  MsgSubmitProposal,
  MsgUpdateDecisionPolicy,
  MsgUpdateMembers,
  MsgUpdateParams,
  MsgVote,
  MsgWithdrawFromTreasury,
  MsgWithdrawProposal,
} from "lbmjs-types/lbm/foundation/v1/tx";

import { longify } from "../../utils";

export const foundationTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.foundation.v1.MsgUpdateParams", MsgUpdateParams],
  ["/lbm.foundation.v1.MsgFundTreasury", MsgFundTreasury],
  ["/lbm.foundation.v1.MsgWithdrawFromTreasury", MsgWithdrawFromTreasury],
  ["/lbm.foundation.v1.MsgUpdateMembers", MsgUpdateMembers],
  ["/lbm.foundation.v1.MsgUpdateDecisionPolicy", MsgUpdateDecisionPolicy],
  ["/lbm.foundation.v1.MsgSubmitProposal", MsgSubmitProposal],
  ["/lbm.foundation.v1.MsgWithdrawProposal", MsgWithdrawProposal],
  ["/lbm.foundation.v1.MsgVote", MsgVote],
  ["/lbm.foundation.v1.MsgExec", MsgExec],
  ["/lbm.foundation.v1.MsgLeaveFoundation", MsgLeaveFoundation],
  ["/lbm.foundation.v1.MsgGrant", MsgGrant],
  ["/lbm.foundation.v1.MsgRevoke", MsgRevoke],
  ["/lbm.foundation.v1.MsgGovMint", MsgGovMint],
  ["/lbm.foundation.v1.ReceiveFromTreasuryAuthorization", ReceiveFromTreasuryAuthorization],
  ["/lbm.foundation.v1.DecisionPolicyWindows", DecisionPolicyWindows],
  ["/lbm.foundation.v1.ThresholdDecisionPolicy", ThresholdDecisionPolicy],
  ["/lbm.foundation.v1.PercentageDecisionPolicy", PercentageDecisionPolicy],
];

export interface MsgUpdateParamsEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgUpdateParams";
  readonly value: Partial<MsgUpdateParams>;
}

export function isMsgUpdateParamsEncodeObject(object: EncodeObject): object is MsgUpdateParamsEncodeObject {
  return (object as MsgUpdateParamsEncodeObject).typeUrl === "/lbm.foundation.v1.MsgUpdateParams";
}

export interface MsgFundTreasuryEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgFundTreasury";
  readonly value: Partial<MsgFundTreasury>;
}

export function isMsgFundTreasuryEncodeObject(object: EncodeObject): object is MsgFundTreasuryEncodeObject {
  return (object as MsgFundTreasuryEncodeObject).typeUrl === "/lbm.foundation.v1.MsgFundTreasury";
}

export interface MsgWithdrawFromTreasuryEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury";
  readonly value: Partial<MsgWithdrawFromTreasury>;
}

export function isMsgWithdrawFromTreasuryEncodeObject(
  object: EncodeObject,
): object is MsgWithdrawFromTreasuryEncodeObject {
  return (
    (object as MsgWithdrawFromTreasuryEncodeObject).typeUrl === "/lbm.foundation.v1.MsgWithdrawFromTreasury"
  );
}

export interface MsgUpdateMembersEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgUpdateMembers";
  readonly value: Partial<MsgUpdateMembers>;
}

export function isMsgUpdateMembersEncodeObject(object: EncodeObject): object is MsgUpdateMembersEncodeObject {
  return (object as MsgUpdateMembersEncodeObject).typeUrl === "/lbm.foundation.v1.MsgUpdateMembers";
}

export interface MsgUpdateDecisionPolicyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgUpdateDecisionPolicy";
  readonly value: Partial<MsgUpdateDecisionPolicy>;
}

export function isMsgUpdateDecisionPolicyEncodeObject(
  object: EncodeObject,
): object is MsgUpdateDecisionPolicyEncodeObject {
  return (
    (object as MsgUpdateDecisionPolicyEncodeObject).typeUrl === "/lbm.foundation.v1.MsgUpdateDecisionPolicy"
  );
}

export interface MsgSubmitProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgSubmitProposal";
  readonly value: Partial<MsgSubmitProposal>;
}

export function isMsgSubmitProposalEncodeObject(
  object: EncodeObject,
): object is MsgSubmitProposalEncodeObject {
  return (object as MsgSubmitProposalEncodeObject).typeUrl === "/lbm.foundation.v1.MsgSubmitProposal";
}

export interface MsgWithdrawProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgWithdrawProposal";
  readonly value: Partial<MsgWithdrawProposal>;
}

export function isMsgWithdrawProposalEncodeObject(
  object: EncodeObject,
): object is MsgWithdrawProposalEncodeObject {
  return (object as MsgWithdrawProposalEncodeObject).typeUrl === "/lbm.foundation.v1.MsgWithdrawProposal";
}

export interface MsgVoteEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgVote";
  readonly value: Partial<MsgVote>;
}

export function isMsgVoteEncodeObject(object: EncodeObject): object is MsgVoteEncodeObject {
  return (object as MsgVoteEncodeObject).typeUrl === "/lbm.foundation.v1.MsgVote";
}

export interface MsgExecEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgExec";
  readonly value: Partial<MsgExec>;
}

export function isMsgExecEncodeObject(object: EncodeObject): object is MsgExecEncodeObject {
  return (object as MsgExecEncodeObject).typeUrl === "/lbm.foundation.v1.MsgExec";
}

export interface MsgLeaveFoundationEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgLeaveFoundation";
  readonly value: Partial<MsgLeaveFoundation>;
}

export function isMsgLeaveFoundationEncodeObject(
  object: EncodeObject,
): object is MsgLeaveFoundationEncodeObject {
  return (object as MsgLeaveFoundationEncodeObject).typeUrl === "/lbm.foundation.v1.MsgLeaveFoundation";
}

export interface MsgGrantEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgGrant";
  readonly value: Partial<MsgGrant>;
}

export function isMsgGrantEncodeObject(object: EncodeObject): object is MsgGrantEncodeObject {
  return (object as MsgGrantEncodeObject).typeUrl === "/lbm.foundation.v1.MsgGrant";
}

export interface MsgRevokeEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgRevoke";
  readonly value: Partial<MsgRevoke>;
}

export function isMsgRevokeEncodeObject(object: EncodeObject): object is MsgRevokeEncodeObject {
  return (object as MsgRevokeEncodeObject).typeUrl === "/lbm.foundation.v1.MsgRevoke";
}

export interface MsgGovMintEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.MsgGovMint";
  readonly value: Partial<MsgGovMint>;
}

export function isMsgGovMintEncodeObject(object: EncodeObject): object is MsgGovMintEncodeObject {
  return (object as MsgGovMintEncodeObject).typeUrl === "/lbm.foundation.v1.MsgGovMint";
}

export interface ThresholdDecisionPolicyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy";
  readonly value: ThresholdDecisionPolicy;
}

export function isThresholdDecisionPolicyEncodeObject(
  object: EncodeObject,
): object is ThresholdDecisionPolicyEncodeObject {
  return (
    (object as ThresholdDecisionPolicyEncodeObject).typeUrl === "/lbm.foundation.v1.ThresholdDecisionPolicy"
  );
}

export interface PercentageDecisionPolicyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy";
  readonly value: PercentageDecisionPolicy;
}

export function isPercentageDecisionPolicyEncodeObject(
  object: EncodeObject,
): object is PercentageDecisionPolicyEncodeObject {
  return (
    (object as PercentageDecisionPolicyEncodeObject).typeUrl === "/lbm.foundation.v1.PercentageDecisionPolicy"
  );
}

export function createMsgSubmitProposal(
  proposers: string[],
  messages: EncodeObject[],
  metadata = "",
  exec: Exec = Exec.EXEC_TRY,
): MsgSubmitProposalEncodeObject {
  const registry = new Registry(foundationTypes);
  const anyMessages = messages.map((message) => registry.encodeAsAny(message));
  return {
    typeUrl: "/lbm.foundation.v1.MsgSubmitProposal",
    value: {
      proposers: proposers,
      metadata: metadata,
      messages: anyMessages,
      exec: exec,
    },
  };
}

export function createMsgGrant(authority: string, grantee: string): MsgGrantEncodeObject {
  const registry = new Registry(foundationTypes);
  return {
    typeUrl: "/lbm.foundation.v1.MsgGrant",
    value: {
      authority: authority,
      grantee: grantee,
      authorization: registry.encodeAsAny({
        typeUrl: "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization",
        value: Uint8Array.from(ReceiveFromTreasuryAuthorization.encode({}).finish()),
      }),
    },
  };
}

export function createMsgRevoke(
  authority: string,
  grantee: string,
  msgTypeUrl: string,
): MsgRevokeEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgRevoke",
    value: {
      authority: authority,
      grantee: grantee,
      msgTypeUrl: msgTypeUrl,
    },
  };
}

export function createMsgWithdrawFromTreasury(
  authority: string,
  toAddress: string,
  amount: Coin[],
): MsgWithdrawFromTreasuryEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
    value: {
      authority: authority,
      to: toAddress,
      amount: amount,
    },
  };
}

export function createMsgUpdateMembers(
  authority: string,
  memberRequest: MemberRequest[],
): MsgUpdateMembersEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgUpdateMembers",
    value: {
      authority: authority,
      memberUpdates: memberRequest,
    },
  };
}

export function createMsgUpdateDecisionPolicy(
  authority: string,
  decisionPolicy: ThresholdDecisionPolicyEncodeObject | PercentageDecisionPolicyEncodeObject,
): MsgUpdateDecisionPolicyEncodeObject {
  const registry = new Registry(foundationTypes);
  return {
    typeUrl: "/lbm.foundation.v1.MsgUpdateDecisionPolicy",
    value: {
      authority: authority,
      decisionPolicy: registry.encodeAsAny(decisionPolicy),
    },
  };
}

export function createThresholdDecisionPolicy(
  threshold: string,
  votingPeriod = "86400",
  minExecutionPeriod = "0",
): ThresholdDecisionPolicyEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy",
    value: {
      threshold: Decimal.fromUserInput(threshold, 18).atomics,
      windows: {
        votingPeriod: Duration.fromPartial({ seconds: longify(votingPeriod) }),
        minExecutionPeriod: Duration.fromPartial({ seconds: longify(minExecutionPeriod) }),
      },
    },
  };
}

export function createPercentageDecisionPolicy(
  percentage: string,
  votingPeriod = "86400",
  minExecutionPeriod = "0",
): PercentageDecisionPolicyEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy",
    value: {
      percentage: Decimal.fromUserInput(percentage, 18).atomics,
      windows: {
        votingPeriod: Duration.fromPartial({ seconds: longify(votingPeriod) }),
        minExecutionPeriod: Duration.fromPartial({ seconds: longify(minExecutionPeriod) }),
      },
    },
  };
}
