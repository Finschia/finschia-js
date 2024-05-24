import { coins, Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess } from "@cosmjs/stargate";

import { makeLinkPath } from "./paths";
import { SigningFinschiaClient } from "./signingfinschiaclient";
import { defaultSigningClientOptions, faucet, pendingWithoutSimapp, simapp } from "./testutils.spec";

describe("SigningFinschiaClient", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  describe("swapAndBridge", () => {
    it("works", async () => {
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
      const result = await client.swapAndBridge(addrs[1], toAddr);
      assertIsDeliverTxSuccess(result);

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
      assertIsDeliverTxSuccess(result);

      const balance = await client.getBalance(addrs[1], "pdt");
      expect(balance.amount).toEqual("0");
    });
  });
});
