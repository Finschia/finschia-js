/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from "@lbmjs/amino";

// auth (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/auth/auth.proto

// bank - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/bank/bank.proto

/** A high level transaction of the coin module */
export interface AminoMsgSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgSend";
  readonly value: {
    /** Bech32 account address */
    readonly from_address: string;
    /** Bech32 account address */
    readonly to_address: string;
    readonly amount: readonly Coin[];
  };
}

export function isAminoMsgSend(msg: AminoMsg): msg is AminoMsgSend {
  return msg.type === "lbm-sdk/MsgSend";
}

interface Input {
  /** Bech32 account address */
  readonly address: string;
  readonly coins: readonly Coin[];
}

interface Output {
  /** Bech32 account address */
  readonly address: string;
  readonly coins: readonly Coin[];
}

/** A high level transaction of the coin module */
export interface AminoMsgMultiSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgMultiSend";
  readonly value: {
    readonly inputs: readonly Input[];
    readonly outputs: readonly Output[];
  };
}

export function isAminoMsgMultiSend(msg: AminoMsg): msg is AminoMsgMultiSend {
  return msg.type === "lbm-sdk/MsgMultiSend";
}

// crisis - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/crisis/crisis.proto

/** Verifies a particular invariance */
export interface AminoMsgVerifyInvariant extends AminoMsg {
  readonly type: "lbm-sdk/MsgVerifyInvariant";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    readonly invariant_module_name: string;
    readonly invariant_route: string;
  };
}

export function isAminoMsgVerifyInvariant(msg: AminoMsg): msg is AminoMsgVerifyInvariant {
  return msg.type === "lbm-sdk/MsgVerifyInvariant";
}

// distribution - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/distribution/distribution.proto

/** Changes the withdraw address for a delegator (or validator self-delegation) */
export interface AminoMsgSetWithdrawAddress extends AminoMsg {
  // NOTE: Type string and names diverge here!
  readonly type: "lbm-sdk/MsgModifyWithdrawAddress";
  readonly value: {
    /** Bech32 account address */
    readonly delegator_address: string;
    /** Bech32 account address */
    readonly withdraw_address: string;
  };
}

export function isAminoMsgSetWithdrawAddress(msg: AminoMsg): msg is AminoMsgSetWithdrawAddress {
  // NOTE: Type string and names diverge here!
  return msg.type === "lbm-sdk/MsgModifyWithdrawAddress";
}

/** Message for delegation withdraw from a single validator */
export interface AminoMsgWithdrawDelegatorReward extends AminoMsg {
  // NOTE: Type string and names diverge here!
  readonly type: "lbm-sdk/MsgWithdrawDelegationReward";
  readonly value: {
    /** Bech32 account address */
    readonly delegator_address: string;
    /** Bech32 account address */
    readonly validator_address: string;
  };
}

export function isAminoMsgWithdrawDelegatorReward(msg: AminoMsg): msg is AminoMsgWithdrawDelegatorReward {
  // NOTE: Type string and names diverge here!
  return msg.type === "lbm-sdk/MsgWithdrawDelegationReward";
}

/** Message for validator withdraw */
export interface AminoMsgWithdrawValidatorCommission extends AminoMsg {
  readonly type: "lbm-sdk/MsgWithdrawValidatorCommission";
  readonly value: {
    /** Bech32 account address */
    readonly validator_address: string;
  };
}

export function isAminoMsgWithdrawValidatorCommission(
  msg: AminoMsg,
): msg is AminoMsgWithdrawValidatorCommission {
  return msg.type === "lbm-sdk/MsgWithdrawValidatorCommission";
}

/** Allows an account to directly fund the community pool. */
export interface AminoMsgFundCommunityPool extends AminoMsg {
  readonly type: "lbm-sdk/MsgFundCommunityPool";
  readonly value: {
    readonly amount: readonly Coin[];
    /** Bech32 account address */
    readonly depositor: string;
  };
}

export function isAminoMsgFundCommunityPool(msg: AminoMsg): msg is AminoMsgFundCommunityPool {
  return msg.type === "lbm-sdk/MsgFundCommunityPool";
}

// evidence - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/evidence/evidence.proto

interface Any {
  readonly type_url: string;
  readonly value: Uint8Array;
}

/** Supports submitting arbitrary evidence */
export interface AminoMsgSubmitEvidence extends AminoMsg {
  readonly type: "lbm-sdk/MsgSubmitEvidence";
  readonly value: {
    /** Bech32 account address */
    readonly submitter: string;
    readonly evidence: Any;
  };
}

export function isAminoMsgSubmitEvidence(msg: AminoMsg): msg is AminoMsgSubmitEvidence {
  return msg.type === "lbm-sdk/MsgSubmitEvidence";
}

// gov - https://github.com/cosmos/cosmos-sdk/blob/efa73c7edb31a7bd65786501da213b294f89267a/proto/cosmos/gov/gov.proto

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

// mint (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/mint/mint.proto

// params (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/params/params.proto

// slashing - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/slashing/slashing.proto

/** Unjails a jailed validator */
export interface AminoMsgUnjail extends AminoMsg {
  readonly type: "lbm-sdk/MsgUnjail";
  readonly value: {
    /** Bech32 account address */
    readonly validator_addr: string;
  };
}

export function isAminoMsgUnjail(msg: AminoMsg): msg is AminoMsgUnjail {
  return msg.type === "lbm-sdk/MsgUnjail";
}

// staking - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/staking/staking.proto

/** The initial commission rates to be used for creating a validator */
interface CommissionRates {
  readonly rate: string;
  readonly max_rate: string;
  readonly max_change_rate: string;
}

/** A validator description. */
interface Description {
  readonly moniker: string;
  readonly identity: string;
  readonly website: string;
  readonly security_contact: string;
  readonly details: string;
}

/** Creates a new validator. */
export interface AminoMsgCreateValidator extends AminoMsg {
  readonly type: "lbm-sdk/MsgCreateValidator";
  readonly value: {
    readonly description: Description;
    readonly commission: CommissionRates;
    readonly min_self_delegation: string;
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    /** Bech32 encoded public key */
    readonly pubkey: string;
    readonly value: Coin;
  };
}

export function isAminoMsgCreateValidator(msg: AminoMsg): msg is AminoMsgCreateValidator {
  return msg.type === "lbm-sdk/MsgCreateValidator";
}

/** Edits an existing validator. */
export interface AminoMsgEditValidator extends AminoMsg {
  readonly type: "lbm-sdk/MsgEditValidator";
  readonly value: {
    readonly description: Description;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly commission_rate: string;
    readonly min_self_delegation: string;
  };
}

export function isAminoMsgEditValidator(msg: AminoMsg): msg is AminoMsgEditValidator {
  return msg.type === "lbm-sdk/MsgEditValidator";
}

/**
 * Performs a delegation from a delegate to a validator.
 *
 * @see https://docs.cosmos.network/master/modules/staking/03_messages.html#msgdelegate
 */
export interface AminoMsgDelegate extends AminoMsg {
  readonly type: "lbm-sdk/MsgDelegate";
  readonly value: {
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly amount: Coin;
  };
}

export function isAminoMsgDelegate(msg: AminoMsg): msg is AminoMsgDelegate {
  return msg.type === "lbm-sdk/MsgDelegate";
}

/** Performs a redelegation from a delegate and source validator to a destination validator */
export interface AminoMsgBeginRedelegate extends AminoMsg {
  readonly type: "lbm-sdk/MsgBeginRedelegate";
  readonly value: {
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded source validator address */
    readonly validator_src_address: string;
    /** Bech32 encoded destination validator address */
    readonly validator_dst_address: string;
    readonly amount: Coin;
  };
}

export function isAminoMsgBeginRedelegate(msg: AminoMsg): msg is AminoMsgBeginRedelegate {
  return msg.type === "lbm-sdk/MsgBeginRedelegate";
}

/** Performs an undelegation from a delegate and a validator */
export interface AminoMsgUndelegate extends AminoMsg {
  readonly type: "lbm-sdk/MsgUndelegate";
  readonly value: {
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly amount: Coin;
  };
}

export function isAminoMsgUndelegate(msg: AminoMsg): msg is AminoMsgUndelegate {
  return msg.type === "lbm-sdk/MsgUndelegate";
}

// upgrade (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/upgrade/upgrade.proto

// ibc

// https://github.com/cosmos/ibc-go/blob/07b6a97b67d17fd214a83764cbdb2c2c3daef445/modules/core/02-client/types/client.pb.go#L297-L312
interface AminoHeight {
  /** 0 values must be omitted (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/x/ibc/core/02-client/types/client.pb.go#L252). */
  readonly revision_number?: string;
  /** 0 values must be omitted (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/x/ibc/core/02-client/types/client.pb.go#L254). */
  readonly revision_height?: string;
}

// https://github.com/cosmos/ibc-go/blob/07b6a97b67d17fd214a83764cbdb2c2c3daef445/modules/apps/transfer/types/tx.pb.go#L33-L53
/** Transfers fungible tokens (i.e Coins) between ICS20 enabled chains */
export interface AminoMsgTransfer extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransfer";
  readonly value: {
    readonly source_port: string;
    readonly source_channel: string;
    readonly token?: Coin;
    /** Bech32 account address */
    readonly sender: string;
    /** Bech32 account address */
    readonly receiver: string;
    /**
     * The timeout as a (revision_number, revision_height) pair.
     *
     * This fied is is non-optional (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/x/ibc/applications/transfer/types/tx.pb.go#L49).
     * In order to not set the timeout height, set it to {}.
     */
    readonly timeout_height: AminoHeight;
    /**
     * Timeout timestamp in nanoseconds since Unix epoch. The timeout is disabled when set to 0.
     *
     * 0 values must be omitted (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/x/ibc/applications/transfer/types/tx.pb.go#L52).
     */
    readonly timeout_timestamp?: string;
  };
}

export function isAminoMsgTransfer(msg: AminoMsg): msg is AminoMsgTransfer {
  return msg.type === "lbm-sdk/MsgTransfer";
}
