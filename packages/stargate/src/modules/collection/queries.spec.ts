import { coins } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { FT, OwnerNFT } from "lbmjs-types/lbm/collection/v1/collection";
import {
  MsgApprove,
  MsgAttach,
  MsgCreateContract,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintNFT,
  MsgTransferFT,
  MsgTransferNFT,
} from "lbmjs-types/lbm/collection/v1/tx";

import { logs, makeLinkPath } from "../../";
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
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: "link",
      });
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
          meta: "test",
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
      expect(contract.meta).toEqual("test");
      expect(contract.baseImgUri).toEqual(baseImgUrl);

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const token = await client.collection.token(contractId, tokenId);
      expect(token.typeUrl).toEqual("/lbm.collection.v1.FT");
      const ft = FT.decode(token.value);
      expect(ft.contractId).toEqual(contractId);
      expect(ft.tokenId).toEqual(tokenId);
      expect(ft.name).toEqual(tokenName)
      expect(ft.meta).toEqual(tokenMeta);
      expect(ft.decimals).toEqual(decimals);
      expect(ft.mintable).toBeTrue();

      tmClient.disconnect();
    });
    it("tokens", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const tokens = await client.collection.tokens(contractId);
      expect(tokens.length).toEqual(1);
      const ft = FT.decode(tokens[0].value);
      expect(ft.contractId).toEqual(contractId);
      expect(ft.tokenId).toEqual(tokenId);
      expect(ft.name).toEqual(tokenName)
      expect(ft.meta).toEqual(tokenMeta);
      expect(ft.decimals).toEqual(decimals);
      expect(ft.mintable).toBeTrue();

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
    it("allBalances", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const coins = await client.collection.allBalances(contractId, toAddr);
      expect(coins.length).toEqual(1);
      expect(coins[0].tokenId).toEqual(tokenId);
      expect(coins[0].amount).toEqual(sentAmount)

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
    it("ftMinted, ftBurnt", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing class ID");
      assert(tokenId, "Missing token ID");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const minted = await client.collection.ftMinted(contractId, tokenId);
      expect(minted).toEqual(amount)

      const burnt = await client.collection.ftBurnt(contractId, tokenId);
      expect(burnt).toEqual("0");

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
  const contractBaseImgUrl = "https://test.network";
  const tokenName = "TestToken";

  let contractId: string | undefined;
  let tokenType: string | undefined;
  let tokenId1: string | undefined;
  let tokenId2: string | undefined;
  let tokenId3: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(1)],
        prefix: "link",
      });
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
          baseImgUri: contractBaseImgUrl,
          meta: "Test NFT Contract",
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
          meta: "Test Meta data",
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

      // MintNFT(1)
      {
        const msg: MsgMintNFT = {
          contractId: contractId,
          from: owner,
          to: owner,
          params: [
            {
              tokenType: tokenType,
              name: "Minted TestToken 1",
              meta: "Test NFT 1",
            },
          ],
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenId1 = logs.findAttribute(parsedLogs, "mint_nft", "token_id").value;
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT(2)
      {
        const msg: MsgMintNFT = {
          contractId: contractId,
          from: owner,
          to: owner,
          params: [
            {
              tokenType: tokenType,
              name: "Minted TestToken 2",
              meta: "Test NFT 2",
            },
          ],
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenId2 = logs.findAttribute(parsedLogs, "mint_nft", "token_id").value;
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT(3)
      {
        const msg: MsgMintNFT = {
          contractId: contractId,
          from: owner,
          to: owner,
          params: [
            {
              tokenType: tokenType,
              name: "Minted TestToken 3",
              meta: "Test NFT 3",
            },
          ],
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenId3 = logs.findAttribute(parsedLogs, "mint_nft", "token_id").value;
        assertIsDeliverTxSuccess(result);
      }

      // TransferNFT
      {
        const msg: MsgTransferNFT = {
          contractId: contractId,
          from: owner,
          to: toAddr,
          tokenIds: [tokenId2],
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgTransferNFT",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Attach ( tokenId1(parent) <--- tokenId3(child) )
      {
        const msg: MsgAttach = {
          contractId: contractId,
          from: owner,
          tokenId: tokenId3,
          toTokenId: tokenId1,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgAttach",
          value: msg,
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Approve
      {
        const msg: MsgApprove = {
          contractId: contractId,
          approver: toAddr,
          proxy: owner,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgApprove",
          value: msg,
        };
        const result = await client.signAndBroadcast(toAddr, [msgAny], defaultFee);
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
      expect(contract.meta).toEqual("Test NFT Contract");
      expect(contract.baseImgUri).toEqual(contractBaseImgUrl);

      tmClient.disconnect();
    });
    it("tokenTypes", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const types = await client.collection.tokenTypes(contractId);
      expect(types.length).toEqual(1);
      expect(types[0].contractId).toEqual(contractId);
      expect(types[0].tokenType).toEqual(tokenType);
      expect(types[0].name).toEqual(tokenName);
      expect(types[0].meta).toEqual("Test Meta data");

      tmClient.disconnect();
    });
    it("tokesWithTokenType", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      assert(tokenId1, "Mission token Id1");
      assert(tokenId2, "Mission token Id1");
      assert(tokenId3, "Mission token Id3");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const tokens = await client.collection.tokensWithTokenType(contractId, tokenType);
      expect(tokens.length).toEqual(3);
      expect(tokens[0].typeUrl).toEqual("/lbm.collection.v1.OwnerNFT");
      expect(tokens[1].typeUrl).toEqual("/lbm.collection.v1.OwnerNFT");
      expect(tokens[2].typeUrl).toEqual("/lbm.collection.v1.OwnerNFT");
      let nft = OwnerNFT.decode(tokens[0].value);
      expect(nft.contractId).toEqual(contractId);
      expect(nft.tokenId).toEqual(tokenId1);
      expect(nft.name).toEqual("Minted TestToken 1");
      expect(nft.meta).toEqual("Test NFT 1")
      expect(nft.owner).toEqual(owner);
      nft = OwnerNFT.decode(tokens[1].value);
      expect(nft.contractId).toEqual(contractId);
      expect(nft.tokenId).toEqual(tokenId2);
      expect(nft.name).toEqual("Minted TestToken 2");
      expect(nft.meta).toEqual("Test NFT 2")
      expect(nft.owner).toEqual(toAddr);
      nft = OwnerNFT.decode(tokens[2].value);
      expect(nft.contractId).toEqual(contractId);
      expect(nft.tokenId).toEqual(tokenId3);
      expect(nft.name).toEqual("Minted TestToken 3");
      expect(nft.meta).toEqual("Test NFT 3")
      expect(nft.owner).toEqual(owner);

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId1, "Mission token Id1");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const token = await client.collection.token(contractId, tokenId1);
      expect(token.typeUrl).toEqual("/lbm.collection.v1.OwnerNFT")
      const ownerNFT = OwnerNFT.decode(token.value);
      expect(ownerNFT.contractId).toEqual(contractId);
      expect(ownerNFT.tokenId).toEqual(tokenId1);
      expect(ownerNFT.name).toEqual("Minted TestToken 1");
      expect(ownerNFT.meta).toEqual("Test NFT 1")
      expect(ownerNFT.owner).toEqual(owner);

      tmClient.disconnect();
    });
    it("nftSupply, nftMinted, nftBurnt", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const supply = await client.collection.nftSupply(contractId, tokenType);
      expect(supply).toBeDefined();
      expect(supply).toEqual("3");

      const minted = await client.collection.nftMinted(contractId, tokenType);
      expect(minted).toEqual("3");

      const burnt = await client.collection.nftBurnt(contractId, tokenType);
      expect(burnt).toEqual("0");

      tmClient.disconnect();
    });
    it("root", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      assert(tokenId1, "Mission token Id");
      assert(tokenId3, "Mission token Id3");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      let nft = await client.collection.root(contractId, tokenId1);
      expect(nft.id).toEqual(tokenId1);

      nft = await client.collection.root(contractId, tokenId3);
      expect(nft.id).toEqual(tokenId1);

      tmClient.disconnect();
    });
    it("parent", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      assert(tokenId1, "Mission token Id");
      assert(tokenId3, "Mission token Id3");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      try {
        await client.collection.parent(contractId, tokenId1);
      } catch (err) {}

      const nft = await client.collection.parent(contractId, tokenId3);
      expect(nft.id).toEqual(tokenId1);

      tmClient.disconnect();
    });
    it("children", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      assert(tokenId1, "Mission token Id");
      assert(tokenId3, "Mission token Id3");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const nfts = await client.collection.children(contractId, tokenId1);
      expect(nfts.length).toEqual(1)
      expect(nfts[0].id).toEqual(tokenId3);

      try {
        await client.collection.children(contractId, tokenId3);
      } catch (err) {}

      tmClient.disconnect();
    });
    it("granteeGrants", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      let grants = await client.collection.granteeGrants(contractId, owner);
      expect(grants.length).toEqual(4);

      grants = await client.collection.granteeGrants(contractId, toAddr);
      expect(grants.length).toEqual(0);

      tmClient.disconnect();
    });
    it("approved", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      let approved = await client.collection.approved(contractId, owner, toAddr);
      expect(approved).toBeTrue();

      approved = await client.collection.approved(contractId, toAddr, owner);
      expect(approved).toBeFalse();

      tmClient.disconnect();
    });
    it("approvers", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const approvers = await client.collection.approvers(contractId, owner);
      expect(approvers.length).toEqual(1);
      expect(approvers[0]).toEqual(toAddr);

      tmClient.disconnect();
    });
  });
});
