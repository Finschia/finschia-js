import { AminoConverters } from "../../aminotypes";

export function createFreegrantAminoConverters(): AminoConverters {
  return {
    "/lbm.feegrant.v1.MsgGrantAllowance": "not_supported_by_chain",
    "/lbm.feegrant.v1.MsgRevokeAllowance": "not_supported_by_chain",
  };
}
