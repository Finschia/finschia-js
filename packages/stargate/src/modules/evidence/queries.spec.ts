/* eslint-disable @typescript-eslint/naming-convention */
import { Tendermint34Client } from "@lbmjs/ostracon-rpc";

import { QueryClient } from "../../queryclient";
import { pendingWithoutSimapp, simapp } from "../../testutils.spec";
import { EvidenceExtension, setupEvidenceExtension } from "./queries";

async function makeClientWithEvidence(
  rpcUrl: string,
): Promise<[QueryClient & EvidenceExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupEvidenceExtension), tmClient];
}

describe("EvidenceExtension", () => {
  describe("AllEvidence", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithEvidence(simapp.tendermintUrl);

      const response = await client.evidence.allEvidence();
      expect(response.evidence).toBeDefined();
      expect(response.evidence).not.toBeNull();

      tmClient.disconnect();
    });
  });
});
