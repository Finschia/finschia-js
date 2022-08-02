import { GeneratedType } from "@cosmjs/proto-signing";
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
