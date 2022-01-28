/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64 } from "@cosmjs/encoding";
import { encodeBech32Pubkey } from "@lbmjs/amino";
import { coin, coins } from "@lbmjs/proto-signing";
import { MsgTransfer } from "lbmjs-types/ibc/applications/transfer/v1/tx";
import { MsgMultiSend, MsgSend } from "lbmjs-types/lbm/bank/v1/tx";
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "lbmjs-types/lbm/distribution/v1/tx";
import { TextProposal, VoteOption } from "lbmjs-types/lbm/gov/v1/gov";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "lbmjs-types/lbm/gov/v1/tx";
import {
  MsgBeginRedelegate,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from "lbmjs-types/lbm/staking/v1/tx";
import Long from "long";

import {
  AminoMsgBeginRedelegate,
  AminoMsgCreateValidator,
  AminoMsgDelegate,
  AminoMsgDeposit,
  AminoMsgEditValidator,
  AminoMsgFundCommunityPool,
  AminoMsgMultiSend,
  AminoMsgSend,
  AminoMsgSetWithdrawAddress,
  AminoMsgSubmitProposal,
  AminoMsgTransfer,
  AminoMsgUndelegate,
  AminoMsgVote,
  AminoMsgWithdrawDelegatorReward,
  AminoMsgWithdrawValidatorCommission,
} from "./aminomsgs";
import { AminoTypes } from "./aminotypes";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    // bank

    it("works for MsgSend", () => {
      const msg: MsgSend = {
        fromAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        toAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coins(1234, "cony"),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.bank.v1.MsgSend",
        value: msg,
      });
      const expected: AminoMsgSend = {
        type: "lbm-sdk/MsgSend",
        value: {
          from_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          to_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgMultiSend", () => {
      const msg: MsgMultiSend = {
        inputs: [
          { address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr", coins: coins(1234, "cony") },
          { address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705", coins: coins(5678, "cony") },
        ],
        outputs: [
          { address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0", coins: coins(6000, "cony") },
          { address: "link1m74nj9caexugrtdexx4f6wdrgy59jrlf06xrsu", coins: coins(912, "cony") },
        ],
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.bank.v1.MsgMultiSend",
        value: msg,
      });
      const expected: AminoMsgMultiSend = {
        type: "lbm-sdk/MsgMultiSend",
        value: {
          inputs: [
            { address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr", coins: coins(1234, "cony") },
            { address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705", coins: coins(5678, "cony") },
          ],
          outputs: [
            { address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0", coins: coins(6000, "cony") },
            { address: "link1m74nj9caexugrtdexx4f6wdrgy59jrlf06xrsu", coins: coins(912, "cony") },
          ],
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    // gov

    it("works for MsgDeposit", () => {
      const msg: MsgDeposit = {
        amount: [{ amount: "12300000", denom: "ustake" }],
        depositor: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        proposalId: Long.fromNumber(5),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.gov.v1.MsgDeposit",
        value: msg,
      });
      const expected: AminoMsgDeposit = {
        type: "lbm-sdk/MsgDeposit",
        value: {
          amount: [{ amount: "12300000", denom: "ustake" }],
          depositor: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          proposal_id: "5",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgSubmitProposal", () => {
      const msg: MsgSubmitProposal = {
        initialDeposit: [{ amount: "12300000", denom: "ustake" }],
        proposer: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        content: {
          typeUrl: "/lbm.gov.v1.TextProposal",
          value: TextProposal.encode({
            description: "This proposal proposes to test whether this proposal passes",
            title: "Test Proposal",
          }).finish(),
        },
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.gov.v1.MsgSubmitProposal",
        value: msg,
      });
      const expected: AminoMsgSubmitProposal = {
        type: "lbm-sdk/MsgSubmitProposal",
        value: {
          initial_deposit: [{ amount: "12300000", denom: "ustake" }],
          proposer: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          content: {
            type: "lbm-sdk/TextProposal",
            value: {
              description: "This proposal proposes to test whether this proposal passes",
              title: "Test Proposal",
            },
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgVote", () => {
      const msg: MsgVote = {
        option: VoteOption.VOTE_OPTION_NO_WITH_VETO,
        proposalId: Long.fromNumber(5),
        voter: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.gov.v1.MsgVote",
        value: msg,
      });
      const expected: AminoMsgVote = {
        type: "lbm-sdk/MsgVote",
        value: {
          option: 4,
          proposal_id: "5",
          voter: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    // distribution

    it("works for MsgFundCommunityPool", async () => {
      const msg: MsgFundCommunityPool = {
        amount: coins(1234, "cony"),
        depositor: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.distribution.v1.MsgFundCommunityPool",
        value: msg,
      });
      const expected: AminoMsgFundCommunityPool = {
        type: "lbm-sdk/MsgFundCommunityPool",
        value: {
          amount: coins(1234, "cony"),
          depositor: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgSetWithdrawAddress", async () => {
      const msg: MsgSetWithdrawAddress = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        withdrawAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.distribution.v1.MsgSetWithdrawAddress",
        value: msg,
      });
      const expected: AminoMsgSetWithdrawAddress = {
        type: "lbm-sdk/MsgModifyWithdrawAddress",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          withdraw_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgWithdrawDelegatorReward", async () => {
      const msg: MsgWithdrawDelegatorReward = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.distribution.v1.MsgWithdrawDelegatorReward",
        value: msg,
      });
      const expected: AminoMsgWithdrawDelegatorReward = {
        type: "lbm-sdk/MsgWithdrawDelegationReward",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgWithdrawValidatorCommission", async () => {
      const msg: MsgWithdrawValidatorCommission = {
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.distribution.v1.MsgWithdrawValidatorCommission",
        value: msg,
      });
      const expected: AminoMsgWithdrawValidatorCommission = {
        type: "lbm-sdk/MsgWithdrawValidatorCommission",
        value: {
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    // staking

    it("works for MsgBeginRedelegate", () => {
      const msg: MsgBeginRedelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorSrcAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        validatorDstAddress: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        amount: coin(1234, "cony"),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.staking.v1.MsgBeginRedelegate",
        value: msg,
      });
      const expected: AminoMsgBeginRedelegate = {
        type: "lbm-sdk/MsgBeginRedelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_src_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          validator_dst_address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
          amount: coin(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgCreateValidator", () => {
      const msg: MsgCreateValidator = {
        description: {
          moniker: "validator",
          identity: "me",
          website: "valid.com",
          securityContact: "Hamburglar",
          details: "...",
        },
        commission: {
          rate: "0.2",
          maxRate: "0.3",
          maxChangeRate: "0.1",
        },
        minSelfDelegation: "123",
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        pubkey: {
          typeUrl: "/lbm.crypto.secp256k1.PubKey",
          value: fromBase64("A7J4jYgKYQPje7f5L7Q9WQGQ6OVJ/CUKYRWsWhey4q2K"),
        },
        value: coin(1234, "cony"),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.staking.v1.MsgCreateValidator",
        value: msg,
      });
      const expected: AminoMsgCreateValidator = {
        type: "lbm-sdk/MsgCreateValidator",
        value: {
          description: {
            moniker: "validator",
            identity: "me",
            website: "valid.com",
            security_contact: "Hamburglar",
            details: "...",
          },
          commission: {
            rate: "0.2",
            max_rate: "0.3",
            max_change_rate: "0.1",
          },
          min_self_delegation: "123",
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
          pubkey: encodeBech32Pubkey(
            { type: "ostracon/PubKeySecp256k1", value: "A7J4jYgKYQPje7f5L7Q9WQGQ6OVJ/CUKYRWsWhey4q2K" },
            "link",
          ),
          value: coin(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgDelegate", () => {
      const msg: MsgDelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coin(1234, "cony"),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.staking.v1.MsgDelegate",
        value: msg,
      });
      const expected: AminoMsgDelegate = {
        type: "lbm-sdk/MsgDelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coin(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgEditValidator", () => {
      const msg: MsgEditValidator = {
        description: {
          moniker: "validator",
          identity: "me",
          website: "valid.com",
          securityContact: "Hamburglar",
          details: "...",
        },
        commissionRate: "0.2",
        minSelfDelegation: "123",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.staking.v1.MsgEditValidator",
        value: msg,
      });
      const expected: AminoMsgEditValidator = {
        type: "lbm-sdk/MsgEditValidator",
        value: {
          description: {
            moniker: "validator",
            identity: "me",
            website: "valid.com",
            security_contact: "Hamburglar",
            details: "...",
          },
          commission_rate: "0.2",
          min_self_delegation: "123",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgUndelegate", () => {
      const msg: MsgUndelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coin(1234, "cony"),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/lbm.staking.v1.MsgUndelegate",
        value: msg,
      });
      const expected: AminoMsgUndelegate = {
        type: "lbm-sdk/MsgUndelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coin(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    // ibc

    it("works for MsgTransfer", () => {
      const msg: MsgTransfer = {
        sourcePort: "testport",
        sourceChannel: "testchannel",
        token: coin(1234, "utest"),
        sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        timeoutHeight: {
          revisionHeight: Long.fromString("123", true),
          revisionNumber: Long.fromString("456", true),
        },
        timeoutTimestamp: Long.fromString("789", true),
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: msg,
      });
      const expected: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          source_port: "testport",
          source_channel: "testchannel",
          token: coin(1234, "utest"),
          sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          timeout_height: {
            revision_height: "123",
            revision_number: "456",
          },
          timeout_timestamp: "789",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgTransfer with empty values", () => {
      const msg: MsgTransfer = {
        sourcePort: "testport",
        sourceChannel: "testchannel",
        token: coin(1234, "utest"),
        sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        timeoutHeight: {
          revisionHeight: Long.UZERO,
          revisionNumber: Long.UZERO,
        },
        timeoutTimestamp: Long.UZERO,
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: msg,
      });
      const expected: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          source_port: "testport",
          source_channel: "testchannel",
          token: coin(1234, "utest"),
          sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          timeout_height: {
            revision_height: undefined,
            revision_number: undefined,
          },
          timeout_timestamp: undefined,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgTransfer with no height timeout", () => {
      const msg: MsgTransfer = {
        sourcePort: "testport",
        sourceChannel: "testchannel",
        token: coin(1234, "utest"),
        sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        timeoutHeight: undefined,
        timeoutTimestamp: Long.UZERO,
      };
      const aminoMsg = new AminoTypes().toAmino({
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: msg,
      });
      const expected: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          source_port: "testport",
          source_channel: "testchannel",
          token: coin(1234, "utest"),
          sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          timeout_height: {},
          timeout_timestamp: undefined,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    // other

    it("works with custom type url", () => {
      const msg = {
        foo: "bar",
      };
      const aminoMsg = new AminoTypes({
        additions: {
          "/my.CustomType": {
            aminoType: "my-sdk/CustomType",
            toAmino: ({
              foo,
            }: {
              readonly foo: string;
            }): { readonly foo: string; readonly constant: string } => ({
              foo: `amino-prefix-${foo}`,
              constant: "something-for-amino",
            }),
            fromAmino: () => {},
          },
        },
      }).toAmino({ typeUrl: "/my.CustomType", value: msg });
      expect(aminoMsg).toEqual({
        type: "my-sdk/CustomType",
        value: {
          foo: "amino-prefix-bar",
          constant: "something-for-amino",
        },
      });
    });

    it("works with overridden type url", () => {
      const msg: MsgDelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coin(1234, "cony"),
      };
      const aminoMsg = new AminoTypes({
        additions: {
          "/lbm.staking.v1.MsgDelegate": {
            aminoType: "my-override/MsgDelegate",
            toAmino: (m: MsgDelegate): { readonly foo: string } => ({
              foo: m.delegatorAddress ?? "",
            }),
            fromAmino: () => {},
          },
        },
      }).toAmino({
        typeUrl: "/lbm.staking.v1.MsgDelegate",
        value: msg,
      });
      const expected = {
        type: "my-override/MsgDelegate",
        value: {
          foo: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("throws for unknown type url", () => {
      expect(() => new AminoTypes().toAmino({ typeUrl: "/xxx.Unknown", value: { foo: "bar" } })).toThrowError(
        /Type URL does not exist in the Amino message type register./i,
      );
    });
  });

  describe("fromAmino", () => {
    // bank

    it("works for MsgSend", () => {
      const aminoMsg: AminoMsgSend = {
        type: "lbm-sdk/MsgSend",
        value: {
          from_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          to_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coins(1234, "cony"),
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgSend = {
        fromAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        toAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.bank.v1.MsgSend",
        value: expectedValue,
      });
    });

    it("works for MsgMultiSend", () => {
      const aminoMsg: AminoMsgMultiSend = {
        type: "lbm-sdk/MsgMultiSend",
        value: {
          inputs: [
            { address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr", coins: coins(1234, "cony") },
            { address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705", coins: coins(5678, "cony") },
          ],
          outputs: [
            { address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0", coins: coins(6000, "cony") },
            { address: "link1m74nj9caexugrtdexx4f6wdrgy59jrlf06xrsu", coins: coins(912, "cony") },
          ],
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgMultiSend = {
        inputs: [
          { address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr", coins: coins(1234, "cony") },
          { address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705", coins: coins(5678, "cony") },
        ],
        outputs: [
          { address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0", coins: coins(6000, "cony") },
          { address: "link1m74nj9caexugrtdexx4f6wdrgy59jrlf06xrsu", coins: coins(912, "cony") },
        ],
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.bank.v1.MsgMultiSend",
        value: expectedValue,
      });
    });

    // gov

    it("works for MsgDeposit", () => {
      const aminoMsg: AminoMsgDeposit = {
        type: "lbm-sdk/MsgDeposit",
        value: {
          amount: [{ amount: "12300000", denom: "ustake" }],
          depositor: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          proposal_id: "5",
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgDeposit = {
        amount: [{ amount: "12300000", denom: "ustake" }],
        depositor: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        proposalId: Long.fromNumber(5),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.gov.v1.MsgDeposit",
        value: expectedValue,
      });
    });

    it("works for MsgSubmitProposal", () => {
      const aminoMsg: AminoMsgSubmitProposal = {
        type: "lbm-sdk/MsgSubmitProposal",
        value: {
          initial_deposit: [{ amount: "12300000", denom: "ustake" }],
          proposer: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          content: {
            type: "lbm-sdk/TextProposal",
            value: {
              description: "This proposal proposes to test whether this proposal passes",
              title: "Test Proposal",
            },
          },
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgSubmitProposal = {
        initialDeposit: [{ amount: "12300000", denom: "ustake" }],
        proposer: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        content: {
          typeUrl: "/lbm.gov.v1.TextProposal",
          value: TextProposal.encode({
            description: "This proposal proposes to test whether this proposal passes",
            title: "Test Proposal",
          }).finish(),
        },
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.gov.v1.MsgSubmitProposal",
        value: expectedValue,
      });
    });

    it("works for MsgVote", () => {
      const aminoMsg: AminoMsgVote = {
        type: "lbm-sdk/MsgVote",
        value: {
          option: 4,
          proposal_id: "5",
          voter: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgVote = {
        option: VoteOption.VOTE_OPTION_NO_WITH_VETO,
        proposalId: Long.fromNumber(5),
        voter: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.gov.v1.MsgVote",
        value: expectedValue,
      });
    });

    // distribution

    // TODO: MsgFundCommunityPool
    // TODO: MsgSetWithdrawAddress
    // TODO: MsgWithdrawDelegatorReward
    // TODO: MsgWithdrawValidatorCommission

    // staking

    it("works for MsgBeginRedelegate", () => {
      const aminoMsg: AminoMsgBeginRedelegate = {
        type: "lbm-sdk/MsgBeginRedelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_src_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          validator_dst_address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
          amount: coin(1234, "cony"),
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgBeginRedelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorSrcAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        validatorDstAddress: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        amount: coin(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.staking.v1.MsgBeginRedelegate",
        value: expectedValue,
      });
    });

    it("works for MsgCreateValidator", () => {
      const aminoMsg: AminoMsgCreateValidator = {
        type: "lbm-sdk/MsgCreateValidator",
        value: {
          description: {
            moniker: "validator",
            identity: "me",
            website: "valid.com",
            security_contact: "Hamburglar",
            details: "...",
          },
          commission: {
            rate: "0.2",
            max_rate: "0.3",
            max_change_rate: "0.1",
          },
          min_self_delegation: "123",
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
          pubkey: encodeBech32Pubkey(
            { type: "ostracon/PubKeySecp256k1", value: "A7J4jYgKYQPje7f5L7Q9WQGQ6OVJ/CUKYRWsWhey4q2K" },
            "link",
          ),
          value: coin(1234, "cony"),
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgCreateValidator = {
        description: {
          moniker: "validator",
          identity: "me",
          website: "valid.com",
          securityContact: "Hamburglar",
          details: "...",
        },
        commission: {
          rate: "0.2",
          maxRate: "0.3",
          maxChangeRate: "0.1",
        },
        minSelfDelegation: "123",
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0",
        pubkey: {
          typeUrl: "/lbm.crypto.secp256k1.PubKey",
          value: fromBase64("A7J4jYgKYQPje7f5L7Q9WQGQ6OVJ/CUKYRWsWhey4q2K"),
        },
        value: coin(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.staking.v1.MsgCreateValidator",
        value: expectedValue,
      });
    });

    it("works for MsgDelegate", () => {
      const aminoMsg: AminoMsgDelegate = {
        type: "lbm-sdk/MsgDelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coin(1234, "cony"),
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgDelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coin(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.staking.v1.MsgDelegate",
        value: expectedValue,
      });
    });

    it("works for MsgEditValidator", () => {
      const aminoMsg: AminoMsgEditValidator = {
        type: "lbm-sdk/MsgEditValidator",
        value: {
          description: {
            moniker: "validator",
            identity: "me",
            website: "valid.com",
            security_contact: "Hamburglar",
            details: "...",
          },
          commission_rate: "0.2",
          min_self_delegation: "123",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgEditValidator = {
        description: {
          moniker: "validator",
          identity: "me",
          website: "valid.com",
          securityContact: "Hamburglar",
          details: "...",
        },
        commissionRate: "0.2",
        minSelfDelegation: "123",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.staking.v1.MsgEditValidator",
        value: expectedValue,
      });
    });

    it("works for MsgUndelegate", () => {
      const aminoMsg: AminoMsgUndelegate = {
        type: "lbm-sdk/MsgUndelegate",
        value: {
          delegator_address: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validator_address: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coin(1234, "cony"),
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgUndelegate = {
        delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        amount: coin(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.staking.v1.MsgUndelegate",
        value: expectedValue,
      });
    });

    // ibc

    it("works for MsgTransfer", () => {
      const aminoMsg: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          source_port: "testport",
          source_channel: "testchannel",
          token: coin(1234, "utest"),
          sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          timeout_height: {
            revision_height: "123",
            revision_number: "456",
          },
          timeout_timestamp: "789",
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgTransfer = {
        sourcePort: "testport",
        sourceChannel: "testchannel",
        token: coin(1234, "utest"),
        sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        timeoutHeight: {
          revisionHeight: Long.fromString("123", true),
          revisionNumber: Long.fromString("456", true),
        },
        timeoutTimestamp: Long.fromString("789", true),
      };
      expect(msg).toEqual({
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: expectedValue,
      });
    });

    it("works for MsgTransfer with default values", () => {
      const aminoMsg: AminoMsgTransfer = {
        type: "lbm-sdk/MsgTransfer",
        value: {
          source_port: "testport",
          source_channel: "testchannel",
          token: coin(1234, "utest"),
          sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          timeout_height: {
            // revision_height omitted
            // revision_number omitted
          },
          // timeout_timestamp omitted
        },
      };
      const msg = new AminoTypes().fromAmino(aminoMsg);
      const expectedValue: MsgTransfer = {
        sourcePort: "testport",
        sourceChannel: "testchannel",
        token: coin(1234, "utest"),
        sender: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        receiver: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
        timeoutHeight: {
          revisionHeight: Long.UZERO,
          revisionNumber: Long.UZERO,
        },
        timeoutTimestamp: Long.UZERO,
      };
      expect(msg).toEqual({
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: expectedValue,
      });
    });

    // other

    it("works for custom type url", () => {
      const aminoMsg = {
        type: "my-sdk/CustomType",
        value: {
          foo: "amino-prefix-bar",
          constant: "something-for-amino",
        },
      };
      const msg = new AminoTypes({
        additions: {
          "/my.CustomType": {
            aminoType: "my-sdk/CustomType",
            toAmino: () => {},
            fromAmino: ({ foo }: { readonly foo: string; readonly constant: string }): any => ({
              foo: foo.slice(13),
            }),
          },
        },
      }).fromAmino(aminoMsg);
      const expectedValue = {
        foo: "bar",
      };
      expect(msg).toEqual({
        typeUrl: "/my.CustomType",
        value: expectedValue,
      });
    });

    it("works with overridden type url", () => {
      const msg = new AminoTypes({
        additions: {
          "/my.OverrideType": {
            aminoType: "lbm-sdk/MsgDelegate",
            toAmino: () => {},
            fromAmino: ({ foo }: { readonly foo: string }): MsgDelegate => ({
              delegatorAddress: foo,
              validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
              amount: coin(1234, "cony"),
            }),
          },
        },
      }).fromAmino({
        type: "lbm-sdk/MsgDelegate",
        value: {
          foo: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
        },
      });
      const expected: { readonly typeUrl: "/my.OverrideType"; readonly value: MsgDelegate } = {
        typeUrl: "/my.OverrideType",
        value: {
          delegatorAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
          validatorAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
          amount: coin(1234, "cony"),
        },
      };
      expect(msg).toEqual(expected);
    });

    it("throws for unknown type url", () => {
      expect(() =>
        new AminoTypes().fromAmino({ type: "lbm-sdk/MsgUnknown", value: { foo: "bar" } }),
      ).toThrowError(/Type does not exist in the Amino message type register./i);
    });
  });
});
