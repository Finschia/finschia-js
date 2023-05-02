import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgAuthorizeOperator,
  MsgBurn,
  MsgGrantPermission,
  MsgIssue,
  MsgMint,
  MsgModify,
  MsgOperatorBurn,
  MsgOperatorSend,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSend,
} from "@finschia/finschia-proto/lbm/token/v1/tx";

export const tokenTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.token.v1.MsgSend", MsgSend],
  ["/lbm.token.v1.MsgOperatorSend", MsgOperatorSend],
  ["/lbm.token.v1.MsgRevokeOperator", MsgRevokeOperator],
  ["/lbm.token.v1.MsgAuthorizeOperator", MsgAuthorizeOperator],
  ["/lbm.token.v1.MsgIssue", MsgIssue],
  ["/lbm.token.v1.MsgGrantPermission", MsgGrantPermission],
  ["/lbm.token.v1.MsgRevokePermission", MsgRevokePermission],
  ["/lbm.token.v1.MsgMint", MsgMint],
  ["/lbm.token.v1.MsgBurn", MsgBurn],
  ["/lbm.token.v1.MsgOperatorBurn", MsgOperatorBurn],
  ["/lbm.token.v1.MsgModify", MsgModify],
];

export interface MsgSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgSend";
  readonly value: Partial<MsgSend>;
}

export function isMsgSendEncodeObject(object: EncodeObject): object is MsgSendEncodeObject {
  return (object as MsgSendEncodeObject).typeUrl === "/lbm.token.v1.MsgSend";
}

export interface MsgOperatorSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgOperatorSend";
  readonly value: Partial<MsgOperatorSend>;
}

export function isMsgOperatorSendEncodeObject(object: EncodeObject): object is MsgOperatorSendEncodeObject {
  return (object as MsgOperatorSendEncodeObject).typeUrl === "/lbm.token.v1.MsgOperatorSend";
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

export interface MsgAuthorizeOperatorEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgAuthorizeOperator";
  readonly value: Partial<MsgAuthorizeOperator>;
}

export function isMsgAuthorizeOperatorEncodeObject(
  object: EncodeObject,
): object is MsgAuthorizeOperatorEncodeObject {
  return (object as MsgAuthorizeOperatorEncodeObject).typeUrl === "/lbm.token.v1.MsgAuthorizeOperator";
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
  readonly value: Partial<MsgMint>;
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

export interface MsgOperatorBurnEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgOperatorBurn";
  readonly value: Partial<MsgOperatorBurn>;
}

export function isMsgOperatorBurnEncodeObject(object: EncodeObject): object is MsgOperatorBurnEncodeObject {
  return (object as MsgOperatorBurnEncodeObject).typeUrl === "/lbm.token.v1.MsgOperatorBurn";
}

export interface MsgModifyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.token.v1.MsgModify";
  readonly value: Partial<MsgModify>;
}

export function isMsgModifyEncodeObject(object: EncodeObject): object is MsgModifyEncodeObject {
  return (object as MsgModifyEncodeObject).typeUrl === "/lbm.token.v1.MsgModify";
}
