import { AminoMsg } from "@cosmjs/amino";
import { fromBase64, fromUtf8, toBase64, toUtf8 } from "@cosmjs/encoding";
import { AminoConverters } from "@cosmjs/stargate";
import { Coin } from "lbmjs-types/cosmos/base/v1beta1/coin";
import { MsgStoreCodeAndInstantiateContract } from "lbmjs-types/lbm/wasm/v1/tx";

import { AccessConfig, accessTypeFromString, accessTypeToString } from "../wasm/aminomessages";

export interface AminoMsgStoreCodeAndInstantiateContract extends AminoMsg {
  readonly type: "wasm/MsgStoreCodeAndInstantiateContract";
  readonly value: {
    /** Sender is the that actor that signed the messages */
    readonly sender: string;
    /** WASMByteCode can be raw or gzip compressed */
    readonly wasm_byte_code: string;
    readonly instantiate_permission?: AccessConfig;
    /** Admin is an optional address that can execute migrations */
    readonly admin?: string;
    /** Label is optional metadata to be stored with a contract instance. */
    readonly label: string;
    /** Msg json encoded message to be passed to the contract on instantiation */
    readonly msg: any;
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
        wasm_byte_code: toBase64(wasmByteCode),
        instantiate_permission: instantiatePermission
          ? {
              permission: accessTypeToString(instantiatePermission.permission),
              address: instantiatePermission.address || undefined,
              addresses:
                instantiatePermission.addresses.length !== 0 ? instantiatePermission.addresses : undefined,
            }
          : undefined,
        admin: admin || undefined,
        label: label,
        msg: JSON.parse(fromUtf8(msg)),
        funds: funds,
      }),
      fromAmino: ({
        sender,
        wasm_byte_code,
        instantiate_permission,
        admin,
        label,
        msg,
        funds,
      }: AminoMsgStoreCodeAndInstantiateContract["value"]): MsgStoreCodeAndInstantiateContract => ({
        sender: sender,
        wasmByteCode: fromBase64(wasm_byte_code),
        instantiatePermission: instantiate_permission
          ? {
              permission: accessTypeFromString(instantiate_permission.permission),
              address: instantiate_permission.address ?? "",
              addresses: instantiate_permission.addresses ?? [],
            }
          : undefined,
        admin: admin ?? "",
        label: label,
        msg: toUtf8(JSON.stringify(msg)),
        funds: [...funds],
      }),
    },
  };
}
