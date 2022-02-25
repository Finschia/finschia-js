/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from "@lbmjs/amino";

// auth (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/auth/auth.proto

// bank - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/bank/bank.proto

/** A high level transaction of the coin module */
export interface MsgSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgSend";
  readonly value: {
    /** Bech32 account address */
    readonly from_address: string;
    /** Bech32 account address */
    readonly to_address: string;
    readonly amount: readonly Coin[];
  };
}

export function isMsgSend(msg: AminoMsg): msg is MsgSend {
  return (msg as MsgSend).type === "lbm-sdk/MsgSend";
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
export interface MsgMultiSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgMultiSend";
  readonly value: {
    readonly inputs: readonly Input[];
    readonly outputs: readonly Output[];
  };
}

export function isMsgMultiSend(msg: AminoMsg): msg is MsgMultiSend {
  return (msg as MsgMultiSend).type === "lbm-sdk/MsgMultiSend";
}

// crisis - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/crisis/crisis.proto

/** Verifies a particular invariance */
export interface MsgVerifyInvariant extends AminoMsg {
  readonly type: "lbm-sdk/MsgVerifyInvariant";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    readonly invariant_module_name: string;
    readonly invariant_route: string;
  };
}

export function isMsgVerifyInvariant(msg: AminoMsg): msg is MsgVerifyInvariant {
  return (msg as MsgVerifyInvariant).type === "lbm-sdk/MsgVerifyInvariant";
}

// distribution - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/distribution/distribution.proto

/** Changes the withdraw address for a delegator (or validator self-delegation) */
export interface MsgSetWithdrawAddress extends AminoMsg {
  // NOTE: Type string and names diverge here!
  readonly type: "lbm-sdk/MsgModifyWithdrawAddress";
  readonly value: {
    /** Bech32 account address */
    readonly delegator_address: string;
    /** Bech32 account address */
    readonly withdraw_address: string;
  };
}

export function isMsgSetWithdrawAddress(msg: AminoMsg): msg is MsgSetWithdrawAddress {
  // NOTE: Type string and names diverge here!
  return (msg as MsgSetWithdrawAddress).type === "lbm-sdk/MsgModifyWithdrawAddress";
}

/** Message for delegation withdraw from a single validator */
export interface MsgWithdrawDelegatorReward extends AminoMsg {
  // NOTE: Type string and names diverge here!
  readonly type: "lbm-sdk/MsgWithdrawDelegationReward";
  readonly value: {
    /** Bech32 account address */
    readonly delegator_address: string;
    /** Bech32 account address */
    readonly validator_address: string;
  };
}

export function isMsgWithdrawDelegatorReward(msg: AminoMsg): msg is MsgWithdrawDelegatorReward {
  // NOTE: Type string and names diverge here!
  return (msg as MsgWithdrawDelegatorReward).type === "lbm-sdk/MsgWithdrawDelegationReward";
}

/** Message for validator withdraw */
export interface MsgWithdrawValidatorCommission extends AminoMsg {
  readonly type: "lbm-sdk/MsgWithdrawValidatorCommission";
  readonly value: {
    /** Bech32 account address */
    readonly validator_address: string;
  };
}

export function isMsgWithdrawValidatorCommission(msg: AminoMsg): msg is MsgWithdrawValidatorCommission {
  return (msg as MsgWithdrawValidatorCommission).type === "lbm-sdk/MsgWithdrawValidatorCommission";
}

/** Allows an account to directly fund the community pool. */
export interface MsgFundCommunityPool extends AminoMsg {
  readonly type: "lbm-sdk/MsgFundCommunityPool";
  readonly value: {
    readonly amount: readonly Coin[];
    /** Bech32 account address */
    readonly depositor: string;
  };
}

export function isMsgFundCommunityPool(msg: AminoMsg): msg is MsgFundCommunityPool {
  return (msg as MsgFundCommunityPool).type === "lbm-sdk/MsgFundCommunityPool";
}

// evidence - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/evidence/evidence.proto

interface Any {
  readonly type_url: string;
  readonly value: Uint8Array;
}

/** Supports submitting arbitrary evidence */
export interface MsgSubmitEvidence extends AminoMsg {
  readonly type: "lbm-sdk/MsgSubmitEvidence";
  readonly value: {
    /** Bech32 account address */
    readonly submitter: string;
    readonly evidence: Any;
  };
}

export function isMsgSubmitEvidence(msg: AminoMsg): msg is MsgSubmitEvidence {
  return (msg as MsgSubmitEvidence).type === "lbm-sdk/MsgSubmitEvidence";
}

// gov - https://github.com/cosmos/cosmos-sdk/blob/efa73c7edb31a7bd65786501da213b294f89267a/proto/cosmos/gov/gov.proto

/** Supports submitting arbitrary proposal content. */
export interface MsgSubmitProposal extends AminoMsg {
  readonly type: "lbm-sdk/MsgSubmitProposal";
  readonly value: {
    readonly content: Any;
    readonly initial_deposit: readonly Coin[];
    /** Bech32 account address */
    readonly proposer: string;
  };
}

export function isMsgSubmitProposal(msg: AminoMsg): msg is MsgSubmitProposal {
  return (msg as MsgSubmitProposal).type === "lbm-sdk/MsgSubmitProposal";
}

enum VoteOption {
  VoteOptionUnspecified,
  VoteOptionYes,
  VoteOptionAbstain,
  VoteOptionNo,
  VoteOptionNoWithVeto,
}

/** Casts a vote */
export interface MsgVote extends AminoMsg {
  readonly type: "lbm-sdk/MsgVote";
  readonly value: {
    readonly proposal_id: number;
    /** Bech32 account address */
    readonly voter: string;
    readonly option: VoteOption;
  };
}

export function isMsgVote(msg: AminoMsg): msg is MsgVote {
  return (msg as MsgVote).type === "lbm-sdk/MsgVote";
}

/** Submits a deposit to an existing proposal */
export interface MsgDeposit extends AminoMsg {
  readonly type: "lbm-sdk/MsgDeposit";
  readonly value: {
    readonly proposal_id: number;
    /** Bech32 account address */
    readonly depositor: string;
    readonly amount: readonly Coin[];
  };
}

export function isMsgDeposit(msg: AminoMsg): msg is MsgDeposit {
  return (msg as MsgDeposit).type === "lbm-sdk/MsgDeposit";
}

// ibc

// mint (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/mint/mint.proto

// params (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/params/params.proto

// slashing - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/slashing/slashing.proto

/** Unjails a jailed validator */
export interface MsgUnjail extends AminoMsg {
  readonly type: "lbm-sdk/MsgUnjail";
  readonly value: {
    /** Bech32 account address */
    readonly validator_addr: string;
  };
}

export function isMsgUnjail(msg: AminoMsg): msg is MsgUnjail {
  return (msg as MsgUnjail).type === "lbm-sdk/MsgUnjail";
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
export interface MsgCreateValidator extends AminoMsg {
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

export function isMsgCreateValidator(msg: AminoMsg): msg is MsgCreateValidator {
  return (msg as MsgCreateValidator).type === "lbm-sdk/MsgCreateValidator";
}

/** Edits an existing validator. */
export interface MsgEditValidator extends AminoMsg {
  readonly type: "lbm-sdk/MsgEditValidator";
  readonly value: {
    readonly description: Description;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly commission_rate: string;
    readonly min_self_delegation: string;
  };
}

export function isMsgEditValidator(msg: AminoMsg): msg is MsgEditValidator {
  return (msg as MsgEditValidator).type === "lbm-sdk/MsgEditValidator";
}

/**
 * Performs a delegation from a delegate to a validator.
 *
 * @see https://docs.cosmos.network/master/modules/staking/03_messages.html#msgdelegate
 */
export interface MsgDelegate extends AminoMsg {
  readonly type: "lbm-sdk/MsgDelegate";
  readonly value: {
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly amount: Coin;
  };
}

export function isMsgDelegate(msg: AminoMsg): msg is MsgDelegate {
  return (msg as MsgDelegate).type === "lbm-sdk/MsgDelegate";
}

/** Performs a redelegation from a delegate and source validator to a destination validator */
export interface MsgBeginRedelegate extends AminoMsg {
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

export function isMsgBeginRedelegate(msg: AminoMsg): msg is MsgBeginRedelegate {
  return (msg as MsgBeginRedelegate).type === "lbm-sdk/MsgBeginRedelegate";
}

/** Performs an undelegation from a delegate and a validator */
export interface MsgUndelegate extends AminoMsg {
  readonly type: "lbm-sdk/MsgUndelegate";
  readonly value: {
    /** Bech32 encoded delegator address */
    readonly delegator_address: string;
    /** Bech32 encoded validator address */
    readonly validator_address: string;
    readonly amount: Coin;
  };
}

export function isMsgUndelegate(msg: AminoMsg): msg is MsgUndelegate {
  return (msg as MsgUndelegate).type === "lbm-sdk/MsgUndelegate";
}

// upgrade (no messages) - see https://github.com/cosmos/cosmos-sdk/blob/efa73c7/proto/cosmos/upgrade/upgrade.proto
