/* eslint-disable @typescript-eslint/naming-convention */
import { addCoins, Secp256k1HdWallet } from "@cosmjs/amino";
import {
  instantiate2Address,
  MsgExecuteContractEncodeObject,
  MsgStoreCodeEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import { sha256 } from "@cosmjs/crypto";
import { toHex, toUtf8 } from "@cosmjs/encoding";
import { decodeTxRaw, DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import {
  AminoMsgDelegate,
  AminoTypes,
  assertIsDeliverTxFailure,
  assertIsDeliverTxSuccess,
  coin,
  coins,
  createStakingAminoConverters,
  isDeliverTxFailure,
  MsgDelegateEncodeObject,
  MsgSendEncodeObject,
} from "@cosmjs/stargate";
import { assert, sleep } from "@cosmjs/utils";
import { DeepPartial } from "cosmjs-types";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgExecuteContract, MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { AccessConfig, AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import Long from "long";
import pako from "pako";
import protobuf from "protobufjs/minimal";

import { makeLinkPath } from "./paths";
import { SigningFinschiaClient } from "./signingfinschiaclient";
import {
  defaultClearAdminFee,
  defaultExecuteFee,
  defaultGasPrice,
  defaultInstantiateFee,
  defaultMigrateFee,
  defaultSendFee,
  defaultSigningClientOptions,
  defaultUpdateAdminFee,
  defaultUploadAndInstantiateFee,
  defaultUploadFee,
  deployedHackatom,
  faucet,
  getHackatom,
  makeRandomAddress,
  makeWasmClient,
  ModifyingDirectSecp256k1HdWallet,
  ModifyingSecp256k1HdWallet,
  pendingWithoutSimapp,
  simapp,
  unused,
  validator,
} from "./testutils.spec";

describe("SigningFinschiaClient", () => {
  describe("connectWithSigner", () => {
    it("can be constructed", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
        ...defaultSigningClientOptions,
      });
      expect(client).toBeTruthy();
      client.disconnect();
    });

    it("can be constructed with custom registry", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const registry = new Registry();
      registry.register("/custom.MsgCustom", MsgSend);
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix, registry: registry };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      expect(client.registry.lookupType("/custom.MsgCustom")).toEqual(MsgSend);
      client.disconnect();
    });
  });

  describe("simulate", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

      const executeContractMsg: MsgExecuteContractEncodeObject = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: faucet.address0,
          contract: deployedHackatom.instances[0].address,
          msg: toUtf8(`{"release":{}}`),
          funds: [],
        }),
      };
      const memo = "Go go go";
      const gasUsed = await client.simulate(faucet.address0, [executeContractMsg], memo);
      expect(gasUsed).toBeGreaterThanOrEqual(80_000);
      expect(gasUsed).toBeLessThanOrEqual(95_000);
      client.disconnect();
    });
  });

  describe("sendTokens", () => {
    it("works with direct signer", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const amount = coins(7890, "cony");
      const beneficiaryAddress = makeRandomAddress();
      const memo = "for dinner";

      // no tokens here

      const before = await client.getBalance(beneficiaryAddress, "cony");
      expect(before).toEqual({
        denom: "cony",
        amount: "0",
      });

      // send
      const result = await client.sendTokens(
        faucet.address0,
        beneficiaryAddress,
        amount,
        defaultSendFee,
        memo,
      );
      assertIsDeliverTxSuccess(result);
      expect(result.rawLog).toBeTruthy();

      // got tokens
      const after = await client.getBalance(beneficiaryAddress, "cony");
      expect(after).toEqual(amount[0]);
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const amount = coins(7890, "cony");
      const beneficiaryAddress = makeRandomAddress();
      const memo = "for dinner";

      // no tokens here
      const before = await client.getBalance(beneficiaryAddress, "cony");
      expect(before).toEqual({
        denom: "cony",
        amount: "0",
      });

      // send
      const result = await client.sendTokens(
        faucet.address0,
        beneficiaryAddress,
        amount,
        defaultSendFee,
        memo,
      );
      assertIsDeliverTxSuccess(result);
      expect(result.rawLog).toBeTruthy();

      // got tokens
      const after = await client.getBalance(beneficiaryAddress, "cony");
      expect(after).toEqual(amount[0]);
    });
  });

  describe("sendIbcTokens", () => {
    it("works with direct signing", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );
      const memo = "Cross-chain fun";
      const fee = {
        amount: coins(2000, "cony"),
        gas: "180000", // 180k
      };

      // both timeouts set
      {
        const result = await client.sendIbcTokens(
          faucet.address0,
          faucet.address1,
          coin(1234, "cony"),
          "fooPort",
          "fooChannel",
          { revisionHeight: Long.fromNumber(123), revisionNumber: Long.fromNumber(456) },
          Math.floor(Date.now() / 1000) + 60,
          fee,
          memo,
        );
        // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
        expect(isDeliverTxFailure(result)).toEqual(true);
      }

      // no height timeout
      {
        const result = await client.sendIbcTokens(
          faucet.address0,
          faucet.address1,
          coin(1234, "cony"),
          "fooPort",
          "fooChannel",
          undefined,
          Math.floor(Date.now() / 1000) + 60,
          fee,
          memo,
        );
        // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
        expect(isDeliverTxFailure(result)).toEqual(true);
      }
    });

    it("works with Amino signing", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );
      const memo = "Cross-chain fun";
      const fee = {
        amount: coins(2000, "cony"),
        gas: "180000", // 180k
      };

      // both timeouts set
      {
        const result = await client.sendIbcTokens(
          faucet.address0,
          faucet.address1,
          coin(1234, "cony"),
          "fooPort",
          "fooChannel",
          { revisionHeight: Long.fromNumber(123), revisionNumber: Long.fromNumber(456) },
          Math.floor(Date.now() / 1000) + 60,
          fee,
          memo,
        );
        // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
        expect(isDeliverTxFailure(result)).toEqual(true);
      }

      // no height timeout
      {
        const result = await client.sendIbcTokens(
          faucet.address0,
          faucet.address1,
          coin(1234, "cony"),
          "fooPort",
          "fooChannel",
          undefined,
          Math.floor(Date.now() / 1000) + 60,
          fee,
          memo,
        );
        // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
        expect(isDeliverTxFailure(result)).toEqual(true);
      }
    });
  });

  describe("upload", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const wasm = getHackatom().data;
      const { codeId, originalChecksum, originalSize, compressedChecksum, compressedSize } =
        await client.upload(faucet.address0, wasm, defaultUploadFee);
      expect(originalChecksum).toEqual(toHex(sha256(wasm)));
      expect(originalSize).toEqual(wasm.length);
      expect(compressedChecksum).toMatch(/^[0-9a-f]{64}$/);
      expect(compressedSize).toBeLessThan(wasm.length * 0.5);
      expect(codeId).toBeGreaterThanOrEqual(1);
      client.disconnect();
    });

    it("works with legacy Amino signer access type", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const wasm = getHackatom().data;
      const accessConfig: AccessConfig = {
        permission: AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES,
        address: "",
        addresses: [faucet.address0],
      };
      const { codeId, originalChecksum, originalSize, compressedChecksum, compressedSize } =
        await client.upload(faucet.address0, wasm, defaultUploadFee, "test memo", accessConfig);
      expect(originalChecksum).toEqual(toHex(sha256(wasm)));
      expect(originalSize).toEqual(wasm.length);
      expect(compressedChecksum).toMatch(/^[0-9a-f]{64}$/);
      expect(compressedSize).toBeLessThan(wasm.length * 0.5);
      expect(codeId).toBeGreaterThanOrEqual(1);
      client.disconnect();
    });
  });

  describe("instantiate", () => {
    it("works with transfer amount", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress, height, gasWanted, gasUsed } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          memo: "Let's see if the memo is used",
          funds: funds,
        },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const ucosmBalance = await wasmClient.bank.balance(contractAddress, "cony");
      const ustakeBalance = await wasmClient.bank.balance(contractAddress, "stake");
      expect(ucosmBalance).toEqual(funds[0]);
      expect(ustakeBalance).toEqual(funds[1]);
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      client.disconnect();
    });

    it("works with admin", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress, height, gasWanted, gasUsed } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        { admin: unused.address },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo);
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      expect(contractInfo.admin).toEqual(unused.address);
      client.disconnect();
    });

    it("can instantiate one code multiple times", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const {
        contractAddress: address1,
        height,
        gasWanted,
        gasUsed,
      } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
      );
      const { contractAddress: address2 } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 2",
        defaultInstantiateFee,
      );
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      expect(address1).not.toEqual(address2);
      client.disconnect();
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

      // With admin
      await client.instantiate(
        faucet.address0,
        deployedHackatom.codeId,
        {
          verifier: faucet.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
        { admin: makeRandomAddress() },
      );

      // Without admin
      await client.instantiate(
        faucet.address0,
        deployedHackatom.codeId,
        {
          verifier: faucet.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
      );

      client.disconnect();
    });
  });

  describe("instantiate2", () => {
    it("can instantiate with predictable address", async () => {
      // Arrange
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };

      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const salt = Uint8Array.from([0x01]);
      const wasm = getHackatom().data;
      const msg = {
        verifier: faucet.address0,
        beneficiary: beneficiaryAddress,
      };
      const expectedAddress = instantiate2Address(sha256(wasm), faucet.address0, salt, simapp.prefix);

      // Act
      const { contractAddress } = await client.instantiate2(
        faucet.address0,
        codeId,
        msg,
        "My cool label--",
        defaultInstantiateFee,
        {
          memo: "Let's see if the memo is used",
          funds: funds,
          salt: salt,
        },
      );

      // Assert
      expect(contractAddress).toEqual(expectedAddress);
      client.disconnect();
    });
  });

  describe("uploadAndInstantiate", () => {
    it("works with transfer amount", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const wasm = getHackatom().data;
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { originalSize, originalChecksum, compressedSize, compressedChecksum, codeId, contractAddress } =
        await client.uploadAndInstantiate(
          faucet.address0,
          wasm,
          {
            verifier: faucet.address0,
            beneficiary: beneficiaryAddress,
          },
          "My Test label",
          defaultUploadAndInstantiateFee,
          {
            memo: "Let's see if the memo is used",
            funds: funds,
          },
        );
      expect(originalChecksum).toEqual(toHex(sha256(wasm)));
      expect(originalSize).toEqual(wasm.length);
      expect(compressedChecksum).toMatch(/^[0-9a-f]{64}$/);
      expect(compressedSize).toBeLessThan(wasm.length * 0.5);
      expect(codeId).toBeGreaterThanOrEqual(1);
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const conyBalance = await wasmClient.bank.balance(contractAddress, "cony");
      expect(conyBalance).toEqual(funds[0]);
      const stakeBalance = await wasmClient.bank.balance(contractAddress, "stake");
      expect(stakeBalance).toEqual(funds[1]);
      client.disconnect();
    });

    it("works with admin", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const wasm = getHackatom().data;
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.uploadAndInstantiate(
        faucet.address0,
        wasm,
        { verifier: faucet.address0, beneficiary: beneficiaryAddress },
        "My test label",
        defaultUploadAndInstantiateFee,
        { admin: unused.address },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo);
      expect(contractInfo.admin).toEqual(unused.address);
      client.disconnect();
    });

    it("works with legacy amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const wasm = getHackatom().data;
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { originalSize, originalChecksum, compressedSize, compressedChecksum, codeId, contractAddress } =
        await client.uploadAndInstantiate(
          faucet.address0,
          wasm,
          {
            verifier: faucet.address0,
            beneficiary: beneficiaryAddress,
          },
          "My",
          defaultUploadAndInstantiateFee,
          {
            memo: "Let's see if the memo is used",
            funds: funds,
            instantiatePermission: {
              permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS,
              address: faucet.address0,
              addresses: [],
            },
            admin: faucet.address0,
          },
        );
      expect(originalChecksum).toEqual(toHex(sha256(wasm)));
      expect(originalSize).toEqual(wasm.length);
      expect(compressedChecksum).toMatch(/^[0-9a-f]{64}$/);
      expect(compressedSize).toBeLessThan(wasm.length * 0.5);
      expect(codeId).toBeGreaterThanOrEqual(1);
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const conyBalance = await wasmClient.bank.balance(contractAddress, "cony");
      expect(conyBalance).toEqual(funds[0]);
      const stakeBalance = await wasmClient.bank.balance(contractAddress, "stake");
      expect(stakeBalance).toEqual(funds[1]);
      client.disconnect();
    });
  });

  describe("updateAdmin", () => {
    it("can update an admin", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,

        {
          admin: faucet.address0,
        },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(faucet.address0);

      const { height, gasUsed, gasWanted } = await client.updateAdmin(
        faucet.address0,
        contractAddress,
        unused.address,
        defaultUpdateAdminFee,
      );
      const { contractInfo: contractInfo2 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo2);
      expect(contractInfo2.admin).toEqual(unused.address);
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      client.disconnect();
    });
  });

  describe("clearAdmin", () => {
    it("can clear an admin", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          admin: faucet.address0,
        },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(faucet.address0);

      const { height, gasUsed, gasWanted } = await client.clearAdmin(
        faucet.address0,
        contractAddress,
        defaultClearAdminFee,
      );
      const { contractInfo: contractInfo2 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo2);
      expect(contractInfo2.admin).toEqual("");
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      client.disconnect();
    });
  });

  describe("migrate", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId: codeId1 } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const { codeId: codeId2 } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId1,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          admin: faucet.address0,
        },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(faucet.address0);

      const newVerifier = makeRandomAddress();
      const { height, gasUsed, gasWanted } = await client.migrate(
        faucet.address0,
        contractAddress,
        codeId2,
        { verifier: newVerifier },
        defaultMigrateFee,
      );
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      const { contractInfo: contractInfo2 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo2);
      expect({ ...contractInfo2 }).toEqual({
        ...contractInfo1,
        codeId: Long.fromNumber(codeId2, true),
      });

      client.disconnect();
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId: codeId1 } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const { codeId: codeId2 } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId1,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        { admin: faucet.address0 },
      );
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(faucet.address0);

      const newVerifier = makeRandomAddress();
      await client.migrate(
        faucet.address0,
        contractAddress,
        codeId2,
        { verifier: newVerifier },
        defaultMigrateFee,
      );
      const { contractInfo: contractInfo2 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo2);
      expect({ ...contractInfo2 }).toEqual({
        ...contractInfo1,
        codeId: Long.fromNumber(codeId2, true),
      });

      client.disconnect();
    });
  });

  describe("execute", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      // instantiate
      const funds = [coin(233444, "cony"), coin(5454, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "amazing random contract",
        defaultInstantiateFee,
        {
          funds: funds,
        },
      );
      // execute
      const result = await client.execute(
        faucet.address0,
        contractAddress,
        { release: {} },
        defaultExecuteFee,
      );
      expect(result.height).toBeGreaterThan(0);
      expect(result.gasWanted).toBeGreaterThan(0);
      expect(result.gasUsed).toBeGreaterThan(0);
      const wasmEvent = result.logs[0].events.find((e) => e.type === "wasm");
      assert(wasmEvent, "Event of type wasm expected");
      expect(wasmEvent.attributes).toContain({ key: "action", value: "release" });
      expect(wasmEvent.attributes).toContain({
        key: "destination",
        value: beneficiaryAddress,
      });
      // Verify token transfer from contract to beneficiary
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const beneficiaryBalanceCony = await wasmClient.bank.balance(beneficiaryAddress, "cony");
      expect(beneficiaryBalanceCony).toEqual(funds[0]);
      const beneficiaryBalanceStake = await wasmClient.bank.balance(beneficiaryAddress, "stake");
      expect(beneficiaryBalanceStake).toEqual(funds[1]);
      const contractBalanceCony = await wasmClient.bank.balance(contractAddress, "cony");
      expect(contractBalanceCony).toEqual(coin(0, "cony"));
      const contractBalanceStake = await wasmClient.bank.balance(contractAddress, "stake");
      expect(contractBalanceStake).toEqual(coin(0, "stake"));

      client.disconnect();
    });

    it("works with fund", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      // instantiate
      const funds = [coin(233444, "cony"), coin(5454, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "amazing random contract",
        defaultInstantiateFee,
        {
          funds: funds,
        },
      );
      // execute
      const result = await client.execute(
        faucet.address0,
        contractAddress,
        { release: {} },
        defaultExecuteFee,
        "",
        funds,
      );
      expect(result.height).toBeGreaterThan(0);
      expect(result.gasWanted).toBeGreaterThan(0);
      expect(result.gasUsed).toBeGreaterThan(0);
      const wasmEvent = result.logs[0].events.find((e) => e.type === "wasm");
      assert(wasmEvent, "Event of type wasm expected");
      expect(wasmEvent.attributes).toContain({ key: "action", value: "release" });
      expect(wasmEvent.attributes).toContain({
        key: "destination",
        value: beneficiaryAddress,
      });
      // Verify token transfer from contract to beneficiary
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const beneficiaryBalanceCony = await wasmClient.bank.balance(beneficiaryAddress, "cony");
      expect(beneficiaryBalanceCony).toEqual(addCoins(funds[0], funds[0]));
      const beneficiaryBalanceStake = await wasmClient.bank.balance(beneficiaryAddress, "stake");
      expect(beneficiaryBalanceStake).toEqual(addCoins(funds[1], funds[1]));
      const contractBalanceCony = await wasmClient.bank.balance(contractAddress, "cony");
      expect(contractBalanceCony).toEqual(coin(0, "cony"));
      const contractBalanceStake = await wasmClient.bank.balance(contractAddress, "stake");
      expect(contractBalanceStake).toEqual(coin(0, "stake"));

      client.disconnect();
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);
      const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
      // instantiate
      const funds = [coin(233444, "cony"), coin(5454, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        faucet.address0,
        codeId,
        {
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        },
        "amazing random contract",
        defaultInstantiateFee,
        {
          funds: funds,
        },
      );
      // execute
      const result = await client.execute(
        faucet.address0,
        contractAddress,
        { release: {} },
        defaultExecuteFee,
      );
      const wasmEvent = result.logs[0].events.find((e) => e.type === "wasm");
      assert(wasmEvent, "Event of type wasm expected");
      expect(wasmEvent.attributes).toContain({ key: "action", value: "release" });
      expect(wasmEvent.attributes).toContain({
        key: "destination",
        value: beneficiaryAddress,
      });
      // Verify token transfer from contract to beneficiary
      const wasmClient = await makeWasmClient(simapp.tendermintUrl);
      const beneficiaryBalanceCony = await wasmClient.bank.balance(beneficiaryAddress, "cony");
      expect(beneficiaryBalanceCony).toEqual(funds[0]);
      const beneficiaryBalanceStake = await wasmClient.bank.balance(beneficiaryAddress, "stake");
      expect(beneficiaryBalanceStake).toEqual(funds[1]);
      const contractBalanceCony = await wasmClient.bank.balance(contractAddress, "cony");
      expect(contractBalanceCony).toEqual(coin(0, "cony"));
      const contractBalanceStake = await wasmClient.bank.balance(contractAddress, "stake");
      expect(contractBalanceStake).toEqual(coin(0, "stake"));

      client.disconnect();
    });
  });

  describe("signAndBroadcast", () => {
    describe("direct mode", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: msgDelegateTypeUrl,
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "180000", // 180k
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("returns DeliverTxFailure on DeliverTx failure", async () => {
        pendingWithoutSimapp();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        const msg = MsgSend.fromPartial({
          fromAddress: faucet.address0,
          toAddress: makeRandomAddress(),
          amount: coins(Number.MAX_SAFE_INTEGER, "stake"),
        });
        const msgAny: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "99000",
        };
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee);
        assertIsDeliverTxFailure(result);
        expect(result.code).toBeGreaterThan(0);
        expect(result.gasWanted).toEqual(99_000);
        expect(result.gasUsed).toBeLessThanOrEqual(99_000);
        // todo: I don't know why fail.
        expect(result.gasUsed).toBeGreaterThan(28_000);
      });

      it("works with auto gas", async () => {
        pendingWithoutSimapp();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
          gasPrice: defaultGasPrice,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: msgDelegateTypeUrl,
          value: msg,
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], "auto", memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutSimapp();
        const wallet = await ModifyingDirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: msgDelegateTypeUrl,
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "180000", // 180k
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        await sleep(500);

        const searchResult = await client.getTx(result.transactionHash);
        assert(searchResult, "Must find transaction");
        const tx = decodeTxRaw(searchResult.tx);
        // From ModifyingDirectSecp256k1HdWallet
        expect(tx.body.memo).toEqual("This was modified");
        expect({ ...tx.authInfo.fee!.amount[0] }).toEqual(coin(3000, "cony"));
        expect(tx.authInfo.fee!.gasLimit.toNumber()).toEqual(333333);

        client.disconnect();
      });
    });

    describe("legacy Amino mode", () => {
      it("works with special characters in memo", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        const msgSend: MsgSend = {
          fromAddress: faucet.address0,
          toAddress: makeRandomAddress(),
          amount: coins(1234, "cony"),
        };
        const msgAny: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: msgSend,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "ampersand:&,lt:<,gt:>";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);
      });

      it("works with bank MsgSend", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });

        const msgSend: MsgSend = {
          fromAddress: faucet.address0,
          toAddress: makeRandomAddress(),
          amount: coins(1234, "cony"),
        };
        const msgAny: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: msgSend,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with staking MsgDelegate", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters()),
        });

        const msgDelegate: MsgDelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msgDelegate,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with wasm MsgStoreCode", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });
        const { data } = getHackatom();

        const msgStoreCode: MsgStoreCode = {
          sender: faucet.address0,
          wasmByteCode: pako.gzip(data),
          instantiatePermission: undefined,
        };
        const msgAny: MsgStoreCodeEncodeObject = {
          typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
          value: msgStoreCode,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "1500000",
        };
        const memo = "Use your tokens wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a custom registry and custom message", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });

        const customRegistry = new Registry();
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";
        interface CustomMsgDelegate {
          customDelegatorAddress?: string;
          customValidatorAddress?: string;
          customAmount?: Coin;
        }
        const baseCustomMsgDelegate: CustomMsgDelegate = {
          customDelegatorAddress: "",
          customValidatorAddress: "",
        };
        const CustomMsgDelegate = {
          // Adapted from autogenerated MsgDelegate implementation
          encode(
            message: CustomMsgDelegate,
            writer: protobuf.Writer = protobuf.Writer.create(),
          ): protobuf.Writer {
            writer.uint32(10).string(message.customDelegatorAddress ?? "");
            writer.uint32(18).string(message.customValidatorAddress ?? "");
            if (message.customAmount !== undefined) {
              Coin.encode(message.customAmount, writer.uint32(26).fork()).ldelim();
            }
            return writer;
          },

          decode(): CustomMsgDelegate {
            throw new Error("decode method should not be required");
          },

          fromPartial(object: DeepPartial<CustomMsgDelegate>): CustomMsgDelegate {
            const message = { ...baseCustomMsgDelegate } as CustomMsgDelegate;
            if (object.customDelegatorAddress !== undefined && object.customDelegatorAddress !== null) {
              message.customDelegatorAddress = object.customDelegatorAddress;
            } else {
              message.customDelegatorAddress = "";
            }
            if (object.customValidatorAddress !== undefined && object.customValidatorAddress !== null) {
              message.customValidatorAddress = object.customValidatorAddress;
            } else {
              message.customValidatorAddress = "";
            }
            if (object.customAmount !== undefined && object.customAmount !== null) {
              message.customAmount = Coin.fromPartial(object.customAmount);
            } else {
              message.customAmount = undefined;
            }
            return message;
          },
        };
        customRegistry.register(msgDelegateTypeUrl, CustomMsgDelegate);
        const customAminoTypes = new AminoTypes({
          "/cosmos.staking.v1beta1.MsgDelegate": {
            aminoType: "cosmos-sdk/MsgDelegate",
            toAmino: ({
              customDelegatorAddress,
              customValidatorAddress,
              customAmount,
            }: CustomMsgDelegate): AminoMsgDelegate["value"] => {
              assert(customDelegatorAddress, "missing customDelegatorAddress");
              assert(customValidatorAddress, "missing validatorAddress");
              assert(customAmount, "missing amount");
              assert(customAmount.amount, "missing amount.amount");
              assert(customAmount.denom, "missing amount.denom");
              return {
                delegator_address: customDelegatorAddress,
                validator_address: customValidatorAddress,
                amount: {
                  amount: customAmount.amount,
                  denom: customAmount.denom,
                },
              };
            },
            fromAmino: ({
              delegator_address,
              validator_address,
              amount,
            }: AminoMsgDelegate["value"]): CustomMsgDelegate => ({
              customDelegatorAddress: delegator_address,
              customValidatorAddress: validator_address,
              customAmount: Coin.fromPartial(amount),
            }),
          },
        });
        const options = {
          ...defaultSigningClientOptions,
          prefix: simapp.prefix,
          registry: customRegistry,
          aminoTypes: customAminoTypes,
        };
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

        const msg = {
          customDelegatorAddress: faucet.address0,
          customValidatorAddress: validator.validatorAddress,
          customAmount: coin(1234, "stake"),
        };
        const msgAny = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutSimapp();
        const wallet = await ModifyingSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters()),
        });

        const msg = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        await sleep(500);

        const searchResult = await client.getTx(result.transactionHash);
        assert(searchResult, "Must find transaction");
        const tx = decodeTxRaw(searchResult.tx);
        // From ModifyingSecp256k1HdWallet
        expect(tx.body.memo).toEqual("This was modified");
        expect({ ...tx.authInfo.fee!.amount[0] }).toEqual(coin(3000, "cony"));
        expect(tx.authInfo.fee!.gasLimit.toNumber()).toEqual(333333);

        client.disconnect();
      });
    });
  });

  describe("sign", () => {
    describe("direct mode", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "180000", // 180k
        };
        const memo = "Use your power wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutSimapp();
        const wallet = await ModifyingDirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "180000", // 180k
        };
        const memo = "Use your power wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        const body = TxBody.decode(signed.bodyBytes);
        const authInfo = AuthInfo.decode(signed.authInfoBytes);
        // From ModifyingDirectSecp256k1HdWallet
        expect(body.memo).toEqual("This was modified");
        expect({ ...authInfo.fee!.amount[0] }).toEqual(coin(3000, "cony"));
        expect(authInfo.fee!.gasLimit.toNumber()).toEqual(333333);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });
    });

    describe("legacy Amino mode", () => {
      it("works with bank MsgSend", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
        });

        const msgSend: MsgSend = {
          fromAddress: faucet.address0,
          toAddress: makeRandomAddress(),
          amount: coins(1234, "cony"),
        };
        const msgAny: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: msgSend,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with staking MsgDelegate", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters()),
        });

        const msgDelegate: MsgDelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msgDelegate,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a custom registry and custom message", async () => {
        pendingWithoutSimapp();
        const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });

        const customRegistry = new Registry();
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";
        interface CustomMsgDelegate {
          customDelegatorAddress?: string;
          customValidatorAddress?: string;
          customAmount?: Coin;
        }
        const baseCustomMsgDelegate: CustomMsgDelegate = {
          customDelegatorAddress: "",
          customValidatorAddress: "",
        };
        const CustomMsgDelegate = {
          // Adapted from autogenerated MsgDelegate implementation
          encode(
            message: CustomMsgDelegate,
            writer: protobuf.Writer = protobuf.Writer.create(),
          ): protobuf.Writer {
            writer.uint32(10).string(message.customDelegatorAddress ?? "");
            writer.uint32(18).string(message.customValidatorAddress ?? "");
            if (message.customAmount !== undefined && message.customAmount !== undefined) {
              Coin.encode(message.customAmount, writer.uint32(26).fork()).ldelim();
            }
            return writer;
          },

          decode(): CustomMsgDelegate {
            throw new Error("decode method should not be required");
          },

          fromPartial(object: DeepPartial<CustomMsgDelegate>): CustomMsgDelegate {
            const message = { ...baseCustomMsgDelegate } as CustomMsgDelegate;
            if (object.customDelegatorAddress !== undefined && object.customDelegatorAddress !== null) {
              message.customDelegatorAddress = object.customDelegatorAddress;
            } else {
              message.customDelegatorAddress = "";
            }
            if (object.customValidatorAddress !== undefined && object.customValidatorAddress !== null) {
              message.customValidatorAddress = object.customValidatorAddress;
            } else {
              message.customValidatorAddress = "";
            }
            if (object.customAmount !== undefined && object.customAmount !== null) {
              message.customAmount = Coin.fromPartial(object.customAmount);
            } else {
              message.customAmount = undefined;
            }
            return message;
          },
        };
        customRegistry.register(msgDelegateTypeUrl, CustomMsgDelegate);
        const customAminoTypes = new AminoTypes({
          "/cosmos.staking.v1beta1.MsgDelegate": {
            aminoType: "cosmos-sdk/MsgDelegate",
            toAmino: ({
              customDelegatorAddress,
              customValidatorAddress,
              customAmount,
            }: CustomMsgDelegate): AminoMsgDelegate["value"] => {
              assert(customDelegatorAddress, "missing customDelegatorAddress");
              assert(customValidatorAddress, "missing validatorAddress");
              assert(customAmount, "missing amount");
              return {
                delegator_address: customDelegatorAddress,
                validator_address: customValidatorAddress,
                amount: {
                  amount: customAmount.amount,
                  denom: customAmount.denom,
                },
              };
            },
            fromAmino: ({
              delegator_address,
              validator_address,
              amount,
            }: AminoMsgDelegate["value"]): CustomMsgDelegate => ({
              customDelegatorAddress: delegator_address,
              customValidatorAddress: validator_address,
              customAmount: Coin.fromPartial(amount),
            }),
          },
        });
        const options = {
          ...defaultSigningClientOptions,
          registry: customRegistry,
          aminoTypes: customAminoTypes,
        };
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

        const msg: CustomMsgDelegate = {
          customDelegatorAddress: faucet.address0,
          customValidatorAddress: validator.validatorAddress,
          customAmount: coin(1234, "stake"),
        };
        const msgAny = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your power wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutSimapp();
        const wallet = await ModifyingSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters()),
        });

        const msg: MsgDelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const fee = {
          amount: coins(2000, "cony"),
          gas: "200000",
        };
        const memo = "Use your power wisely";
        const signed = await client.sign(faucet.address0, [msgAny], fee, memo);

        const body = TxBody.decode(signed.bodyBytes);
        const authInfo = AuthInfo.decode(signed.authInfoBytes);
        // From ModifyingSecp256k1HdWallet
        expect(body.memo).toEqual("This was modified");
        expect({ ...authInfo.fee!.amount[0] }).toEqual(coin(3000, "cony"));
        expect(authInfo.fee!.gasLimit.toNumber()).toEqual(333333);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });
    });
  });
});
