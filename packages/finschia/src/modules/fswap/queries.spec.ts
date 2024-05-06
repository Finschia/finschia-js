import { coins } from "@cosmjs/amino";
import { Decimal } from "@cosmjs/math";
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import {
  assertIsDeliverTxFailure,
  assertIsDeliverTxSuccess,
  MsgSendEncodeObject,
  MsgSubmitProposalEncodeObject,
  QueryClient,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";
import { Swap } from "@finschia/finschia-proto/lbm/fswap/v1/fswap";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { createMakeSwapProposal, fswapTypes, MsgSwapAllEncodeObject, MsgSwapEncodeObject } from "./messages";
import { FswapExtension, setupFswapExtension } from "./queries";

export async function makeClientWithFswap(
  rpcUrl: string,
): Promise<[QueryClient & FswapExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupFswapExtension), tmClient];
}

describe("FswapExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const swapAmount = "1000";
  const swapAllAmount = "1000000";

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(1), makeLinkPath(100)],
        prefix: simapp.prefix,
      });
      const accounts = await wallet.getAccounts();
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const owner = faucet.address0;
      const swapAllUser = accounts[2].address;

      // Swap
      {
        const msgSwap: MsgSwapEncodeObject = {
          typeUrl: "/lbm.fswap.v1.MsgSwap",
          value: {
            fromAddress: owner,
            fromCoinAmount: { denom: "cony", amount: swapAmount },
            toDenom: "pdt",
          },
        };
        const result = await client.signAndBroadcast(owner, [msgSwap], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // SwapAll
      {
        // send
        const msgSend: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: owner,
            toAddress: swapAllUser,
            amount: coins(swapAllAmount, simapp.denomFee),
          },
        };
        const result = await client.signAndBroadcast(owner, [msgSend], defaultFee);
        assertIsDeliverTxSuccess(result);

        await sleep(75);

        const msgSwapAll: MsgSwapAllEncodeObject = {
          typeUrl: "/lbm.fswap.v1.MsgSwapAll",
          value: {
            fromAddress: swapAllUser,
            fromDenom: "cony",
            toDenom: "pdt",
          },
        };
        const result2 = await client.signAndBroadcast(swapAllUser, [msgSwapAll], defaultFee);
        assertIsDeliverTxSuccess(result2);

        const conyBalance = await client.getBalance(swapAllUser, "cony");
        expect(conyBalance.amount).toEqual("0");
        const swappedCoinBalance = await client.getBalance(swapAllUser, "pdt");
        expect(swappedCoinBalance.amount).toEqual("144300000");

        client.disconnect();
      }
    }
  });

  describe("query", () => {
    it("swaps", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const response = await client.fswap.swaps();
      expect(response.swaps).toBeDefined();
      expect(response.swaps.length).toEqual(1);
      const expected: Swap = {
        fromDenom: "cony",
        toDenom: "pdt",
        amountCapForToDenom: "100000000000000",
        swapRate: Decimal.fromUserInput("148", 18).atomics,
      };
      expect(response.swaps[0]).toEqual(expected);

      tmClient.disconnect();
    });

    it("TotalSwappableToCoinAmount", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const coin = await client.fswap.totalSwappableToCoinAmount("cony", "pdt");
      expect(coin).toBeDefined();
      expect(coin?.denom).toEqual("pdt");
      const totalSwappedCony =
        parseInt(swapAmount, 10) + (parseInt(swapAllAmount, 10) - parseInt(defaultFee.amount[0].amount, 10));
      const expectedTotalSwappableToCoinAmount = 100000000000000 - totalSwappedCony * 148;
      expect(coin?.amount).toEqual(expectedTotalSwappableToCoinAmount.toString());

      tmClient.disconnect();
    });

    it("Swapped", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const response = await client.fswap.swapped("cony", "pdt");
      expect(response.fromCoinAmount).toBeDefined();
      expect(response.toCoinAmount).toBeDefined();
      const expectedTotalCony =
        parseInt(swapAmount, 10) + (parseInt(swapAllAmount, 10) - parseInt(defaultFee.amount[0].amount, 10));
      expect(response.fromCoinAmount).toEqual({ denom: "cony", amount: expectedTotalCony.toString() });
      expect(response.toCoinAmount).toEqual({ denom: "pdt", amount: (expectedTotalCony * 148).toString() });

      tmClient.disconnect();
    });
  });
});

describe("Proposal", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };

  describe("MakeSwapProposal", () => {
    it("Submit", async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0), makeLinkPath(1)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        const initialDeposit = coins(10000000, "stake");
        const metadata: Metadata = {
          description: "test swapped coin metadata",
          denomUnits: [
            {
              denom: "pdt",
              exponent: 0,
              aliases: [],
            },
            {
              denom: "PDT",
              exponent: 18,
              aliases: [],
            },
          ],
          base: "pdt",
          display: "PDT",
          name: "PDT",
          symbol: "PDT",
          uri: "",
          uriHash: "",
        };
        // proposal MakeSwapProposal
        const msg = createMakeSwapProposal(
          "sample swap",
          "finschia-js test sample swap",
          {
            fromDenom: "cony1",
            toDenom: "pdt",
            amountCapForToDenom: "100000000000000",
            swapRate: Decimal.fromUserInput("148", 18).atomics,
          },
          metadata,
        );
        const registry = new Registry(fswapTypes);
        const proposalMsg: MsgSubmitProposalEncodeObject = {
          typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
          value: {
            content: registry.encodeAsAny(msg),
            proposer: faucet.address1,
            initialDeposit: initialDeposit,
          },
        };
        const proposalResult = await client.signAndBroadcast(
          faucet.address1,
          [proposalMsg],
          defaultFee,
          "Register sample swap proposal",
        );
        assertIsDeliverTxFailure(proposalResult);
        // check error message
        expect(proposalResult.rawLog).toContain(
          "cannot make more swaps, max swaps is 1: no more swap allowed: invalid proposal content",
        );
      }
    });
  });
});
