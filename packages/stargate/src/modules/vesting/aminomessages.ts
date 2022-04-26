import { AminoConverters } from "../../aminotypes";

export function createVestingAminoConverters(): AminoConverters {
  return {
    "/lbm.vesting.v1.MsgCreateVestingAccount": "not_supported_by_chain",
  };
}
