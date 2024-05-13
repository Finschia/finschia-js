import { coins } from "@cosmjs/amino";
import { Decimal } from "@cosmjs/math";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
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
import { createMakeSwapProposal, MsgSwapAllEncodeObject, MsgSwapEncodeObject } from "./messages";
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

  const swapAmount = "1000000";
  const swapAllAmount = "1000000";

  let beforeSwappedFromAmount: string | undefined;
  let beforeTotalSwappableToAmount: string | undefined;

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

      // save before data
      const [queryClient, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);
      const swappedRes = await queryClient.fswap.swapped("cony", "pdt");
      expect(swappedRes.fromCoinAmount).toBeDefined();
      expect(swappedRes.toCoinAmount).toBeDefined();
      beforeSwappedFromAmount = swappedRes.fromCoinAmount?.amount;

      const totalSwappableCoin = await queryClient.fswap.totalSwappableToCoinAmount("cony", "pdt");
      expect(totalSwappableCoin).toBeDefined();
      beforeTotalSwappableToAmount = totalSwappableCoin?.amount;
      tmClient.disconnect();

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
        // bank send swapAllAmount to swapAllUser for MsgSwapAll test
        const result = await client.sendTokens(owner, swapAllUser, coins(swapAllAmount, "cony"), defaultFee);
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

        client.disconnect();
      }
    }
  });

  describe("query", () => {
    it("Swaps", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const response = await client.fswap.swaps();
      expect(response.swaps).toBeDefined();
      expect(response.swaps.length).toEqual(1);
      const expected: Swap = {
        fromDenom: "cony",
        toDenom: "pdt",
        amountCapForToDenom: "1000000000000000000000000000000000000000000000",
        swapRate: Decimal.fromUserInput("148079656000000", 18).atomics,
      };
      expect(response.swaps[0]).toEqual(expected);

      tmClient.disconnect();
    });

    it("TotalSwappableToCoinAmount", async () => {
      pendingWithoutSimapp();
      assert(beforeTotalSwappableToAmount, "Missing beforeTotalSwappableToAmount");
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const coin = await client.fswap.totalSwappableToCoinAmount("cony", "pdt");
      expect(coin).toBeDefined();
      expect(coin?.denom).toEqual("pdt");
      const totalSwappedCony =
        BigInt(swapAmount) + (BigInt(swapAllAmount) - BigInt(defaultFee.amount[0].amount));
      const expectedTotalSwappableToCoinAmount =
        BigInt(beforeTotalSwappableToAmount) - totalSwappedCony * BigInt("148079656000000");
      expect(coin?.amount).toEqual(expectedTotalSwappableToCoinAmount.toString());

      tmClient.disconnect();
    });

    it("Swapped", async () => {
      pendingWithoutSimapp();
      assert(beforeSwappedFromAmount, "Missing beforeSwappedFromAmount");
      const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);

      const response = await client.fswap.swapped("cony", "pdt");
      expect(response.fromCoinAmount).toBeDefined();
      expect(response.toCoinAmount).toBeDefined();
      const expectedTotalCony =
        BigInt(beforeSwappedFromAmount) +
        BigInt(swapAmount) +
        (BigInt(swapAllAmount) - BigInt(defaultFee.amount[0].amount));
      expect(response.fromCoinAmount).toEqual({ denom: "cony", amount: expectedTotalCony.toString() });
      expect(response.toCoinAmount).toEqual({
        denom: "pdt",
        amount: (expectedTotalCony * BigInt("148079656000000")).toString(),
      });

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
        const foundationAccount = faucet.address0;
        const foundationModuleAddr = "link190vt0vxc8c8vj24a7mm3fjsenfu8f5yxxj76cp";
        const proposalMsg = createMakeSwapProposal(
          foundationAccount,
          foundationModuleAddr,
          {
            fromDenom: "cony1",
            toDenom: "pdt",
            amountCapForToDenom: "100000000000000",
            swapRate: Decimal.fromUserInput("148", 18).atomics,
          },
          metadata,
        );
        const proposalResult = await client.signAndBroadcast(
          foundationAccount,
          [proposalMsg],
          defaultFee,
          "Register sample swap proposal",
        );
        // tx success but execution fail
        assertIsDeliverTxSuccess(proposalResult);
        // check error message
        expect(proposalResult.rawLog).toContain(
          "cannot make more swaps, max swaps is 1: no more swap allowed",
        );
      }
    });
  });
});
