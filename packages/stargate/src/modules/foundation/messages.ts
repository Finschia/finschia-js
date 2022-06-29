import { Decimal } from "@cosmjs/math";
import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing/build";
import { Coin } from "lbmjs-types/cosmos/base/v1beta1/coin";
import { Duration } from "lbmjs-types/google/protobuf/duration";
import { ReceiveFromTreasuryAuthorization } from "lbmjs-types/lbm/foundation/v1/authz";
import {
  DecisionPolicyWindows,
  Member,
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
} from "lbmjs-types/lbm/foundation/v1/foundation";
import {
  Exec,
  MsgExec,
  MsgFundTreasury,
  MsgGrant,
  MsgLeaveFoundation,
  MsgRevoke,
  MsgSubmitProposal,
  MsgUpdateDecisionPolicy,
  MsgUpdateMembers,
  MsgVote,
  MsgWithdrawFromTreasury,
  MsgWithdrawProposal,
} from "lbmjs-types/lbm/foundation/v1/tx";

import { longify } from "../../queryclient";

export const foundationTypes: ReadonlyArray<[string, GeneratedType]> = [
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
  ["/lbm.foundation.v1.ReceiveFromTreasuryAuthorization", ReceiveFromTreasuryAuthorization],
  ["/lbm.foundation.v1.DecisionPolicyWindows", DecisionPolicyWindows],
  ["/lbm.foundation.v1.ThresholdDecisionPolicy", ThresholdDecisionPolicy],
  ["/lbm.foundation.v1.PercentageDecisionPolicy", PercentageDecisionPolicy],
];

export function createMsgSubmitProposal(
  proposers: string[],
  messages: EncodeObject[],
  metadata = "",
  exec: Exec = Exec.EXEC_TRY,
): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgSubmitProposal",
    value: {
      proposers: proposers,
      metadata: metadata,
      messages: messages,
      exec: exec,
    },
  };
}

export function createMsgGrant(operator: string, grantee: string): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgGrant",
    value: Uint8Array.from(
      MsgGrant.encode({
        operator: operator,
        grantee: grantee,
        authorization: {
          typeUrl: "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization",
          value: Uint8Array.from(ReceiveFromTreasuryAuthorization.encode({}).finish()),
        },
      }).finish(),
    ),
  };
}

export function createMsgRevoke(operator: string, grantee: string, msgTypeUrl: string): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgRevoke",
    value: Uint8Array.from(
      MsgRevoke.encode({
        operator: operator,
        grantee: grantee,
        msgTypeUrl: msgTypeUrl,
      }).finish(),
    ),
  };
}

export function createMsgWithdrawFromTreasury(
  operator: string,
  toAddress: string,
  amount: Coin[],
): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
    value: Uint8Array.from(
      MsgWithdrawFromTreasury.encode({
        operator: operator,
        to: toAddress,
        amount: amount,
      }).finish(),
    ),
  };
}

export function createMsgUpdateMembers(operator: string, members: Member[]): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgUpdateMembers",
    value: Uint8Array.from(
      MsgUpdateMembers.encode({
        operator: operator,
        memberUpdates: members,
      }).finish(),
    ),
  };
}

export function createMsgUpdateDecisionPolicy(
  operator: string,
  decisionPolicy: ThresholdDecisionPolicyEncodeObject | PercentageDecisionPolicyEncodeObject,
): EncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.MsgUpdateDecisionPolicy",
    value: Uint8Array.from(
      MsgUpdateDecisionPolicy.encode({
        operator: operator,
        decisionPolicy: decisionPolicy,
      }).finish(),
    ),
  };
}

export interface ThresholdDecisionPolicyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy";
  readonly value: Uint8Array;
}

export function isThresholdDecisionPolicyEncodeObject(
  object: EncodeObject,
): object is ThresholdDecisionPolicyEncodeObject {
  return (
    (object as ThresholdDecisionPolicyEncodeObject).typeUrl === "/lbm.foundation.v1.ThresholdDecisionPolicy"
  );
}

export function createThresholdDecisionPolicy(
  threshold: string,
  votingPeriod = "86400",
  minExecutionPeriod = "0",
): ThresholdDecisionPolicyEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy",
    value: Uint8Array.from(
      ThresholdDecisionPolicy.encode({
        threshold: Decimal.fromUserInput(threshold, 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify(votingPeriod) }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify(minExecutionPeriod) }),
        },
      }).finish(),
    ),
  };
}

export interface PercentageDecisionPolicyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy";
  readonly value: Uint8Array;
}

export function isPercentageDecisionPolicyEncodeObject(
  object: EncodeObject,
): object is PercentageDecisionPolicyEncodeObject {
  return (
    (object as PercentageDecisionPolicyEncodeObject).typeUrl === "/lbm.foundation.v1.PercentageDecisionPolicy"
  );
}

export function createPercentageDecisionPolicy(
  percentage: string,
  votingPeriod = "86400",
  minExecutionPeriod = "0",
): PercentageDecisionPolicyEncodeObject {
  return {
    typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy",
    value: Uint8Array.from(
      PercentageDecisionPolicy.encode({
        percentage: Decimal.fromUserInput(percentage, 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify(votingPeriod) }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify(minExecutionPeriod) }),
        },
      }).finish(),
    ),
  };
}
