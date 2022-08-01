import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assertDefined, sleep } from "@cosmjs/utils";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";

import { makeLinkPath } from "../../paths";
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
import { AuthzExtension, setupAuthzExtension } from "./queries";

async function makeClientWithAuthz(
  rpcUrl: string,
): Promise<[QueryClient & AuthzExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupAuthzExtension), tmClient];
}

// todo: This test has bug. This was issued as https://github.com/cosmos/cosmjs/issues/1038.
// we need to watch this issue
xdescribe("AuthzExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const granter1Address = faucet.address1;
  const grantee1Address = makeRandomAddress();

  const grantedMsg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        // Use address 1 and 2 instead of 0 to avoid conflicts with other delegation tests
        // This must match `voterAddress` above.
        hdPaths: [makeLinkPath(1), makeLinkPath(2)],
        prefix: simapp.prefix,
      });
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const grantMsg = {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: {
          granter: granter1Address,
          grantee: grantee1Address,
          grant: {
            authorization: {
              typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
              value: GenericAuthorization.encode(
                GenericAuthorization.fromPartial({
                  msg: grantedMsg,
                }),
              ).finish(),
            },
          },
        },
      };
      const grantResult = await client.signAndBroadcast(
        granter1Address,
        [grantMsg],
        defaultFee,
        "Test grant for simd",
      );
      assertIsDeliverTxSuccess(grantResult);
      await sleep(75); // wait until transactions are indexed

      client.disconnect();
    }
  });

  describe("grants", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithAuthz(simapp.tendermintUrl);
      const response = await client.authz.grants(granter1Address, grantee1Address, "");
      expect(response.grants.length).toEqual(1);
      const grant = response.grants[0];

      // Needs to respond with a grant
      assertDefined(grant.authorization);

      // Needs to be GenericAuthorization to decode it below
      expect(grant.authorization.typeUrl).toEqual("/cosmos.authz.v1beta1.GenericAuthorization");

      // Decode the message
      const msgDecoded = GenericAuthorization.decode(grant.authorization.value).msg;

      // Check if its the same one then we granted
      expect(msgDecoded).toEqual(grantedMsg);

      tmClient.disconnect();
    });
  });
});
