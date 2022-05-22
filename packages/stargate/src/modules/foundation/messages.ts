import { GeneratedType } from "@lbmjs/proto-signing/build";
import {
  MsgExec,
  MsgFundTreasury,
  MsgGrant,
  MsgLeaveFoundation,
  MsgRevoke,
  MsgSubmitProposal,
  MsgUpdateDecisionPolicy,
  MsgUpdateMembers,
  MsgVote,
  MsgWithdrawFromTreasury,
  MsgWithdrawProposal,
} from "lbmjs-types/lbm/foundation/v1/tx";

export const foundationTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.foundation.v1.MsgFundTreasury", MsgFundTreasury],
  ["/lbm.foundation.v1.MsgWithdrawFromTreasury", MsgWithdrawFromTreasury],
  ["/lbm.foundation.v1.MsgUpdateMembers", MsgUpdateMembers],
  ["/lbm.foundation.v1.MsgUpdateDecisionPolicy", MsgUpdateDecisionPolicy],
  ["/lbm.foundation.v1.MsgSubmitProposal", MsgSubmitProposal],
  ["/lbm.foundation.v1.MsgWithdrawProposal", MsgWithdrawProposal],
  ["/lbm.foundation.v1.MsgVote", MsgVote],
  ["/lbm.foundation.v1.MsgExec", MsgExec],
  ["/lbm.foundation.v1.MsgLeaveFoundation", MsgLeaveFoundation],
  ["/lbm.foundation.v1.MsgGrant", MsgGrant],
  ["/lbm.foundation.v1.MsgRevoke", MsgRevoke],
];
