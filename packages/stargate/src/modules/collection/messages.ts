import { GeneratedType } from "@cosmjs/proto-signing";
import {
  // MsgAbandon,
  MsgApprove,
  MsgAttach,
  MsgAttachFrom,
  // MsgAuthorizeOperator,
  // MsgBurn,
  MsgBurnFT,
  MsgBurnFTFrom,
  MsgBurnNFT,
  MsgBurnNFTFrom,
  MsgCreateContract,
  // MsgCreateFTClass,
  // MsgCreateNFTClass,
  MsgDetach,
  MsgDetachFrom,
  MsgDisapprove,
  // MsgGrant,
  MsgGrantPermission,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintFT,
  MsgMintNFT,
  MsgModify,
  // MsgModifyContract,
  // MsgModifyNFT,
  // MsgModifyTokenClass,
  // MsgOperatorAttach,
  // MsgOperatorBurn,
  // MsgOperatorDetach,
  // MsgOperatorSend,
  // MsgRevokeOperator,
  MsgRevokePermission,
  // MsgSend,
  MsgTransferFT,
  MsgTransferFTFrom,
  MsgTransferNFT,
  MsgTransferNFTFrom,
} from "lbmjs-types/lbm/collection/v1/tx";

export const collectionTypes: ReadonlyArray<[string, GeneratedType]> = [
  // ["/lbm.collection.v1.MsgSend", MsgSend], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgOperatorSend", MsgOperatorSend], // Since: 0.46.0
  ["/lbm.collection.v1.MsgTransferFT", MsgTransferFT], // Deprecated: use Send
  ["/lbm.collection.v1.MsgTransferFTFrom", MsgTransferFTFrom], // Deprecated: use OperatorSend
  ["/lbm.collection.v1.MsgTransferNFT", MsgTransferNFT], // Deprecated: use Send
  ["/lbm.collection.v1.MsgTransferNFTFrom", MsgTransferNFTFrom], // Deprecated: use OperatorSend
  // ["/lbm.collection.v1.MsgAuthorizeOperator", MsgAuthorizeOperator], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgRevokeOperator", MsgRevokeOperator], // Since: 0.46.0
  ["/lbm.collection.v1.MsgApprove", MsgApprove], // Deprecated: use AuthorizeOperator
  ["/lbm.collection.v1.MsgDisapprove", MsgDisapprove], // Deprecated: use RevokeOperator
  ["/lbm.collection.v1.MsgCreateContract", MsgCreateContract],
  // ["/lbm.collection.v1.MsgCreateFTClass", MsgCreateFTClass], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgCreateNFTClass", MsgCreateNFTClass], // Since: 0.46.0
  ["/lbm.collection.v1.MsgIssueFT", MsgIssueFT], // Deprecated: use CreateFTClass
  ["/lbm.collection.v1.MsgIssueNFT", MsgIssueNFT], // Deprecated: use CreateNFTClass
  ["/lbm.collection.v1.MsgMintFT", MsgMintFT],
  ["/lbm.collection.v1.MsgMintNFT", MsgMintNFT],
  // ["/lbm.collection.v1.MsgBurn", MsgBurn], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgOperatorBurn", MsgOperatorBurn], // Since: 0.46.0
  ["/lbm.collection.v1.MsgBurnFT", MsgBurnFT], // Deprecated: use Burn
  ["/lbm.collection.v1.MsgBurnFTFrom", MsgBurnFTFrom], // Deprecated: use OperatorBurn
  ["/lbm.collection.v1.MsgBurnNFT", MsgBurnNFT], // Deprecated: use Burn
  ["/lbm.collection.v1.MsgBurnNFTFrom", MsgBurnNFTFrom], // Deprecated: use OperatorBurn
  // ["/lbm.collection.v1.MsgModifyContract", MsgModifyContract], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgModifyTokenClass", MsgModifyTokenClass], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgModifyNFT", MsgModifyNFT], // Since: 0.46.0
  ["/lbm.collection.v1.MsgModify", MsgModify], // Deprecated: use ModifyContract, ModifyTokenClass or ModifyNFT
  // ["/lbm.collection.v1.MsgGrant", MsgGrant], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgAbandon", MsgAbandon], // Since: 0.46.0
  ["/lbm.collection.v1.MsgGrantPermission", MsgGrantPermission], // Deprecated: use Grant
  ["/lbm.collection.v1.MsgRevokePermission", MsgRevokePermission], // Deprecated: use Abandon
  ["/lbm.collection.v1.MsgAttach", MsgAttach],
  ["/lbm.collection.v1.MsgDetach", MsgDetach],
  // ["/lbm.collection.v1.MsgOperatorAttach", MsgOperatorAttach], // Since: 0.46.0
  // ["/lbm.collection.v1.MsgOperatorDetach", MsgOperatorDetach], // Since: 0.46.0
  ["/lbm.collection.v1.MsgAttachFrom", MsgAttachFrom], // Deprecated: use OperatorAttach
  ["/lbm.collection.v1.MsgDetachFrom", MsgDetachFrom], // Deprecated: use OperatorDetach
];
