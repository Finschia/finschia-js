/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { assert, assertDefinedAndNotNull, isNonNullObject } from "@cosmjs/utils";
import { AminoMsg, decodeBech32Pubkey, encodeBech32Pubkey } from "@lbmjs/amino";
import { EncodeObject } from "@lbmjs/proto-signing";
import { Any } from "lbmjs-types/google/protobuf/any";
import { MsgTransfer } from "lbmjs-types/ibc/applications/transfer/v1/tx";
import { MsgMultiSend, MsgSend } from "lbmjs-types/lbm/bank/v1/tx";
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "lbmjs-types/lbm/distribution/v1/tx";
import { TextProposal, voteOptionFromJSON } from "lbmjs-types/lbm/gov/v1/gov";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "lbmjs-types/lbm/gov/v1/tx";
import {
  MsgBeginRedelegate,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from "lbmjs-types/lbm/staking/v1/tx";
import Long from "long";

import {
  AminoMsgBeginRedelegate,
  AminoMsgCreateValidator,
  AminoMsgDelegate,
  AminoMsgDeposit,
  AminoMsgEditValidator,
  AminoMsgFundCommunityPool,
  AminoMsgMultiSend,
  AminoMsgSend,
  AminoMsgSetWithdrawAddress,
  AminoMsgSubmitProposal,
  AminoMsgTransfer,
  AminoMsgUndelegate,
  AminoMsgVote,
  AminoMsgWithdrawDelegatorReward,
  AminoMsgWithdrawValidatorCommission,
} from "./aminomsgs";

export interface AminoConverter {
  readonly aminoType: string;
  readonly toAmino: (value: any) => any;
  readonly fromAmino: (value: any) => any;
}

function omitDefault<T extends string | number | Long>(input: T): T | undefined {
  if (typeof input === "string") {
    return input === "" ? undefined : input;
  }

  if (typeof input === "number") {
    return input === 0 ? undefined : input;
  }

  if (Long.isLong(input)) {
    return input.isZero() ? undefined : input;
  }

  throw new Error(`Got unsupported type '${typeof input}'`);
}

function createDefaultTypes(prefix: string): Record<string, AminoConverter> {
  return {
    // bank

    "/lbm.bank.v1.MsgSend": {
      aminoType: "lbm-sdk/MsgSend",
      toAmino: ({ fromAddress, toAddress, amount }: MsgSend): AminoMsgSend["value"] => ({
        from_address: fromAddress,
        to_address: toAddress,
        amount: [...amount],
      }),
      fromAmino: ({ from_address, to_address, amount }: AminoMsgSend["value"]): MsgSend => ({
        fromAddress: from_address,
        toAddress: to_address,
        amount: [...amount],
      }),
    },
    "/lbm.bank.v1.MsgMultiSend": {
      aminoType: "lbm-sdk/MsgMultiSend",
      toAmino: ({ inputs, outputs }: MsgMultiSend): AminoMsgMultiSend["value"] => ({
        inputs: inputs.map((input) => ({
          address: input.address,
          coins: [...input.coins],
        })),
        outputs: outputs.map((output) => ({
          address: output.address,
          coins: [...output.coins],
        })),
      }),
      fromAmino: ({ inputs, outputs }: AminoMsgMultiSend["value"]): MsgMultiSend => ({
        inputs: inputs.map((input) => ({
          address: input.address,
          coins: [...input.coins],
        })),
        outputs: outputs.map((output) => ({
          address: output.address,
          coins: [...output.coins],
        })),
      }),
    },

    // distribution

    "/lbm.distribution.v1.MsgFundCommunityPool": {
      aminoType: "lbm-sdk/MsgFundCommunityPool",
      toAmino: ({ amount, depositor }: MsgFundCommunityPool): AminoMsgFundCommunityPool["value"] => ({
        amount: [...amount],
        depositor: depositor,
      }),
      fromAmino: ({ amount, depositor }: AminoMsgFundCommunityPool["value"]): MsgFundCommunityPool => ({
        amount: [...amount],
        depositor: depositor,
      }),
    },
    "/lbm.distribution.v1.MsgSetWithdrawAddress": {
      aminoType: "lbm-sdk/MsgModifyWithdrawAddress",
      toAmino: ({
        delegatorAddress,
        withdrawAddress,
      }: MsgSetWithdrawAddress): AminoMsgSetWithdrawAddress["value"] => ({
        delegator_address: delegatorAddress,
        withdraw_address: withdrawAddress,
      }),
      fromAmino: ({
        delegator_address,
        withdraw_address,
      }: AminoMsgSetWithdrawAddress["value"]): MsgSetWithdrawAddress => ({
        delegatorAddress: delegator_address,
        withdrawAddress: withdraw_address,
      }),
    },
    "/lbm.distribution.v1.MsgWithdrawDelegatorReward": {
      aminoType: "lbm-sdk/MsgWithdrawDelegationReward",
      toAmino: ({
        delegatorAddress,
        validatorAddress,
      }: MsgWithdrawDelegatorReward): AminoMsgWithdrawDelegatorReward["value"] => ({
        delegator_address: delegatorAddress,
        validator_address: validatorAddress,
      }),
      fromAmino: ({
        delegator_address,
        validator_address,
      }: AminoMsgWithdrawDelegatorReward["value"]): MsgWithdrawDelegatorReward => ({
        delegatorAddress: delegator_address,
        validatorAddress: validator_address,
      }),
    },
    "/lbm.distribution.v1.MsgWithdrawValidatorCommission": {
      aminoType: "lbm-sdk/MsgWithdrawValidatorCommission",
      toAmino: ({
        validatorAddress,
      }: MsgWithdrawValidatorCommission): AminoMsgWithdrawValidatorCommission["value"] => ({
        validator_address: validatorAddress,
      }),
      fromAmino: ({
        validator_address,
      }: AminoMsgWithdrawValidatorCommission["value"]): MsgWithdrawValidatorCommission => ({
        validatorAddress: validator_address,
      }),
    },

    // gov

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

    // staking

    "/lbm.staking.v1.MsgBeginRedelegate": {
      aminoType: "lbm-sdk/MsgBeginRedelegate",
      toAmino: ({
        delegatorAddress,
        validatorSrcAddress,
        validatorDstAddress,
        amount,
      }: MsgBeginRedelegate): AminoMsgBeginRedelegate["value"] => {
        assertDefinedAndNotNull(amount, "missing amount");
        return {
          delegator_address: delegatorAddress,
          validator_src_address: validatorSrcAddress,
          validator_dst_address: validatorDstAddress,
          amount: amount,
        };
      },
      fromAmino: ({
        delegator_address,
        validator_src_address,
        validator_dst_address,
        amount,
      }: AminoMsgBeginRedelegate["value"]): MsgBeginRedelegate => ({
        delegatorAddress: delegator_address,
        validatorSrcAddress: validator_src_address,
        validatorDstAddress: validator_dst_address,
        amount: amount,
      }),
    },
    "/lbm.staking.v1.MsgCreateValidator": {
      aminoType: "lbm-sdk/MsgCreateValidator",
      toAmino: ({
        description,
        commission,
        minSelfDelegation,
        delegatorAddress,
        validatorAddress,
        pubkey,
        value,
      }: MsgCreateValidator): AminoMsgCreateValidator["value"] => {
        assertDefinedAndNotNull(description, "missing description");
        assertDefinedAndNotNull(commission, "missing commission");
        assertDefinedAndNotNull(pubkey, "missing pubkey");
        assertDefinedAndNotNull(value, "missing value");
        return {
          description: {
            moniker: description.moniker,
            identity: description.identity,
            website: description.website,
            security_contact: description.securityContact,
            details: description.details,
          },
          commission: {
            rate: commission.rate,
            max_rate: commission.maxRate,
            max_change_rate: commission.maxChangeRate,
          },
          min_self_delegation: minSelfDelegation,
          delegator_address: delegatorAddress,
          validator_address: validatorAddress,
          pubkey: encodeBech32Pubkey(
            {
              type: "ostracon/PubKeySecp256k1",
              value: toBase64(pubkey.value),
            },
            prefix,
          ),
          value: value,
        };
      },
      fromAmino: ({
        description,
        commission,
        min_self_delegation,
        delegator_address,
        validator_address,
        pubkey,
        value,
      }: AminoMsgCreateValidator["value"]): MsgCreateValidator => {
        const decodedPubkey = decodeBech32Pubkey(pubkey);
        if (decodedPubkey.type !== "ostracon/PubKeySecp256k1") {
          throw new Error("Only Secp256k1 public keys are supported");
        }
        return {
          description: {
            moniker: description.moniker,
            identity: description.identity,
            website: description.website,
            securityContact: description.security_contact,
            details: description.details,
          },
          commission: {
            rate: commission.rate,
            maxRate: commission.max_rate,
            maxChangeRate: commission.max_change_rate,
          },
          minSelfDelegation: min_self_delegation,
          delegatorAddress: delegator_address,
          validatorAddress: validator_address,
          pubkey: {
            typeUrl: "/lbm.crypto.secp256k1.PubKey",
            value: fromBase64(decodedPubkey.value),
          },
          value: value,
        };
      },
    },
    "/lbm.staking.v1.MsgDelegate": {
      aminoType: "lbm-sdk/MsgDelegate",
      toAmino: ({ delegatorAddress, validatorAddress, amount }: MsgDelegate): AminoMsgDelegate["value"] => {
        assertDefinedAndNotNull(amount, "missing amount");
        return {
          delegator_address: delegatorAddress,
          validator_address: validatorAddress,
          amount: amount,
        };
      },
      fromAmino: ({
        delegator_address,
        validator_address,
        amount,
      }: AminoMsgDelegate["value"]): MsgDelegate => ({
        delegatorAddress: delegator_address,
        validatorAddress: validator_address,
        amount: amount,
      }),
    },
    "/lbm.staking.v1.MsgEditValidator": {
      aminoType: "lbm-sdk/MsgEditValidator",
      toAmino: ({
        description,
        commissionRate,
        minSelfDelegation,
        validatorAddress,
      }: MsgEditValidator): AminoMsgEditValidator["value"] => {
        assertDefinedAndNotNull(description, "missing description");
        return {
          description: {
            moniker: description.moniker,
            identity: description.identity,
            website: description.website,
            security_contact: description.securityContact,
            details: description.details,
          },
          commission_rate: commissionRate,
          min_self_delegation: minSelfDelegation,
          validator_address: validatorAddress,
        };
      },
      fromAmino: ({
        description,
        commission_rate,
        min_self_delegation,
        validator_address,
      }: AminoMsgEditValidator["value"]): MsgEditValidator => ({
        description: {
          moniker: description.moniker,
          identity: description.identity,
          website: description.website,
          securityContact: description.security_contact,
          details: description.details,
        },
        commissionRate: commission_rate,
        minSelfDelegation: min_self_delegation,
        validatorAddress: validator_address,
      }),
    },
    "/lbm.staking.v1.MsgUndelegate": {
      aminoType: "lbm-sdk/MsgUndelegate",
      toAmino: ({
        delegatorAddress,
        validatorAddress,
        amount,
      }: MsgUndelegate): AminoMsgUndelegate["value"] => {
        assertDefinedAndNotNull(amount, "missing amount");
        return {
          delegator_address: delegatorAddress,
          validator_address: validatorAddress,
          amount: amount,
        };
      },
      fromAmino: ({
        delegator_address,
        validator_address,
        amount,
      }: AminoMsgUndelegate["value"]): MsgUndelegate => ({
        delegatorAddress: delegator_address,
        validatorAddress: validator_address,
        amount: amount,
      }),
    },

    // ibc

    "/ibc.applications.transfer.v1.MsgTransfer": {
      aminoType: "lbm-sdk/MsgTransfer",
      toAmino: ({
        sourcePort,
        sourceChannel,
        token,
        sender,
        receiver,
        timeoutHeight,
        timeoutTimestamp,
      }: MsgTransfer): AminoMsgTransfer["value"] => ({
        source_port: sourcePort,
        source_channel: sourceChannel,
        token: token,
        sender: sender,
        receiver: receiver,
        timeout_height: timeoutHeight
          ? {
              revision_height: omitDefault(timeoutHeight.revisionHeight)?.toString(),
              revision_number: omitDefault(timeoutHeight.revisionNumber)?.toString(),
            }
          : {},
        timeout_timestamp: omitDefault(timeoutTimestamp)?.toString(),
      }),
      fromAmino: ({
        source_port,
        source_channel,
        token,
        sender,
        receiver,
        timeout_height,
        timeout_timestamp,
      }: AminoMsgTransfer["value"]): MsgTransfer => ({
        sourcePort: source_port,
        sourceChannel: source_channel,
        token: token,
        sender: sender,
        receiver: receiver,
        timeoutHeight: timeout_height
          ? {
              revisionHeight: Long.fromString(timeout_height.revision_height || "0", true),
              revisionNumber: Long.fromString(timeout_height.revision_number || "0", true),
            }
          : undefined,
        timeoutTimestamp: Long.fromString(timeout_timestamp || "0", true),
      }),
    },
  };
}

interface AminoTypesOptions {
  readonly additions?: Record<string, AminoConverter>;
  readonly prefix?: string;
}

/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
export class AminoTypes {
  private readonly register: Record<string, AminoConverter>;

  public constructor({ additions = {}, prefix = "link" }: AminoTypesOptions = {}) {
    const additionalAminoTypes = Object.values(additions);
    const filteredDefaultTypes = Object.entries(createDefaultTypes(prefix)).reduce(
      (acc, [key, value]) =>
        additionalAminoTypes.find(({ aminoType }) => value.aminoType === aminoType)
          ? acc
          : { ...acc, [key]: value },
      {},
    );
    this.register = { ...filteredDefaultTypes, ...additions };
  }

  public toAmino({ typeUrl, value }: EncodeObject): AminoMsg {
    const converter = this.register[typeUrl];
    if (!converter) {
      throw new Error(
        "Type URL does not exist in the Amino message type register. " +
          "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
          "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
      );
    }
    return {
      type: converter.aminoType,
      value: converter.toAmino(value),
    };
  }

  public fromAmino({ type, value }: AminoMsg): EncodeObject {
    const result = Object.entries(this.register).find(([_typeUrl, { aminoType }]) => aminoType === type);
    if (!result) {
      throw new Error(
        "Type does not exist in the Amino message type register. " +
          "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
          "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
      );
    }
    const [typeUrl, converter] = result;
    return {
      typeUrl: typeUrl,
      value: converter.fromAmino(value),
    };
  }
}
