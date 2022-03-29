/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64, fromUtf8, toBase64, toUtf8 } from "@cosmjs/encoding";
import { AminoConverter, Coin } from "@lbmjs/stargate";
import {
  MsgClearAdmin,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgMigrateContract,
  MsgStoreCode,
  MsgStoreCodeAndInstantiateContract,
  MsgUpdateAdmin,
} from "lbmjs-types/lbm/wasm/v1/tx";
import Long from "long";

// TODO: implement
/**
 * @see https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/types.proto#L36-L41
 */
type AccessConfig = never;

/**
 * The Amino JSON representation of [MsgStoreCode].
 *
 * [MsgStoreCode]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L28-L39
 */
export interface AminoMsgStoreCode {
  type: "wasm/MsgStoreCode";
  value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Base64 encoded Wasm */
    readonly wasm_byte_code: string;
    readonly instantiate_permission?: AccessConfig;
  };
}

export interface AminoMsgStoreCodeAndInstantiateContract {
  type: "wasm/MsgStoreCodeAndInstantiateContract";
  value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Base64 encoded Wasm */
    readonly wasm_byte_code: string;
    readonly instantiate_permission?: AccessConfig;
    readonly label: string;
    /** Instantiate message as JavaScript object */
    readonly init_msg: any;
    readonly funds: readonly Coin[];
    /** Bech32-encoded admin address */
    readonly admin?: string;
  };
}

/**
 * The Amino JSON representation of [MsgExecuteContract].
 *
 * [MsgExecuteContract]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L73-L86
 */
export interface AminoMsgExecuteContract {
  type: "wasm/MsgExecuteContract";
  value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Bech32 account address */
    readonly contract: string;
    /** Execute message as JavaScript object */
    readonly msg: any;
    readonly funds: readonly Coin[];
  };
}

/**
 * The Amino JSON representation of [MsgInstantiateContract].
 *
 * [MsgInstantiateContract]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L46-L64
 */
export interface AminoMsgInstantiateContract {
  type: "wasm/MsgInstantiateContract";
  value: {
    /** Bech32 account address */
    readonly sender: string;
    /** ID of the Wasm code that was uploaded before */
    readonly code_id: string;
    /** Human-readable label for this contract */
    readonly label: string;
    /** Instantiate message as JavaScript object */
    readonly msg: any;
    readonly funds: readonly Coin[];
    /** Bech32-encoded admin address */
    readonly admin?: string;
  };
}

/**
 * The Amino JSON representation of [MsgMigrateContract].
 *
 * [MsgMigrateContract]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L94-L104
 */
export interface AminoMsgMigrateContract {
  type: "wasm/MsgMigrateContract";
  value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Bech32 account address */
    readonly contract: string;
    /** The new code */
    readonly code_id: string;
    /** Migrate message as JavaScript object */
    readonly msg: any;
  };
}

/**
 * The Amino JSON representation of [MsgUpdateAdmin].
 *
 * [MsgUpdateAdmin]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L113-L121
 */
export interface AminoMsgUpdateAdmin {
  type: "wasm/MsgUpdateAdmin";
  value: {
    /** Bech32-encoded sender address. This must be the old admin. */
    readonly sender: string;
    /** Bech32-encoded contract address to be updated */
    readonly contract: string;
    /** Bech32-encoded address of the new admin */
    readonly new_admin: string;
  };
}

/**
 * The Amino JSON representation of [MsgClearAdmin].
 *
 * [MsgClearAdmin]: https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/tx.proto#L126-L132
 */
export interface AminoMsgClearAdmin {
  type: "wasm/MsgClearAdmin";
  value: {
    /** Bech32-encoded sender address. This must be the old admin. */
    readonly sender: string;
    /** Bech32-encoded contract address to be updated */
    readonly contract: string;
  };
}

export const cosmWasmTypes: Record<string, AminoConverter> = {
  "/lbm.wasm.v1.MsgStoreCode": {
    aminoType: "wasm/MsgStoreCode",
    toAmino: ({ sender, wasmByteCode }: MsgStoreCode): AminoMsgStoreCode["value"] => ({
      sender: sender,
      wasm_byte_code: toBase64(wasmByteCode),
    }),
    fromAmino: ({ sender, wasm_byte_code }: AminoMsgStoreCode["value"]): MsgStoreCode => ({
      sender: sender,
      wasmByteCode: fromBase64(wasm_byte_code),
      instantiatePermission: undefined,
    }),
  },
  "/lbm.wasm.v1.MsgInstantiateContract": {
    aminoType: "wasm/MsgInstantiateContract",
    toAmino: ({
      sender,
      codeId,
      label,
      msg,
      funds,
      admin,
    }: MsgInstantiateContract): AminoMsgInstantiateContract["value"] => ({
      sender: sender,
      code_id: codeId.toString(),
      label: label,
      msg: toBase64(msg),
      funds: funds,
      admin: admin || undefined,
    }),
    fromAmino: ({
      sender,
      code_id,
      label,
      msg,
      funds,
      admin,
    }: AminoMsgInstantiateContract["value"]): MsgInstantiateContract => ({
      sender: sender,
      codeId: Long.fromString(code_id),
      label: label,
      msg: fromBase64(msg),
      funds: [...funds],
      admin: admin ?? "",
    }),
  },
  "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract": {
    aminoType: "wasm/MsgStoreCodeAndInstantiateContract",
    toAmino: ({
      sender,
      wasmByteCode,
      label,
      initMsg,
      funds,
      admin,
    }: MsgStoreCodeAndInstantiateContract): AminoMsgStoreCodeAndInstantiateContract["value"] => ({
      sender: sender,
      wasm_byte_code: toBase64(wasmByteCode),
      label: label,
      init_msg: JSON.parse(fromUtf8(initMsg)),
      funds: funds,
      admin: admin || undefined,
    }),
    fromAmino: ({
      sender,
      wasm_byte_code,
      label,
      init_msg,
      funds,
      admin,
    }: AminoMsgStoreCodeAndInstantiateContract["value"]): MsgStoreCodeAndInstantiateContract => ({
      sender: sender,
      wasmByteCode: fromBase64(wasm_byte_code),
      label: label,
      initMsg: toUtf8(JSON.stringify(init_msg)),
      funds: [...funds],
      admin: admin ?? "",
      instantiatePermission: undefined,
    }),
  },
  "/lbm.wasm.v1.MsgUpdateAdmin": {
    aminoType: "wasm/MsgUpdateAdmin",
    toAmino: ({ sender, newAdmin, contract }: MsgUpdateAdmin): AminoMsgUpdateAdmin["value"] => ({
      sender: sender,
      new_admin: newAdmin,
      contract: contract,
    }),
    fromAmino: ({ sender, new_admin, contract }: AminoMsgUpdateAdmin["value"]): MsgUpdateAdmin => ({
      sender: sender,
      newAdmin: new_admin,
      contract: contract,
    }),
  },
  "/lbm.wasm.v1.MsgClearAdmin": {
    aminoType: "wasm/MsgClearAdmin",
    toAmino: ({ sender, contract }: MsgClearAdmin): AminoMsgClearAdmin["value"] => ({
      sender: sender,
      contract: contract,
    }),
    fromAmino: ({ sender, contract }: AminoMsgClearAdmin["value"]): MsgClearAdmin => ({
      sender: sender,
      contract: contract,
    }),
  },
  "/lbm.wasm.v1.MsgExecuteContract": {
    aminoType: "wasm/MsgExecuteContract",
    toAmino: ({ sender, contract, msg, funds }: MsgExecuteContract): AminoMsgExecuteContract["value"] => ({
      sender: sender,
      contract: contract,
      msg: toBase64(msg),
      funds: funds,
    }),
    fromAmino: ({ sender, contract, msg, funds }: AminoMsgExecuteContract["value"]): MsgExecuteContract => ({
      sender: sender,
      contract: contract,
      msg: fromBase64(msg),
      funds: [...funds],
    }),
  },
  "/lbm.wasm.v1.MsgMigrateContract": {
    aminoType: "wasm/MsgMigrateContract",
    toAmino: ({ sender, contract, codeId, msg }: MsgMigrateContract): AminoMsgMigrateContract["value"] => ({
      sender: sender,
      contract: contract,
      code_id: codeId.toString(),
      msg: toBase64(msg),
    }),
    fromAmino: ({
      sender,
      contract,
      code_id,
      msg,
    }: AminoMsgMigrateContract["value"]): MsgMigrateContract => ({
      sender: sender,
      contract: contract,
      codeId: Long.fromString(code_id),
      msg: fromBase64(msg),
    }),
  },
};
