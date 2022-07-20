/* eslint-disable @typescript-eslint/naming-convention */
import { sha256 } from "@cosmjs/crypto";
import { toHex, toUtf8 } from "@cosmjs/encoding";
import { assert, sleep } from "@cosmjs/utils";
import { Secp256k1HdWallet } from "@lbmjs/amino";
import { decodeTxRaw, DirectSecp256k1HdWallet, Registry } from "@lbmjs/proto-signing";
import {
  AminoMsgDelegate,
  AminoTypes,
  assertIsDeliverTxSuccess,
  coin,
  coins,
  createStakingAminoConverters,
  MsgDelegateEncodeObject,
  MsgSendEncodeObject,
} from "@lbmjs/stargate";
import { DeepPartial, MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgExecuteContract, MsgStoreCode } from "lbmjs-types/lbm/wasm/v1/tx";
import Long from "long";
import pako from "pako";
import protobuf from "protobufjs/minimal";

import { MsgExecuteContractEncodeObject, MsgStoreCodeEncodeObject } from "./modules";
import { SigningCosmWasmClient } from "./signingcosmwasmclient";
import {
  alice,
  defaultClearAdminFee,
  defaultExecuteFee,
  defaultGasPrice,
  defaultInstantiateFee,
  defaultMigrateFee,
  defaultSendFee,
  defaultSigningClientOptions,
  defaultUpdateAdminFee,
  defaultUploadFee,
  deployedHackatom,
  getHackatom,
  makeRandomAddress,
  makeWasmClient,
  ModifyingDirectSecp256k1HdWallet,
  ModifyingSecp256k1HdWallet,
  pendingWithoutWasmd,
  unused,
  validator,
  wasmd,
} from "./testutils.spec";

describe("SigningCosmWasmClient", () => {
  describe("connectWithSigner", () => {
    it("can be constructed", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
        ...defaultSigningClientOptions,
        prefix: wasmd.prefix,
      });
      expect(client).toBeTruthy();
      client.disconnect();
    });

    it("can be constructed with custom registry", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic);
      const registry = new Registry();
      registry.register("/custom.MsgCustom", MsgSend);
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix, registry: registry };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      expect(client.registry.lookupType("/custom.MsgCustom")).toEqual(MsgSend);
      client.disconnect();
    });
  });

  describe("simulate", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

      const executeContractMsg: MsgExecuteContractEncodeObject = {
        typeUrl: "/lbm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: alice.address0,
          contract: deployedHackatom.instances[0].address,
          msg: toUtf8(`{"release":{}}`),
          funds: [],
        }),
      };
      const memo = "Go go go";
      const gasUsed = await client.simulate(alice.address0, [executeContractMsg], memo);
      expect(gasUsed).toBeGreaterThanOrEqual(61_000);
      expect(gasUsed).toBeLessThanOrEqual(67_000);
      client.disconnect();
    });
  });

  describe("upload", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const wasm = getHackatom().data;
      const { codeId, originalChecksum, originalSize, compressedChecksum, compressedSize } =
        await client.upload(alice.address0, wasm, defaultUploadFee);
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
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress, height, gasWanted, gasUsed } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          memo: "Let's see if the memo is used",
          funds: funds,
        },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
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
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress, height, gasWanted, gasUsed } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        { admin: unused.address },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo);
      expect(height).toBeGreaterThan(0);
      expect(gasWanted).toBeGreaterThan(0);
      expect(gasUsed).toBeGreaterThan(0);
      expect(contractInfo.admin).toEqual(unused.address);
      client.disconnect();
    });

    it("can instantiate one code multiple times", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const {
        contractAddress: address1,
        height,
        gasWanted,
        gasUsed,
      } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
      );
      const { contractAddress: address2 } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
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
      pendingWithoutWasmd();
      const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

      // With admin
      await client.instantiate(
        alice.address0,
        deployedHackatom.codeId,
        {
          verifier: alice.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
        { admin: makeRandomAddress() },
      );

      // Without admin
      await client.instantiate(
        alice.address0,
        deployedHackatom.codeId,
        {
          verifier: alice.address0,
          beneficiary: makeRandomAddress(),
        },
        "contract 1",
        defaultInstantiateFee,
      );

      client.disconnect();
    });
  });

  describe("uploadAndInstantiate", () => {
    it("works with transfer amount", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const wasm = getHackatom().data;
      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { originalSize, originalChecksum, compressedSize, compressedChecksum, codeId, contractAddress } =
        await client.uploadAndInstantiate(
          alice.address0,
          wasm,
          {
            verifier: alice.address0,
            beneficiary: beneficiaryAddress,
          },
          "My Test label",
          defaultUploadFee,
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
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const conyBalance = await wasmClient.bank.balance(contractAddress, "cony");
      expect(conyBalance).toEqual(funds[0]);
      const stakeBalance = await wasmClient.bank.balance(contractAddress, "stake");
      expect(stakeBalance).toEqual(funds[1]);
      client.disconnect();
    });

    it("works with admin", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const wasm = getHackatom().data;
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.uploadAndInstantiate(
        alice.address0,
        wasm,
        { verifier: alice.address0, beneficiary: beneficiaryAddress },
        "My test label",
        defaultUploadFee,
        { admin: unused.address },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo);
      expect(contractInfo.admin).toEqual(unused.address);
      client.disconnect();
    });
  });

  describe("updateAdmin", () => {
    it("can update an admin", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,

        {
          admin: alice.address0,
        },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(alice.address0);

      const { height, gasUsed, gasWanted } = await client.updateAdmin(
        alice.address0,
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
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          admin: alice.address0,
        },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(alice.address0);

      const { height, gasUsed, gasWanted } = await client.clearAdmin(
        alice.address0,
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
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId: codeId1 } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const { codeId: codeId2 } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId1,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        {
          admin: alice.address0,
        },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(alice.address0);

      const newVerifier = makeRandomAddress();
      const { height, gasUsed, gasWanted } = await client.migrate(
        alice.address0,
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
      pendingWithoutWasmd();
      const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId: codeId1 } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const { codeId: codeId2 } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId1,
        {
          verifier: alice.address0,
          beneficiary: beneficiaryAddress,
        },
        "My cool label",
        defaultInstantiateFee,
        { admin: alice.address0 },
      );
      const wasmClient = await makeWasmClient(wasmd.endpoint);
      const { contractInfo: contractInfo1 } = await wasmClient.wasm.getContractInfo(contractAddress);
      assert(contractInfo1);
      expect(contractInfo1.admin).toEqual(alice.address0);

      const newVerifier = makeRandomAddress();
      await client.migrate(
        alice.address0,
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
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      // instantiate
      const funds = [coin(233444, "cony"), coin(5454, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
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
        alice.address0,
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
      const wasmClient = await makeWasmClient(wasmd.endpoint);
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

    it("works with legacy Amino signer", async () => {
      pendingWithoutWasmd();
      const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);
      const { codeId } = await client.upload(alice.address0, getHackatom().data, defaultUploadFee);
      // instantiate
      const funds = [coin(233444, "cony"), coin(5454, "stake")];
      const beneficiaryAddress = makeRandomAddress();
      const { contractAddress } = await client.instantiate(
        alice.address0,
        codeId,
        {
          verifier: alice.address0,
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
        alice.address0,
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
      const wasmClient = await makeWasmClient(wasmd.endpoint);
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

  describe("sendTokens", () => {
    it("works with direct signer", async () => {
      pendingWithoutWasmd();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

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
        alice.address0,
        beneficiaryAddress,
        amount,
        defaultSendFee,
        memo,
      );
      assertIsDeliverTxSuccess(result);
      expect(result.rawLog).toBeTruthy();

      // got tokens
      const after = await client.getBalance(beneficiaryAddress, "cony");
      assert(after);
      expect(after).toEqual(amount[0]);

      client.disconnect();
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutWasmd();
      const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
      const options = { ...defaultSigningClientOptions, prefix: wasmd.prefix };
      const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

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
        alice.address0,
        beneficiaryAddress,
        amount,
        defaultSendFee,
        memo,
      );
      assertIsDeliverTxSuccess(result);
      expect(result.rawLog).toBeTruthy();

      // got tokens
      const after = await client.getBalance(beneficiaryAddress, "cony");
      assert(after);
      expect(after).toEqual(amount[0]);

      client.disconnect();
    });
  });

  describe("signAndBroadcast", () => {
    describe("direct mode", () => {
      it("works", async () => {
        pendingWithoutWasmd();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: alice.address0,
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
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with auto gas", async () => {
        pendingWithoutWasmd();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
          gasPrice: defaultGasPrice,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: alice.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        });
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: msgDelegateTypeUrl,
          value: msg,
        };
        const memo = "Use your power wisely";
        const result = await client.signAndBroadcast(alice.address0, [msgAny], "auto", memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutWasmd();
        const wallet = await ModifyingDirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, {
          prefix: wasmd.prefix,
        });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });
        const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: alice.address0,
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
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
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
      it("works with bank MsgSend", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });

        const msgSend: MsgSend = {
          fromAddress: alice.address0,
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
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with staking MsgDelegate", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters(wasmd.prefix)),
          prefix: wasmd.prefix,
        });

        const msgDelegate: MsgDelegate = {
          delegatorAddress: alice.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msgDelegate,
        };
        const fee = {
          amount: coins(2000, "stake"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with wasm MsgStoreCode", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });
        const { data } = getHackatom();

        const msgStoreCode: MsgStoreCode = {
          sender: alice.address0,
          wasmByteCode: pako.gzip(data),
          instantiatePermission: undefined,
        };
        const msgAny: MsgStoreCodeEncodeObject = {
          typeUrl: "/lbm.wasm.v1.MsgStoreCode",
          value: msgStoreCode,
        };
        const fee = {
          amount: coins(2000, "stake"),
          gas: "1500000",
        };
        const memo = "Use your tokens wisely";
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a custom registry and custom message", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });

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

          fromJSON(): CustomMsgDelegate {
            throw new Error("fromJSON method should not be required");
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

          toJSON(): unknown {
            throw new Error("toJSON method should not be required");
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
          prefix: wasmd.prefix,
          registry: customRegistry,
          aminoTypes: customAminoTypes,
        };
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

        const msg = {
          customDelegatorAddress: alice.address0,
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
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutWasmd();
        const wallet = await ModifyingSecp256k1HdWallet.fromMnemonic(alice.mnemonic, {
          prefix: wasmd.prefix,
        });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters(wasmd.prefix)),
          prefix: wasmd.prefix,
        });

        const msg = {
          delegatorAddress: alice.address0,
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
        const result = await client.signAndBroadcast(alice.address0, [msgAny], fee, memo);
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
        pendingWithoutWasmd();
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: alice.address0,
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
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutWasmd();
        const wallet = await ModifyingDirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, {
          prefix: wasmd.prefix,
        });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });

        const msg = MsgDelegate.fromPartial({
          delegatorAddress: alice.address0,
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
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

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
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          prefix: wasmd.prefix,
        });

        const msgSend: MsgSend = {
          fromAddress: alice.address0,
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
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with staking MsgDelegate", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters(wasmd.prefix)),
          prefix: wasmd.prefix,
        });

        const msgDelegate: MsgDelegate = {
          delegatorAddress: alice.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(1234, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msgDelegate,
        };
        const fee = {
          amount: coins(2000, "stake"),
          gas: "200000",
        };
        const memo = "Use your tokens wisely";
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a custom registry and custom message", async () => {
        pendingWithoutWasmd();
        const wallet = await Secp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: wasmd.prefix });

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

          fromJSON(): CustomMsgDelegate {
            throw new Error("fromJSON method should not be required");
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

          toJSON(): unknown {
            throw new Error("toJSON method should not be required");
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
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, options);

        const msg: CustomMsgDelegate = {
          customDelegatorAddress: alice.address0,
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
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

        // ensure signature is valid
        const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
        assertIsDeliverTxSuccess(result);

        client.disconnect();
      });

      it("works with a modifying signer", async () => {
        pendingWithoutWasmd();
        const wallet = await ModifyingSecp256k1HdWallet.fromMnemonic(alice.mnemonic, {
          prefix: wasmd.prefix,
        });
        const client = await SigningCosmWasmClient.connectWithSigner(wasmd.endpoint, wallet, {
          ...defaultSigningClientOptions,
          aminoTypes: new AminoTypes(createStakingAminoConverters(wasmd.prefix)),
          prefix: wasmd.prefix,
        });

        const msg: MsgDelegate = {
          delegatorAddress: alice.address0,
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
        const signed = await client.sign(alice.address0, [msgAny], fee, memo);

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
