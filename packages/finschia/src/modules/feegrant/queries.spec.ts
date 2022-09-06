/* eslint-disable @typescript-eslint/naming-convention */
import { coins } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";
import { BasicAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";

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
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const msg = {
        typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
        value: {
          granter: granterAddress,
          grantee: granteeAddress,
          allowance: {
            typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
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

      client.disconnect();
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
