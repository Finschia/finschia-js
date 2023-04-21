/* eslint-disable @typescript-eslint/naming-convention */
import { coins } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, logs, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { MsgBurnFTEncodeObject } from "./messages";
import {
  MsgAttachEncodeObject,
  MsgCreateContractEncodeObject,
  MsgIssueFTEncodeObject,
  MsgIssueNFTEncodeObject,
  MsgMintNFTEncodeObject,
} from "./messages";
import { MsgAuthorizeOperatorEncodeObject } from "./messages";
import { CollectionExtension, setupCollectionExtension } from "./queries";

async function makeClientWithCollection(
  rpcUrl: string,
): Promise<[QueryClient & CollectionExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupCollectionExtension), tmClient];
}

describe("CollectionExtension (fungible token) grpc error", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const otherAddr = "link1008wengr28z5quat2dzrprt9h8euav4herfyum";
  const contractName = "TestContract";
  const tokenName = "TestToken";
  const baseImgUrl = "https://test.network";
  const tokenMeta = "Test Meta data";
  const decimals = 6;
  const amount = "1000000";

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
        tokenId = logs.findAttribute(parsedLogs, "issue_ft", "token_id").value;
        assert(tokenId, "Missing token ID");
        tokenId = tokenId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75);

      client.disconnect();
    }
  });

  describe("query", () => {
    describe("allBalance", () => {
      it("address does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const balances = await client.collection.allBalances(contractId, nonExistAddress);
        expect(balances.length).toEqual(0);

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const balances = await client.collection.allBalances(nonExistContract, owner);
        expect(balances.length).toEqual(0);

        tmClient.disconnect();
      });
    });

    describe("balance", () => {
      it("address is not a holder", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonHolderAddress = otherAddr;

        const balance = await client.collection.balance(contractId, nonHolderAddress, tokenId);
        expect(balance.amount).toEqual("0");

        tmClient.disconnect();
      });

      it("address does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const balance = await client.collection.balance(contractId, nonExistAddress, tokenId);
        expect(balance.amount).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const balance = await client.collection.balance(nonExistContract, owner, tokenId);
        expect(balance.amount).toEqual("0");

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistToken = "ffffffff";

        await expectAsync(client.collection.balance(contractId, owner, nonExistToken)).toBeRejectedWith(
          new Error(
            `Query failed with (18): rpc error: code = InvalidArgument desc = invalid id: ${nonExistToken}: invalid request: invalid token id: invalid request`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("tokenClassTypeName", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";
        const classId = tokenId.substr(0, 8);

        await expectAsync(client.collection.tokenClassTypeName(nonExistContract, classId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("class does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistClass = "ffffffff";

        await expectAsync(client.collection.tokenClassTypeName(contractId, nonExistClass)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistClass}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("contract", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.contract(nonExistContract)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("token", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";
        const classId = tokenId.substr(0, 8);

        await expectAsync(client.collection.token(nonExistContract, tokenId)).toBeRejectedWith(
          new Error(
            // `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${nonExistContract}: ${classId}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistToken = "ffffffff00000000";
        const nonExistClass = nonExistToken.substr(0, 8);

        await expectAsync(client.collection.token(contractId, nonExistToken)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistClass}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("ft burn", () => {
      it("burn is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing class ID");
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const minted = await client.collection.ftBurnt(contractId, tokenId);
        expect(minted).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.ftBurnt(nonExistContract, tokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistToken = "ffffffff00000000";
        const nonExistClass = nonExistToken.substr(0, 8);

        await expectAsync(client.collection.ftBurnt(contractId, nonExistToken)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistClass}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("ft minted", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.ftMinted(nonExistContract, tokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistToken = "ffffffff00000000";
        const nonExistClass = nonExistToken.substr(0, 8);

        await expectAsync(client.collection.ftMinted(contractId, nonExistToken)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistClass}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("ft supply", () => {
      beforeAll(async () => {
        assert(contractId, "Missing contract ID");
        assert(tokenId, "Missing token ID");
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        // Burn all supply
        {
          const msgBurn: MsgBurnFTEncodeObject = {
            typeUrl: "/lbm.collection.v1.MsgBurnFT",
            value: {
              contractId: contractId,
              from: owner,
              amount: [
                {
                  amount,
                  tokenId,
                },
              ],
            },
          };
          const result = await client.signAndBroadcast(owner, [msgBurn], defaultFee);
          assertIsDeliverTxSuccess(result);
        }
      });

      it("supply is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing class ID");
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const supply = await client.collection.ftSupply(contractId, tokenId);
        expect(supply).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId, "Missing token ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.ftSupply(nonExistContract, tokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistToken = "ffffffff00000000";
        const nonExistClass = nonExistToken.substr(0, 8);

        await expectAsync(client.collection.ftSupply(contractId, nonExistToken)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistClass}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });
  });
});

describe("CollectionExtension (non-fungible token)", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const toAddr = "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705";
  const otherAddr = "link1008wengr28z5quat2dzrprt9h8euav4herfyum";
  const contractName = "TestContract";
  const contractBaseImgUrl = "https://test.network";
  const tokenName = "TestToken";

  let contractId: string | undefined;
  let tokenType: string | undefined;
  let tokenType2: string | undefined;
  let tokenId1: string | undefined;
  let tokenId2: string | undefined;

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

      // IssueNFT
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
        tokenType = logs.findAttribute(parsedLogs, "issue_nft", "token_type").value;
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
        tokenId1 = logs.findAttribute(parsedLogs, "mint_nft", "token_id").value;
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
        tokenId2 = logs.findAttribute(parsedLogs, "mint_nft", "token_id").value;
        assertIsDeliverTxSuccess(result);
      }

      // Attach ( tokenId1(parent) <--- tokenId2(child) )
      {
        const msgAttach: MsgAttachEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgAttach",
          value: {
            contractId: contractId,
            from: owner,
            tokenId: tokenId2,
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
            holder: owner,
            operator: toAddr,
          },
        };
        const result = await client.signAndBroadcast(owner, [MsgAuthorizeOperator], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // IssueNFT 2
      {
        const msgIssueNFT: MsgIssueNFTEncodeObject = {
          typeUrl: "/lbm.collection.v1.MsgIssueNFT",
          value: {
            contractId: contractId,
            name: "testToken2",
            meta: "Test Meta data",
            owner: owner,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgIssueNFT], defaultFee);
        const parsedLogs = logs.parseRawLog(result.rawLog);
        tokenType2 = logs.findAttribute(parsedLogs, "issue_nft", "token_type").value;
        assert(tokenType, "Missing contract ID");
        tokenType2 = tokenType2.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75);

      client.disconnect();
    }
  });

  describe("query", () => {
    describe("tokenType", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.tokenType(nonExistContract, tokenType2)).toBeRejectedWith(
          new Error(
            // `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${nonExistContract}: ${tokenType2}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenType = "ffffffff";

        await expectAsync(client.collection.tokenType(contractId, nonExistTokenType)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistTokenType}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("mint", () => {
      it("mint is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const burnt = await client.collection.nftMinted(contractId, tokenType2);
        expect(burnt).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.nftMinted(nonExistContract, tokenType2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenType = "ffffffff";

        await expectAsync(client.collection.nftMinted(contractId, nonExistTokenType)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistTokenType}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("supply", () => {
      it("supply is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const burnt = await client.collection.nftSupply(contractId, tokenType2);
        expect(burnt).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.nftSupply(nonExistContract, tokenType2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenType = "ffffffff";

        await expectAsync(client.collection.nftSupply(contractId, nonExistTokenType)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistTokenType}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("burn", () => {
      it("burn is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const burnt = await client.collection.nftBurnt(contractId, tokenType2);
        expect(burnt).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenType2, "Missing token type");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.nftBurnt(nonExistContract, tokenType2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenType = "ffffffff";

        await expectAsync(client.collection.nftBurnt(contractId, nonExistTokenType)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a class in contract ${contractId}: ${nonExistTokenType}: not found: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("root", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId2, "Missing token id");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.root(nonExistContract, tokenId2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenId = "ffffffffffffffff";

        await expectAsync(client.collection.root(contractId, nonExistTokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = ${nonExistTokenId}: token symbol, token-id does not exist: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("hasParent", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId2, "Missing token id");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.hasParent(nonExistContract, tokenId2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenId = "ffffffffffffffff";

        await expectAsync(client.collection.hasParent(contractId, nonExistTokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = ${nonExistTokenId}: token symbol, token-id does not exist: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("parent", () => {
      it("parent does not exist", async () => {
        assert(contractId, "Missing contract ID");
        assert(tokenId1, "Missing token Id");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        await expectAsync(client.collection.parent(contractId, tokenId1)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = ${tokenId1} has no parent: token is not a child of some other: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        assert(tokenId2, "Missing token id");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.parent(nonExistContract, tokenId2)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });

      it("token does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistTokenId = "ffffffffffffffff";

        await expectAsync(client.collection.parent(contractId, nonExistTokenId)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = ${nonExistTokenId}: token symbol, token-id does not exist: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("children", () => {
      it("does not have children", async () => {
        assert(contractId, "Missing contract ID");
        assert(tokenId2, "Missing token Id");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const children = await client.collection.children(contractId, tokenId2);
        expect(children.length).toEqual(0);

        tmClient.disconnect();
      });
    });

    describe("granteeGrants", () => {
      it("grant does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);

        const grants = await client.collection.granteeGrants(contractId, otherAddr);
        expect(grants.length).toEqual(0);

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.granteeGrants(nonExistContract, owner)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("isOperatorFor", () => {
      it("operator, holder does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistAddress1 = makeRandomAddress();
        const nonExistAddress2 = makeRandomAddress();

        const approved = await client.collection.isOperatorFor(
          contractId,
          nonExistAddress1,
          nonExistAddress2,
        );
        expect(approved).toBeFalse();

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.isOperatorFor(nonExistContract, owner, toAddr)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("holdersByOperator", () => {
      it("holder does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const holders = await client.collection.holdersByOperator(contractId, nonExistAddress);
        expect(holders.length).toEqual(0);

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithCollection(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.collection.holdersByOperator(nonExistContract, owner)).toBeRejectedWith(
          new Error(
            `Query failed with (22): rpc error: code = NotFound desc = no such a contract: ${nonExistContract}: collection does not exists: key not found`,
          ),
        );

        tmClient.disconnect();
      });
    });
  });
});
