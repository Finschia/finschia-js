/* eslint-disable @typescript-eslint/naming-convention */
import { sleep } from "@cosmjs/utils";
import { coins } from "@lbmjs/amino/build";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc/build";
import { DirectSecp256k1HdWallet } from "@lbmjs/proto-signing/build";
import { BasicAllowance } from "lbmjs-types/lbm/feegrant/v1/feegrant";

import { QueryClient } from "../../queryclient";
import { SigningStargateClient } from "../../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { FeeGrantExtension, setupFeeGrantExtension } from "./queries";

async function makeClientWithFeeGrant(
  rpcUrl: string,
): Promise<[QueryClient & FeeGrantExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupFeeGrantExtension), tmClient];
}

describe("FeeGrantExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const granterAddress = faucet.address0;
  const granteeAddress = makeRandomAddress();

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const msg = {
        typeUrl: "/lbm.feegrant.v1.MsgGrantAllowance",
        value: {
          granter: granterAddress,
          grantee: granteeAddress,
          allowance: {
            typeUrl: "/lbm.feegrant.v1.BasicAllowance",
            value: BasicAllowance.encode({ spendLimit: [] }).finish(),
          },
        },
      };
      const grantResult = await client.signAndBroadcast(
        granterAddress,
        [msg],
        defaultFee,
        "Test feegrant for simd",
      );
      assertIsDeliverTxSuccess(grantResult);

      await sleep(75);
    }
  });

  describe("allowance", () => {
    it("work", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFeeGrant(simapp.tendermintUrl);

      const response = await client.feegrant.allowance(granterAddress, granteeAddress);
      expect(response.allowance).toBeDefined();
      expect(response.allowance).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("allowances", () => {
    it("work", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFeeGrant(simapp.tendermintUrl);

      const response = await client.feegrant.allowances(granteeAddress);
      expect(response.allowances).toBeDefined();
      expect(response.allowances).not.toBeNull();
      expect(response.allowances.length).toBeGreaterThanOrEqual(1);

      tmClient.disconnect();
    });
  });
});
