import { AminoTypes } from "@cosmjs/stargate";
import {
  BridgeStatus,
  bridgeStatusFromJSON,
  Role,
  roleFromJSON,
  VoteOption,
  voteOptionFromJSON,
} from "@finschia/finschia-proto/lbm/fbridge/v1/fbridge";
import {
  MsgAddVoteForRole,
  MsgSetBridgeStatus,
  MsgSuggestRole,
  MsgTransfer,
} from "@finschia/finschia-proto/lbm/fbridge/v1/tx";

import { faucet } from "../../testutils.spec";
import { longify } from "../../utils";
import {
  AminoMsgAddVoteForRole,
  AminoMsgSetBridgeStatus,
  AminoMsgSuggestRole,
  AminoMsgTransfer,
  createFbridgeAminoConverters,
} from "./aminomessages";

describe("Fbridge AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgTransfer", () => {
      const msg: MsgTransfer = {
        sender: faucet.address0,
        receiver: faucet.address1,
        amount: "10000",
      };
      const aminoType = new AminoTypes(createFbridgeAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fbridge.v1.MsgTransfer",
        value: msg,
      });
      const expected: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          sender: faucet.address0,
          receiver: faucet.address1,
          amount: "10000",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgSuggestRole", () => {
      const msg: MsgSuggestRole = {
        from: faucet.address0,
        target: faucet.address1,
        role: roleFromJSON("GUARDIAN"),
      };
      const aminoType = new AminoTypes(createFbridgeAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fbridge.v1.MsgSuggestRole",
        value: msg,
      });
      const expected: AminoMsgSuggestRole = {
        type: "lbm-sdk/MsgSuggestRole",
        value: {
          from: faucet.address0,
          target: faucet.address1,
          role: Role.GUARDIAN,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgAddVoteForRole", () => {
      const msg: MsgAddVoteForRole = {
        from: faucet.address0,
        proposalId: longify(1),
        option: voteOptionFromJSON(VoteOption.VOTE_OPTION_YES),
      };
      const aminoType = new AminoTypes(createFbridgeAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fbridge.v1.MsgAddVoteForRole",
        value: msg,
      });
      const expected: AminoMsgAddVoteForRole = {
        type: "lbm-sdk/MsgAddVoteForRole",
        value: {
          from: faucet.address0,
          proposal_id: "1",
          option: VoteOption.VOTE_OPTION_YES,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgSetBridgeStatus", () => {
      const msg: MsgSetBridgeStatus = {
        guardian: faucet.address0,
        status: bridgeStatusFromJSON(BridgeStatus.BRIDGE_STATUS_ACTIVE),
      };
      const aminoType = new AminoTypes(createFbridgeAminoConverters());
      const aminoMsg = aminoType.toAmino({
        typeUrl: "/lbm.fbridge.v1.MsgSetBridgeStatus",
        value: msg,
      });
      const expected: AminoMsgSetBridgeStatus = {
        type: "lbm-sdk/MsgSetBridgeStatus",
        value: {
          guardian: faucet.address0,
          status: BridgeStatus.BRIDGE_STATUS_ACTIVE,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    it("works for MsgTransfer", () => {
      const aminoMsg: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          sender: faucet.address0,
          receiver: faucet.address1,
          amount: "10000",
        },
      };
      const msg = new AminoTypes(createFbridgeAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgTransfer = {
        sender: faucet.address0,
        receiver: faucet.address1,
        amount: "10000",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fbridge.v1.MsgTransfer",
        value: expectedValue,
      });
    });

    it("works for MsgSuggestRole", () => {
      const aminoMsg: AminoMsgSuggestRole = {
        type: "lbm-sdk/MsgSuggestRole",
        value: {
          from: faucet.address0,
          target: faucet.address1,
          role: Role.GUARDIAN,
        },
      };
      const msg = new AminoTypes(createFbridgeAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgSuggestRole = {
        from: faucet.address0,
        target: faucet.address1,
        role: roleFromJSON("GUARDIAN"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fbridge.v1.MsgSuggestRole",
        value: expectedValue,
      });
    });

    it("works for MsgAddVoteForRole", () => {
      const aminoMsg: AminoMsgAddVoteForRole = {
        type: "lbm-sdk/MsgAddVoteForRole",
        value: {
          from: faucet.address0,
          proposal_id: "1",
          option: VoteOption.VOTE_OPTION_YES,
        },
      };
      const msg = new AminoTypes(createFbridgeAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgAddVoteForRole = {
        from: faucet.address0,
        proposalId: longify(1),
        option: voteOptionFromJSON(VoteOption.VOTE_OPTION_YES),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fbridge.v1.MsgAddVoteForRole",
        value: expectedValue,
      });
    });

    it("works for MsgSetBridgeStatus", () => {
      const aminoMsg: AminoMsgSetBridgeStatus = {
        type: "lbm-sdk/MsgSetBridgeStatus",
        value: {
          guardian: faucet.address0,
          status: BridgeStatus.BRIDGE_STATUS_ACTIVE,
        },
      };
      const msg = new AminoTypes(createFbridgeAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgSetBridgeStatus = {
        guardian: faucet.address0,
        status: bridgeStatusFromJSON(BridgeStatus.BRIDGE_STATUS_ACTIVE),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.fbridge.v1.MsgSetBridgeStatus",
        value: expectedValue,
      });
    });
  });
});
