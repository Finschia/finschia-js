import { coin, coins, Secp256k1HdWallet } from "@cosmjs/amino";
import { AminoTypes, assertIsDeliverTxSuccess } from "@cosmjs/stargate";
import { assertDefined } from "@cosmjs/utils";
import { MsgSwap, MsgSwapAll } from "@finschia/finschia-proto/lbm/fswap/v1/tx";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import { defaultSigningClientOptions, faucet, pendingWithoutSimapp, simapp } from "../../testutils.spec";
import { AminoMsgSwap, AminoMsgSwapAll, createFswapAminoConverters } from "./aminomessages";
import { MsgSwapAllEncodeObject, MsgSwapEncodeObject } from "./messages";
import { makeClientWithFswap } from "./queries.spec";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgSwap", () => {
      const msg: MsgSwap = {
        fromAddress: faucet.address0,
        fromCoinAmount: { denom: "cony", amount: "1000" },
        toDenom: "pdt",
      };
      const aminoType = new AminoTypes(createFswapAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fswap.v1.MsgSwap",
        value: msg,
      });
      const expected: AminoMsgSwap = {
        type: "lbm-sdk/MsgSwap",
        value: {
          from_address: faucet.address0,
          from_coin_amount: coin("1000", "cony"),
          to_denom: "pdt",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgSwapAll", () => {
      const msg: MsgSwapAll = {
        fromAddress: faucet.address0,
        fromDenom: "cony",
        toDenom: "pdt",
      };
      const aminoType = new AminoTypes(createFswapAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fswap.v1.MsgSwapAll",
        value: msg,
      });
      const expected: AminoMsgSwapAll = {
        type: "lbm-sdk/MsgSwapAll",
        value: {
          from_address: faucet.address0,
          from_denom: "cony",
          to_denom: "pdt",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    it("works for MsgSwap", () => {
      const aminoMsg: AminoMsgSwap = {
        type: "lbm-sdk/MsgSwap",
        value: {
          from_address: faucet.address0,
          from_coin_amount: coin("1000", "cony"),
          to_denom: "pdt",
        },
      };
      const msg = new AminoTypes(createFswapAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgSwap = {
        fromAddress: faucet.address0,
        fromCoinAmount: { amount: "1000", denom: "cony" },
        toDenom: "pdt",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fswap.v1.MsgSwap",
        value: expectedValue,
      });
    });

    it("works for MsgSwapAll", () => {
      const aminoMsg: AminoMsgSwapAll = {
        type: "lbm-sdk/MsgSwapAll",
        value: {
          from_address: faucet.address0,
          from_denom: "cony",
          to_denom: "pdt",
        },
      };
      const msg = new AminoTypes(createFswapAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgSwapAll = {
        fromAddress: faucet.address0,
        fromDenom: "cony",
        toDenom: "pdt",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fswap.v1.MsgSwapAll",
        value: expectedValue,
      });
    });
  });
});

describe("Amino Sign", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const owner = faucet.address0;
  const swapAmount = "100000";

  it("MsgSwap", async () => {
    pendingWithoutSimapp();
    const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });

    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const beforeAmount = (await client.fswap.swapped("cony", "pdt")).toCoinAmount?.amount;
    assertDefined(beforeAmount);

    const msgSwap: MsgSwapEncodeObject = {
      typeUrl: "/lbm.fswap.v1.MsgSwap",
      value: {
        fromAddress: owner,
        fromCoinAmount: { denom: "cony", amount: swapAmount },
        toDenom: "pdt",
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(owner, [msgSwap], defaultFee);
    assertIsDeliverTxSuccess(result);

    const afterAmount = (await client.fswap.swapped("cony", "pdt")).toCoinAmount?.amount;
    assertDefined(afterAmount);
    // beforeAmount + swapAmount(100000) * swapRate(148)
    const expectedAmount = BigInt(beforeAmount) + BigInt(swapAmount) * BigInt("148079656000000");
    expect(afterAmount).toEqual(expectedAmount.toString());

    tmClient.disconnect();
  });

  it("MsgSwapAll", async () => {
    const [client, tmClient] = await makeClientWithFswap(simapp.tendermintUrl);
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0), makeLinkPath(100)],
      prefix: simapp.prefix,
    });

    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const swapUser = (await wallet.getAccounts())[1].address;

    // bank send to swapUser for swapAll
    {
      const result = await signingFinschiaClient.sendTokens(
        owner,
        swapUser,
        coins(swapAmount, "cony"),
        defaultFee,
      );
      assertIsDeliverTxSuccess(result);
    }

    const beforeAmount = (await client.fswap.swapped("cony", "pdt")).toCoinAmount?.amount;
    assertDefined(beforeAmount);

    const msgSwapAll: MsgSwapAllEncodeObject = {
      typeUrl: "/lbm.fswap.v1.MsgSwapAll",
      value: {
        fromAddress: swapUser,
        fromDenom: "cony",
        toDenom: "pdt",
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(swapUser, [msgSwapAll], defaultFee);
    assertIsDeliverTxSuccess(result);

    const afterAmount = (await client.fswap.swapped("cony", "pdt")).toCoinAmount?.amount;
    assertDefined(afterAmount);
    // beforeAmount + (swapAmount(100000) - defaultFee(25000)) * swapRate(148079656000000)
    const expectedAmount =
      BigInt(beforeAmount) +
      (BigInt(swapAmount) - BigInt(defaultFee.amount[0].amount)) * BigInt("148079656000000");
    expect(afterAmount).toEqual(expectedAmount.toString());

    tmClient.disconnect();
  });
});
