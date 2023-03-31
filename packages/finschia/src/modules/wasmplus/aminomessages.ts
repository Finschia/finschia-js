import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { AccessConfig } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { MsgStoreCodeAndInstantiateContract } from "lbmjs-types/lbm/wasm/v1/tx";

export interface AminoMsgStoreCodeAndInstantiateContract extends AminoMsg {
  readonly type: "wasm/MsgStoreCodeAndInstantiateContract";
  readonly value: {
    /** Sender is the that actor that signed the messages */
    readonly sender: string;
    /** WASMByteCode can be raw or gzip compressed */
    readonly wasmByteCode: Uint8Array;
    readonly instantiatePermission?: AccessConfig;
    /** Admin is an optional address that can execute migrations */
    readonly admin: string;
    /** Label is optional metadata to be stored with a contract instance. */
    readonly label: string;
    /** Msg json encoded message to be passed to the contract on instantiation */
    readonly msg: Uint8Array;
    /** Funds coins that are transferred to the contract on instantiation */
    readonly funds: Coin[];
  };
}

export function createWasmplusAminoConverters(): AminoConverters {
  return {
    "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract": {
      aminoType: "wasm/MsgStoreCodeAndInstantiateContract",
      toAmino: ({
        sender,
        wasmByteCode,
        instantiatePermission,
        admin,
        label,
        msg,
        funds,
      }: MsgStoreCodeAndInstantiateContract): AminoMsgStoreCodeAndInstantiateContract["value"] => ({
        sender: sender,
        wasmByteCode: wasmByteCode,
        instantiatePermission: instantiatePermission,
        admin: admin,
        label: label,
        msg: msg,
        funds: funds,
      }),
      fromAmino: ({
        sender,
        wasmByteCode,
        instantiatePermission,
        admin,
        label,
        msg,
        funds,
      }: AminoMsgStoreCodeAndInstantiateContract["value"]): MsgStoreCodeAndInstantiateContract => ({
        sender: sender,
        wasmByteCode: wasmByteCode,
        instantiatePermission: instantiatePermission,
        admin: admin,
        label: label,
        msg: msg,
        funds: funds,
      }),
    },
  };
}
