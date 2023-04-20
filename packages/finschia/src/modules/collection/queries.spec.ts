/* eslint-disable @typescript-eslint/naming-convention */
import { coins } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, logs, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { FT, OwnerNFT } from "lbmjs-types/lbm/collection/v1/collection";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import {
  MsgAttachEncodeObject,
  MsgCreateContractEncodeObject,
  MsgIssueFTEncodeObject,
  MsgIssueNFTEncodeObject,
  MsgMintNFTEncodeObject,
  MsgSendFTEncodeObject,
  MsgSendNFTEncodeObject,
} from "./messages";
import { MsgAuthorizeOperatorEncodeObject } from "./messages";
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
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // CreateContract
      {
        const msgCreateContract: MsgCreateContractEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgCreateContract",
          value: {
            owner: owner,
            name: contractName,
            uri: baseImgUrl,
            meta: "test",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgCreateContract], defaultFee);
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
        const msgIssueFT: MsgIssueFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgIssueFT",
          value: {
            contractId: contractId,
            name: tokenName,
            meta: tokenMeta,
            decimals: decimals,
            mintable: true,
            owner: owner,
            to: owner,
            amount: amount,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgIssueFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenId = logs.findAttribute(parsedLogs, "lbm.collection.v1.EventCreatedFTClass", "token_id").value;
        assert(tokenId, "Missing token ID");
        tokenId = tokenId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // SendFT
      {
        const msgSendFT: MsgSendFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgSendFT",
          value: {
            contractId: contractId,
            from: owner,
            to: toAddr,
            amount: ftCoins(sentAmount, tokenId),
          },
        };
        const result = await client.signAndBroadcast(owner, [msgSendFT], defaultFee);
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
      expect(contract.id).toEqual(contractId);
      expect(contract.name).toEqual(contractName);
      expect(contract.meta).toEqual("test");
      expect(contract.uri).toEqual(baseImgUrl);

      tmClient.disconnect();
    });
    it("tokenClassTypeName", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId, "Mission token Id1");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
      const classId = tokenId.substr(0, 8);
      const name = await client.collection.tokenClassTypeName(contractId, classId);
      expect(name).toEqual("lbm.collection.v1.FTClass");

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
      expect(ft.name).toEqual(tokenName);
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

      const balances = await client.collection.allBalances(contractId, toAddr);
      expect(balances.length).toEqual(1);
      expect(balances[0].tokenId).toEqual(tokenId);
      expect(balances[0].amount).toEqual(sentAmount);

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
      expect(minted).toEqual(amount);

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
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // CreateContract
      {
        const msgCreateContract: MsgCreateContractEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgCreateContract",
          value: {
            owner: owner,
            name: contractName,
            uri: contractBaseImgUrl,
            meta: "Test NFT Contract",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgCreateContract], defaultFee);
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
        const msgIssueNFT: MsgIssueNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgIssueNFT",
          value: {
            contractId: contractId,
            name: tokenName,
            meta: "Test Meta data",
            owner: owner,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgIssueNFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenType = logs.findAttribute(
          parsedLogs,
          "lbm.collection.v1.EventCreatedNFTClass",
          "token_type",
        ).value;
        assert(tokenType, "Missing contract ID");
        tokenType = tokenType.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT(1)
      {
        const msgMintNFT: MsgMintNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: {
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
          },
        };
        const result = await client.signAndBroadcast(owner, [msgMintNFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        const tokens = logs.findAttribute(parsedLogs, "lbm.collection.v1.EventMintedNFT", "tokens").value;
        tokenId1 = JSON.parse(tokens)[0].token_id;
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT(2)
      {
        const msgMintNFT: MsgMintNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: {
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
          },
        };
        const result = await client.signAndBroadcast(owner, [msgMintNFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        const tokens = logs.findAttribute(parsedLogs, "lbm.collection.v1.EventMintedNFT", "tokens").value;
        tokenId2 = JSON.parse(tokens)[0].token_id;
        assertIsDeliverTxSuccess(result);
      }

      // MintNFT(3)
      {
        const msgMintNFT: MsgMintNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgMintNFT",
          value: {
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
          },
        };
        const result = await client.signAndBroadcast(owner, [msgMintNFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        const tokens = logs.findAttribute(parsedLogs, "lbm.collection.v1.EventMintedNFT", "tokens").value;
        tokenId3 = JSON.parse(tokens)[0].token_id;
        assertIsDeliverTxSuccess(result);
      }

      // TransferNFT
      {
        const MsgSendNFT: MsgSendNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgSendNFT",
          value: {
            contractId: contractId,
            from: owner,
            to: toAddr,
            tokenIds: [tokenId2!],
          },
        };
        const result = await client.signAndBroadcast(owner, [MsgSendNFT], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Attach ( tokenId1(parent) <--- tokenId3(child) )
      {
        const msgAttach: MsgAttachEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgAttach",
          value: {
            contractId: contractId,
            from: owner,
            tokenId: tokenId3,
            toTokenId: tokenId1,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAttach], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Approve
      {
        const MsgAuthorizeOperator: MsgAuthorizeOperatorEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgAuthorizeOperator",
          value: {
            contractId: contractId,
            holder: toAddr,
            operator: owner,
          },
        };
        const result = await client.signAndBroadcast(toAddr, [MsgAuthorizeOperator], defaultFee);
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
      expect(contract.id).toEqual(contractId);
      expect(contract.name).toEqual(contractName);
      expect(contract.meta).toEqual("Test NFT Contract");
      expect(contract.uri).toEqual(contractBaseImgUrl);

      tmClient.disconnect();
    });
    it("tokenClassTypeName", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId1, "Mission token Id1");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
      const classId = tokenId1.substr(0, 8);
      const name = await client.collection.tokenClassTypeName(contractId, classId);
      expect(name).toEqual("lbm.collection.v1.NFTClass");

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenId1, "Mission token Id1");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const token = await client.collection.token(contractId, tokenId1);
      expect(token.typeUrl).toEqual("/lbm.collection.v1.OwnerNFT");
      const ownerNFT = OwnerNFT.decode(token.value);
      expect(ownerNFT.contractId).toEqual(contractId);
      expect(ownerNFT.tokenId).toEqual(tokenId1);
      expect(ownerNFT.name).toEqual("Minted TestToken 1");
      expect(ownerNFT.meta).toEqual("Test NFT 1");
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
      expect(nft.tokenId).toEqual(tokenId1);

      nft = await client.collection.root(contractId, tokenId3);
      expect(nft.tokenId).toEqual(tokenId1);

      tmClient.disconnect();
    });
    it("hasParent", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      assert(tokenId1, "Mission token Id");
      assert(tokenId3, "Mission token Id3");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      try {
        await client.collection.hasParent(contractId, tokenId1);
        // eslint-disable-next-line no-empty
      } catch (err) {}

      const hasParent = await client.collection.hasParent(contractId, tokenId3);
      expect(hasParent).toBeTrue();

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
        // eslint-disable-next-line no-empty
      } catch (err) {}

      const nft = await client.collection.parent(contractId, tokenId3);
      expect(nft.tokenId).toEqual(tokenId1);

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
      expect(nfts.length).toEqual(1);
      expect(nfts[0].tokenId).toEqual(tokenId3);

      try {
        await client.collection.children(contractId, tokenId3);
        // eslint-disable-next-line no-empty
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

      let approved = await client.collection.isOperatorFor(contractId, owner, toAddr);
      expect(approved).toBeTrue();

      approved = await client.collection.isOperatorFor(contractId, toAddr, owner);
      expect(approved).toBeFalse();

      tmClient.disconnect();
    });
    it("approvers", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      assert(tokenType, "Mission token type");
      const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

      const approvers = await client.collection.holdersByOperator(contractId, owner);
      expect(approvers.length).toEqual(1);
      expect(approvers[0]).toEqual(toAddr);

      tmClient.disconnect();
    });
  });
});
