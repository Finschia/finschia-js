import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing";
import {
  MsgClearAdmin,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgMigrateContract,
  MsgStoreCode,
  MsgStoreCodeAndInstantiateContract,
  MsgUpdateAdmin,
} from "lbmjs-types/lbm/wasm/v1/tx";

export const wasmTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.wasm.v1.MsgClearAdmin", MsgClearAdmin],
  ["/lbm.wasm.v1.MsgExecuteContract", MsgExecuteContract],
  ["/lbm.wasm.v1.MsgMigrateContract", MsgMigrateContract],
  ["/lbm.wasm.v1.MsgStoreCode", MsgStoreCode],
  ["/lbm.wasm.v1.MsgInstantiateContract", MsgInstantiateContract],
  ["/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract", MsgStoreCodeAndInstantiateContract],
  ["/lbm.wasm.v1.MsgUpdateAdmin", MsgUpdateAdmin],
];

export interface MsgStoreCodeEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgStoreCode";
  readonly value: Partial<MsgStoreCode>;
}

export function isMsgStoreCodeEncodeObject(object: EncodeObject): object is MsgStoreCodeEncodeObject {
  return (object as MsgStoreCodeEncodeObject).typeUrl === "/lbm.wasm.v1.MsgStoreCode";
}

export interface MsgInstantiateContractEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgInstantiateContract";
  readonly value: Partial<MsgInstantiateContract>;
}

export function isMsgInstantiateContractEncodeObject(
  object: EncodeObject,
): object is MsgInstantiateContractEncodeObject {
  return (object as MsgInstantiateContractEncodeObject).typeUrl === "/lbm.wasm.v1.MsgInstantiateContract";
}

export interface MsgStoreCodeAndInstantiateContractEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract";
  readonly value: Partial<MsgStoreCodeAndInstantiateContract>;
}

export function isMsgStoreCodeAndInstantiateContract(
  object: EncodeObject,
): object is MsgStoreCodeAndInstantiateContractEncodeObject {
  return (
    (object as MsgStoreCodeAndInstantiateContractEncodeObject).typeUrl ===
    "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract"
  );
}

export interface MsgUpdateAdminEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgUpdateAdmin";
  readonly value: Partial<MsgUpdateAdmin>;
}

export function isMsgUpdateAdminEncodeObject(object: EncodeObject): object is MsgUpdateAdminEncodeObject {
  return (object as MsgUpdateAdminEncodeObject).typeUrl === "/lbm.wasm.v1.MsgUpdateAdmin";
}

export interface MsgClearAdminEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgClearAdmin";
  readonly value: Partial<MsgClearAdmin>;
}

export function isMsgClearAdminEncodeObject(object: EncodeObject): object is MsgClearAdminEncodeObject {
  return (object as MsgClearAdminEncodeObject).typeUrl === "/lbm.wasm.v1.MsgClearAdmin";
}

export interface MsgMigrateContractEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgMigrateContract";
  readonly value: Partial<MsgMigrateContract>;
}

export function isMsgMigrateEncodeObject(object: EncodeObject): object is MsgMigrateContractEncodeObject {
  return (object as MsgMigrateContractEncodeObject).typeUrl === "/lbm.wasm.v1.MsgMigrateContract";
}

export interface MsgExecuteContractEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.wasm.v1.MsgExecuteContract";
  readonly value: Partial<MsgExecuteContract>;
}

export function isMsgExecuteEncodeObject(object: EncodeObject): object is MsgExecuteContractEncodeObject {
  return (object as MsgExecuteContractEncodeObject).typeUrl === "/lbm.wasm.v1.MsgExecuteContract";
}
