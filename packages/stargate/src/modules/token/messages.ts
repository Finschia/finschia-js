import { GeneratedType } from "@lbmjs/proto-signing/build";
import {
  MsgApprove,
  MsgBurn,
  MsgBurnFrom,
  MsgGrant,
  MsgIssue,
  MsgMint,
  MsgModify,
  MsgRevoke,
  MsgTransfer,
  MsgTransferFrom,
} from "lbmjs-types/lbm/token/v1/tx";

export const tokenTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.token.v1.MsgTransfer", MsgTransfer],
  ["/lbm.token.v1.MsgTransferFrom", MsgTransferFrom],
  ["/lbm.token.v1.MsgApprove", MsgApprove],
  ["/lbm.token.v1.MsgIssue", MsgIssue],
  ["/lbm.token.v1.MsgGrant", MsgGrant],
  ["/lbm.token.v1.MsgRevoke", MsgRevoke],
  ["/lbm.token.v1.MsgMint", MsgMint],
  ["/lbm.token.v1.MsgBurn", MsgBurn],
  ["/lbm.token.v1.MsgBurnFrom", MsgBurnFrom],
  ["/lbm.token.v1.MsgModify", MsgModify],
];
