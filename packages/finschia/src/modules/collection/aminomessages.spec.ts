import { AminoTypes } from "@cosmjs/stargate";
import { Coin } from "lbmjs-types/lbm/collection/v1/collection";
import { MsgTransferFT } from "lbmjs-types/lbm/collection/v1/tx";
import { faucet } from "src/testutils.spec";

import { AminoMsgTransferFT, createCollectionAminoConverters } from "./aminomessages";
import { ftCoins } from "./utils";

describe("AminoTypes", () => {
  describe("to Amino", () => {
    it("MsgTransferFT", () => {
      const tokenAmount: Coin[] = ftCoins("50000", "1");
      const msg: MsgTransferFT = {
        contractId: "1",
        from: faucet.address0,
        to: faucet.address1,
        amount: tokenAmount,
      };
      const aminoTypes = new AminoTypes(createCollectionAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.collection.v1.MsgTransferFT",
        value: msg,
      });
      const expected: AminoMsgTransferFT = {
        type: "lbm-sdk/MsgTransferFT",
        value: {
          contractId: "1",
          from: faucet.address0,
          to: faucet.address1,
          amount: tokenAmount,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });
});
