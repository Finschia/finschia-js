import { Decimal } from "@cosmjs/math";
import { Registry } from "@cosmjs/proto-signing";
import { AminoTypes, coins } from "@cosmjs/stargate";
import { Duration } from "lbmjs-types/google/protobuf/duration";
import { ReceiveFromTreasuryAuthorization } from "lbmjs-types/lbm/foundation/v1/authz";
import {
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
  VoteOption,
} from "lbmjs-types/lbm/foundation/v1/foundation";
import {
  Exec,
  MsgExec,
  MsgFundTreasury,
  MsgGovMint,
  MsgGrant,
  MsgLeaveFoundation,
  MsgRevoke,
  MsgUpdateDecisionPolicy,
  MsgUpdateMembers,
  MsgUpdateParams,
  MsgVote,
  MsgWithdrawFromTreasury,
  MsgWithdrawProposal,
} from "lbmjs-types/lbm/foundation/v1/tx";
import Long from "long";

import { faucet } from "../../testutils.spec";
import { longify } from "../../utils";
import {
  AminoMsgExec,
  AminoMsgFundTreasury,
  AminoMsgGovMint,
  AminoMsgGrant,
  AminoMsgLeaveFoundation,
  AminoMsgRevoke,
  AminoMsgUpdateDecisionPolicy,
  AminoMsgUpdateMembers,
  AminoMsgUpdateParams,
  AminoMsgVote,
  AminoMsgWithdrawFromTreasury,
  AminoMsgWithdrawProposal,
  AminoPercentageDecisionPolicy,
  AminoThresholdDecisionPolicy,
  createFoundationAminoConverters,
} from "./aminomessages";
import { createThresholdDecisionPolicy, foundationTypes } from "./messages";

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
            foundation_tax: "0",
            censored_msg_type_urls: ["/lbm.foundation.v1.MsgWithdrawFromTreasury"],
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

    it("MsgWithdrawFromTreasury", () => {
      const msg: MsgWithdrawFromTreasury = {
        authority: faucet.address0,
        to: faucet.address1,
        amount: coins(1234, "cony"),
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
        value: msg,
      });
      const expected: AminoMsgWithdrawFromTreasury = {
        type: "lbm-sdk/MsgWithdrawFromTreasury",
        value: {
          authority: faucet.address0,
          to: faucet.address1,
          amount: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgUpdateMembers", () => {
      const msg: MsgUpdateMembers = {
        authority: faucet.address0,
        memberUpdates: [
          {
            address: faucet.address1,
            remove: true,
            metadata: "this is test data 1",
          },
          {
            address: faucet.address2,
            remove: false,
            metadata: "this is test data 2",
          },
        ],
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgUpdateMembers",
        value: msg,
      });
      const expected: AminoMsgUpdateMembers = {
        type: "lbm-sdk/MsgUpdateMembers",
        value: {
          authority: faucet.address0,
          member_updates: [
            {
              address: faucet.address1,
              remove: true,
              metadata: "this is test data 1",
            },
            {
              address: faucet.address2,
              remove: false,
              metadata: "this is test data 2",
            },
          ],
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgUpdateDecisionPolicy", () => {
      const registry = new Registry(foundationTypes);
      const msg: MsgUpdateDecisionPolicy = {
        authority: faucet.address0,
        decisionPolicy: registry.encodeAsAny(createThresholdDecisionPolicy("10")),
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgUpdateDecisionPolicy",
        value: msg,
      });
      const expected: AminoMsgUpdateDecisionPolicy = {
        type: "lbm-sdk/MsgUpdateDecisionPolicy",
        value: {
          authority: faucet.address0,
          decision_policy: {
            type: "lbm-sdk/ThresholdDecisionPolicy",
            value: {
              threshold: Decimal.fromUserInput("10", 18).atomics,
              windows: {
                voting_period: {
                  seconds: "86400",
                  nanos: 0,
                },
                min_execution_period: {
                  seconds: "0",
                  nanos: 0,
                },
              },
            },
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgWithdrawProposal", () => {
      const msg: MsgWithdrawProposal = {
        proposalId: Long.fromString("1"),
        address: faucet.address1,
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgWithdrawProposal",
        value: msg,
      });
      const expected: AminoMsgWithdrawProposal = {
        type: "lbm-sdk/MsgWithdrawProposal",
        value: {
          proposal_id: "1",
          address: faucet.address1,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgVote", () => {
      const msg: MsgVote = {
        proposalId: Long.fromString("1"),
        voter: faucet.address0,
        option: VoteOption.VOTE_OPTION_YES,
        metadata: "test data 1",
        exec: Exec.EXEC_TRY,
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgVote",
        value: msg,
      });
      const expected: AminoMsgVote = {
        type: "lbm-sdk/MsgVote",
        value: {
          proposal_id: "1",
          voter: faucet.address0,
          option: 1,
          metadata: "test data 1",
          exec: 1,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgExec", () => {
      const msg: MsgExec = {
        proposalId: Long.fromString("1"),
        signer: faucet.address0,
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgExec",
        value: msg,
      });
      const expected: AminoMsgExec = {
        type: "lbm-sdk/MsgExec",
        value: {
          proposal_id: "1",
          signer: faucet.address0,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgLeaveFoundation", () => {
      const msg: MsgLeaveFoundation = {
        address: faucet.address1,
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgLeaveFoundation",
        value: msg,
      });
      const expected: AminoMsgLeaveFoundation = {
        type: "lbm-sdk/MsgLeaveFoundation",
        value: {
          address: faucet.address1,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgGrant", () => {
      const msg: MsgGrant = {
        authority: faucet.address0,
        grantee: faucet.address1,
        authorization: {
          typeUrl: "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization",
          value: ReceiveFromTreasuryAuthorization.encode({}).finish(),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgGrant",
        value: msg,
      });
      const expected: AminoMsgGrant = {
        type: "lbm-sdk/MsgGrant",
        value: {
          authority: faucet.address0,
          grantee: faucet.address1,
          authorization: {
            type: "lbm-sdk/ReceiveFromTreasuryAuthorization",
            value: {},
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgRevoke", () => {
      const msg: MsgRevoke = {
        authority: faucet.address0,
        grantee: faucet.address1,
        msgTypeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgRevoke",
        value: msg,
      });
      const expected: AminoMsgRevoke = {
        type: "lbm-sdk/MsgRevoke",
        value: {
          authority: faucet.address0,
          grantee: faucet.address1,
          msg_type_url: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgGovMint", () => {
      const msg: MsgGovMint = {
        authority: faucet.address0,
        amount: coins(1234, "cony"),
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgGovMint",
        value: msg,
      });
      const expected: AminoMsgGovMint = {
        type: "lbm-sdk/MsgGovMint",
        value: {
          authority: faucet.address0,
          amount: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("ThresholdDecisionPolicy", () => {
      const msg: ThresholdDecisionPolicy = {
        threshold: Decimal.fromUserInput("10", 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify("86400") }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify("0") }),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy",
        value: msg,
      });
      const expected: AminoThresholdDecisionPolicy = {
        type: "lbm-sdk/ThresholdDecisionPolicy",
        value: {
          threshold: Decimal.fromUserInput("10", 18).atomics,
          windows: {
            voting_period: {
              seconds: "86400",
              nanos: 0,
            },
            min_execution_period: {
              seconds: "0",
              nanos: 0,
            },
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("PercentageDecisionPolicy", () => {
      const msg: PercentageDecisionPolicy = {
        percentage: Decimal.fromUserInput("10", 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify("86400") }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify("0") }),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy",
        value: msg,
      });
      const expected: AminoPercentageDecisionPolicy = {
        type: "lbm-sdk/PercentageDecisionPolicy",
        value: {
          percentage: Decimal.fromUserInput("10", 18).atomics,
          windows: {
            voting_period: {
              seconds: "86400",
              nanos: 0,
            },
            min_execution_period: {
              seconds: "0",
              nanos: 0,
            },
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("from Amino", () => {
    it("MsgUpdateParams", () => {
      const aminoMsg: AminoMsgUpdateParams = {
        type: "lbm-sdk/MsgUpdateParams",
        value: {
          authority: faucet.address0,
          params: {
            foundation_tax: "0",
            censored_msg_type_urls: ["/lbm.foundation.v1.MsgWithdrawFromTreasury"],
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgUpdateParams = {
        authority: faucet.address0,
        params: {
          foundationTax: "0",
          censoredMsgTypeUrls: ["/lbm.foundation.v1.MsgWithdrawFromTreasury"],
        },
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgUpdateParams",
        value: expectedValue,
      });
    });

    it("MsgFundTreasury", () => {
      const aminoMsg: AminoMsgFundTreasury = {
        type: "lbm-sdk/MsgFundTreasury",
        value: {
          from: faucet.address0,
          amount: coins(1234, "cony"),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgFundTreasury = {
        from: faucet.address0,
        amount: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgFundTreasury",
        value: expectedValue,
      });
    });

    it("MsgWithdrawFromTreasury", () => {
      const aminoMsg: AminoMsgWithdrawFromTreasury = {
        type: "lbm-sdk/MsgWithdrawFromTreasury",
        value: {
          authority: faucet.address0,
          to: faucet.address1,
          amount: coins(1234, "cony"),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgWithdrawFromTreasury = {
        authority: faucet.address0,
        to: faucet.address1,
        amount: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
        value: expectedValue,
      });
    });

    it("MsgUpdateMembers", () => {
      const aminoMsg: AminoMsgUpdateMembers = {
        type: "lbm-sdk/MsgUpdateMembers",
        value: {
          authority: faucet.address0,
          member_updates: [
            {
              address: faucet.address1,
              remove: true,
              metadata: "this is test data 1",
            },
            {
              address: faucet.address2,
              remove: false,
              metadata: "this is test data 2",
            },
          ],
        },
      };

      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgUpdateMembers = {
        authority: faucet.address0,
        memberUpdates: [
          {
            address: faucet.address1,
            remove: true,
            metadata: "this is test data 1",
          },
          {
            address: faucet.address2,
            remove: false,
            metadata: "this is test data 2",
          },
        ],
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgUpdateMembers",
        value: expectedValue,
      });
    });

    it("MsgUpdateDecisionPolicy", () => {
      const registry = new Registry(foundationTypes);
      const aminoMsg: AminoMsgUpdateDecisionPolicy = {
        type: "lbm-sdk/MsgUpdateDecisionPolicy",
        value: {
          authority: faucet.address0,
          decision_policy: {
            type: "lbm-sdk/ThresholdDecisionPolicy",
            value: {
              threshold: Decimal.fromUserInput("10", 18).atomics,
              windows: {
                voting_period: {
                  seconds: "86400",
                  nanos: 0,
                },
                min_execution_period: {
                  seconds: "0",
                  nanos: 0,
                },
              },
            },
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgUpdateDecisionPolicy = {
        authority: faucet.address0,
        decisionPolicy: registry.encodeAsAny(createThresholdDecisionPolicy("10")),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgUpdateDecisionPolicy",
        value: expectedValue,
      });
    });

    it("MsgWithdrawProposal", () => {
      const aminoMsg: AminoMsgWithdrawProposal = {
        type: "lbm-sdk/MsgWithdrawProposal",
        value: {
          proposal_id: "1",
          address: faucet.address1,
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgWithdrawProposal = {
        proposalId: Long.fromString("1"),
        address: faucet.address1,
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgWithdrawProposal",
        value: expectedValue,
      });
    });

    it("MsgVote", () => {
      const aminoMsg: AminoMsgVote = {
        type: "lbm-sdk/MsgVote",
        value: {
          proposal_id: "1",
          voter: faucet.address0,
          option: 1,
          metadata: "test data 1",
          exec: 1,
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgVote = {
        proposalId: Long.fromString("1"),
        voter: faucet.address0,
        option: VoteOption.VOTE_OPTION_YES,
        metadata: "test data 1",
        exec: Exec.EXEC_TRY,
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgVote",
        value: expectedValue,
      });
    });

    it("MsgExec", () => {
      const aminoMsg: AminoMsgExec = {
        type: "lbm-sdk/MsgExec",
        value: {
          proposal_id: "1",
          signer: faucet.address0,
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgExec = {
        proposalId: Long.fromString("1"),
        signer: faucet.address0,
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgExec",
        value: expectedValue,
      });
    });

    it("MsgLeaveFoundation", () => {
      const aminoMsg: AminoMsgLeaveFoundation = {
        type: "lbm-sdk/MsgLeaveFoundation",
        value: {
          address: faucet.address1,
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgLeaveFoundation = {
        address: faucet.address1,
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgLeaveFoundation",
        value: expectedValue,
      });
    });

    it("MsgGrant", () => {
      const aminoMsg: AminoMsgGrant = {
        type: "lbm-sdk/MsgGrant",
        value: {
          authority: faucet.address0,
          grantee: faucet.address1,
          authorization: {
            type: "lbm-sdk/ReceiveFromTreasuryAuthorization",
            value: {},
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgGrant = {
        authority: faucet.address0,
        grantee: faucet.address1,
        authorization: {
          typeUrl: "/lbm.foundation.v1.ReceiveFromTreasuryAuthorization",
          value: ReceiveFromTreasuryAuthorization.encode({}).finish(),
        },
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgGrant",
        value: expectedValue,
      });
    });

    it("MsgRevoke", () => {
      const aminoMsg: AminoMsgRevoke = {
        type: "lbm-sdk/MsgRevoke",
        value: {
          authority: faucet.address0,
          grantee: faucet.address1,
          msg_type_url: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgRevoke = {
        authority: faucet.address0,
        grantee: faucet.address1,
        msgTypeUrl: "/lbm.foundation.v1.MsgWithdrawFromTreasury",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgRevoke",
        value: expectedValue,
      });
    });

    it("MsgGovMint", () => {
      const aminoMsg: AminoMsgGovMint = {
        type: "lbm-sdk/MsgGovMint",
        value: {
          authority: faucet.address0,
          amount: coins(1234, "cony"),
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgGovMint = {
        authority: faucet.address0,
        amount: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.MsgGovMint",
        value: expectedValue,
      });
    });

    it("ThresholdDecisionPolicy", () => {
      const aminoMsg: AminoThresholdDecisionPolicy = {
        type: "lbm-sdk/ThresholdDecisionPolicy",
        value: {
          threshold: Decimal.fromUserInput("10", 18).atomics,
          windows: {
            voting_period: {
              seconds: "86400",
              nanos: 0,
            },
            min_execution_period: {
              seconds: "0",
              nanos: 0,
            },
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: ThresholdDecisionPolicy = {
        threshold: Decimal.fromUserInput("10", 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify("86400") }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify("0") }),
        },
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.ThresholdDecisionPolicy",
        value: expectedValue,
      });
    });

    it("PercentageDecisionPolicy", () => {
      const aminoMsg: AminoPercentageDecisionPolicy = {
        type: "lbm-sdk/PercentageDecisionPolicy",
        value: {
          percentage: Decimal.fromUserInput("10", 18).atomics,
          windows: {
            voting_period: {
              seconds: "86400",
              nanos: 0,
            },
            min_execution_period: {
              seconds: "0",
              nanos: 0,
            },
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: PercentageDecisionPolicy = {
        percentage: Decimal.fromUserInput("10", 18).atomics,
        windows: {
          votingPeriod: Duration.fromPartial({ seconds: longify("86400") }),
          minExecutionPeriod: Duration.fromPartial({ seconds: longify("0") }),
        },
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.foundation.v1.PercentageDecisionPolicy",
        value: expectedValue,
      });
    });
  });
});
