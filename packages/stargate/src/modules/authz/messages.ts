import { GeneratedType } from "@lbmjs/proto-signing";
import { MsgExec, MsgGrant, MsgRevoke } from "lbmjs-types/lbm/authz/v1/tx";

export const authzTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.authz.v1.MsgExec", MsgExec],
  ["/lbm.authz.v1.MsgGrant", MsgGrant],
  ["/lbm.authz.v1.MsgRevoke", MsgRevoke],
];
