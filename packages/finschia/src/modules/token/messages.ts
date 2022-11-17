import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgApprove,
  MsgBurn,
  MsgBurnFrom,
  MsgGrantPermission,
  MsgIssue,
  MsgMint,
  MsgModify,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSend,
  MsgTransferFrom,
} from "lbmjs-types/lbm/token/v1/tx";

export const tokenTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.token.v1.MsgSend", MsgSend],
  ["/lbm.token.v1.MsgTransferFrom", MsgTransferFrom],
  ["/lbm.token.v1.MsgRevokeOperator", MsgRevokeOperator],
  ["/lbm.token.v1.MsgApprove", MsgApprove],
  ["/lbm.token.v1.MsgIssue", MsgIssue],
  ["/lbm.token.v1.MsgGrantPermission", MsgGrantPermission],
  ["/lbm.token.v1.MsgRevokePermission", MsgRevokePermission],
  ["/lbm.token.v1.MsgMint", MsgMint],
  ["/lbm.token.v1.MsgBurn", MsgBurn],
  ["/lbm.token.v1.MsgBurnFrom", MsgBurnFrom],
  ["/lbm.token.v1.MsgModify", MsgModify],
];

export interface MsgSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgSend";
  readonly value: Partial<MsgSend>;
}

export function isMsgSendEncodeObject(object: EncodeObject): object is MsgSendEncodeObject {
  return (object as MsgSendEncodeObject).typeUrl === "/lbm.token.v1.MsgSend";
}

export interface MsgTransferFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgTransferFrom";
  readonly value: Partial<MsgTransferFrom>;
}

export function isMsgTransferFromEncodeObject(object: EncodeObject): object is MsgTransferFromEncodeObject {
  return (object as MsgTransferFromEncodeObject).typeUrl === "/lbm.token.v1.MsgTransferFrom";
}

export interface MsgRevokeOperatorEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgRevokeOperator";
  readonly value: Partial<MsgRevokeOperator>;
}

export function isMsgRevokeOperatorEncodeObject(
  object: EncodeObject,
): object is MsgRevokeOperatorEncodeObject {
  return (object as MsgRevokeOperatorEncodeObject).typeUrl === "/lbm.token.v1.MsgRevokeOperator";
}

export interface MsgApproveEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgApprove";
  readonly value: Partial<MsgApprove>;
}

export function isMsgApproveEncodeObject(object: EncodeObject): object is MsgApproveEncodeObject {
  return (object as MsgApproveEncodeObject).typeUrl === "/lbm.token.v1.MsgApprove";
}

export interface MsgIssueEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgIssue";
  readonly value: Partial<MsgIssue>;
}

export function isMsgIssueEncodeObject(object: EncodeObject): object is MsgIssueEncodeObject {
  return (object as MsgIssueEncodeObject).typeUrl === "/lbm.token.v1.MsgIssue";
}

export interface MsgGrantPermissionEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgGrantPermission";
  readonly value: Partial<MsgGrantPermission>;
}

export function isMsgGrantPermissionEncodeObject(
  object: EncodeObject,
): object is MsgGrantPermissionEncodeObject {
  return (object as MsgGrantPermissionEncodeObject).typeUrl === "/lbm.token.v1.MsgGrantPermission";
}

export interface MsgRevokePermissionEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgRevokePermission";
  readonly value: Partial<MsgRevokePermission>;
}

export function isMsgRevokePermissionEncodeObject(
  object: EncodeObject,
): object is MsgRevokePermissionEncodeObject {
  return (object as MsgRevokePermissionEncodeObject).typeUrl === "/lbm.token.v1.MsgRevokePermission";
}

export interface MsgMintEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgMint";
  readonly value: Partial<MsgRevokePermission>;
}

export function isMsgMintEncodeObject(object: EncodeObject): object is MsgMintEncodeObject {
  return (object as MsgMintEncodeObject).typeUrl === "/lbm.token.v1.MsgMint";
}

export interface MsgBurnEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgBurn";
  readonly value: Partial<MsgBurn>;
}

export function isMsgBurnEncodeObject(object: EncodeObject): object is MsgBurnEncodeObject {
  return (object as MsgBurnEncodeObject).typeUrl === "/lbm.token.v1.MsgBurn";
}

export interface MsgBurnFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgBurnFrom";
  readonly value: Partial<MsgBurnFrom>;
}

export function isMsgBurnFromEncodeObject(object: EncodeObject): object is MsgBurnFromEncodeObject {
  return (object as MsgBurnFromEncodeObject).typeUrl === "/lbm.token.v1.MsgBurnFrom";
}

export interface MsgModifyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgModify";
  readonly value: Partial<MsgModify>;
}

export function isMsgModifyEncodeObject(object: EncodeObject): object is MsgModifyEncodeObject {
  return (object as MsgModifyEncodeObject).typeUrl === "/lbm.token.v1.MsgModify";
}
