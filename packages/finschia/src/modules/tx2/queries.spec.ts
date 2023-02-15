import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { coins, coin, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import { defaultSigningClientOptions, faucet, pendingWithoutSimapp, simapp } from "../../testutils.spec";
import { longify } from "../../utils";
import { setupTx2Extension, Tx2Extension } from "./queries";

async function makeClientWithTx2(rpcUrl: string): Promise<[QueryClient & Tx2Extension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTx2Extension), tmClient];
}

async function sendDummyTx() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
    hdPaths: [makeLinkPath(0)],
    prefix: simapp.prefix,
  });
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const client = await SigningFinschiaClient.connectWithSigner(
    simapp.tendermintUrl,
    wallet,
    defaultSigningClientOptions,
  );
  const sendAmount = coin("1000", "cony");
  const msg = {
    typeUrl: "/lbm.foundation.v1.MsgFundTreasury",
    value: { from: faucet.address0, amount: [sendAmount] },
  };

  return client.signAndBroadcast(faucet.address0, [msg], defaultFee);
}

describe("Tx2Extension", () => {
  let client: QueryClient & Tx2Extension;
  let tmClient: Tendermint34Client;
  beforeAll(async () => {
    const res = await makeClientWithTx2(simapp.tendermintUrl);
    client = res[0];
    tmClient = res[1];
  });
  afterAll(() => {
    tmClient.disconnect();
  });

  it("getBlockWithTxs", async () => {
    pendingWithoutSimapp();

    const txRes = await sendDummyTx();
    const response = await client.tx2.getBlockWithTxs(longify(txRes.height));

    expect(response.txs).toBeDefined();
    expect(response.blockId).toBeDefined();
    expect(response.block).toBeDefined();
  });
});
