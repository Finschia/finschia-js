import { Tendermint34Client } from "@lbmjs/ostracon-rpc";
import { coins, DirectSecp256k1HdWallet, EncodeObject } from "@lbmjs/proto-signing";
import { MsgIssue } from "lbmjs-types/lbm/token/v1/tx";

import { SigningStargateClient } from "../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../stargateclient";
import { defaultSigningClientOptions, faucet, simapp, simappEnabled } from "../testutils.spec";
import { QueryClient } from "./queryclient";
import { setupTokenExtension, TokenExtension } from "./token";

async function makeClientWithToken(
  rpcUrl: string,
): Promise<[QueryClient & TokenExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupTokenExtension), tmClient];
}

describe("TokenExtension", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  describe("Issue", () => {
    it("works", async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
        const client = await SigningStargateClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        {
          const msg: MsgIssue = {
            owner: faucet.address0,
            to: faucet.address1,
            name: "TestToken",
            symbol: "ZERO1",
            imageUri: "",
            meta: "",
            amount: "1000",
            mintable: true,
            decimals: 6,
          };
          const msgAny: EncodeObject = {
            typeUrl: "/lbm.token.v1.MsgIssue",
            value: msg,
          };
          const memo = "Test Token for Stargate";
          const result = await client.signAndBroadcast(faucet.address0, [msgAny], defaultFee, memo);
          console.log("MsgIssueResult:", result);
          assertIsDeliverTxSuccess(result);
        }
      }
    });
  });
});
