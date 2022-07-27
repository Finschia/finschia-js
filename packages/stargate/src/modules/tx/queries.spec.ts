import { coin, coins, DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assertDefined, sleep } from "@cosmjs/utils";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import Long from "long";

import { longify, makeLinkPath, QueryClient } from "../../queryclient";
import { defaultRegistryTypes, SigningStargateClient } from "../../signingstargateclient";
import { assertIsDeliverTxSuccess, StargateClient } from "../../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
  validator,
} from "../../testutils.spec";
import { setupTxExtension, TxExtension } from "./queries";

async function makeClientWithTx(rpcUrl: string): Promise<[QueryClient & TxExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTxExtension), tmClient];
}

describe("TxExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  let txHash: string | undefined;
  let memo: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: "link",
      });
      const client = await SigningStargateClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      {
        const recipient = makeRandomAddress();
        memo = `Test tx ${Date.now()}`;
        const result = await client.sendTokens(
          faucet.address0,
          recipient,
          coins(25000, "cony"),
          defaultFee,
          memo,
        );
        assertIsDeliverTxSuccess(result);
        txHash = result.transactionHash;
      }

      await sleep(75); // wait until transactions are indexed
    }
  });

  describe("getTx", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      assertDefined(txHash);
      assertDefined(memo);
      const [client, tmClient] = await makeClientWithTx(simapp.tendermintUrl);

      const response = await client.tx.getTx(txHash);
      expect(response.tx?.body?.memo).toEqual(memo);

      tmClient.disconnect();
    });
  });

  describe("simulate", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      assertDefined(txHash);
      assertDefined(memo);
      const [client, tmClient] = await makeClientWithTx(simapp.tendermintUrl);
      const sequenceClient = await StargateClient.connect(simapp.tendermintUrl);

      const registry = new Registry(defaultRegistryTypes);
      const msg: MsgDelegate = {
        delegatorAddress: faucet.address0,
        validatorAddress: validator.validatorAddress,
        amount: coin(25000, "stake"),
      };
      const msgAny = registry.encodeAsAny({
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: msg,
      });

      const { sequence } = await sequenceClient.getSequence(faucet.address0);
      const response = await client.tx.simulate([msgAny], "foo", faucet.pubkey0, sequence);
      expect(response.gasInfo?.gasUsed.toNumber()).toBeGreaterThanOrEqual(101_000);
      expect(response.gasInfo?.gasUsed.toNumber()).toBeLessThanOrEqual(153_000);
      expect(response.gasInfo?.gasWanted).toEqual(longify(Long.UZERO));

      tmClient.disconnect();
    });
  });
});
