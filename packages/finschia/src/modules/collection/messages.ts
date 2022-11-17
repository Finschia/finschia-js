import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import {
  MsgApprove,
  MsgAttach,
  MsgAttachFrom,
  MsgBurnFT,
  MsgBurnFTFrom,
  MsgBurnNFT,
  MsgBurnNFTFrom,
  MsgCreateContract,
  MsgDetach,
  MsgDetachFrom,
  MsgDisapprove,
  MsgGrantPermission,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintFT,
  MsgMintNFT,
  MsgModify,
  MsgRevokePermission,
  MsgTransferFT,
  MsgTransferFTFrom,
  MsgTransferNFT,
  MsgTransferNFTFrom,
} from "lbmjs-types/lbm/collection/v1/tx";

export const collectionTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.collection.v1.MsgTransferFT", MsgTransferFT],
  ["/lbm.collection.v1.MsgTransferFTFrom", MsgTransferFTFrom],
  ["/lbm.collection.v1.MsgTransferNFT", MsgTransferNFT],
  ["/lbm.collection.v1.MsgTransferNFTFrom", MsgTransferNFTFrom],
  ["/lbm.collection.v1.MsgApprove", MsgApprove],
  ["/lbm.collection.v1.MsgDisapprove", MsgDisapprove],
  ["/lbm.collection.v1.MsgCreateContract", MsgCreateContract],
  ["/lbm.collection.v1.MsgIssueFT", MsgIssueFT],
  ["/lbm.collection.v1.MsgIssueNFT", MsgIssueNFT],
  ["/lbm.collection.v1.MsgMintFT", MsgMintFT],
  ["/lbm.collection.v1.MsgMintNFT", MsgMintNFT],
  ["/lbm.collection.v1.MsgBurnFT", MsgBurnFT],
  ["/lbm.collection.v1.MsgBurnFTFrom", MsgBurnFTFrom],
  ["/lbm.collection.v1.MsgBurnNFT", MsgBurnNFT],
  ["/lbm.collection.v1.MsgBurnNFTFrom", MsgBurnNFTFrom],
  ["/lbm.collection.v1.MsgModify", MsgModify],
  ["/lbm.collection.v1.MsgGrantPermission", MsgGrantPermission],
  ["/lbm.collection.v1.MsgRevokePermission", MsgRevokePermission],
  ["/lbm.collection.v1.MsgAttach", MsgAttach],
  ["/lbm.collection.v1.MsgDetach", MsgDetach],
  ["/lbm.collection.v1.MsgAttachFrom", MsgAttachFrom],
  ["/lbm.collection.v1.MsgDetachFrom", MsgDetachFrom],
];

export interface MsgTransferFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgTransferFT";
  readonly value: Partial<MsgTransferFT>;
}

export function isMsgTransferFTEncodeObject(object: EncodeObject): object is MsgTransferFTEncodeObject {
  return (object as MsgTransferFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgTransferFT";
}

export interface MsgTransferFTFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgTransferFTFrom";
  readonly value: Partial<MsgTransferFTFrom>;
}

export function isMsgTransferFTFromEncodeObject(
  object: EncodeObject,
): object is MsgTransferFTFromEncodeObject {
  return (object as MsgTransferFTFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgTransferFTFrom";
}

export interface MsgTransferNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgTransferNFT";
  readonly value: Partial<MsgTransferNFT>;
}

export function isMsgTransferNFTEncodeObject(object: EncodeObject): object is MsgTransferNFTEncodeObject {
  return (object as MsgTransferNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgTransferNFT";
}

export interface MsgTransferNFTFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgTransferNFTFrom";
  readonly value: Partial<MsgTransferNFTFrom>;
}

export function isMsgTransferNFTFromEncodeObject(
  object: EncodeObject,
): object is MsgTransferNFTFromEncodeObject {
  return (object as MsgTransferNFTFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgTransferNFTFrom";
}

export interface MsgApproveEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgApprove";
  readonly value: Partial<MsgApprove>;
}

export function isMsgApproveEncodeObject(object: EncodeObject): object is MsgApproveEncodeObject {
  return (object as MsgApproveEncodeObject).typeUrl === "/lbm.collection.v1.MsgApprove";
}

export interface MsgDisapproveEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgDisapprove";
  readonly value: Partial<MsgDisapprove>;
}

export function isMsgDisapproveEncodeObject(object: EncodeObject): object is MsgDisapproveEncodeObject {
  return (object as MsgDisapproveEncodeObject).typeUrl === "/lbm.collection.v1.MsgDisapprove";
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

export interface MsgBurnFTFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgBurnFTFrom";
  readonly value: Partial<MsgBurnFTFrom>;
}

export function isMsgBurnFTFromEncodeObject(object: EncodeObject): object is MsgBurnFTFromEncodeObject {
  return (object as MsgBurnFTFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgBurnFTFrom";
}

export interface MsgBurnNFTEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgBurnNFT";
  readonly value: Partial<MsgBurnNFT>;
}

export function isMsgBurnNFTEncodeObject(object: EncodeObject): object is MsgBurnNFTEncodeObject {
  return (object as MsgBurnNFTEncodeObject).typeUrl === "/lbm.collection.v1.MsgBurnNFT";
}

export interface MsgBurnNFTFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgBurnNFTFrom";
  readonly value: Partial<MsgBurnNFTFrom>;
}

export function isMsgBurnNFTFromEncodeObject(object: EncodeObject): object is MsgBurnNFTFromEncodeObject {
  return (object as MsgBurnNFTFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgBurnNFTFrom";
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

export interface MsgAttachFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgAttachFrom";
  readonly value: Partial<MsgAttachFrom>;
}

export function isMsgAttachFromEncodeObject(object: EncodeObject): object is MsgAttachFromEncodeObject {
  return (object as MsgAttachFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgAttachFrom";
}

export interface MsgDetachFromEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.collection.v1.MsgDetachFrom";
  readonly value: Partial<MsgDetachFrom>;
}

export function isMsgDetachFromEncodeObject(object: EncodeObject): object is MsgDetachFromEncodeObject {
  return (object as MsgDetachFromEncodeObject).typeUrl === "/lbm.collection.v1.MsgDetachFrom";
}
