/* eslint-disable @typescript-eslint/naming-convention */
import { sleep } from "@cosmjs/utils";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc";
import { coin, coins, DirectSecp256k1HdWallet } from "@lbmjs/proto-signing";
import { MsgDelegate, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";

import { QueryClient } from "../../queryclient";
import { SigningStargateClient } from "../../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
  validator,
} from "../../testutils.spec";
import { MsgDelegateEncodeObject, MsgUndelegateEncodeObject } from "./messages";
import { setupStakingExtension, StakingExtension } from "./queries";

async function makeClientWithStaking(
  rpcUrl: string,
): Promise<[QueryClient & StakingExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupStakingExtension), tmClient];
}

describe("StakingExtension", () => {
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

      {
        const msg: MsgDelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(25000, "stake"),
        };
        const msgAny: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const memo = "Test delegation for Stargate";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], defaultFee, memo);
        assertIsDeliverTxSuccess(result);
      }
      {
        const msg: MsgUndelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(100, "stake"),
        };
        const msgAny: MsgUndelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
          value: msg,
        };
        const memo = "Test undelegation for Stargate";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], defaultFee, memo);
        assertIsDeliverTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed
    }
  });

  describe("delegation", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.delegation(faucet.address0, validator.validatorAddress);
      expect(response.delegationResponse).toBeDefined();
      expect(response.delegationResponse).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("delegatorDelegations", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.delegatorDelegations(faucet.address0);
      expect(response.delegationResponses).toBeDefined();
      expect(response.delegationResponses).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("delegatorUnbondingDelegations", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.delegatorUnbondingDelegations(faucet.address0);
      expect(response.unbondingResponses).toBeDefined();
      expect(response.unbondingResponses).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("delegatorValidator", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.delegatorValidator(faucet.address0, validator.validatorAddress);
      expect(response.validator).toBeDefined();
      expect(response.validator).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("delegatorValidators", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.delegatorValidators(faucet.address0);
      expect(response.validators).toBeDefined();
      expect(response.validators).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("historicalInfo", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.historicalInfo(5);
      expect(response.hist).toBeDefined();
      expect(response.hist).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("params", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.params();
      expect(response.params).toBeDefined();
      expect(response.params).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("pool", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.pool();
      expect(response.pool).toBeDefined();
      expect(response.pool).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("redelegations", () => {
    it("works", async () => {
      // TODO: Set up a result for this test
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      await expectAsync(
        client.staking.redelegations(faucet.address0, validator.validatorAddress, validator.validatorAddress),
      ).toBeRejectedWithError(/redelegation not found/i);

      tmClient.disconnect();
    });
  });

  describe("unbondingDelegation", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.unbondingDelegation(faucet.address0, validator.validatorAddress);
      expect(response.unbond).toBeDefined();
      expect(response.unbond).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("validator", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.validator(validator.validatorAddress);
      expect(response.validator).toBeDefined();
      expect(response.validator).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("validatorDelegations", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.validatorDelegations(validator.validatorAddress);
      expect(response.delegationResponses).toBeDefined();
      expect(response.delegationResponses).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("validators", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.validators("BOND_STATUS_BONDED");
      expect(response.validators).toBeDefined();
      expect(response.validators).not.toBeNull();

      tmClient.disconnect();
    });
  });

  describe("validatorUnbondingDelegations", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

      const response = await client.staking.validatorUnbondingDelegations(validator.validatorAddress);
      expect(response.unbondingResponses).toBeDefined();
      expect(response.unbondingResponses).not.toBeNull();

      tmClient.disconnect();
    });
  });
});
