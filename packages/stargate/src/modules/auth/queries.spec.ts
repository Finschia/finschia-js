/* eslint-disable @typescript-eslint/naming-convention */
import { encodePubkey } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert } from "@cosmjs/utils";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { Any } from "cosmjs-types/google/protobuf/any";
import Long from "long";

import { QueryClient } from "../../queryclient";
import { nonExistentAddress, pendingWithoutSimapp, simapp, unused, validator } from "../../testutils.spec";
import { AuthExtension, setupAuthExtension } from "./queries";

async function makeClientWithAuth(
  rpcUrl: string,
): Promise<[QueryClient & AuthExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupAuthExtension), tmClient];
}

describe("AuthExtension", () => {
  describe("account", () => {
    it("works for unused account", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithAuth(simapp.tendermintUrl);
      const account = await client.auth.account(unused.address);
      assert(account);

      expect(account.typeUrl).toEqual("/cosmos.auth.v1beta1.BaseAccount");
      expect(BaseAccount.decode(account.value)).toEqual({
        address: unused.address,
        accountNumber: Long.fromNumber(unused.accountNumber, true),
        sequence: Long.fromNumber(0, true),
      });

      tmClient.disconnect();
    });

    it("works for account with pubkey and non-zero sequence", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithAuth(simapp.tendermintUrl);
      const account = await client.auth.account(validator.delegatorAddress);
      assert(account);

      expect(account.typeUrl).toEqual("/cosmos.auth.v1beta1.BaseAccount");
      expect(BaseAccount.decode(account.value)).toEqual({
        address: validator.delegatorAddress,
        pubKey: Any.fromPartial(encodePubkey(validator.pubkey)),
        accountNumber: Long.fromNumber(validator.accountNumber, true),
        sequence: Long.fromNumber(validator.sequence, true),
      });

      tmClient.disconnect();
    });

    it("rejects for non-existent address", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithAuth(simapp.tendermintUrl);

      await expectAsync(client.auth.account(nonExistentAddress)).toBeRejectedWithError(
        /account link1hvuxwh9sp2zlc3ee5nnhngln6auv4ak4kyuspq not found/i,
      );

      tmClient.disconnect();
    });
  });
});
