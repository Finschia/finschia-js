import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { coins, MsgSendEncodeObject, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert } from "@cosmjs/utils";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";

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
import { longify } from "../../utils";
import { setupTx2Extension, Tx2Extension } from "./queries";

async function makeClientWithTx2(rpcUrl: string): Promise<[QueryClient & Tx2Extension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTx2Extension), tmClient];
}

describe("Tx2Extension", () => {
  let txHeight: number | undefined;

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
      const defaultFee = {
        amount: coins(250000, simapp.denomFee),
        gas: "1500000",
      };
      const msg: MsgSend = {
        fromAddress: faucet.address0,
        toAddress: makeRandomAddress(),
        amount: coins(1234, simapp.denomFee),
      };
      const dummyMsg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: msg,
      };
      const result = await client.signAndBroadcast(faucet.address0, [dummyMsg], defaultFee);
      txHeight = result.height;

      client.disconnect();
    }
  });

  it("getBlockWithTxs", async () => {
    pendingWithoutSimapp();
    assert(txHeight, "Missing txHeight");

    const [client, tmClient] = await makeClientWithTx2(simapp.tendermintUrl);
    const response = await client.tx2.getBlockWithTxs(longify(txHeight));

    expect(response.txs).toBeDefined();
    expect(response.blockId).toBeDefined();
    expect(response.block).toBeDefined();
    tmClient.disconnect();
  });
});
