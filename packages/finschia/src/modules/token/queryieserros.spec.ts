import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";

import { QueryRpcFailError } from "../../errors";
import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeNotFoundMessage,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { MsgAuthorizeOperatorEncodeObject, MsgBurnEncodeObject, MsgIssueEncodeObject } from "./messages";
import { setupTokenExtension, TokenExtension } from "./queries";

async function makeClientWithToken(
  rpcUrl: string,
): Promise<[QueryClient & TokenExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTokenExtension), tmClient];
}

describe("TokenExtension grpc errors", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const toAddress = "link1m3h30wlvsf8llruxtpukdvsy0km2kum8al86ug";
  const otherAddress = "link17xpfvakm2amg962yls6f84z3kell8c5l9hrzs4";
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
            to: owner,
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

      // AuthorizeOperator
      {
        const msgAuthorizeOperator: MsgAuthorizeOperatorEncodeObject = {
          typeUrl: "/lbm.token.v1.MsgAuthorizeOperator",
          value: {
            contractId: contractId,
            holder: owner,
            operator: toAddress,
          },
        };
        const result = await client.signAndBroadcast(owner, [msgAuthorizeOperator], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("query", () => {
    describe("balance", () => {
      it("address, contract exists but does not have balance", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

        const balance = await client.token.balance(contractId, toAddress);
        expect(balance).toBe("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const nonExistContract = "ffffffff";
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const address = toAddress;

        const balance = await client.token.balance(nonExistContract, address);
        expect(balance).toBe("0");

        tmClient.disconnect();
      });

      it("address not exists", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const balance = await client.token.balance(contractId, nonExistAddress);
        expect(balance).toEqual("0");

        tmClient.disconnect();
      });
    });

    describe("granteeGrants", () => {
      it("grantee does not have Grants", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const haveNoGrantAddress = otherAddress;

        const grants = await client.token.granteeGrants(contractId, haveNoGrantAddress);
        expect(grants.length).toEqual(0);

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const granteeGrants = await client.token.granteeGrants(nonExistContract, otherAddress);
        expect(granteeGrants.length).toEqual(0);

        tmClient.disconnect();
      });

      it("grantee does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const grants = await client.token.granteeGrants(contractId, nonExistAddress);
        expect(grants.length).toEqual(0);

        tmClient.disconnect();
      });
    });

    describe("isOperatorFor", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const isOperator = await client.token.isOperatorFor(nonExistContract, toAddress, owner);
        expect(isOperator).toEqual(false);

        tmClient.disconnect();
      });

      it("operator does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const isOperator = await client.token.isOperatorFor(contractId, nonExistAddress, owner);
        expect(isOperator).toEqual(false);

        tmClient.disconnect();
      });

      it("holder does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const isOperator = await client.token.isOperatorFor(contractId, nonExistAddress, owner);
        expect(isOperator).toEqual(false);

        tmClient.disconnect();
      });
    });

    describe("contract", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        await expectAsync(client.token.contract(nonExistContract)).toBeRejectedWith(
          new QueryRpcFailError(
            22,
            makeNotFoundMessage(`no class for ${nonExistContract}: token does not exist`),
          ),
        );

        tmClient.disconnect();
      });
    });

    describe("mint", () => {
      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const minted = await client.token.minted(nonExistContract);
        expect(minted).toEqual("0");

        tmClient.disconnect();
      });
    });

    describe("burn", () => {
      it("burn is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

        const burnt = await client.token.burnt(contractId);
        expect(burnt).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const burnt = await client.token.burnt(nonExistContract);
        expect(burnt).toEqual("0");

        tmClient.disconnect();
      });
    });

    describe("supply", () => {
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
          // Burn all supply
          {
            const msgBurn: MsgBurnEncodeObject = {
              typeUrl: "/lbm.token.v1.MsgBurn",
              value: {
                contractId: contractId,
                from: owner,
                amount: "1000",
              },
            };
            const result = await client.signAndBroadcast(owner, [msgBurn], defaultFee);
            assertIsDeliverTxSuccess(result);
          }
        }
      });

      it("supply is 0", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Missing contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);

        const supply = await client.token.supply(contractId);
        expect(supply).toEqual("0");

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const supply = await client.token.supply(nonExistContract);
        expect(supply).toEqual("0");

        tmClient.disconnect();
      });
    });

    describe("holdersByOperator", () => {
      it("operator does not exist", async () => {
        pendingWithoutSimapp();
        assert(contractId, "Mission contract ID");
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistAddress = makeRandomAddress();

        const holders = await client.token.holdersByOperator(contractId, nonExistAddress);
        expect(holders.length).toEqual(0);

        tmClient.disconnect();
      });

      it("contract does not exist", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithToken(simapp.tendermintUrl);
        const nonExistContract = "ffffffff";

        const holders = await client.token.holdersByOperator(nonExistContract, toAddress);
        expect(holders.length).toEqual(0);

        tmClient.disconnect();
      });
    });
  });
});
