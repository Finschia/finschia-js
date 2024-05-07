import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgAddVoteForRole,
  MsgSetBridgeStatus,
  MsgSuggestRole,
  MsgTransfer,
} from "@finschia/finschia-proto/lbm/fbridge/v1/tx";

export const fbridgeTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.fbridge.v1.MsgTransfer", MsgTransfer],
  ["/lbm.fbridge.v1.MsgSuggestRole", MsgSuggestRole],
  ["/lbm.fbridge.v1.MsgAddVoteForRole", MsgAddVoteForRole],
  ["/lbm.fbridge.v1.MsgSetBridgeStatus", MsgSetBridgeStatus],
];

export interface MsgTransferEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fbridge.v1.MsgTransfer";
  readonly value: Partial<MsgTransfer>;
}

export function isMsgTransferEncodeObject(object: EncodeObject): object is MsgTransferEncodeObject {
  return (object as MsgTransferEncodeObject).typeUrl === "/lbm.fbridge.v1.MsgTransfer";
}
export interface MsgSuggestRoleEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fbridge.v1.MsgSuggestRole";
  readonly value: Partial<MsgSuggestRole>;
}

export function isMsgSuggestRoleEncodeObject(object: EncodeObject): object is MsgSuggestRoleEncodeObject {
  return (object as MsgSuggestRoleEncodeObject).typeUrl === "/lbm.fbridge.v1.MsgSuggestRole";
}

export interface MsgAddVoteForRoleEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fbirdge.v1.MsgAddVoteForRole";
  readonly value: Partial<MsgAddVoteForRole>;
}

export function isMsgAddVoteForRoleEncodeObject(
  object: EncodeObject,
): object is MsgAddVoteForRoleEncodeObject {
  return (object as MsgAddVoteForRoleEncodeObject).typeUrl === "/lbm.fbirdge.v1.MsgAddVoteForRole";
}

export interface MsgSetBridgeStatusEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.fbridge.v1.MsgSetBridgeStatus";
  readonly value: Partial<MsgSetBridgeStatus>;
}

export function isMsgSetBridgeStatusEncodeObject(
  object: EncodeObject,
): object is MsgSetBridgeStatusEncodeObject {
  return (object as MsgSetBridgeStatusEncodeObject).typeUrl === "/lbm.fbridge.v1.MsgSetBridgeStatus";
}

export function createFbridgeTransfer(
  sender: string,
  receiver: string,
  amount: number | string,
): MsgTransferEncodeObject {
  return {
    typeUrl: "/lbm.fbridge.v1.MsgTransfer",
    value: {
      sender: sender,
      receiver: receiver,
      amount: amount.toString(),
    },
  };
}
