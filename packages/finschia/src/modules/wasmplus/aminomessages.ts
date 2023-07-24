/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg } from "@cosmjs/amino";
import { fromBase64, fromUtf8, toBase64, toUtf8 } from "@cosmjs/encoding";
import { AminoConverters } from "@cosmjs/stargate";
import { MsgStoreCodeAndInstantiateContract } from "@finschia/finschia-proto/lbm/wasm/v1/tx";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

// This is already in cosmjs, but it's not exported properly so I can't use it, so I'm redefining it.
// You can delete this after this issue (https://github.com/cosmos/cosmjs/issues/1455) is resolved.
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
    case "AnyOfAddresses":
      return AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES;
    default:
      return AccessType.UNRECOGNIZED;
  }
}

// This is already in cosmjs, but it's not exported properly so I can't use it, so I'm redefining it.
// You can delete this after this issue (https://github.com/cosmos/cosmjs/issues/1455) is resolved.
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
    case AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES:
      return "AnyOfAddresses";
    case AccessType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

// This is already in cosmjs, but it's not exported properly so I can't use it, so I'm redefining it.
// You can delete this after this issue (https://github.com/cosmos/cosmjs/issues/1455) is resolved.
/**
 * @see https://github.com/CosmWasm/wasmd/blob/v0.18.0-rc1/proto/cosmwasm/wasm/v1/types.proto#L36-L41
 */
export interface AccessConfig {
  /**
   * Permission should be one kind of string 'Nobody', 'OnlyAddress', 'Everybody', 'AnyOfAddresses', 'Unspecified'
   * @see https://github.com/CosmWasm/wasmd/blob/v0.31.0/x/wasm/types/params.go#L54
   */
  readonly permission: string;
  /**
   * Address
   * Deprecated: replaced by addresses
   */
  readonly address?: string;
  readonly addresses?: string[];
}

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
