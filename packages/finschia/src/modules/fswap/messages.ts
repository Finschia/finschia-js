import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { MakeSwapProposal, Swap } from "@finschia/finschia-proto/lbm/fswap/v1/fswap";
import { MsgSwap, MsgSwapAll } from "@finschia/finschia-proto/lbm/fswap/v1/tx";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";

export const fswapTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.fswap.v1.MsgSwap", MsgSwap],
  ["/lbm.fswap.v1.MsgSwapAll", MsgSwapAll],
  ["/lbm.fswap.v1.MakeSwapProposal", MakeSwapProposal],
];

export interface MsgSwapEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fswap.v1.MsgSwap";
  readonly value: Partial<MsgSwap>;
}

export function isMsgSwapEncodeObject(object: EncodeObject): object is MsgSwapEncodeObject {
  return (object as MsgSwapEncodeObject).typeUrl === "/lbm.fswap.v1.MsgSwap";
}

export interface MsgSwapAllEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fswap.v1.MsgSwapAll";
  readonly value: Partial<MsgSwapAll>;
}

export function isMsgSwapAllEncodeObject(object: EncodeObject): object is MsgSwapAllEncodeObject {
  return (object as MsgSwapAllEncodeObject).typeUrl === "/lbm.fswap.v1.MsgSwapAll";
}

export interface MakeSwapProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fswap.v1.MakeSwapProposal";
  readonly value: Partial<MakeSwapProposal>;
}

export function isMakeSwapProposalEncodeObject(object: EncodeObject): object is MakeSwapProposalEncodeObject {
  return (object as MakeSwapProposalEncodeObject).typeUrl === "/lbm.fswap.v1.MakeSwapProposal";
}

export function createMakeSwapProposal(
  title: string,
  description: string,
  swap: Swap,
  toDenomMetadata: Metadata,
): MakeSwapProposalEncodeObject {
  return {
    typeUrl: "/lbm.fswap.v1.MakeSwapProposal",
    value: {
      title: title,
      description: description,
      swap: swap,
      toDenomMetadata: toDenomMetadata,
    },
  };
}
