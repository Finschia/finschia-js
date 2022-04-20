import { GeneratedType } from "@lbmjs/proto-signing";
import { MsgGrantAllowance, MsgRevokeAllowance } from "lbmjs-types/lbm/feegrant/v1/tx";

export const feegrantTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.feegrant.v1.MsgGrantAllowance", MsgGrantAllowance],
  ["/lbm.feegrant.v1.MsgRevokeAllowance", MsgRevokeAllowance],
];
