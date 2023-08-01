/* eslint-disable @typescript-eslint/naming-convention */
import { AminoSignResponse, Secp256k1HdWallet, Secp256k1HdWalletOptions, StdSignDoc } from "@cosmjs/amino";
import { setupWasmExtension, WasmExtension } from "@cosmjs/cosmwasm-stargate";
import { Bip39, EnglishMnemonic, Random } from "@cosmjs/crypto";
import { fromBase64, toBech32 } from "@cosmjs/encoding";
import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1HdWalletOptions,
  DirectSignResponse,
  makeAuthInfoBytes,
} from "@cosmjs/proto-signing";
import {
  AuthExtension,
  BankExtension,
  calculateFee,
  coins,
  GasPrice,
  IbcExtension,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { SigningStargateClientOptions } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, SignDoc, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { setupWasmplusExtension, WasmplusExtension } from "./modules";
import hackatom from "./testdata/contract.json";

export const defaultGasPrice = GasPrice.fromString("0.025cony");
export const defaultSendFee = calculateFee(100_000, defaultGasPrice);
export const defaultUploadFee = calculateFee(1_500_000, defaultGasPrice);
export const defaultInstantiateFee = calculateFee(500_000, defaultGasPrice);
export const defaultUploadAndInstantiateFee = calculateFee(2_000_000, defaultGasPrice);
export const defaultExecuteFee = calculateFee(200_000, defaultGasPrice);
export const defaultMigrateFee = calculateFee(200_000, defaultGasPrice);
export const defaultUpdateAdminFee = calculateFee(80_000, defaultGasPrice);
export const defaultClearAdminFee = calculateFee(80_000, defaultGasPrice);

/** An internal testing type. SigningCosmWasmClient has a similar but different interface */
export interface ContractUploadInstructions {
  /** The wasm bytecode */
  readonly data: Uint8Array;
}

export const simapp = {
  tendermintUrl: "localhost:26658",
  tendermintUrlWs: "ws://localhost:26658",
  tendermintUrlHttp: "http://localhost:26658",
  chainId: "simd-testing",
  prefix: "link",
  denomStaking: "stake",
  denomFee: "cony",
  blockTime: 1_000, // ms
  totalSupply: 1100000000000, // cony
  govMinDeposit: coins(10000000, "stake"),
  validator: {
    address: "linkvaloper146asaycmtydq45kxc8evntqfgepagygeddajpy",
  },
};

export const counterpartSimapp = {
  tendermintUrl: "localhost:26558",
  tendermintUrlWs: "ws://localhost:26558",
  tendermintUrlHttp: "http://localhost:26558",
  chainId: "simd-testing",
  prefix: "link",
  denomStaking: "stake",
  denomFee: "brown",
};

/** Setting to speed up testing */
export const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
};

export function getHackatom(): ContractUploadInstructions {
  return {
    data: fromBase64(hackatom.data),
  };
}

export function makeRandomAddress(): string {
  return toBech32("link", Random.getBytes(20));
}

export const tendermintIdMatcher = /^[0-9A-F]{64}$/;
/** @see https://rgxdb.com/r/1NUN74O6 */
export const base64Matcher =
  /^(?:[a-zA-Z0-9+/]{4})*(?:|(?:[a-zA-Z0-9+/]{3}=)|(?:[a-zA-Z0-9+/]{2}==)|(?:[a-zA-Z0-9+/]{1}===))$/;
// https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32
export const bech32AddressMatcher = /^[\x21-\x7e]{1,83}1[02-9ac-hj-np-z]{38,58}$/;

export const faucet = {
  mnemonic:
    "mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have",
  pubkey0: {
    type: "tendermint/PubKeySecp256k1",
    value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
  },
  pubkey1: {
    type: "tendermint/PubKeySecp256k1",
    value: "Au7fdDpmcXLbuxH5z6PvvzUaKQI6EeDY5GNt9e17cYxk",
  },
  pubkey2: {
    type: "tendermint/PubKeySecp256k1",
    value: "A45xEMprNuuMDvoSyN35OFzMSjgN3JfU0JrtDigGL1li",
  },
  pubkey3: {
    type: "tendermint/PubKeySecp256k1",
    value: "A++1IDp1lAwqi1/nSxjRwsUAgMuabMHaOaxEgszpHH3O",
  },
  pubkey4: {
    type: "tendermint/PubKeySecp256k1",
    value: "AiprmR/HER1JI4/kF49WNZUND57MygR4myw1HrqlJ8if",
  },
  pubkey5: {
    type: "tendermint/PubKeySecp256k1",
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
    type: "tendermint/PubKeySecp256k1",
    value: "A7Tvuh48+JzNyBnTeK2Qw987f5FqFHK/QH65pTVsZvuh",
  },
  address: "link1g7gsgktl9yjqatacswlwvns5yzy4u5jehsx2pz",
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
    type: "tendermint/PubKeySecp256k1",
    value: "AsVtdRaoc8AsTmzIvRAKWSYgHXf97/HI4ls2wENFk9C8",
  },
  /**
   * delegator_address from /cosmos.staking.v1beta1.MsgCreateValidator in scripts/simapp42/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].delegator_address" scripts/simapp42/template/.simapp/config/genesis.json
   * ```
   */
  delegatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
  /**
   * validator_address from /cosmos.staking.v1beta1.MsgCreateValidator in scripts/simapp42/template/.simapp/config/genesis.json
   *
   * ```
   * jq ".app_state.genutil.gen_txs[0].body.messages[0].validator_address" scripts/simapp42/template/.simapp/config/genesis.json
   * ```
   */
  validatorAddress: "linkvaloper1twsfmuj28ndph54k4nw8crwu8h9c8mh33lyrp8",
  accountNumber: 10,
  sequence: 1,
};

export const nonExistentAddress = "link1hvuxwh9sp2zlc3ee5nnhngln6auv4ak4kyuspq";

/** Deployed as part of scripts/wasmd/init.sh */
export const deployedHackatom = {
  codeId: 1,
  checksum: "470c5b703a682f778b8b088d48169b8d6e43f7f44ac70316692cdbe69e6605e3",
  instances: [
    {
      beneficiary: faucet.address0,
      address: "link14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sgf2vn8",
      label: "From deploy_hackatom.js (0)",
    },
    {
      beneficiary: faucet.address1,
      address: "link1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrshuxemw",
      label: "From deploy_hackatom.js (1)",
    },
    {
      beneficiary: faucet.address2,
      address: "link1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtq6cjue5",
      label: "From deploy_hackatom.js (2)",
    },
  ],
};

/** Deployed as part of scripts/wasmd/init.sh */
export const deployedIbcReflect = {
  codeId: 2,
  instances: [
    {
      address: "link1aakfpghcanxtc45gpqlx8j3rq0zcpyf49qmhm9mdjrfx036h4z5s782d42",
      ibcPortId: "wasm.link1aakfpghcanxtc45gpqlx8j3rq0zcpyf49qmhm9mdjrfx036h4z5s782d42",
    },
  ],
};
export function simappEnabled(): boolean {
  return !!process.env.SIMAPP_ENABLED;
}

export function ibcEnabled(): boolean {
  return !!process.env.IBC_ENABLED;
}

export function pendingWithoutSimapp(): void {
  if (!simappEnabled()) {
    return pending("Set SIMAPP_ENABLED to enable simapp-based tests");
  }
}

export function pendingWithoutIbc(): void {
  if (!ibcEnabled()) {
    return pending("Set IBC_ENABLED to enable ibc-based tests");
  }
}

/** Returns first element. Throws if array has a different length than 1. */
export function fromOneElementArray<T>(elements: ArrayLike<T>): T {
  if (elements.length !== 1) throw new Error(`Expected exactly one element but got ${elements.length}`);
  return elements[0];
}

export async function makeWasmClient(
  endpoint: string,
): Promise<QueryClient & AuthExtension & BankExtension & WasmExtension & WasmplusExtension> {
  const tmClient = await Tendermint34Client.connect(endpoint);
  return QueryClient.withExtensions(
    tmClient,
    setupAuthExtension,
    setupBankExtension,
    setupWasmExtension,
    setupWasmplusExtension,
  );
}

export function makeNotFoundMessage(log: string): string {
  return `rpc error: code = NotFound desc = ${log}: key not found`;
}

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
    const modifiedFeeGranter = undefined;
    const modifiedFeePayer = undefined;
    const modifiedSignDoc = {
      ...signDoc,
      bodyBytes: Uint8Array.from(TxBody.encode(modifiedTxBody).finish()),
      authInfoBytes: makeAuthInfoBytes(
        signers,
        modifiedFeeAmount,
        modifiedGasLimit,
        modifiedFeeGranter,
        modifiedFeePayer,
        SignMode.SIGN_MODE_DIRECT,
      ),
    };
    return super.signDirect(address, modifiedSignDoc);
  }
}
