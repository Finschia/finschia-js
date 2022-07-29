import { assert, sleep } from "@cosmjs/utils";
import { coins } from "@lbmjs/amino";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc";
import { DirectSecp256k1HdWallet, EncodeObject } from "@lbmjs/proto-signing";
import {
  MsgCreateContract,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintNFT,
  MsgTransferFT,
} from "lbmjs-types/lbm/collection/v1/tx";

import { logs } from "../../";
import { QueryClient } from "../../queryclient";
import { SigningStargateClient } from "../../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { CollectionExtension, setupCollectionExtension } from "./queries";
import { ftCoins } from "./utils";

async function makeClientWithCollection(
  rpcUrl: string,
): Promise<[QueryClient & CollectionExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupCollectionExtension), tmClient];
}

describe("CollectionExtension (fungible token)", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const toAddr = faucet.address1;
  const contractName = "TestContract";
  const tokenName = "TestToken";
  const baseImgUrl = "https://test.network";
  const tokenMeta = "Test Meta data";
  const decimals = 6;
  const amount = "1000000";
  const sentAmount = "500000";

  let contractId: string | undefined;
  let tokenId: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // CreateContract
      {
        const msg: MsgCreateContract = {
          owner: owner,
          name: contractName,
          baseImgUri: baseImgUrl,
          meta: "",
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgCreateContract",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        contractId = logs.findAttribute(
          parsedLogs,
          "lbm.collection.v1.EventCreatedContract",
          "contract_id",
        ).value;
        assert(contractId, "Missing contract ID");
        contractId = contractId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // IssueFT
      {
        const msg: MsgIssueFT = {
          contractId: contractId,
          name: tokenName,
          meta: tokenMeta,
          decimals: decimals,
          mintable: true,
          owner: owner,
          to: owner,
          amount: amount,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgIssueFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenId = logs.findAttribute(parsedLogs, "issue_ft", "token_id").value;
        assert(tokenId, "Missing token ID");
        tokenId = tokenId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // TransferFT
      {
        const msg: MsgTransferFT = {
          contractId: contractId,
          from: owner,
          to: toAddr,
          amount: ftCoins(sentAmount, tokenId),
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgTransferFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75);

      client.disconnect();
    }
  });

  describe("query", () => {
    it("contract", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const contract = await client.collection.contract(contractId);
      expect(contract).toBeDefined();
      expect(contract.contractId).toEqual(contractId);
      expect(contract.name).toEqual(contractName);
      expect(contract.meta).toEqual("");
      expect(contract.baseImgUri).toEqual(baseImgUrl);

      tmClient.disconnect();
    });
    it("balance", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const coin = await client.collection.balance(contractId, owner, tokenId);
      expect(coin).toBeDefined();
      expect(coin.tokenId).toEqual(tokenId);
      expect(coin.amount).toEqual((parseInt(amount, 10) - parseInt(sentAmount, 10)).toString());

      tmClient.disconnect();
    });
    it("supply", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing class ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const supply = await client.collection.ftSupply(contractId, tokenId);
      expect(supply).toBeDefined();
      expect(supply).toEqual(amount);

      tmClient.disconnect();
    });
  });
});

describe("CollectionExtension (non-fungible token)", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const toAddr = faucet.address1;
  const contractName = "TestContract";
  const tokenName = "TestToken";
  const baseImgUrl = "https://test.network";
  const tokenMeta = "Test Meta data";

  const mintedTokenName = "Minted TestToken 1";

  let contractId: string | undefined;
  let tokenType: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // CreateContract
      {
        const msg: MsgCreateContract = {
          owner: owner,
          name: contractName,
          baseImgUri: baseImgUrl,
          meta: "",
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgCreateContract",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        contractId = logs.findAttribute(
          parsedLogs,
          "lbm.collection.v1.EventCreatedContract",
          "contract_id",
        ).value;
        assert(contractId, "Missing contract ID");
        contractId = contractId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // IssueFT
      {
        const msg: MsgIssueNFT = {
          contractId: contractId,
          name: tokenName,
          meta: tokenMeta,
          owner: owner,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgIssueNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenType = logs.findAttribute(parsedLogs, "issue_nft", "token_type").value;
        assert(tokenType, "Missing contract ID");
        tokenType = tokenType.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT
      {
        const msg: MsgMintNFT = {
          contractId: contractId,
          from: owner,
          to: toAddr,
          params: [
            {
              tokenType: tokenType,
              name: mintedTokenName,
              meta: "",
            },
          ],
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75);

      client.disconnect();
    }
  });

  describe("query", () => {
    it("contract", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const contract = await client.collection.contract(contractId);
      expect(contract).toBeDefined();
      expect(contract.contractId).toEqual(contractId);
      expect(contract.name).toEqual(contractName);
      expect(contract.meta).toEqual("");
      expect(contract.baseImgUri).toEqual(baseImgUrl);

      tmClient.disconnect();
    });
    it("nftSupply", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const supply = await client.collection.nftSupply(contractId, tokenType);
      expect(supply).toBeDefined();
      expect(supply).toEqual("1");

      tmClient.disconnect();
    });
    it("")
  });
});
