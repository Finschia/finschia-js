import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { Permission } from "lbmjs-types/lbm/token/v1/token";

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
  MsgAuthorizeOperatorEncodeObject,
  MsgBurnEncodeObject,
  MsgGrantPermissionEncodeObject,
  MsgIssueEncodeObject,
  MsgMintEncodeObject,
  MsgRevokePermissionEncodeObject,
  MsgSendEncodeObject,
} from "./messages";
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
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        const msgIssue: MsgIssueEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: {
            name: tokenName,
            symbol: symbol,
            uri: "",
            meta: "",
            decimals: 6,
            owner: owner,
            to: toAddress,
            amount: amount,
            mintable: true,
          },
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(owner, [msgIssue], defaultFee, memo);
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
    it("contract", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Missing contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const token = await client.token.contract(contractId);
      expect(token).toEqual({
        id: contractId,
        name: tokenName,
        symbol: symbol,
        meta: "",
        uri: "",
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
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // Issue
      {
        const msgIssue: MsgIssueEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgIssue",
          value: {
            owner: owner,
            to: toAddress,
            name: tokenName,
            symbol: symbol,
            uri: "",
            meta: "https://test.network",
            amount: amount,
            mintable: true,
            decimals: 6,
          },
        };
        const memo = "Test Token for Stargate";
        const result = await client.signAndBroadcast(owner, [msgIssue], defaultFee, memo);
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
        const msgMint: MsgMintEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgMint",
          value: {
            contractId: contractId,
            from: owner,
            to: owner,
            amount: "500",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgMint], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Transfer
      {
        const msgSend: MsgSendEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgSend",
          value: {
            contractId: contractId,
            from: owner,
            to: otherAddress,
            amount: "100",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgSend], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Burn
      {
        const msgBurn: MsgBurnEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgBurn",
          value: {
            contractId: contractId,
            from: owner,
            amount: "200",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgBurn], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // GrantPermission
      {
        const msgGrantPermission: MsgGrantPermissionEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgGrantPermission",
          value: {
            contractId: contractId,
            from: owner,
            to: toAddress,
            permission: "MODIFY", // {MODIFY, MINT, BURN}
          },
        };
        const result = await client.signAndBroadcast(owner, [msgGrantPermission], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Revoke
      {
        const msgRevokePermission: MsgRevokePermissionEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgRevokePermission",
          value: {
            contractId: contractId,
            from: owner,
            permission: "BURN", // {MODIFY, MINT, BURN}
          },
        };
        const result = await client.signAndBroadcast(owner, [msgRevokePermission], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // Approve
      {
        const msgApprove: MsgAuthorizeOperatorEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgAuthorizeOperator",
          value: {
            contractId: contractId,
            holder: owner,
            operator: toAddress,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgApprove], defaultFee);
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

      const token = await client.token.contract(contractId);
      expect(token).toEqual({
        id: contractId,
        name: tokenName,
        symbol: symbol,
        uri: "",
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

      const response = await client.token.isOperatorFor(contractId, toAddress, owner);
      expect(response).toBeTrue();

      tmClient.disconnect();
    });
    it("approvers", async () => {
      pendingWithoutSimapp();
      assert(contractId, "Mission contract ID");
      const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

      const response = await client.token.holdersByOperator(contractId, toAddress);
      expect(response[0]).toEqual(owner);

      tmClient.disconnect();
    });
  });
});
