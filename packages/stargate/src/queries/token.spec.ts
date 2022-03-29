import { assert, sleep } from "@cosmjs/utils";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc";
import { coins, DirectSecp256k1HdWallet, EncodeObject } from "@lbmjs/proto-signing";
import { MsgIssue } from "lbmjs-types/lbm/token/v1/tx";

import { SigningStargateClient } from "../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../testutils.spec";
import { QueryClient } from "./queryclient";
import { setupTokenExtension, TokenExtension } from "./token";

async function makeClientWithToken(
  rpcUrl: string,
): Promise<[QueryClient & TokenExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTokenExtension), tmClient];
}

describe("TokenExtension(Just Issue)", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const fromAddress = faucet.address0;
  const toAddress = faucet.address1;
  const tokenName = "TestToken";
  const symbol = "ZERO1";
  const amount = "1000";
  let classId: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        const msg: MsgIssue = {
          owner: fromAddress,
          to: toAddress,
          name: tokenName,
          symbol: symbol,
          imageUri: "",
          meta: "",
          amount: amount,
          mintable: true,
          decimals: 6,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: msg,
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee, memo);
        const logs = JSON.parse(result.rawLog || "");
        classId = logs[0].events
          .find(({ type }: any) => type === "lbm.token.v1.EventIssue")
          .attributes.find(({ key }: any) => key === "class_id").value;
        assert(classId, "Missing class ID");
        classId = classId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("query", () => {
    it("totalBalance", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const totalBalace = await client.token.totalBalance(classId, toAddress);
      tmClient.disconnect();
    });
    it("supply", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const supplyRes = await client.token.supply(classId, "supply");
      expect(supplyRes).toEqual(amount);

      const mintSupplyRes = await client.token.supply(classId, "mint");
      expect(mintSupplyRes).toEqual(amount);

      const burnSupplyRes = await client.token.supply(classId, "burn");
      expect(burnSupplyRes).toEqual("0");

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const token = await client.token.token(classId);
      expect(token).toEqual({
        id: classId,
        name: tokenName,
        symbol: symbol,
        meta: "",
        imageUri: "",
        decimals: 6,
        mintable: true,
      });

      tmClient.disconnect();
    });
    it("grants", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.grants(classId, toAddress);
      expect(response).toEqual([]);

      tmClient.disconnect();
    });
    it("approve", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.approves(classId, toAddress);
      expect(response).toEqual([]);

      tmClient.disconnect();
    });
  });
});

describe("TokenExtension", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const fromAddress = faucet.address0;
  const toAddress = faucet.address1;
  const otherAddress = faucet.address3;
  const tokenName = "TestToken";
  const symbol = "ZERO2";
  const amount = "1000";
  let classId: string | undefined;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        // const msg: MsgIssue = {
        //   owner: fromAddress,
        //   to: toAddress,
        //   name: tokenName,
        //   symbol: symbol,
        //   imageUri: "",
        //   meta: "",
        //   amount: amount,
        //   mintable: true,
        //   decimals: 6,
        // };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: {
            owner: fromAddress,
            to: toAddress,
            name: tokenName,
            symbol: symbol,
            imageUri: "",
            meta: "",
            amount: amount,
            mintable: true,
            decimals: 6,
          },
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee, memo);
        const logs = JSON.parse(result.rawLog || "");
        classId = logs[0].events
          .find(({ type }: any) => type === "lbm.token.v1.EventIssue")
          .attributes.find(({ key }: any) => key === "class_id").value;
        assert(classId, "Missing class ID");
        classId = classId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // Mint
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgMint",
          value: {
            classId: classId,
            grantee: fromAddress,
            to: fromAddress,
            amount: "500",
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Transfer
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgTransfer",
          value: {
            classId: classId,
            from: fromAddress,
            to: otherAddress,
            amount: "100",
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Burn
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgBurn",
          value: {
            classId: classId,
            from: fromAddress,
            amount: "200",
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Grant
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgGrant",
          value: {
            classId: classId,
            granter: fromAddress,
            grantee: toAddress,
            action: "modify",
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Revoke
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgRevoke",
          value: {
            classId: classId,
            grantee: fromAddress,
            action: "burn",
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Approve
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgApprove",
          value: {
            classId: classId,
            approver: fromAddress,
            proxy: toAddress,
          },
        };
        const result = await client.signAndBroadcast(fromAddress, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("query", () => {
    it("totalBalance", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const balance1 = await client.token.totalBalance(classId, toAddress);
      expect(balance1).toEqual("1000");

      const balance2 = await client.token.totalBalance(classId, fromAddress);
      expect(balance2).toEqual("200");

      const balance3 = await client.token.totalBalance(classId, otherAddress);
      expect(balance3).toEqual("100");

      tmClient.disconnect();
    });
    it("supply", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const supplyRes = await client.token.supply(classId, "supply");
      expect(supplyRes).toEqual("1300");

      const mintSupplyRes = await client.token.supply(classId, "mint");
      expect(mintSupplyRes).toEqual("1500");

      const burnSupplyRes = await client.token.supply(classId, "burn");
      expect(burnSupplyRes).toEqual("200");

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const token = await client.token.token(classId);
      expect(token).toEqual({
        id: classId,
        name: tokenName,
        symbol: symbol,
        meta: "",
        imageUri: "",
        decimals: 6,
        mintable: true,
      });

      tmClient.disconnect();
    });
    it("grants", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.grants(classId, toAddress);
      expect(response).toEqual([
        {
          grantee: toAddress,
          classId: classId,
          action: "modify",
        },
      ]);

      tmClient.disconnect();
    });
    it("approve", async () => {
      pendingWithoutSimapp();
      assert(classId, "Missing class ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.approves(classId, toAddress);
      expect(response).toEqual([
        {
          approver: fromAddress,
          proxy: toAddress,
          classId: classId,
        },
      ]);

      tmClient.disconnect();
    });
  });
});
