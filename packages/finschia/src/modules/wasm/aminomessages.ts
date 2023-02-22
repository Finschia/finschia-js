/* eslint-disable @typescript-eslint/naming-convention */
import { createWasmAminoConverters as createAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { AminoConverters } from "@cosmjs/stargate";
import { MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

export function accessTypeFromString(str: string): AccessType {
  switch (str) {
    case "Unspecified":
      return AccessType.ACCESS_TYPE_UNSPECIFIED;
    case "Nobody":
      return AccessType.ACCESS_TYPE_NOBODY;
    case "OnlyAddress":
      return AccessType.ACCESS_TYPE_ONLY_ADDRESS;
    case "Everybody":
      return AccessType.ACCESS_TYPE_EVERYBODY;
    default:
      return AccessType.UNRECOGNIZED;
  }
}

export function accessTypeToString(object: any): string {
  switch (object) {
    case AccessType.ACCESS_TYPE_UNSPECIFIED:
      return "Unspecified";
    case AccessType.ACCESS_TYPE_NOBODY:
      return "Nobody";
    case AccessType.ACCESS_TYPE_ONLY_ADDRESS:
      return "OnlyAddress";
    case AccessType.ACCESS_TYPE_EVERYBODY:
      return "Everybody";
    case AccessType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * @see https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/types.proto#L36-L41
 */
export interface AccessConfig {
  /**
   * Permission should be one kind of string 'Nobody', 'OnlyAddress', 'Everybody', 'Unspecified'
   * @see https://github.com/CosmWasm/wasmd/blob/v0.28.0/x/wasm/types/params.go#L54
   */
  readonly permission: string;
  readonly address?: string;
}

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

export function createWasmAminoConverters(): AminoConverters {
  return {
    ...createAminoConverters(),
    "/cosmwasm.wasm.v1.MsgStoreCode": {
      aminoType: "wasm/MsgStoreCode",
      toAmino: ({
        sender,
        wasmByteCode,
        instantiatePermission,
      }: MsgStoreCode): AminoMsgStoreCode["value"] => ({
        sender: sender,
        wasm_byte_code: toBase64(wasmByteCode),
        instantiate_permission: instantiatePermission
          ? {
              permission: accessTypeToString(instantiatePermission.permission),
              address: instantiatePermission.address || undefined,
            }
          : undefined,
      }),
      fromAmino: ({
        sender,
        wasm_byte_code,
        instantiate_permission,
      }: AminoMsgStoreCode["value"]): MsgStoreCode => ({
        sender: sender,
        wasmByteCode: fromBase64(wasm_byte_code),
        instantiatePermission: instantiate_permission
          ? {
              permission: accessTypeFromString(instantiate_permission.permission),
              address: instantiate_permission.address ?? "",
            }
          : undefined,
      }),
    },
  };
}

/** @deprecated use `createWasmAminoConverters()` */
export const cosmWasmTypes: AminoConverters = createWasmAminoConverters();
