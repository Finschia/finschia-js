import { Uint64 } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { decodeMultisigPubkey, MultisigThresholdPubkeyValue, PubkeyValue } from "@lbmjs/proto-signing";
import { Any } from "lbmjs-types/google/protobuf/any";
import { BaseAccount, ModuleAccount } from "lbmjs-types/lbm/auth/v1/auth";
import {
  BaseVestingAccount,
  ContinuousVestingAccount,
  DelayedVestingAccount,
  PeriodicVestingAccount,
} from "lbmjs-types/lbm/vesting/v1/vesting";
import Long from "long";

export interface Account {
  /** Bech32 account address */
  readonly address: string;
  readonly ed25519PubKey: PubkeyValue | null;
  readonly secp256k1PubKey: PubkeyValue | null;
  readonly secp256r1PubKey: PubkeyValue | null;
  readonly multisigPubKey: MultisigThresholdPubkeyValue | null;
  readonly accountNumber: number;
  readonly sequence: number;
}

function uint64FromProto(input: number | Long): Uint64 {
  return Uint64.fromString(input.toString());
}

function accountFromBaseAccount(input: BaseAccount): Account {
  const {
    address,
    ed25519PubKey,
    secp256k1PubKey,
    secp256r1PubKey,
    multisigPubKey,
    accountNumber,
    sequence,
  } = input;
  return {
    address: address,
    ed25519PubKey: ed25519PubKey || null,
    secp256k1PubKey: secp256k1PubKey || null,
    secp256r1PubKey: secp256r1PubKey || null,
    multisigPubKey: decodeMultisigPubkey(multisigPubKey) || null,
    accountNumber: uint64FromProto(accountNumber).toNumber(),
    sequence: uint64FromProto(sequence).toNumber(),
  };
}

/**
 * Represents a generic function that takes an `Any` encoded account from the chain
 * and extracts some common `Account` information from it.
 */
export type AccountParser = (any: Any) => Account;

/**
 * Basic implementation of AccountParser. This is supposed to support the most relevant
 * common Cosmos SDK account types. If you need support for exotic account types,
 * you'll need to write your own account decoder.
 */
export function accountFromAny(input: Any): Account {
  const { typeUrl, value } = input;

  switch (typeUrl) {
    // auth

    case "/lbm.auth.v1.BaseAccount":
      return accountFromBaseAccount(BaseAccount.decode(value));
    case "/lbm.auth.v1.ModuleAccount": {
      const baseAccount = ModuleAccount.decode(value).baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }

    // vesting

    case "/lbm.vesting.v1.BaseVestingAccount": {
      const baseAccount = BaseVestingAccount.decode(value)?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/lbm.vesting.v1.ContinuousVestingAccount": {
      const baseAccount = ContinuousVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/lbm.vesting.v1.DelayedVestingAccount": {
      const baseAccount = DelayedVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/lbm.vesting.v1.PeriodicVestingAccount": {
      const baseAccount = PeriodicVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }

    default:
      throw new Error(`Unsupported type: '${typeUrl}'`);
  }
}
