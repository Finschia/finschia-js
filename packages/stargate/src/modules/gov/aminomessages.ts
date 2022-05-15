/* eslint-disable @typescript-eslint/naming-convention */
import { assert, assertDefinedAndNotNull, isNonNullObject } from "@cosmjs/utils";
import { AminoMsg, Coin } from "@lbmjs/amino";
import { Any } from "lbmjs-types/google/protobuf/any";
import { TextProposal, voteOptionFromJSON } from "lbmjs-types/lbm/gov/v1/gov";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "lbmjs-types/lbm/gov/v1/tx";
import Long from "long";

import { AminoConverters } from "../../aminotypes";

/** Supports submitting arbitrary proposal content. */
export interface AminoMsgSubmitProposal extends AminoMsg {
  readonly type: "lbm-sdk/MsgSubmitProposal";
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
  return msg.type === "lbm-sdk/MsgSubmitProposal";
}

/** Casts a vote */
export interface AminoMsgVote extends AminoMsg {
  readonly type: "lbm-sdk/MsgVote";
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
  return msg.type === "lbm-sdk/MsgVote";
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
  readonly type: "lbm-sdk/MsgVoteWeighted";
  readonly value: {
    readonly proposal_id: string;
    /** Bech32 account address */
    readonly voter: string;
    readonly options: readonly WeightedVoteOption[];
  };
}

export function isAminoMsgVoteWeighted(msg: AminoMsg): msg is AminoMsgVoteWeighted {
  return msg.type === "lbm-sdk/MsgVoteWeighted";
}

/** Submits a deposit to an existing proposal */
export interface AminoMsgDeposit extends AminoMsg {
  readonly type: "lbm-sdk/MsgDeposit";
  readonly value: {
    readonly proposal_id: string;
    /** Bech32 account address */
    readonly depositor: string;
    readonly amount: readonly Coin[];
  };
}

export function isAminoMsgDeposit(msg: AminoMsg): msg is AminoMsgDeposit {
  return msg.type === "lbm-sdk/MsgDeposit";
}

export function createGovAminoConverters(): AminoConverters {
  return {
    "/lbm.gov.v1.MsgDeposit": {
      aminoType: "lbm-sdk/MsgDeposit",
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
    "/lbm.gov.v1.MsgVote": {
      aminoType: "lbm-sdk/MsgVote",
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
    "/lbm.gov.v1.MsgSubmitProposal": {
      aminoType: "lbm-sdk/MsgSubmitProposal",
      toAmino: ({
        initialDeposit,
        proposer,
        content,
      }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
        assertDefinedAndNotNull(content);
        let proposal: any;
        switch (content.typeUrl) {
          case "/lbm.gov.v1.TextProposal": {
            const textProposal = TextProposal.decode(content.value);
            proposal = {
              type: "lbm-sdk/TextProposal",
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
          case "lbm-sdk/TextProposal": {
            const { value } = content;
            assert(isNonNullObject(value));
            const { title, description } = value as any;
            assert(typeof title === "string");
            assert(typeof description === "string");
            any_content = Any.fromPartial({
              typeUrl: "/lbm.gov.v1.TextProposal",
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
