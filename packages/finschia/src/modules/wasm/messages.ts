import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgClearAdmin,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgInstantiateContract2,
  MsgMigrateContract,
  MsgStoreCode,
  MsgUpdateAdmin,
} from "lbmjs-types/cosmwasm/wasm/v1/tx";
import { Coin } from "lbmjs-types/cosmos/base/v1beta1/coin";

export const wasmTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmwasm.wasm.v1.MsgClearAdmin", MsgClearAdmin],
  ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract],
  ["/cosmwasm.wasm.v1.MsgMigrateContract", MsgMigrateContract],
  ["/cosmwasm.wasm.v1.MsgStoreCode", MsgStoreCode],
  ["/cosmwasm.wasm.v1.MsgInstantiateContract", MsgInstantiateContract],
  ["/cosmwasm.wasm.v1.MsgInstantiateContract2", MsgInstantiateContract2],
  ["/cosmwasm.wasm.v1.MsgUpdateAdmin", MsgUpdateAdmin],
];

export interface MsgInstantiateContract2EncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract2";
  readonly value: Partial<MsgInstantiateContract2>;
}

export function isMsgInstantiateContract2EncodeObject(
  object: EncodeObject,
): object is MsgInstantiateContract2EncodeObject {
  return (
    (object as MsgInstantiateContract2EncodeObject).typeUrl === "/cosmwasm.wasm.v1.MsgInstantiateContract2"
  );
}

/**
 * The options of an .instantiate() call.
 * All properties are optional.
 */
export interface Instantiate2Options {
  readonly memo?: string;
  /**
   * The funds that are transferred from the sender to the newly created contract.
   * The funds are transferred as part of the message execution after the contract address is
   * created and before the instantiation message is executed by the contract.
   *
   * Only native tokens are supported.
   */
  readonly funds?: readonly Coin[];
  /**
   * A bech32 encoded address of an admin account.
   * Caution: an admin has the privilege to upgrade a contract. If this is not desired, do not set this value.
   */
  readonly admin?: string;

  /**
   * salt is an arbitrary value provided by the sender. Size can be 1 to 64.
   */
  readonly salt?: Uint8Array;

  /**
   * FixMsg include the msg value into the hash for the predictable address.
   * Default is false
   */
  readonly fixMsg?: boolean;
}
