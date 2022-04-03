/* eslint-disable @typescript-eslint/naming-convention */
import { Bip39, EnglishMnemonic, Random } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { AminoSignResponse, Secp256k1HdWallet, Secp256k1HdWalletOptions, StdSignDoc } from "@lbmjs/amino";
import {
  coins,
  DirectSecp256k1HdWallet,
  DirectSecp256k1HdWalletOptions,
  DirectSignResponse,
  makeAuthInfoBytes,
} from "@lbmjs/proto-signing";
import { SignMode } from "lbmjs-types/lbm/tx/signing/v1/signing";
import { AuthInfo, SignDoc, TxBody } from "lbmjs-types/lbm/tx/v1/tx";

import { calculateFee, GasPrice } from "./fee";
import { SigningStargateClientOptions } from "./signingstargateclient";

export function simapp42Enabled(): boolean {
  return !!process.env.SIMAPP42_ENABLED;
}

export function simapp44Enabled(): boolean {
  return !!process.env.SIMAPP44_ENABLED;
}

export function simappEnabled(): boolean {
  return simapp42Enabled() || simapp44Enabled();
}

export function pendingWithoutSimapp44(): void {
  if (!simapp44Enabled()) {
    return pending("Set SIMAPP44_ENABLED to enable Simapp based tests");
  }
}

export function pendingWithoutSimapp42(): void {
  if (!simapp42Enabled()) {
    return pending("Set SIMAPP42_ENABLED to enable Simapp based tests");
  }
}

export function pendingWithoutSimapp(): void {
  if (!simappEnabled()) {
    return pending("Set SIMAPP42_ENABLED or SIMAPP44_ENABLED to enable Simapp based tests");
  }
}

export function slowSimappEnabled(): boolean {
  return !!process.env.SLOW_SIMAPP42_ENABLED || !!process.env.SLOW_SIMAPP44_ENABLED;
}

export function pendingWithoutSlowSimapp(): void {
  if (!slowSimappEnabled()) {
    return pending("Set SLOW_SIMAPP42_ENABLED or SLOW_SIMAPP44_ENABLED to enable slow Simapp based tests");
  }
}

export function makeRandomAddressBytes(): Uint8Array {
  return Random.getBytes(20);
}

export function makeRandomAddress(): string {
  return toBech32("link", makeRandomAddressBytes());
}

/** Returns first element. Throws if array has a different length than 1. */
export function fromOneElementArray<T>(elements: ArrayLike<T>): T {
  if (elements.length !== 1) throw new Error(`Expected exactly one element but got ${elements.length}`);
  return elements[0];
}

export const defaultGasPrice = GasPrice.fromString("0.025cony");
export const defaultSendFee = calculateFee(100_000, defaultGasPrice);

export const simapp = {
  tendermintUrl: "localhost:26658",
  tendermintUrlWs: "ws://localhost:26658",
  tendermintUrlHttp: "http://localhost:26658",
  chainId: "simd-testing",
  denomStaking: "stake",
  denomFee: "cony",
  blockTime: 1_000, // ms
  totalSupply: 1100000000000, // cony
  govMinDeposit: coins(10000000, "stake"),
};

export const slowSimapp = {
  tendermintUrl: "localhost:26660",
  tendermintUrlWs: "ws://localhost:26660",
  tendermintUrlHttp: "http://localhost:26660",
  chainId: "simd-testing",
  denomStaking: "ustake",
  denomFee: "cony",
  blockTime: 10_000, // ms
  totalSupply: 21000000000, // cony
};

/** Setting to speed up testing */
export const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
};

export const faucet = {
  mnemonic:
    "mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have",
  pubkey0: {
    type: "ostracon/PubKeySecp256k1",
    value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
  },
  pubkey1: {
    type: "ostracon/PubKeySecp256k1",
    value: "Au7fdDpmcXLbuxH5z6PvvzUaKQI6EeDY5GNt9e17cYxk",
  },
  pubkey2: {
    type: "ostracon/PubKeySecp256k1",
    value: "A45xEMprNuuMDvoSyN35OFzMSjgN3JfU0JrtDigGL1li",
  },
  pubkey3: {
    type: "ostracon/PubKeySecp256k1",
    value: "A++1IDp1lAwqi1/nSxjRwsUAgMuabMHaOaxEgszpHH3O",
  },
  pubkey4: {
    type: "ostracon/PubKeySecp256k1",
    value: "AiprmR/HER1JI4/kF49WNZUND57MygR4myw1HrqlJ8if",
  },
  pubkey5: {
    type: "ostracon/PubKeySecp256k1",
    value: "A/sRpmP7Bk1LIkax7HA6DxegTIxmstJXH6xkmAzSxzXO",
  },
  address0: "link146asaycmtydq45kxc8evntqfgepagygelel00h",
  address1: "link1aaffxdz4dwcnjzumjm7h89yjw5c5wul88zvzuu",
  address2: "link1ey0w0xj9v48vk82ht6mhqdlh9wqkx8enkpjwpr",
  address3: "link1dfyywjglcfptn72axxhsslpy8ep6wq7wujasma",
  address4: "link1equ4n3uwyhapak5g3leq0avz85k0q6jcdy5w0f",
  address5: "link14nvvrk4dz3k695t8740vqzjnvrwszwm69hw0ls",
};

/** Unused account */
export const unused = {
  pubkey: {
    type: "ostracon/PubKeySecp256k1",
    value: "A7Tvuh48+JzNyBnTeK2Qw987f5FqFHK/QH65pTVsZvuh",
  },
  address: "link1tfcuj70ssvwnxv9ryk4p9xywyq626asgfktaxv",
  accountNumber: 8,
  sequence: 0,
  balanceStaking: "20000000000", // 100000 STAKE
  balanceFee: "100000000000", // 1000 CONY
};

export const validator = {
  /**
   * From first gentx's auth_info.signer_infos in scripts/simapp42/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].auth_info.signer_infos[0].public_key" scripts/simapp42/template/.simapp/config/genesis.json
   * ```
   */
  pubkey: {
    type: "ostracon/PubKeySecp256k1",
    value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
  },
  /**
   * delegator_address from /lbm.staking.v1.MsgCreateValidator in scripts/simapp42/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].delegator_address" scripts/simapp42/template/.simapp/config/genesis.json
   * ```
   */
  delegatorAddress: "link146asaycmtydq45kxc8evntqfgepagygelel00h",
  /**
   * validator_address from /lbm.staking.v1.MsgCreateValidator in scripts/simapp42/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].validator_address" scripts/simapp42/template/.simapp/config/genesis.json
   * ```
   */
  validatorAddress: "linkvaloper146asaycmtydq45kxc8evntqfgepagygeddajpy",
  accountNumber: 9,
  sequence: 1,
};

export const nonExistentAddress = "link1hvuxwh9sp2zlc3ee5nnhngln6auv4ak4kyuspq";

export const nonNegativeIntegerMatcher = /^[0-9]+$/;
export const tendermintIdMatcher = /^[0-9A-F]{64}$/;

/**
 * A class for testing clients using an Amino signer which modifies the transaction it receives before signing
 */
export class ModifyingSecp256k1HdWallet extends Secp256k1HdWallet {
  public static override async fromMnemonic(
    mnemonic: string,
    options: Partial<Secp256k1HdWalletOptions> = {},
  ): Promise<ModifyingSecp256k1HdWallet> {
    const mnemonicChecked = new EnglishMnemonic(mnemonic);
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
    return new ModifyingSecp256k1HdWallet(mnemonicChecked, { ...options, seed: seed });
  }

  public override async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    const modifiedSignDoc = {
      ...signDoc,
      fee: {
        amount: coins(3000, "cony"),
        gas: "333333",
      },
      memo: "This was modified",
    };
    return super.signAmino(signerAddress, modifiedSignDoc);
  }
}

/**
 * A class for testing clients using a direct signer which modifies the transaction it receives before signing
 */
export class ModifyingDirectSecp256k1HdWallet extends DirectSecp256k1HdWallet {
  public static override async fromMnemonic(
    mnemonic: string,
    options: Partial<DirectSecp256k1HdWalletOptions> = {},
  ): Promise<DirectSecp256k1HdWallet> {
    const mnemonicChecked = new EnglishMnemonic(mnemonic);
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
    return new ModifyingDirectSecp256k1HdWallet(mnemonicChecked, { ...options, seed: seed });
  }

  public override async signDirect(address: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const txBody = TxBody.decode(signDoc.bodyBytes);
    const modifiedTxBody = TxBody.fromPartial({
      ...txBody,
      memo: "This was modified",
    });
    const authInfo = AuthInfo.decode(signDoc.authInfoBytes);
    const signers = authInfo.signerInfos.map((signerInfo) => ({
      pubkey: signerInfo.publicKey!,
      sequence: signerInfo.sequence.toNumber(),
    }));
    const modifiedFeeAmount = coins(3000, "cony");
    const modifiedGasLimit = 333333;
    const modifiedSignDoc = {
      ...signDoc,
      bodyBytes: Uint8Array.from(TxBody.encode(modifiedTxBody).finish()),
      authInfoBytes: makeAuthInfoBytes(
        signers,
        modifiedFeeAmount,
        modifiedGasLimit,
        SignMode.SIGN_MODE_DIRECT,
      ),
    };
    return super.signDirect(address, modifiedSignDoc);
  }
}
