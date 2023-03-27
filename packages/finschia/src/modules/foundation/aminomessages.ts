import { AminoMsg, Coin } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { AminoConverter, AminoConverters, AminoTypes } from "@cosmjs/stargate";
import { assertDefinedAndNotNull } from "@cosmjs/utils";
import { Any } from "lbmjs-types/google/protobuf/any";
import { ReceiveFromTreasuryAuthorization } from "lbmjs-types/lbm/foundation/v1/authz";
import {
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
  voteOptionFromJSON,
} from "lbmjs-types/lbm/foundation/v1/foundation";
import {
  Exec,
  execFromJSON,
  MsgExec,
  MsgFundTreasury,
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
import { CreateValidatorAuthorization } from "lbmjs-types/lbm/stakingplus/v1/authz";
import Long from "long";

import { createDefaultRegistry, createDefaultTypesWithoutFoundation } from "../../types";
import {
  jsonDecimalToProto,
  jsonDurationToProto,
  protoDecimalToJson,
  protoDurationToJson,
} from "../../utils";

interface Params {
  foundation_tax: string;
  censored_msg_type_urls: string[];
}

interface DecisionPolicyWindows {
  voting_period: string;
  min_execution_period: string;
}
interface MemberRequest {
  address: string;
  remove?: boolean;
  metadata?: string;
}

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
    readonly member_updates: MemberRequest[];
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
    readonly decision_policy: {
      readonly type: string;
      readonly value: any;
    };
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
    readonly metadata?: string;
    /** messages is a list of `sdk.Msg`s that will be executed if the proposal passes. */
    readonly messages: Array<{
      readonly type: string;
      readonly value: any;
    }>;
    /**
     * exec defines the mode of execution of the proposal,
     * whether it should be executed immediately on creation or not.
     * If so, proposers signatures are considered as Yes votes.
     */
    readonly exec?: number;
  };
}

export function isAminoMsgSubmitProposal(msg: AminoMsg): msg is AminoMsgSubmitProposal {
  return msg.type === "lbm-sdk/MsgSubmitProposal";
}

export interface AminoMsgWithdrawProposal extends AminoMsg {
  readonly type: "lbm-sdk/MsgWithdrawProposal";
  readonly value: {
    /** proposal is the unique ID of the proposal. */
    readonly proposal_id: string;
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
    readonly proposal_id: string;
    /** voter is the voter account address. */
    readonly voter: string;
    /** option is the voter's choice on the proposal. */
    readonly option: number;
    /** metadata is any arbitrary metadata to attached to the vote. */
    readonly metadata?: string;
    /**
     * exec defines whether the proposal should be executed
     * immediately after voting or not.
     */
    readonly exec?: number;
  };
}

export function isAminoMsgVote(msg: AminoMsg): msg is AminoMsgVote {
  return msg.type === "lbm-sdk/MsgVote";
}

export interface AminoMsgExec extends AminoMsg {
  readonly type: "lbm-sdk/MsgExec";
  readonly value: {
    /** proposal is the unique ID of the proposal. */
    readonly proposal_id: string;
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
    readonly authorization: {
      readonly type: string;
      readonly value: any;
    };
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
    readonly msg_type_url: string;
  };
}

export function isAminoMsgRevoke(msg: AminoMsg): msg is AminoMsgRevoke {
  return msg.type === "lbm-sdk/MsgRevoke";
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

export function createFoundationAminoConvertersWithoutSubmitProposal(): AminoConverters {
  return {
    "/lbm.foundation.v1.MsgUpdateParams": {
      aminoType: "lbm-sdk/MsgUpdateParams",
      toAmino: ({ authority, params }: MsgUpdateParams): AminoMsgUpdateParams["value"] => {
        assertDefinedAndNotNull(params);
        return {
          authority: authority,
          params: {
            foundation_tax: protoDecimalToJson(params.foundationTax),
            censored_msg_type_urls: params.censoredMsgTypeUrls,
          },
        };
      },
      fromAmino: ({ authority, params }: AminoMsgUpdateParams["value"]): MsgUpdateParams => {
        assertDefinedAndNotNull(params);
        return {
          authority: authority,
          params: {
            foundationTax: jsonDecimalToProto(params.foundation_tax),
            censoredMsgTypeUrls: params.censored_msg_type_urls,
          },
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
          amount: Array.from(amount),
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
          amount: Array.from(amount),
        };
      },
    },
    "/lbm.foundation.v1.MsgUpdateMembers": {
      aminoType: "lbm-sdk/MsgUpdateMembers",
      toAmino: ({ authority, memberUpdates }: MsgUpdateMembers): AminoMsgUpdateMembers["value"] => {
        return {
          authority: authority,
          member_updates: memberUpdates.map((memberUpdate) => {
            return {
              address: memberUpdate.address,
              remove: memberUpdate.remove ? memberUpdate.remove : undefined,
              metadata: memberUpdate.metadata ? memberUpdate.metadata : undefined,
            };
          }),
        };
      },
      fromAmino: ({ authority, member_updates }: AminoMsgUpdateMembers["value"]): MsgUpdateMembers => {
        return {
          authority: authority,
          memberUpdates: member_updates.map((memberUpdate) => {
            return {
              address: memberUpdate.address,
              remove: memberUpdate.remove ?? false,
              metadata: memberUpdate.metadata ?? "",
            };
          }),
        };
      },
    },
    "/lbm.foundation.v1.MsgUpdateDecisionPolicy": {
      aminoType: "lbm-sdk/MsgUpdateDecisionPolicy",
      toAmino: ({
        authority,
        decisionPolicy,
      }: MsgUpdateDecisionPolicy): AminoMsgUpdateDecisionPolicy["value"] => {
        assertDefinedAndNotNull(decisionPolicy);
        let anyDecisionPolicy: any;
        switch (decisionPolicy.typeUrl) {
          case "/lbm.foundation.v1.ThresholdDecisionPolicy": {
            const thresholdDecisionPolicy = ThresholdDecisionPolicy.decode(decisionPolicy.value);
            assertDefinedAndNotNull(thresholdDecisionPolicy);
            assertDefinedAndNotNull(thresholdDecisionPolicy.windows);
            assertDefinedAndNotNull(thresholdDecisionPolicy.windows.votingPeriod);
            assertDefinedAndNotNull(thresholdDecisionPolicy.windows.minExecutionPeriod);
            anyDecisionPolicy = {
              type: "lbm-sdk/ThresholdDecisionPolicy",
              value: {
                threshold: protoDecimalToJson(thresholdDecisionPolicy.threshold),
                windows: {
                  voting_period: protoDurationToJson(thresholdDecisionPolicy.windows.votingPeriod),
                  min_execution_period: protoDurationToJson(
                    thresholdDecisionPolicy.windows.minExecutionPeriod,
                  ),
                },
              },
            };
            break;
          }
          case "/lbm.foundation.v1.PercentageDecisionPolicy": {
            const percentageDecisionPolicy = PercentageDecisionPolicy.decode(decisionPolicy.value);
            assertDefinedAndNotNull(percentageDecisionPolicy);
            assertDefinedAndNotNull(percentageDecisionPolicy.windows);
            assertDefinedAndNotNull(percentageDecisionPolicy.windows.votingPeriod);
            assertDefinedAndNotNull(percentageDecisionPolicy.windows.minExecutionPeriod);
            anyDecisionPolicy = {
              type: "lbm-sdk/PercentageDecisionPolicy",
              value: {
                percentage: protoDecimalToJson(percentageDecisionPolicy.percentage),
                windows: {
                  voting_period: protoDurationToJson(percentageDecisionPolicy.windows.votingPeriod),
                  min_execution_period: protoDurationToJson(
                    percentageDecisionPolicy.windows.minExecutionPeriod,
                  ),
                },
              },
            };
            break;
          }
          default: {
            throw new Error(`Unsupported authorization type: '${decisionPolicy.typeUrl}'`);
          }
        }
        return {
          authority: authority,
          decision_policy: anyDecisionPolicy,
        };
      },
      fromAmino: ({
        authority,
        decision_policy,
      }: AminoMsgUpdateDecisionPolicy["value"]): MsgUpdateDecisionPolicy => {
        let anyDecisionPolicy: Any;
        switch (decision_policy.type) {
          case "lbm-sdk/ThresholdDecisionPolicy": {
            const decisionPolicy: ThresholdDecisionPolicy = {
              threshold: jsonDecimalToProto(decision_policy.value.threshold),
              windows: {
                votingPeriod: jsonDurationToProto(decision_policy.value.windows.voting_period),
                minExecutionPeriod: jsonDurationToProto(decision_policy.value.windows.min_execution_period),
              },
            };
            anyDecisionPolicy = Any.fromPartial({
              typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy",
              value: ThresholdDecisionPolicy.encode(decisionPolicy).finish(),
            });
            break;
          }
          case "lbm-sdk/PercentageDecisionPolicy": {
            const decisionPolicy: PercentageDecisionPolicy = {
              percentage: jsonDecimalToProto(decision_policy.value.percentage),
              windows: {
                votingPeriod: jsonDurationToProto(decision_policy.value.windows.voting_period),
                minExecutionPeriod: jsonDurationToProto(decision_policy.value.windows.min_execution_period),
              },
            };
            anyDecisionPolicy = Any.fromPartial({
              typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy",
              value: PercentageDecisionPolicy.encode(decisionPolicy).finish(),
            });
            break;
          }
          default:
            throw new Error(`Unsupported authorization type: '${decision_policy.type}'`);
        }
        return {
          authority: authority,
          decisionPolicy: anyDecisionPolicy,
        };
      },
    },
    "/lbm.foundation.v1.MsgWithdrawProposal": {
      aminoType: "lbm-sdk/MsgWithdrawProposal",
      toAmino: ({ proposalId, address }: MsgWithdrawProposal): AminoMsgWithdrawProposal["value"] => {
        return {
          proposal_id: proposalId.toString(),
          address: address,
        };
      },
      fromAmino: ({ proposal_id, address }: AminoMsgWithdrawProposal["value"]): MsgWithdrawProposal => {
        return {
          proposalId: Long.fromString(proposal_id),
          address: address,
        };
      },
    },
    "/lbm.foundation.v1.MsgVote": {
      aminoType: "lbm-sdk/MsgVote",
      toAmino: ({ proposalId, voter, option, metadata, exec }: MsgVote): AminoMsgVote["value"] => {
        return {
          proposal_id: proposalId.toString(),
          voter: voter,
          option: option,
          metadata: metadata ? metadata : undefined,
          exec: exec ? exec : undefined,
        };
      },
      fromAmino: ({ proposal_id, voter, option, metadata, exec }: AminoMsgVote["value"]): MsgVote => {
        return {
          proposalId: Long.fromString(proposal_id),
          voter: voter,
          option: voteOptionFromJSON(option),
          metadata: metadata ?? "",
          exec: exec ? execFromJSON(exec) : execFromJSON(0),
        };
      },
    },
    "/lbm.foundation.v1.MsgExec": {
      aminoType: "lbm-sdk/MsgExec",
      toAmino: ({ proposalId, signer }: MsgExec): AminoMsgExec["value"] => {
        return {
          proposal_id: proposalId.toString(),
          signer: signer,
        };
      },
      fromAmino: ({ proposal_id, signer }: AminoMsgExec["value"]): MsgExec => {
        return {
          proposalId: Long.fromString(proposal_id),
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
        assertDefinedAndNotNull(authorization);
        let anyAuthorization: any;
        switch (authorization.typeUrl) {
          case "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization": {
            anyAuthorization = {
              type: "lbm-sdk/ReceiveFromTreasuryAuthorization",
              value: {},
            };
            break;
          }
          case "/lbm.stakingplus.v1.CreateValidatorAuthorization": {
            const decoded = CreateValidatorAuthorization.decode(authorization.value);
            anyAuthorization = {
              type: "lbm-sdk/CreateValidatorAuthorization",
              value: {
                validator_address: decoded.validatorAddress,
              },
            };
            break;
          }
          default: {
            throw new Error(`Unsupported authorization type: '${authorization.typeUrl}'`);
          }
        }
        return {
          authority: authority,
          grantee: grantee,
          authorization: anyAuthorization,
        };
      },
      fromAmino: ({ authority, grantee, authorization }: AminoMsgGrant["value"]): MsgGrant => {
        let anyAuthorization: Any;
        switch (authorization.type) {
          case "lbm-sdk/ReceiveFromTreasuryAuthorization": {
            anyAuthorization = Any.fromPartial({
              typeUrl: "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization",
              value: ReceiveFromTreasuryAuthorization.encode(authorization.value).finish(),
            });
            break;
          }
          case "lbm-sdk/CreateValidatorAuthorization": {
            anyAuthorization = Any.fromPartial({
              typeUrl: "/lbm.stakingplus.v1.CreateValidatorAuthorization",
              value: CreateValidatorAuthorization.encode({
                validatorAddress: authorization.value.validator_address,
              }).finish(),
            });
            break;
          }
          default:
            throw new Error(`Unsupported authorization type: '${authorization.type}'`);
        }
        return {
          authority: authority,
          grantee: grantee,
          authorization: anyAuthorization,
        };
      },
    },
    "/lbm.foundation.v1.MsgRevoke": {
      aminoType: "lbm-sdk/MsgRevoke",
      toAmino: ({ authority, grantee, msgTypeUrl }: MsgRevoke): AminoMsgRevoke["value"] => {
        return {
          authority: authority,
          grantee: grantee,
          msg_type_url: msgTypeUrl,
        };
      },
      fromAmino: ({ authority, grantee, msg_type_url }: AminoMsgRevoke["value"]): MsgRevoke => {
        return {
          authority: authority,
          grantee: grantee,
          msgTypeUrl: msg_type_url,
        };
      },
    },
    "/lbm.foundation.v1.ThresholdDecisionPolicy": {
      aminoType: "lbm-sdk/ThresholdDecisionPolicy",
      toAmino: ({ threshold, windows }: ThresholdDecisionPolicy): AminoThresholdDecisionPolicy["value"] => {
        assertDefinedAndNotNull(windows);
        assertDefinedAndNotNull(windows.votingPeriod);
        assertDefinedAndNotNull(windows.minExecutionPeriod);
        return {
          threshold: protoDecimalToJson(threshold),
          windows: {
            voting_period: protoDurationToJson(windows.votingPeriod),
            min_execution_period: protoDurationToJson(windows.minExecutionPeriod),
          },
        };
      },
      fromAmino: ({ threshold, windows }: AminoThresholdDecisionPolicy["value"]): ThresholdDecisionPolicy => {
        assertDefinedAndNotNull(windows);
        assertDefinedAndNotNull(windows.voting_period);
        assertDefinedAndNotNull(windows.min_execution_period);
        return {
          threshold: jsonDecimalToProto(threshold),
          windows: {
            votingPeriod: jsonDurationToProto(windows.voting_period),
            minExecutionPeriod: jsonDurationToProto(windows.min_execution_period),
          },
        };
      },
    },
    "/lbm.foundation.v1.PercentageDecisionPolicy": {
      aminoType: "lbm-sdk/PercentageDecisionPolicy",
      toAmino: ({
        percentage,
        windows,
      }: PercentageDecisionPolicy): AminoPercentageDecisionPolicy["value"] => {
        assertDefinedAndNotNull(windows);
        assertDefinedAndNotNull(windows.votingPeriod);
        assertDefinedAndNotNull(windows.minExecutionPeriod);
        return {
          percentage: protoDecimalToJson(percentage),
          windows: {
            voting_period: protoDurationToJson(windows.votingPeriod),
            min_execution_period: protoDurationToJson(windows.minExecutionPeriod),
          },
        };
      },
      fromAmino: ({
        percentage,
        windows,
      }: AminoPercentageDecisionPolicy["value"]): PercentageDecisionPolicy => {
        assertDefinedAndNotNull(windows);
        assertDefinedAndNotNull(windows.voting_period);
        assertDefinedAndNotNull(windows.min_execution_period);
        return {
          percentage: jsonDecimalToProto(percentage),
          windows: {
            votingPeriod: jsonDurationToProto(windows.voting_period),
            minExecutionPeriod: jsonDurationToProto(windows.min_execution_period),
          },
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

function isAminoConverter(
  converter: [string, AminoConverter | "not_supported_by_chain"],
): converter is [string, AminoConverter] {
  return typeof converter[1] !== "string";
}

function createMsgSubmitProposalAminoConverter(): AminoConverters {
  const aminoConvertersWithoutSubmitProposal = createFoundationAminoConvertersWithoutSubmitProposal();
  const registry = createDefaultRegistry();
  const aminoTypes = new AminoTypes({
    ...createDefaultTypesWithoutFoundation(),
    ...aminoConvertersWithoutSubmitProposal,
  });
  return {
    "/lbm.foundation.v1.MsgSubmitProposal": {
      aminoType: "lbm-sdk/MsgSubmitProposal",
      toAmino: ({
        proposers,
        metadata,
        messages,
        exec,
      }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
        const decodedMessages = messages.map((message) => {
          const encodeObject: EncodeObject = {
            typeUrl: message.typeUrl,
            value: registry.decode(message),
          };
          return aminoTypes.toAmino(encodeObject);
        });
        return {
          proposers: proposers,
          metadata: metadata ? metadata : undefined,
          messages: decodedMessages,
          exec: exec ? exec : undefined,
        };
      },
      fromAmino: ({
        proposers,
        metadata,
        messages,
        exec,
      }: AminoMsgSubmitProposal["value"]): MsgSubmitProposal => {
        const encodedMessages: Any[] = messages.map((message: AminoMsg) => {
          const matches = Object.entries(aminoConvertersWithoutSubmitProposal)
            .filter(isAminoConverter)
            .filter(([_typeUrl, { aminoType }]) => aminoType === message.type);
          if (matches.length === 0) {
            throw new Error(
              `Amino type identifier '${message.type}' does not exist in the Amino message type register. `,
            );
          }
          return {
            typeUrl: matches[0][0],
            value: registry.encode(aminoTypes.fromAmino(message)),
          };
        });
        return {
          proposers: proposers,
          metadata: metadata ?? "",
          messages: encodedMessages,
          exec: exec ? execFromJSON(exec) : Exec.EXEC_UNSPECIFIED,
        };
      },
    },
  };
}

export function createFoundationAminoConverters(): AminoConverters {
  return {
    ...createFoundationAminoConvertersWithoutSubmitProposal(),
    ...createMsgSubmitProposalAminoConverter(),
  };
}
