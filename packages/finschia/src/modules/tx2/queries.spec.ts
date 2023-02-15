import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { coins, MsgSendEncodeObject, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
} from "../../testutils.spec";
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
  const signed = await client.sign(faucet.address0, [dummyMsg], defaultFee, "");
  return await client.broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()));
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
