/* eslint-disable @typescript-eslint/naming-convention */
import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgAttach,
  MsgAuthorizeOperator,
  MsgBurnFT,
  MsgBurnNFT,
  MsgCreateContract,
  MsgDetach,
  MsgGrantPermission,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintFT,
  MsgMintNFT,
  MsgModify,
  MsgOperatorAttach,
  MsgOperatorBurnFT,
  MsgOperatorBurnNFT,
  MsgOperatorDetach,
  MsgOperatorSendFT,
  MsgOperatorSendNFT,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSendFT,
  MsgSendNFT,
} from "@finschia/finschia-proto/lbm/collection/v1/tx";

export const collectionTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.collection.v1.MsgSendFT", MsgSendFT],
  ["/lbm.collection.v1.MsgOperatorSendFT", MsgOperatorSendFT],
  ["/lbm.collection.v1.MsgSendNFT", MsgSendNFT],
  ["/lbm.collection.v1.MsgOperatorSendNFT", MsgOperatorSendNFT],
  ["/lbm.collection.v1.MsgAuthorizeOperator", MsgAuthorizeOperator],
  ["/lbm.collection.v1.MsgRevokeOperator", MsgRevokeOperator],
  ["/lbm.collection.v1.MsgCreateContract", MsgCreateContract],
  ["/lbm.collection.v1.MsgIssueFT", MsgIssueFT],
  ["/lbm.collection.v1.MsgIssueNFT", MsgIssueNFT],
  ["/lbm.collection.v1.MsgMintFT", MsgMintFT],
  ["/lbm.collection.v1.MsgMintNFT", MsgMintNFT],
  ["/lbm.collection.v1.MsgBurnFT", MsgBurnFT],
  ["/lbm.collection.v1.MsgOperatorBurnFT", MsgOperatorBurnFT],
  ["/lbm.collection.v1.MsgBurnNFT", MsgBurnNFT],
  ["/lbm.collection.v1.MsgOperatorBurnNFT", MsgOperatorBurnNFT],
  ["/lbm.collection.v1.MsgModify", MsgModify],
  ["/lbm.collection.v1.MsgGrantPermission", MsgGrantPermission],
  ["/lbm.collection.v1.MsgRevokePermission", MsgRevokePermission],
  ["/lbm.collection.v1.MsgAttach", MsgAttach],
  ["/lbm.collection.v1.MsgDetach", MsgDetach],
  ["/lbm.collection.v1.MsgOperatorAttach", MsgOperatorAttach],
  ["/lbm.collection.v1.MsgOperatorDetach", MsgOperatorDetach],
];

export interface MsgSendFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgSendFT";
  readonly value: Partial<MsgSendFT>;
}

export function isMsgSendFTEncodeObject(object: EncodeObject): object is MsgSendFTEncodeObject {
  return (object as MsgSendFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgSendFT";
}

export interface MsgOperatorSendFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorSendFT";
  readonly value: Partial<MsgOperatorSendFT>;
}

export function isMsgOperatorSendFTEncodeObject(
  object: EncodeObject,
): object is MsgOperatorSendFTEncodeObject {
  return (object as MsgOperatorSendFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorSendFT";
}

export interface MsgSendNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgSendNFT";
  readonly value: Partial<MsgSendNFT>;
}

export function isMsgSendNFTEncodeObject(object: EncodeObject): object is MsgSendNFTEncodeObject {
  return (object as MsgSendNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgSendNFT";
}

export interface MsgOperatorSendNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorSendNFT";
  readonly value: Partial<MsgOperatorSendNFT>;
}

export function isMsgOperatorSendNFTEncodeObject(
  object: EncodeObject,
): object is MsgOperatorSendNFTEncodeObject {
  return (object as MsgOperatorSendNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorSendNFT";
}

export interface MsgAuthorizeOperatorEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgAuthorizeOperator";
  readonly value: Partial<MsgAuthorizeOperator>;
}

export function isMsgAuthorizeOperatorEncodeObject(
  object: EncodeObject,
): object is MsgAuthorizeOperatorEncodeObject {
  return (object as MsgAuthorizeOperatorEncodeObject).typeUrl === "/lbm.collection.v1.MsgAuthorizeOperator";
}

export interface MsgRevokeOperatorEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgRevokeOperator";
  readonly value: Partial<MsgRevokeOperator>;
}

export function isMsgRevokeOperatorEncodeObject(
  object: EncodeObject,
): object is MsgRevokeOperatorEncodeObject {
  return (object as MsgRevokeOperatorEncodeObject).typeUrl === "/lbm.collection.v1.MsgRevokeOperator";
}

export interface MsgCreateContractEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgCreateContract";
  readonly value: Partial<MsgCreateContract>;
}

export function isMsgCreateContractEncodeObject(
  object: EncodeObject,
): object is MsgCreateContractEncodeObject {
  return (object as MsgCreateContractEncodeObject).typeUrl === "/lbm.collection.v1.MsgCreateContract";
}

export interface MsgIssueFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgIssueFT";
  readonly value: Partial<MsgIssueFT>;
}

export function isMsgIssueFTEncodeObject(object: EncodeObject): object is MsgIssueFTEncodeObject {
  return (object as MsgIssueFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgIssueFT";
}

export interface MsgIssueNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgIssueNFT";
  readonly value: Partial<MsgIssueNFT>;
}

export function isMsgIssueNFTEncodeObject(object: EncodeObject): object is MsgIssueNFTEncodeObject {
  return (object as MsgIssueNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgIssueNFT";
}

export interface MsgMintFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgMintFT";
  readonly value: Partial<MsgMintFT>;
}

export function isMsgMintFTEncodeObject(object: EncodeObject): object is MsgMintFTEncodeObject {
  return (object as MsgMintFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgMintFT";
}

export interface MsgMintNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgMintNFT";
  readonly value: Partial<MsgMintNFT>;
}

export function isMsgMintNFTEncodeObject(object: EncodeObject): object is MsgMintNFTEncodeObject {
  return (object as MsgMintNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgMintNFT";
}

export interface MsgBurnFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgBurnFT";
  readonly value: Partial<MsgBurnFT>;
}

export function isMsgBurnFTEncodeObject(object: EncodeObject): object is MsgBurnFTEncodeObject {
  return (object as MsgBurnFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgBurnFT";
}

export interface MsgOperatorBurnFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorBurnFT";
  readonly value: Partial<MsgOperatorBurnFT>;
}

export function isMsgOperatorBurnFTEncodeObject(
  object: EncodeObject,
): object is MsgOperatorBurnFTEncodeObject {
  return (object as MsgOperatorBurnFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorBurnFT";
}

export interface MsgBurnNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgBurnNFT";
  readonly value: Partial<MsgBurnNFT>;
}

export function isMsgBurnNFTEncodeObject(object: EncodeObject): object is MsgBurnNFTEncodeObject {
  return (object as MsgBurnNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgBurnNFT";
}

export interface MsgOperatorBurnNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorBurnNFT";
  readonly value: Partial<MsgOperatorBurnNFT>;
}

export function isMsgOperatorBurnNFTEncodeObject(
  object: EncodeObject,
): object is MsgOperatorBurnNFTEncodeObject {
  return (object as MsgOperatorBurnNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorBurnNFT";
}

export interface MsgModifyEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgModify";
  readonly value: Partial<MsgModify>;
}

export function isMsgModifyEncodeObject(object: EncodeObject): object is MsgModifyEncodeObject {
  return (object as MsgModifyEncodeObject).typeUrl === "/lbm.collection.v1.MsgModify";
}

export interface MsgGrantPermissionEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgGrantPermission";
  readonly value: Partial<MsgGrantPermission>;
}

export function isMsgGrantPermissionEncodeObject(
  object: EncodeObject,
): object is MsgGrantPermissionEncodeObject {
  return (object as MsgGrantPermissionEncodeObject).typeUrl === "/lbm.collection.v1.MsgGrantPermission";
}

export interface MsgRevokePermissionEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgRevokePermission";
  readonly value: Partial<MsgRevokePermission>;
}

export function isMsgRevokePermissionEncodeObject(
  object: EncodeObject,
): object is MsgRevokePermissionEncodeObject {
  return (object as MsgRevokePermissionEncodeObject).typeUrl === "/lbm.collection.v1.MsgRevokePermission";
}

export interface MsgAttachEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgAttach";
  readonly value: Partial<MsgAttach>;
}

export function isMsgAttachEncodeObject(object: EncodeObject): object is MsgAttachEncodeObject {
  return (object as MsgAttachEncodeObject).typeUrl === "/lbm.collection.v1.MsgAttach";
}

export interface MsgDetachEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgDetach";
  readonly value: Partial<MsgDetach>;
}

export function isMsgDetachEncodeObject(object: EncodeObject): object is MsgDetachEncodeObject {
  return (object as MsgDetachEncodeObject).typeUrl === "/lbm.collection.v1.MsgDetach";
}

export interface MsgOperatorAttachEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorAttach";
  readonly value: Partial<MsgOperatorAttach>;
}

export function isMsgOperatorAttachEncodeObject(
  object: EncodeObject,
): object is MsgOperatorAttachEncodeObject {
  return (object as MsgOperatorAttachEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorAttach";
}

export interface MsgOperatorDetachEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgOperatorDetach";
  readonly value: Partial<MsgOperatorDetach>;
}

export function isMsgOperatorDetachEncodeObject(
  object: EncodeObject,
): object is MsgOperatorDetachEncodeObject {
  return (object as MsgOperatorDetachEncodeObject).typeUrl === "/lbm.collection.v1.MsgOperatorDetach";
}
