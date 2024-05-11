import { EncodeObject, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { Exec } from "@finschia/finschia-proto/lbm/foundation/v1/tx";
import { Swap } from "@finschia/finschia-proto/lbm/fswap/v1/fswap";
import { MsgSetSwap, MsgSwap, MsgSwapAll } from "@finschia/finschia-proto/lbm/fswap/v1/tx";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";

import { MsgSubmitProposalEncodeObject } from "../foundation/messages";

export const fswapTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.fswap.v1.MsgSwap", MsgSwap],
  ["/lbm.fswap.v1.MsgSwapAll", MsgSwapAll],
  ["/lbm.fswap.v1.MsgSetSwap", MsgSetSwap],
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

export interface MsgSetSwapEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fswap.v1.MsgSetSwap";
  readonly value: Partial<MsgSetSwap>;
}

export function isMsgSetSwapEncodeObject(object: EncodeObject): object is MsgSetSwapEncodeObject {
  return (object as MsgSetSwapEncodeObject).typeUrl === "/lbm.fswap.v1.MsgSetSwap";
}

export function createMakeSwapProposal(
  proposer: string,
  authority: string,
  swap: Swap,
  toDenomMetadata: Metadata,
  metadata = "",
  exec: Exec = Exec.EXEC_TRY,
): MsgSubmitProposalEncodeObject {
  const swapMsg: MsgSetSwapEncodeObject = {
    typeUrl: "/lbm.fswap.v1.MsgSetSwap",
    value: {
      authority: authority,
      swap: swap,
      toDenomMetadata: toDenomMetadata,
    },
  };

  const registry = new Registry(fswapTypes);
  const msg = registry.encodeAsAny(swapMsg);
  return {
    typeUrl: "/lbm.foundation.v1.MsgSubmitProposal",
    value: {
      proposers: [proposer],
      metadata: metadata,
      messages: [msg],
      exec: exec,
    },
  };
}
