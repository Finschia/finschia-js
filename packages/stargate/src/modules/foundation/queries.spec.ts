import { sleep } from "@cosmjs/utils";
import { coin, coins } from "@lbmjs/amino/build";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc/build";
import { DirectSecp256k1HdWallet } from "@lbmjs/proto-signing/build";

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
import { createMsgGrant, createMsgSubmitProposal, createMsgWithdrawFromTreasury } from "./messages";
import { FoundationExtension, setupFoundationExtension } from "./queries";

async function makeClientWithFoundation(
  rpcUrl: string,
): Promise<[QueryClient & FoundationExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupFoundationExtension), tmClient];
}

describe("FoundationExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const msg = {
        typeUrl: "/lbm.foundation.v1.MsgFundTreasury",
        value: {
          from: faucet.address0,
          amount: [coin(1000, "cony")],
        },
      };
      const result = await client.signAndBroadcast(faucet.address0, [msg], defaultFee);
      assertIsDeliverTxSuccess(result);

      await sleep(75);
    }
  });

  describe("Query Treasury", () => {
    it("work", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.treasury();
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.length).toEqual(1);

      tmClient.disconnect();
    });
  });
});

describe("FoundationExtension2", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const operatorAddress = "link1gx2dzurw686q340q94njwacpnax48pw824tksx";
  const granteeAddress = faucet.address5;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      // proposal grant
      {
        const msgGrant = createMsgGrant(operatorAddress, granteeAddress);
        const msg = createMsgSubmitProposal([faucet.address0], [msgGrant]);
        const result = await client.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        await sleep(75);
      }

      // proposal withdrawFromTreasury
      {
        const msgWithdraw = createMsgWithdrawFromTreasury(
          operatorAddress,
          granteeAddress,
          coins(100, "cony"),
        );
        const msg = createMsgSubmitProposal([faucet.address0], [msgWithdraw]);
        const result = await client.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        await sleep(75);
      }
    }
  });

  describe("Query result of Grant and Withdraw", () => {
    it("grant", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const response = await client.foundation.grants("link14nvvrk4dz3k695t8740vqzjnvrwszwm69hw0ls", "");
      expect(response.authorizations).toBeDefined();
      expect(response.authorizations).not.toBeNull();
      expect(response.authorizations.length).toEqual(1);

      tmClient.disconnect();
    });
  });
});
