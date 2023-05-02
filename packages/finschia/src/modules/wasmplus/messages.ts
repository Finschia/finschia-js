import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { MsgStoreCodeAndInstantiateContract } from "@finschia/finschia-proto/lbm/wasm/v1/tx";

export const wasmplusTypes: ReadonlyArray<[string, GeneratedType]> = [
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
