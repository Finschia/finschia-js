import { AminoConverters } from "../../aminotypes";

export function createAuthzAminoConverters(): AminoConverters {
  return {
    "/lbm.authz.v1.MsgGrant": "not_supported_by_chain",
    "/lbm.authz.v1.MsgExec": "not_supported_by_chain",
    "/lbm.authz.v1.MsgRevoke": "not_supported_by_chain",
  };
}
