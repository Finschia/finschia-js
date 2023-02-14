import { QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import { pendingWithoutSimapp, simapp } from "../../testutils.spec";
import { longify } from "../../utils";
import { setupTx2Extension, Tx2Extension } from "./queries";

export async function makeClientWithTx2(
  rpcUrl: string,
): Promise<[QueryClient & Tx2Extension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTx2Extension), tmClient];
}

describe("Tx2Extension", () => {
  // Currently ignored test, because current lbm-app doesn't expose 'lbm.tx.v1beta1.Service' endpoint
  xit("getBlockWithTxs", async () => {
    pendingWithoutSimapp();
    const [client, tmClient] = await makeClientWithTx2(simapp.tendermintUrl);

    const response = await client.tx2.getBlockWithTxs(longify(1));

    expect(response.txs).toBeDefined();
    expect(response.blockId).toBeDefined();
    expect(response.block).toBeDefined();

    tmClient.disconnect();
  });
});
