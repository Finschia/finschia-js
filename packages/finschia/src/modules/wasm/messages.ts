import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgClearAdmin,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgMigrateContract,
  MsgStoreCode,
  MsgUpdateAdmin,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgStoreCodeAndInstantiateContract } from "lbmjs-types/lbm/wasm/v1/tx";

export const wasmTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmwasm.wasm.v1.MsgClearAdmin", MsgClearAdmin],
  ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract],
  ["/cosmwasm.wasm.v1.MsgMigrateContract", MsgMigrateContract],
  ["/cosmwasm.wasm.v1.MsgStoreCode", MsgStoreCode],
  ["/cosmwasm.wasm.v1.MsgInstantiateContract", MsgInstantiateContract],
  ["/cosmwasm.wasm.v1.MsgUpdateAdmin", MsgUpdateAdmin],
  ["/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract", MsgStoreCodeAndInstantiateContract],
];

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
