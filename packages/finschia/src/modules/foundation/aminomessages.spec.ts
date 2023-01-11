import { AminoTypes, coins } from "@cosmjs/stargate";
import { MsgFundTreasury, MsgUpdateParams } from "lbmjs-types/lbm/foundation/v1/tx";
import { faucet } from "src/testutils.spec";

import { AminoMsgFundTreasury, AminoMsgUpdateParams, createFoundationAminoConverters } from "./aminomessages";

describe("AminoTypes", () => {
  describe("to Amino", () => {
    it("MsgUpdateParams", () => {
      const msg: MsgUpdateParams = {
        authority: faucet.address0,
        params: {
          foundationTax: "0",
          censoredMsgTypeUrls: ["/lbm.foundation.v1.MsgWithdrawFromTreasury"],
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgUpdateParams",
        value: msg,
      });
      const expected: AminoMsgUpdateParams = {
        type: "lbm-sdk/MsgUpdateParams",
        value: {
          authority: faucet.address0,
          params: {
            foundationTax: "0",
            censoredMsgTypeUrls: ["/lbm.foundation.v1.MsgWithdrawFromTreasury"],
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgFundTreasury", () => {
      const msg: MsgFundTreasury = {
        from: faucet.address0,
        amount: coins(1234, "cony"),
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgFundTreasury",
        value: msg,
      });
      const expected: AminoMsgFundTreasury = {
        type: "lbm-sdk/MsgFundTreasury",
        value: {
          from: faucet.address0,
          amount: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });
});
