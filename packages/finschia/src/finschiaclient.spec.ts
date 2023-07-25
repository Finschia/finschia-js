/* eslint-disable @typescript-eslint/naming-convention */
import { coin, Secp256k1HdWallet } from "@cosmjs/amino";
import { Code } from "@cosmjs/cosmwasm-stargate";
import { sha256 } from "@cosmjs/crypto";
import { fromAscii, fromBase64, fromHex, toAscii, toBase64 } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  DirectSecp256k1HdWallet,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignDoc,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, coins, logs, MsgSendEncodeObject, StdFee } from "@cosmjs/stargate";
import { assert, sleep } from "@cosmjs/utils";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { ReadonlyDate } from "readonly-date";

import { FinschiaClient, PrivateFinschiaClient } from "./finschiaclient";
import { makeLinkPath } from "./paths";
import { SigningFinschiaClient } from "./signingfinschiaclient";
import {
  counterpartSimapp,
  defaultInstantiateFee,
  defaultSigningClientOptions,
  defaultUploadFee,
  deployedHackatom,
  deployedIbcReflect,
  faucet,
  getHackatom,
  makeRandomAddress,
  nonExistentAddress,
  pendingWithoutIbc,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
  tendermintIdMatcher,
  unused,
  validator,
} from "./testutils.spec";

interface HackatomInstance {
  readonly instantiateMsg: {
    readonly verifier: string;
    readonly beneficiary: string;
  };
  readonly address: string;
}

describe("FinschiaClient", () => {
  describe("connect", () => {
    it("can be constructed", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      expect(client).toBeTruthy();
      client.disconnect();
    });
  });

  describe("getChainId", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      expect(await client.getChainId()).toEqual(simapp.chainId);
      client.disconnect();
    });

    it("caches chain ID", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const openedClient = client as unknown as PrivateFinschiaClient;
      const getCodeSpy = spyOn(openedClient.tmClient!, "status").and.callThrough();

      expect(await client.getChainId()).toEqual(simapp.chainId); // from network
      expect(await client.getChainId()).toEqual(simapp.chainId); // from cache

      expect(getCodeSpy).toHaveBeenCalledTimes(1);

      client.disconnect();
    });
  });

  describe("getHeight", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const height1 = await client.getHeight();
      expect(height1).toBeGreaterThan(0);

      await sleep(simapp.blockTime * 1.4); // tolerate chain being 40% slower than expected

      const height2 = await client.getHeight();
      expect(height2).toBeGreaterThanOrEqual(height1 + 1);
      expect(height2).toBeLessThanOrEqual(height1 + 2);

      client.disconnect();
    });
  });

  describe("getAccount", () => {
    it("works for unused account", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      expect(await client.getAccount(unused.address)).toEqual({
        address: unused.address,
        accountNumber: unused.accountNumber,
        sequence: unused.sequence,
        pubkey: null,
      });

      client.disconnect();
    });

    it("works for account with pubkey and non-zero sequence", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const account = await client.getAccount(validator.delegatorAddress);
      assert(account);
      expect(account).toEqual({
        address: validator.delegatorAddress,
        pubkey: validator.pubkey,
        accountNumber: validator.accountNumber,
        sequence: 1,
      });

      client.disconnect();
    });

    it("returns null for missing accounts", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const missing = makeRandomAddress();
      expect(await client.getAccount(missing)).toBeNull();
    });
  });

  describe("getSequence", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      expect(await client.getSequence(unused.address)).toEqual({
        accountNumber: unused.accountNumber,
        sequence: unused.sequence,
      });
    });

    it("rejects for missing accounts", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const missing = makeRandomAddress();
      await expectAsync(client.getSequence(missing)).toBeRejectedWithError(
        /account '([a-z0-9]{10,90})' does not exist on chain/i,
      );
    });
  });

  describe("getBlock", () => {
    it("works for latest block", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const response = await client.getBlock();

      // id
      expect(response.id).toMatch(tendermintIdMatcher);

      // header
      expect(response.header.height).toBeGreaterThanOrEqual(1);
      expect(response.header.chainId).toEqual(await client.getChainId());
      expect(new ReadonlyDate(response.header.time).getTime()).toBeLessThan(ReadonlyDate.now());
      expect(new ReadonlyDate(response.header.time).getTime()).toBeGreaterThanOrEqual(
        ReadonlyDate.now() - 5_000,
      );

      // txs
      expect(Array.isArray(response.txs)).toEqual(true);
    });

    it("works for block by height", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const height = (await client.getBlock()).header.height;
      const response = await client.getBlock(height - 1);

      // id
      expect(response.id).toMatch(tendermintIdMatcher);

      // header
      expect(response.header.height).toEqual(height - 1);
      expect(response.header.chainId).toEqual(await client.getChainId());
      expect(new ReadonlyDate(response.header.time).getTime()).toBeLessThan(ReadonlyDate.now());
      expect(new ReadonlyDate(response.header.time).getTime()).toBeGreaterThanOrEqual(
        ReadonlyDate.now() - 5_000,
      );

      // txs
      expect(Array.isArray(response.txs)).toEqual(true);
    });
  });

  describe("broadcastTx", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const registry = new Registry();

      const memo = "My first contract on chain";
      const sendMsg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: faucet.address0,
          toAddress: makeRandomAddress(),
          amount: coins(1234567, "cony"),
        },
      };
      const fee: StdFee = {
        amount: coins(5000, "cony"),
        gas: "890000",
      };

      const chainId = await client.getChainId();
      const sequenceResponse = await client.getSequence(faucet.address0);
      assert(sequenceResponse);
      const { accountNumber, sequence } = sequenceResponse;
      const pubkey = encodePubkey(faucet.pubkey0);
      const txBody: TxBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: [sendMsg],
          memo: memo,
        },
      };
      const txBodyBytes = registry.encode(txBody);
      const gasLimit = Int53.fromString(fee.gas).toNumber();
      const feeGranter = undefined;
      const feePayer = undefined;
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence }],
        fee.amount,
        gasLimit,
        feeGranter,
        feePayer,
      );
      const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
      const { signed, signature } = await wallet.signDirect(faucet.address0, signDoc);
      const txRaw = TxRaw.fromPartial({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      });
      const signedTx = Uint8Array.from(TxRaw.encode(txRaw).finish());
      const result = await client.broadcastTx(signedTx);
      assertIsDeliverTxSuccess(result);
      const amountAttr = logs.findAttribute(logs.parseRawLog(result.rawLog), "transfer", "amount");
      expect(amountAttr.value).toEqual("1234567cony");
      expect(result.transactionHash).toMatch(/^[0-9A-F]{64}$/);
    });

    it("errors immediately for a CheckTx failure", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const [{ address, pubkey: pubkeyBytes }] = await wallet.getAccounts();
      const pubkey = encodePubkey({
        type: "tendermint/PubKeySecp256k1",
        value: toBase64(pubkeyBytes),
      });
      const registry = new Registry();
      const invalidRecipientAddress = "tgrade1z363ulwcrxged4z5jswyt5dn5v3lzsemwz9ewj"; // wrong bech32 prefix
      const txBodyFields: TxBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: {
                fromAddress: address,
                toAddress: invalidRecipientAddress,
                amount: [
                  {
                    denom: "cony",
                    amount: "1234567",
                  },
                ],
              },
            },
          ],
        },
      };
      const txBodyBytes = registry.encode(txBodyFields);
      const { accountNumber, sequence } = (await client.getSequence(address))!;
      const feeAmount = coins(2000, "cony");
      const gasLimit = 200000;
      const feeGranter = undefined;
      const feePayer = undefined;
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence }],
        feeAmount,
        gasLimit,
        feeGranter,
        feePayer,
        sequence,
      );

      const chainId = await client.getChainId();
      const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
      const { signature } = await wallet.signDirect(address, signDoc);
      const txRaw = TxRaw.fromPartial({
        bodyBytes: txBodyBytes,
        authInfoBytes: authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      });
      const txRawBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());

      await expectAsync(client.broadcastTx(txRawBytes)).toBeRejectedWithError(/invalid recipient address/i);

      client.disconnect();
    });
  });

  describe("getBalance", () => {
    it("works for different existing balances", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const response1 = await client.getBalance(unused.address, simapp.denomFee);
      expect(response1).toEqual({
        amount: unused.balanceFee,
        denom: simapp.denomFee,
      });
      const response2 = await client.getBalance(unused.address, simapp.denomStaking);
      expect(response2).toEqual({
        amount: unused.balanceStaking,
        denom: simapp.denomStaking,
      });

      client.disconnect();
    });

    describe("getBalanceStaked", () => {
      beforeAll(async () => {
        if (simappEnabled()) {
          const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
            hdPaths: [makeLinkPath(4)],
            prefix: simapp.prefix,
          });
          const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, {
            ...defaultSigningClientOptions,
          });
          await client.delegateTokens(faucet.address4, validator.validatorAddress, coin(1234, "stake"), {
            amount: coins(2000, "cony"),
            gas: "200000",
          });
        }
      });
      it("works", async () => {
        pendingWithoutSimapp();
        const client = await FinschiaClient.connect(simapp.tendermintUrl);
        const response = await client.getBalanceStaked(faucet.address4);

        expect(response).toEqual({ denom: "stake", amount: "1234" });
      });
    });

    it("returns 0 for non-existent balance", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const response = await client.getBalance(unused.address, "gintonic");
      expect(response).toEqual({
        denom: "gintonic",
        amount: "0",
      });

      client.disconnect();
    });

    it("returns 0 for non-existent address", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const response = await client.getBalance(nonExistentAddress, simapp.denomFee);
      expect(response).toEqual({
        denom: simapp.denomFee,
        amount: "0",
      });

      client.disconnect();
    });
  });

  describe("getAllBalances", () => {
    it("returns all balances for unused account", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const balances = await client.getAllBalances(unused.address);
      expect(balances).toEqual([
        {
          amount: unused.balanceFee,
          denom: simapp.denomFee,
        },
        {
          amount: unused.balanceStaking,
          denom: simapp.denomStaking,
        },
      ]);

      client.disconnect();
    });

    it("returns an empty list for non-existent account", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);

      const balances = await client.getAllBalances(nonExistentAddress);
      expect(balances).toEqual([]);

      client.disconnect();
    });
  });

  describe("getCodes", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const result = await client.getCodes();
      expect(result.length).toBeGreaterThanOrEqual(1);
      const [first] = result;
      expect(first).toEqual({
        id: deployedHackatom.codeId,
        checksum: deployedHackatom.checksum,
        creator: faucet.address0,
      });
    });
  });

  describe("getCodeDetails", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const result = await client.getCodeDetails(1);

      const expectedInfo: Code = {
        id: deployedHackatom.codeId,
        checksum: deployedHackatom.checksum,
        creator: faucet.address0,
      };

      // check info
      expect(result).toEqual(jasmine.objectContaining(expectedInfo));
      // check data
      expect(sha256(result.data)).toEqual(fromHex(expectedInfo.checksum));
    });

    it("caches downloads", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const openedClient = client as unknown as PrivateFinschiaClient;
      const getCodeSpy = spyOn(openedClient.queryClient!.wasm, "getCode").and.callThrough();

      const result1 = await client.getCodeDetails(deployedHackatom.codeId); // from network
      const result2 = await client.getCodeDetails(deployedHackatom.codeId); // from cache
      expect(result2).toEqual(result1);

      expect(getCodeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("getContracts", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const result = await client.getContracts(deployedHackatom.codeId);
      const expectedAddresses = deployedHackatom.instances.map((info) => info.address);

      // Test first 3 instances we get from scripts/wasmd/init.sh. There may me more than that in the result.
      expect(result[0]).toEqual(expectedAddresses[0]);
      expect(result[1]).toEqual(expectedAddresses[1]);
      expect(result[2]).toEqual(expectedAddresses[2]);
    });
  });

  describe("getContract", () => {
    it("works for instance without admin", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const zero = await client.getContract(deployedHackatom.instances[0].address);
      expect(zero).toEqual({
        address: deployedHackatom.instances[0].address,
        codeId: deployedHackatom.codeId,
        creator: faucet.address0,
        label: deployedHackatom.instances[0].label,
        admin: undefined,
        ibcPortId: undefined,
      });
    });

    it("works for instance with admin", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const two = await client.getContract(deployedHackatom.instances[2].address);
      expect(two).toEqual({
        address: deployedHackatom.instances[2].address,
        codeId: deployedHackatom.codeId,
        creator: faucet.address0,
        label: deployedHackatom.instances[2].label,
        admin: faucet.address1,
        ibcPortId: undefined,
      });
    });

    it("works for instance with IBC port ID", async () => {
      pendingWithoutSimapp();
      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const contract = await client.getContract(deployedIbcReflect.instances[0].address);
      expect(contract).toEqual(
        jasmine.objectContaining({
          address: deployedIbcReflect.instances[0].address,
          codeId: deployedIbcReflect.codeId,
          ibcPortId: deployedIbcReflect.instances[0].ibcPortId,
        }),
      );
    });
  });

  describe("queryContractRaw", () => {
    const configKey = toAscii("config");
    const otherKey = toAscii("this_does_not_exist");
    let contract: HackatomInstance | undefined;

    beforeAll(async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet);
        const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
        const instantiateMsg = { verifier: makeRandomAddress(), beneficiary: makeRandomAddress() };
        const label = "random hackatom";
        const { contractAddress } = await client.instantiate(
          faucet.address0,
          codeId,
          instantiateMsg,
          label,
          defaultInstantiateFee,
        );
        contract = { instantiateMsg: instantiateMsg, address: contractAddress };
      }
    });

    it("can query existing key", async () => {
      pendingWithoutSimapp();
      assert(contract);

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const raw = await client.queryContractRaw(contract.address, configKey);
      assert(raw, "must get result");
      expect(JSON.parse(fromAscii(raw))).toEqual({
        verifier: contract.instantiateMsg.verifier,
        beneficiary: contract.instantiateMsg.beneficiary,
        funder: faucet.address0,
      });
    });

    it("can query non-existent key", async () => {
      pendingWithoutSimapp();
      assert(contract);

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const raw = await client.queryContractRaw(contract.address, otherKey);
      expect(raw).toEqual(new Uint8Array());
    });

    it("errors for non-existent contract", async () => {
      pendingWithoutSimapp();
      assert(contract);

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      await expectAsync(client.queryContractRaw(nonExistentAddress, configKey)).toBeRejectedWithError(
        /not found/i,
      );
    });
  });

  describe("queryContractSmart", () => {
    let contract: HackatomInstance | undefined;

    beforeAll(async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet);
        const { codeId } = await client.upload(faucet.address0, getHackatom().data, defaultUploadFee);
        const instantiateMsg = { verifier: makeRandomAddress(), beneficiary: makeRandomAddress() };
        const label = "a different hackatom";
        const { contractAddress } = await client.instantiate(
          faucet.address0,
          codeId,
          instantiateMsg,
          label,
          defaultInstantiateFee,
        );
        contract = { instantiateMsg: instantiateMsg, address: contractAddress };
      }
    });

    it("works", async () => {
      pendingWithoutSimapp();
      assert(contract);

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const result = await client.queryContractSmart(contract.address, { verifier: {} });
      expect(result).toEqual({ verifier: contract.instantiateMsg.verifier });

      // Typed request (https://github.com/cosmos/cosmjs/pull/1281)
      interface VerifierQuery {
        verifier: Record<string, never>;
      }
      const request: VerifierQuery = { verifier: {} };
      const result2 = await client.queryContractSmart(contract.address, request);
      expect(result2).toEqual({ verifier: contract.instantiateMsg.verifier });
    });

    it("errors for malformed query message", async () => {
      pendingWithoutSimapp();
      assert(contract);

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      await expectAsync(client.queryContractSmart(contract.address, { broken: {} })).toBeRejectedWithError(
        /Error parsing into type hackatom::msg::QueryMsg: unknown variant/i,
      );
    });

    it("errors for non-existent contract", async () => {
      pendingWithoutSimapp();

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      await expectAsync(
        client.queryContractSmart(nonExistentAddress, { verifier: {} }),
      ).toBeRejectedWithError(/not found/i);
    });
  });

  describe("Query minimum gas price", () => {
    it("works", async () => {
      pendingWithoutSimapp();

      const client = await FinschiaClient.connect(simapp.tendermintUrl);
      const minimumGasPrice = await client.queryMinimumGasPrice();
      expect(minimumGasPrice).not.toBeNull();
      expect(minimumGasPrice).toBe("0.000100000000000000cony");
    });
  });

  describe("get denom trace", () => {
    const sendAmount = coin(1234, "cony");
    const randomAddress = makeRandomAddress();

    beforeAll(async () => {
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

      await client.sendIbcTokens(
        faucet.address0,
        randomAddress,
        sendAmount,
        "transfer",
        "channel-0",
        undefined,
        Math.floor(Date.now() / 1000) + 60,
        fee,
        memo,
      );

      // sleep until counterpart chain get ibc tx from relayer
      await sleep(3000);
    });
    it("works", async () => {
      pendingWithoutIbc();

      const counterpartClient = await FinschiaClient.connect(counterpartSimapp.tendermintUrl);
      const recipientBalances = await counterpartClient.getAllBalances(randomAddress);
      const ibcBalance = recipientBalances.find((balance) => balance.denom.startsWith("ibc/"));
      assert(ibcBalance, "ibc token should be exist");

      const ibcDenom = await counterpartClient.getDenomTrace(ibcBalance.denom);
      assert(ibcDenom);
      expect(ibcDenom.baseDenom).toEqual(sendAmount.denom);
    });
  });
});
