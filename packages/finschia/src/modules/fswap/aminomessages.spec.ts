import { coin } from "@cosmjs/amino";
import { AminoTypes } from "@cosmjs/stargate";
import { MsgSwap, MsgSwapAll } from "@finschia/finschia-proto/lbm/fswap/v1/tx";

import { faucet } from "../../testutils.spec";
import { AminoMsgSwap, AminoMsgSwapAll, createFswapAminoConverters } from "./aminomessages";

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
