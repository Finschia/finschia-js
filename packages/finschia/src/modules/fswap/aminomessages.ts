/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { assertDefinedAndNotNull } from "@cosmjs/utils";
import { MsgSwap, MsgSwapAll } from "@finschia/finschia-proto/lbm/fswap/v1/tx";

export interface AminoMsgSwap extends AminoMsg {
  readonly type: "lbm-sdk/MsgSwap";
  readonly value: {
    readonly from_address: string;
    readonly from_coin_amount: Coin;
    readonly to_denom: string;
  };
}

export function isAminoMsgSwap(msg: AminoMsg): msg is AminoMsgSwap {
  return msg.type === "lbm-sdk/MsgSwap";
}

export interface AminoMsgSwapAll extends AminoMsg {
  readonly type: "lbm-sdk/MsgSwapAll";
  readonly value: {
    readonly from_address: string;
    readonly from_denom: string;
    readonly to_denom: string;
  };
}

export function isAminoMsgSwapAll(msg: AminoMsg): msg is AminoMsgSwapAll {
  return msg.type === "lbm-sdk/MsgSwapAll";
}

export function createFswapAminoConverters(): AminoConverters {
  return {
    "/lbm.fswap.v1.MsgSwap": {
      aminoType: "lbm-sdk/MsgSwap",
      toAmino: ({ fromAddress, fromCoinAmount, toDenom }: MsgSwap): AminoMsgSwap["value"] => {
        assertDefinedAndNotNull(fromCoinAmount, "missing fromCoinAmount");
        return {
          from_address: fromAddress,
          from_coin_amount: fromCoinAmount,
          to_denom: toDenom,
        };
      },
      fromAmino: ({ from_address, from_coin_amount, to_denom }: AminoMsgSwap["value"]): MsgSwap => {
        return {
          fromAddress: from_address,
          fromCoinAmount: from_coin_amount,
          toDenom: to_denom,
        };
      },
    },
    "/lbm.fswap.v1.MsgSwapAll": {
      aminoType: "lbm-sdk/MsgSwapAll",
      toAmino: ({ fromAddress, fromDenom, toDenom }: MsgSwapAll): AminoMsgSwapAll["value"] => {
        return {
          from_address: fromAddress,
          from_denom: fromDenom,
          to_denom: toDenom,
        };
      },
      fromAmino: ({ from_address, from_denom, to_denom }: AminoMsgSwapAll["value"]): MsgSwapAll => {
        return {
          fromAddress: from_address,
          fromDenom: from_denom,
          toDenom: to_denom,
        };
      },
    },
  };
}
