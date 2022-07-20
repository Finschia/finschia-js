/* eslint-disable @typescript-eslint/naming-convention */
import { assert, assertDefinedAndNotNull, isNonNullObject } from "@cosmjs/utils";
import { AminoMsg, Coin } from "@lbmjs/amino";
import { TextProposal, voteOptionFromJSON } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import Long from "long";

import { AminoConverters } from "../../aminotypes";

/** Supports submitting arbitrary proposal content. */
export interface AminoMsgSubmitProposal extends AminoMsg {
  readonly type: "cosmos-sdk/MsgSubmitProposal";
  readonly value: {
    /**
     * A proposal structure, e.g.
     *
     * ```
     * {
     *   type: 'cosmos-sdk/TextProposal',
     *   value: {
     *     description: 'This proposal proposes to test whether this proposal passes',
     *     title: 'Test Proposal'
     *   }
     * }
     * ```
     */
    readonly content: {
      readonly type: string;
      readonly value: any;
    };
    readonly initial_deposit: readonly Coin[];
    /** Bech32 account address */
    readonly proposer: string;
  };
}

export function isAminoMsgSubmitProposal(msg: AminoMsg): msg is AminoMsgSubmitProposal {
  return msg.type === "cosmos-sdk/MsgSubmitProposal";
}

/** Casts a vote */
export interface AminoMsgVote extends AminoMsg {
  readonly type: "cosmos-sdk/MsgVote";
  readonly value: {
    readonly proposal_id: string;
    /** Bech32 account address */
    readonly voter: string;
    /**
     * VoteOption as integer from 0 to 4 🤷‍
     *
     * @see https://github.com/cosmos/cosmos-sdk/blob/v0.42.9/x/gov/types/gov.pb.go#L38-L49
     */
    readonly option: number;
  };
}

export function isAminoMsgVote(msg: AminoMsg): msg is AminoMsgVote {
  return msg.type === "cosmos-sdk/MsgVote";
}

export interface WeightedVoteOption {
  /**
   * VoteOption as integer from 0 to 4 🤷‍
   *
   * @see https://github.com/cosmos/cosmos-sdk/blob/v0.42.9/x/gov/types/gov.pb.go#L38-L49
   */
  readonly option: number;
  readonly weight: string;
}

export interface AminoMsgVoteWeighted extends AminoMsg {
  readonly type: "cosmos-sdk/MsgVoteWeighted";
  readonly value: {
    readonly proposal_id: string;
    /** Bech32 account address */
    readonly voter: string;
    readonly options: readonly WeightedVoteOption[];
  };
}

export function isAminoMsgVoteWeighted(msg: AminoMsg): msg is AminoMsgVoteWeighted {
  return msg.type === "cosmos-sdk/MsgVoteWeighted";
}

/** Submits a deposit to an existing proposal */
export interface AminoMsgDeposit extends AminoMsg {
  readonly type: "cosmos-sdk/MsgDeposit";
  readonly value: {
    readonly proposal_id: string;
    /** Bech32 account address */
    readonly depositor: string;
    readonly amount: readonly Coin[];
  };
}

export function isAminoMsgDeposit(msg: AminoMsg): msg is AminoMsgDeposit {
  return msg.type === "cosmos-sdk/MsgDeposit";
}

export function createGovAminoConverters(): AminoConverters {
  return {
    "/cosmos.gov.v1beta1.MsgDeposit": {
      aminoType: "cosmos-sdk/MsgDeposit",
      toAmino: ({ amount, depositor, proposalId }: MsgDeposit): AminoMsgDeposit["value"] => {
        return {
          amount,
          depositor,
          proposal_id: proposalId.toString(),
        };
      },
      fromAmino: ({ amount, depositor, proposal_id }: AminoMsgDeposit["value"]): MsgDeposit => {
        return {
          amount: Array.from(amount),
          depositor,
          proposalId: Long.fromString(proposal_id),
        };
      },
    },
    "/cosmos.gov.v1beta1.MsgVote": {
      aminoType: "cosmos-sdk/MsgVote",
      toAmino: ({ option, proposalId, voter }: MsgVote): AminoMsgVote["value"] => {
        return {
          option: option,
          proposal_id: proposalId.toString(),
          voter: voter,
        };
      },
      fromAmino: ({ option, proposal_id, voter }: AminoMsgVote["value"]): MsgVote => {
        return {
          option: voteOptionFromJSON(option),
          proposalId: Long.fromString(proposal_id),
          voter: voter,
        };
      },
    },
    "/cosmos.gov.v1beta1.MsgSubmitProposal": {
      aminoType: "cosmos-sdk/MsgSubmitProposal",
      toAmino: ({
        initialDeposit,
        proposer,
        content,
      }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
        assertDefinedAndNotNull(content);
        let proposal: any;
        switch (content.typeUrl) {
          case "/cosmos.gov.v1beta1.TextProposal": {
            const textProposal = TextProposal.decode(content.value);
            proposal = {
              type: "cosmos-sdk/TextProposal",
              value: {
                description: textProposal.description,
                title: textProposal.title,
              },
            };
            break;
          }
          default:
            throw new Error(`Unsupported proposal type: '${content.typeUrl}'`);
        }
        return {
          initial_deposit: initialDeposit,
          proposer: proposer,
          content: proposal,
        };
      },
      fromAmino: ({
        initial_deposit,
        proposer,
        content,
      }: AminoMsgSubmitProposal["value"]): MsgSubmitProposal => {
        let any_content: Any;
        switch (content.type) {
          case "cosmos-sdk/TextProposal": {
            const { value } = content;
            assert(isNonNullObject(value));
            const { title, description } = value as any;
            assert(typeof title === "string");
            assert(typeof description === "string");
            any_content = Any.fromPartial({
              typeUrl: "/cosmos.gov.v1beta1.TextProposal",
              value: TextProposal.encode(
                TextProposal.fromPartial({
                  title: title,
                  description: description,
                }),
              ).finish(),
            });
            break;
          }
          default:
            throw new Error(`Unsupported proposal type: '${content.type}'`);
        }
        return {
          initialDeposit: Array.from(initial_deposit),
          proposer: proposer,
          content: any_content,
        };
      },
    },
  };
}
