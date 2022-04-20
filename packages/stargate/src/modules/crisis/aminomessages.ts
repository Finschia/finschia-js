/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg } from "@lbmjs/amino";

import { AminoConverters } from "../../aminotypes";

// See https://github.com/cosmos/cosmos-sdk/blob/v0.45.1/proto/cosmos/crisis/v1beta1/tx.proto

/** Verifies a particular invariance */
export interface AminoMsgVerifyInvariant extends AminoMsg {
  readonly type: "lbm-sdk/MsgVerifyInvariant";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    readonly invariant_module_name: string;
    readonly invariant_route: string;
  };
}

export function isAminoMsgVerifyInvariant(msg: AminoMsg): msg is AminoMsgVerifyInvariant {
  return msg.type === "lbm-sdk/MsgVerifyInvariant";
}

export function createCrysisAminoConverters(): AminoConverters {
  throw new Error("Not implemented");
}
