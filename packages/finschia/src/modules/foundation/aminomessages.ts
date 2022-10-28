import { AminoMsg, Coin } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { assertDefinedAndNotNull } from "@cosmjs/utils";
import { Any } from "lbmjs-types/google/protobuf/any";
import { ReceiveFromTreasuryAuthorization } from "lbmjs-types/lbm/foundation/v1/authz";
import {
  DecisionPolicyWindows,
  MemberRequest,
  Params,
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
  VoteOption,
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

export interface AminoMsgUpdateParams extends AminoMsg {
  readonly type: "lbm-sdk/MsgUpdateParams";
  readonly value: {
    /** authority is the address of the privileged account. */
    readonly authority: string;
    /**
     * params defines the x/foundation parameters to update.
     *
     * NOTE: All parameters must be supplied.
     */
    readonly params?: Params;
  };
}

export function isAminoMsgUpdateParams(msg: AminoMsg): msg is AminoMsgUpdateParams {
  return msg.type === "lbm-sdk/MsgUpdateParams";
}

export interface AminoMsgFundTreasury extends AminoMsg {
  readonly type: "lbm-sdk/MsgFundTreasury";
  readonly value: {
    readonly from: string;
    readonly amount: Coin[];
  };
}

export function isAminoMsgFundTreasurys(msg: AminoMsg): msg is AminoMsgFundTreasury {
  return msg.type === "lbm-sdk/MsgFundTreasury";
}

export interface AminoMsgWithdrawFromTreasury extends AminoMsg {
  readonly type: "lbm-sdk/MsgWithdrawFromTreasury";
  readonly value: {
    readonly authority: string;
    readonly to: string;
    readonly amount: Coin[];
  };
}

export function isAminoMsgWithdrawFromTreasury(msg: AminoMsg): msg is AminoMsgWithdrawFromTreasury {
  return msg.type === "lbm-sdk/MsgWithdrawFromTreasury";
}

export interface AminoMsgUpdateMembers extends AminoMsg {
  readonly type: "lbm-sdk/MsgUpdateMembers";
  readonly value: {
    readonly authority: string;
    readonly memberUpdates: MemberRequest[];
  };
}

export function isAminoMsgUpdateMembers(msg: AminoMsg): msg is AminoMsgUpdateMembers {
  return msg.type === "lbm-sdk/MsgUpdateMembers";
}

export interface AminoMsgUpdateDecisionPolicy extends AminoMsg {
  readonly type: "lbm-sdk/MsgUpdateDecisionPolicy";
  readonly value: {
    /** authority is the address of the privileged account. */
    readonly authority: string;
    /** decision_policy is the updated decision policy. */
    readonly decisionPolicy?: Any;
  };
}

export function isAminoMsgUpdateDecisionPolicy(msg: AminoMsg): msg is AminoMsgUpdateDecisionPolicy {
  return msg.type === "lbm-sdk/MsgUpdateDecisionPolicy";
}

export interface AminoMsgSubmitProposal extends AminoMsg {
  readonly type: "lbm-sdk/MsgSubmitProposal";
  readonly value: {
    /**
     * proposers are the account addresses of the proposers.
     * Proposers signatures will be counted as yes votes.
     */
    readonly proposers: string[];
    /** metadata is any arbitrary metadata to attached to the proposal. */
    readonly metadata: string;
    /** messages is a list of `sdk.Msg`s that will be executed if the proposal passes. */
    readonly messages: Any[];
    /**
     * exec defines the mode of execution of the proposal,
     * whether it should be executed immediately on creation or not.
     * If so, proposers signatures are considered as Yes votes.
     */
    readonly exec: Exec;
  };
}

export function isAminoMsgSubmitProposal(msg: AminoMsg): msg is AminoMsgSubmitProposal {
  return msg.type === "lbm-sdk/MsgSubmitProposal";
}

export interface AminoMsgWithdrawProposal extends AminoMsg {
  readonly type: "lbm-sdk/MsgWithdrawProposal";
  readonly value: {
    /** proposal is the unique ID of the proposal. */
    readonly proposalId: Long;
    /** address of one of the proposer of the proposal. */
    readonly address: string;
  };
}

export function isAminoMsgWithdrawProposal(msg: AminoMsg): msg is AminoMsgWithdrawProposal {
  return msg.type === "lbm-sdk/MsgWithdrawProposal";
}

export interface AminoMsgVote extends AminoMsg {
  readonly type: "lbm-sdk/MsgVote";
  readonly value: {
    /** proposal is the unique ID of the proposal. */
    readonly proposalId: Long;
    /** voter is the voter account address. */
    readonly voter: string;
    /** option is the voter's choice on the proposal. */
    readonly option: VoteOption;
    /** metadata is any arbitrary metadata to attached to the vote. */
    readonly metadata: string;
    /**
     * exec defines whether the proposal should be executed
     * immediately after voting or not.
     */
    readonly exec: Exec;
  };
}

export function isAminoMsgVote(msg: AminoMsg): msg is AminoMsgVote {
  return msg.type === "lbm-sdk/MsgVote";
}

export interface AminoMsgExec extends AminoMsg {
  readonly type: "lbm-sdk/MsgExec";
  readonly value: {
    /** proposal is the unique ID of the proposal. */
    readonly proposalId: Long;
    /** signer is the account address used to execute the proposal. */
    readonly signer: string;
  };
}

export function isAminoMsgExec(msg: AminoMsg): msg is AminoMsgExec {
  return msg.type === "lbm-sdk/MsgExec";
}

export interface AminoMsgLeaveFoundation extends AminoMsg {
  readonly type: "lbm-sdk/MsgLeaveFoundation";
  readonly value: {
    /** address is the account address of the foundation member. */
    readonly address: string;
  };
}

export function isAminoMsgLeaveFoundation(msg: AminoMsg): msg is AminoMsgLeaveFoundation {
  return msg.type === "lbm-sdk/MsgLeaveFoundation";
}

export interface AminoMsgGrant extends AminoMsg {
  readonly type: "lbm-sdk/MsgGrant";
  readonly value: {
    /** authority is the address of the privileged account. */
    readonly authority: string;
    readonly grantee: string;
    readonly authorization?: Any;
  };
}

export function isAminoMsgGrant(msg: AminoMsg): msg is AminoMsgGrant {
  return msg.type === "lbm-sdk/MsgGrant";
}

export interface AminoMsgRevoke extends AminoMsg {
  readonly type: "lbm-sdk/MsgRevoke";
  readonly value: {
    /** authority is the address of the privileged account. */
    readonly authority: string;
    readonly grantee: string;
    readonly msgTypeUrl: string;
  };
}

export function isAminoMsgRevoke(msg: AminoMsg): msg is AminoMsgRevoke {
  return msg.type === "lbm-sdk/MsgRevoke";
}

export interface AminoMsgGovMint extends AminoMsg {
  readonly type: "lbm-sdk/MsgGovMint";
  readonly value: {
    /** authority is the address of the privileged account. */
    readonly authority: string;
    readonly amount: Coin[];
  };
}

export function isAminoMsgGovMint(msg: AminoMsg): msg is AminoMsgGovMint {
  return msg.type === "lbm-sdk/MsgGovMint";
}

export interface AminoThresholdDecisionPolicy extends AminoMsg {
  readonly type: "lbm-sdk/ThresholdDecisionPolicy";
  readonly value: {
    /** threshold is the minimum sum of yes votes that must be met or exceeded for a proposal to succeed. */
    readonly threshold: string;
    /** windows defines the different windows for voting and execution. */
    readonly windows?: DecisionPolicyWindows;
  };
}

export function isAminoThresholdDecisionPolicy(msg: AminoMsg): msg is AminoThresholdDecisionPolicy {
  return msg.type === "lbm-sdk/ThresholdDecisionPolicy";
}
export interface AminoPercentageDecisionPolicy extends AminoMsg {
  readonly type: "lbm-sdk/PercentageDecisionPolicy";
  readonly value: {
    /** percentage is the minimum percentage the sum of yes votes must meet for a proposal to succeed. */
    readonly percentage: string;
    /** windows defines the different windows for voting and execution. */
    readonly windows?: DecisionPolicyWindows;
  };
}

export function isAminoPercentageDecisionPolicy(msg: AminoMsg): msg is AminoPercentageDecisionPolicy {
  return msg.type === "lbm-sdk/PercentageDecisionPolicy";
}

export interface AminoReceiveFromTreasuryAuthorization extends AminoMsg {
  readonly type: "lbm-sdk/ReceiveFromTreasuryAuthorization";
  readonly value: {};
}

export function isAminoReceiveFromTreasuryAuthorization(
  msg: AminoMsg,
): msg is AminoReceiveFromTreasuryAuthorization {
  return msg.type === "lbm-sdk/ReceiveFromTreasuryAuthorization";
}

export function createFoundationAminoConverters(): AminoConverters {
  return {
    "/lbm.foundation.v1.MsgUpdateParams": {
      aminoType: "lbm-sdk/MsgUpdateParams",
      toAmino: ({ authority, params }: MsgUpdateParams): AminoMsgUpdateParams["value"] => {
        assertDefinedAndNotNull(params);
        return {
          authority: authority,
          params: params,
        };
      },
      fromAmino: ({ authority, params }: AminoMsgUpdateParams["value"]): MsgUpdateParams => {
        return {
          authority: authority,
          params: params,
        };
      },
    },
    "/lbm.foundation.v1.MsgFundTreasury": {
      aminoType: "lbm-sdk/MsgFundTreasury",
      toAmino: ({ from, amount }: MsgFundTreasury): AminoMsgFundTreasury["value"] => {
        return {
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ from, amount }: AminoMsgFundTreasury["value"]): MsgFundTreasury => {
        return {
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.MsgWithdrawFromTreasury": {
      aminoType: "lbm-sdk/MsgWithdrawFromTreasury",
      toAmino: ({
        authority,
        to,
        amount,
      }: MsgWithdrawFromTreasury): AminoMsgWithdrawFromTreasury["value"] => {
        return {
          authority: authority,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        authority,
        to,
        amount,
      }: AminoMsgWithdrawFromTreasury["value"]): MsgWithdrawFromTreasury => {
        return {
          authority: authority,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.MsgUpdateMembers": {
      aminoType: "lbm-sdk/MsgUpdateMembers",
      toAmino: ({ authority, memberUpdates }: MsgUpdateMembers): AminoMsgUpdateMembers["value"] => {
        return {
          authority: authority,
          memberUpdates: memberUpdates,
        };
      },
      fromAmino: ({ authority, memberUpdates }: AminoMsgUpdateMembers["value"]): MsgUpdateMembers => {
        return {
          authority: authority,
          memberUpdates: memberUpdates,
        };
      },
    },
    "/lbm.foundation.v1.MsgUpdateDecisionPolicy": {
      aminoType: "lbm-sdk/MsgUpdateDecisionPolicy",
      toAmino: ({
        authority,
        decisionPolicy,
      }: MsgUpdateDecisionPolicy): AminoMsgUpdateDecisionPolicy["value"] => {
        return {
          authority: authority,
          decisionPolicy: decisionPolicy,
        };
      },
      fromAmino: ({
        authority,
        decisionPolicy,
      }: AminoMsgUpdateDecisionPolicy["value"]): MsgUpdateDecisionPolicy => {
        return {
          authority: authority,
          decisionPolicy: decisionPolicy,
        };
      },
    },
    "/lbm.foundation.v1.MsgSubmitProposal": {
      aminoType: "lbm-sdk/MsgSubmitProposal",
      toAmino: ({
        proposers,
        metadata,
        messages,
        exec,
      }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
        return {
          proposers: proposers,
          metadata: metadata,
          messages: messages,
          exec: exec,
        };
      },
      fromAmino: ({
        proposers,
        metadata,
        messages,
        exec,
      }: AminoMsgSubmitProposal["value"]): MsgSubmitProposal => {
        return {
          proposers: proposers,
          metadata: metadata,
          messages: messages,
          exec: exec,
        };
      },
    },
    "/lbm.foundation.v1.MsgWithdrawProposal": {
      aminoType: "lbm-sdk/MsgWithdrawProposal",
      toAmino: ({ proposalId, address }: MsgWithdrawProposal): AminoMsgWithdrawProposal["value"] => {
        return {
          proposalId: proposalId,
          address: address,
        };
      },
      fromAmino: ({ proposalId, address }: AminoMsgWithdrawProposal["value"]): MsgWithdrawProposal => {
        return {
          proposalId: proposalId,
          address: address,
        };
      },
    },
    "/lbm.foundation.v1.MsgVote": {
      aminoType: "lbm-sdk/MsgVote",
      toAmino: ({ proposalId, voter, option, metadata, exec }: MsgVote): AminoMsgVote["value"] => {
        return {
          proposalId: proposalId,
          voter: voter,
          option: option,
          metadata: metadata,
          exec: exec,
        };
      },
      fromAmino: ({ proposalId, voter, option, metadata, exec }: AminoMsgVote["value"]): MsgVote => {
        return {
          proposalId: proposalId,
          voter: voter,
          option: option,
          metadata: metadata,
          exec: exec,
        };
      },
    },
    "/lbm.foundation.v1.MsgExec": {
      aminoType: "lbm-sdk/MsgExec",
      toAmino: ({ proposalId, signer }: MsgExec): AminoMsgExec["value"] => {
        return {
          proposalId: proposalId,
          signer: signer,
        };
      },
      fromAmino: ({ proposalId, signer }: AminoMsgExec["value"]): MsgExec => {
        return {
          proposalId: proposalId,
          signer: signer,
        };
      },
    },
    "/lbm.foundation.v1.MsgLeaveFoundation": {
      aminoType: "lbm-sdk/MsgLeaveFoundation",
      toAmino: ({ address }: MsgLeaveFoundation): AminoMsgLeaveFoundation["value"] => {
        return {
          address: address,
        };
      },
      fromAmino: ({ address }: AminoMsgLeaveFoundation["value"]): MsgLeaveFoundation => {
        return {
          address: address,
        };
      },
    },
    "/lbm.foundation.v1.MsgGrant": {
      aminoType: "lbm-sdk/MsgGrant",
      toAmino: ({ authority, grantee, authorization }: MsgGrant): AminoMsgGrant["value"] => {
        return {
          authority: authority,
          grantee: grantee,
          authorization: authorization,
        };
      },
      fromAmino: ({ authority, grantee, authorization }: AminoMsgGrant["value"]): MsgGrant => {
        return {
          authority: authority,
          grantee: grantee,
          authorization: authorization,
        };
      },
    },
    "/lbm.foundation.v1.MsgRevoke": {
      aminoType: "lbm-sdk/MsgRevoke",
      toAmino: ({ authority, grantee, msgTypeUrl }: MsgRevoke): AminoMsgRevoke["value"] => {
        return {
          authority: authority,
          grantee: grantee,
          msgTypeUrl: msgTypeUrl,
        };
      },
      fromAmino: ({ authority, grantee, msgTypeUrl }: AminoMsgRevoke["value"]): MsgRevoke => {
        return {
          authority: authority,
          grantee: grantee,
          msgTypeUrl: msgTypeUrl,
        };
      },
    },
    "/lbm.foundation.v1.MsgGovMint": {
      aminoType: "lbm-sdk/MsgGovMint",
      toAmino: ({ authority, amount }: MsgGovMint): AminoMsgGovMint["value"] => {
        return {
          authority: authority,
          amount: amount,
        };
      },
      fromAmino: ({ authority, amount }: AminoMsgGovMint["value"]): MsgGovMint => {
        return {
          authority: authority,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.ThresholdDecisionPolicy": {
      aminoType: "lbm-sdk/ThresholdDecisionPolicy",
      toAmino: ({ threshold, windows }: ThresholdDecisionPolicy): AminoThresholdDecisionPolicy["value"] => {
        return {
          threshold: threshold,
          windows: windows,
        };
      },
      fromAmino: ({ threshold, windows }: AminoThresholdDecisionPolicy["value"]): ThresholdDecisionPolicy => {
        return {
          threshold: threshold,
          windows: windows,
        };
      },
    },
    "/lbm.foundation.v1.PercentageDecisionPolicy": {
      aminoType: "lbm-sdk/PercentageDecisionPolicy",
      toAmino: ({
        percentage,
        windows,
      }: PercentageDecisionPolicy): AminoPercentageDecisionPolicy["value"] => {
        return {
          percentage: percentage,
          windows: windows,
        };
      },
      fromAmino: ({
        percentage,
        windows,
      }: AminoPercentageDecisionPolicy["value"]): PercentageDecisionPolicy => {
        return {
          percentage: percentage,
          windows: windows,
        };
      },
    },
    "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization": {
      aminoType: "lbm-sdk/ReceiveFromTreasuryAuthorization",
      // eslint-disable-next-line no-empty-pattern
      toAmino: ({}: ReceiveFromTreasuryAuthorization): AminoReceiveFromTreasuryAuthorization["value"] => {
        return {};
      },
      // eslint-disable-next-line no-empty-pattern
      fromAmino: ({}: AminoReceiveFromTreasuryAuthorization["value"]): ReceiveFromTreasuryAuthorization => {
        return {};
      },
    },
  };
}
