import { coins, Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, DeliverTxResponse } from "@cosmjs/stargate";
import { assertDefined } from "@cosmjs/utils";

import { makeLinkPath } from "./paths";
import { SigningFinschiaClient } from "./signingfinschiaclient";
import { defaultSigningClientOptions, faucet, pendingWithoutSimapp, simapp } from "./testutils.spec";

describe("SigningFinschiaClient", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  describe("swapAndBridge", () => {
    it("works (Async broadcast)", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(200)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

      const addrs = (await wallet.getAccounts()).map((item) => item.address);

      // bank send for test
      {
        const result = await client.sendTokens(addrs[0], addrs[1], coins(1000000, "cony"), defaultFee);
        assertIsDeliverTxSuccess(result);
      }
      // swap & bridge partial balance
      const toAddr = "0xf7bAc63fc7CEaCf0589F25454Ecf5C2ce904997c";
      const result = await client.swapAndBridge(addrs[1], toAddr, { amount: 500_000 });
      assertIsDeliverTxSuccess(result as DeliverTxResponse);

      const balanceCony = await client.getBalance(addrs[1], "cony");
      expect(balanceCony.amount).toEqual("497750");
      const balance = await client.getBalance(addrs[1], "pdt");
      expect(balance.amount).toEqual("0");

      // swap & bridge all balance
      const result2 = await client.swapAndBridge(addrs[1], toAddr);
      assertIsDeliverTxSuccess(result2 as DeliverTxResponse);

      const balanceCony2 = await client.getBalance(addrs[1], "cony");
      expect(balanceCony2.amount).toEqual("0");
      const balance2 = await client.getBalance(addrs[1], "pdt");
      expect(balance2.amount).toEqual("0");
    });

    it("works (Sync broadcast)", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(200)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

      const addrs = (await wallet.getAccounts()).map((item) => item.address);

      // bank send for test
      {
        const result = await client.sendTokens(addrs[0], addrs[1], coins(1000000, "cony"), defaultFee);
        assertIsDeliverTxSuccess(result);
      }
      const toAddr = "0xf7bAc63fc7CEaCf0589F25454Ecf5C2ce904997c";
      const result = await client.swapAndBridge(addrs[1], toAddr, { asyncBroadcast: true });
      assertDefined(result);

      {
        const txRes = await client.pollForTxResult(result as Uint8Array);
        assertIsDeliverTxSuccess(txRes);
      }

      const balanceCony = await client.getBalance(addrs[1], "cony");
      expect(balanceCony.amount).toEqual("0");
      const balance = await client.getBalance(addrs[1], "pdt");
      expect(balance.amount).toEqual("0");
    });

    it("works with legacy Amino signer", async () => {
      pendingWithoutSimapp();
      const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(200)],
        prefix: simapp.prefix,
      });
      const options = { ...defaultSigningClientOptions, prefix: simapp.prefix };
      const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, wallet, options);

      const addrs = (await wallet.getAccounts()).map((item) => item.address);

      // bank send for test
      {
        const result = await client.sendTokens(addrs[0], addrs[1], coins(1000000, "cony"), defaultFee);
        assertIsDeliverTxSuccess(result);
      }
      const toAddr = "0xf7bAc63fc7CEaCf0589F25454Ecf5C2ce904997c";
      const result = await client.swapAndBridge(addrs[1], toAddr);
      assertIsDeliverTxSuccess(result as DeliverTxResponse);

      const balanceCony = await client.getBalance(addrs[1], "cony");
      expect(balanceCony.amount).toEqual("0");
      const balance = await client.getBalance(addrs[1], "pdt");
      expect(balance.amount).toEqual("0");
    });
  });
});
