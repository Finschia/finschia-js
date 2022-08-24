import { coins, DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { Permission } from "lbmjs-types/lbm/token/v1/token";
import { MsgIssue } from "lbmjs-types/lbm/token/v1/tx";

import { makeLinkPath } from "../../paths";
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
import { setupTokenExtension, TokenExtension } from "./queries";

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

  const owner = faucet.address0;
  const toAddress = faucet.address1;
  const tokenName = "TestToken";
  const symbol = "ZERO1";
  const amount = "1000";
  let contractId: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        const msg: MsgIssue = {
          name: tokenName,
          symbol: symbol,
          imageUri: "",
          meta: "",
          decimals: 6,
          owner: owner,
          to: toAddress,
          amount: amount,
          mintable: true,
        };
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: msg,
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee, memo);
        const logs = JSON.parse(result.rawLog || "");
        contractId = logs[0].events
          .find(({ type }: any) => type === "lbm.token.v1.EventIssued")
          .attributes.find(({ key }: any) => key === "contract_id").value;
        assert(contractId, "Missing contract ID");
        contractId = contractId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("query", () => {
    it("totalBalance", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const totalBalance = await client.token.balance(contractId, toAddress);
      expect(totalBalance).toBeDefined();
      expect(totalBalance).not.toBeNull();
      expect(totalBalance).toEqual("1000");

      tmClient.disconnect();
    });
    it("supply", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const supplyRes = await client.token.supply(contractId);
      expect(supplyRes).toEqual(amount);

      const mintSupplyRes = await client.token.minted(contractId);
      expect(mintSupplyRes).toEqual(amount);

      const burnSupplyRes = await client.token.burnt(contractId);
      expect(burnSupplyRes).toEqual("0");

      tmClient.disconnect();
    });
    it("tokenClass", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const token = await client.token.tokenClass(contractId);
      expect(token).toEqual({
        contractId: contractId,
        name: tokenName,
        symbol: symbol,
        meta: "",
        imageUri: "",
        decimals: 6,
        mintable: true,
      });

      tmClient.disconnect();
    });
    it("grant", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.granteeGrants(contractId, owner);
      expect(response[0]).toEqual({ grantee: owner, permission: Permission.PERMISSION_MODIFY });

      tmClient.disconnect();
    });
  });
  it("tokenClasses", async () => {
    pendingWithoutSimapp();
    const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

    const response = await client.token.tokenClasses();
    expect(response.length).toBeGreaterThanOrEqual(1);

    tmClient.disconnect();
  });
});

describe("TokenExtension", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const toAddress = faucet.address1;
  const otherAddress = faucet.address3;
  const tokenName = "TestToken";
  const symbol = "ZERO2";
  const amount = "1000";
  let contractId: string | undefined;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: {
            owner: owner,
            to: toAddress,
            name: tokenName,
            symbol: symbol,
            imageUri: "",
            meta: "https://test.network",
            amount: amount,
            mintable: true,
            decimals: 6,
          },
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee, memo);
        const logs = JSON.parse(result.rawLog || "");
        contractId = logs[0].events
          .find(({ type }: any) => type === "lbm.token.v1.EventIssued")
          .attributes.find(({ key }: any) => key === "contract_id").value;
        assert(contractId, "Missing contract ID");
        contractId = contractId.replace(/^"(.*)"$/, "$1");
        assertIsDeliverTxSuccess(result);
      }

      // Mint
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgMint",
          value: {
            contractId: contractId,
            from: owner,
            to: owner,
            amount: "500",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Transfer
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgSend",
          value: {
            contractId: contractId,
            from: owner,
            to: otherAddress,
            amount: "100",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Burn
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgBurn",
          value: {
            contractId: contractId,
            from: owner,
            amount: "200",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // GrantPermission
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgGrantPermission",
          value: {
            contractId: contractId,
            from: owner,
            to: toAddress,
            permission: "MODIFY", // {MODIFY, MINT, BURN}
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Revoke
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgRevokePermission",
          value: {
            contractId: contractId,
            from: owner,
            permission: "BURN", // {MODIFY, MINT, BURN}
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Approve
      {
        const msgAny: EncodeObject = {
          typeUrl: "/lbm.token.v1.MsgApprove",
          value: {
            contractId: contractId,
            approver: owner,
            proxy: toAddress,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAny], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("query", () => {
    it("totalBalance", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const balance1 = await client.token.balance(contractId, toAddress);
      expect(balance1).toEqual("1000");

      const balance2 = await client.token.balance(contractId, owner);
      expect(balance2).toEqual("200");

      const balance3 = await client.token.balance(contractId, otherAddress);
      expect(balance3).toEqual("100");

      tmClient.disconnect();
    });
    it("supply", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const supplyRes = await client.token.supply(contractId);
      expect(supplyRes).toEqual("1300");

      const mintSupplyRes = await client.token.minted(contractId);
      expect(mintSupplyRes).toEqual("1500");

      const burnSupplyRes = await client.token.burnt(contractId);
      expect(burnSupplyRes).toEqual("200");

      tmClient.disconnect();
    });
    it("token", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const token = await client.token.tokenClass(contractId);
      expect(token).toEqual({
        contractId: contractId,
        name: tokenName,
        symbol: symbol,
        imageUri: "",
        meta: "https://test.network",
        decimals: 6,
        mintable: true,
      });

      tmClient.disconnect();
    });
    it("granteeGrants", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.granteeGrants(contractId, toAddress);
      expect(response[0]).toEqual({ grantee: toAddress, permission: Permission.PERMISSION_MODIFY });

      tmClient.disconnect();
    });
    it("approved", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.approved(contractId, toAddress, owner);
      expect(response).toBeTrue();

      tmClient.disconnect();
    });
    it("approvers", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Mission contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.approvers(contractId, toAddress);
      expect(response[0]).toEqual(owner);

      tmClient.disconnect();
    });
  });
});
