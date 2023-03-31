import { addCoins, coin, Secp256k1HdWallet } from "@cosmjs/amino";
import { Decimal } from "@cosmjs/math";
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { AminoTypes, assertIsDeliverTxSuccess, coins, logs } from "@cosmjs/stargate";
import { sleep } from "@cosmjs/utils";
import { Any } from "cosmjs-types/google/protobuf/any";
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
import { CreateValidatorAuthorization } from "lbmjs-types/lbm/stakingplus/v1/authz";
import Long from "long";
import { MsgUpdateParamsEncodeObject } from "src";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
  validator,
} from "../../testutils.spec";
import { longify } from "../../utils";
import {
  AminoMsgExec,
  AminoMsgFundTreasury,
  AminoMsgGrant,
  AminoMsgLeaveFoundation,
  AminoMsgRevoke,
  AminoMsgSubmitProposal,
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
import {
  createMsgGrant,
  createMsgUpdateDecisionPolicy,
  createPercentageDecisionPolicy,
  MsgExecEncodeObject,
  MsgGrantEncodeObject,
  MsgLeaveFoundationEncodeObject,
  MsgUpdateMembersEncodeObject,
  MsgVoteEncodeObject,
  MsgWithdrawProposalEncodeObject,
} from "./messages";
import {
  createMsgSubmitProposal,
  createMsgWithdrawFromTreasury,
  createThresholdDecisionPolicy,
  foundationTypes,
} from "./messages";
import { makeClientWithFoundation } from "./queries.spec";

describe("Amino sign", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const authorityAddress = "link190vt0vxc8c8vj24a7mm3fjsenfu8f5yxxj76cp";
  let proposalId: Long;
  let withdrawProposalId: Long;

  beforeAll(async () => {
    if (simappEnabled()) {
      // proposal withdrawFromTreasury without grant for failing exec
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const msgUpdateParams: MsgUpdateParamsEncodeObject = {
        typeUrl: "/lbm.foundation.v1.MsgUpdateParams",
        value: {
          authority: authorityAddress,
          params: {
            foundationTax: Decimal.fromUserInput("0.1", 18).atomics,
          },
        },
      };
      const msg = createMsgSubmitProposal(
        [faucet.address0],
        [msgUpdateParams],
        "test",
        Exec.EXEC_UNSPECIFIED,
      );

      const result1 = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
      assertIsDeliverTxSuccess(result1);
      const parsedLogs1 = logs.parseRawLog(result1.rawLog);
      proposalId = longify(
        JSON.parse(logs.findAttribute(parsedLogs1, "lbm.foundation.v1.EventSubmitProposal", "proposal").value)
          .id,
      );

      const result2 = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
      assertIsDeliverTxSuccess(result2);
      const parsedLogs2 = logs.parseRawLog(result2.rawLog);
      withdrawProposalId = longify(
        JSON.parse(logs.findAttribute(parsedLogs2, "lbm.foundation.v1.EventSubmitProposal", "proposal").value)
          .id,
      );

      await sleep(75);
    }
  });

  it("MsgWithdrawProposal", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );
    const msgWithdrawProposal: MsgWithdrawProposalEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgWithdrawProposal",
      value: {
        proposalId: withdrawProposalId,
        address: faucet.address0,
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(
      faucet.address0,
      [msgWithdrawProposal],
      defaultFee,
    );
    assertIsDeliverTxSuccess(result);
  });

  it("MsgVote", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );
    const msgVote: MsgVoteEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgVote",
      value: {
        proposalId: proposalId,
        voter: faucet.address0,
        option: VoteOption.VOTE_OPTION_YES,
        metadata: "test",
        exec: Exec.EXEC_UNSPECIFIED,
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msgVote], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgExec", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );
    const msgExec: MsgExecEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgExec",
      value: {
        proposalId: proposalId,
        signer: faucet.address0,
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msgExec], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgUpdateParams", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const msgUpdateParams: MsgUpdateParamsEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgUpdateParams",
      value: {
        authority: authorityAddress,
        params: {
          foundationTax: Decimal.fromUserInput("0.1", 18).atomics,
        },
      },
    };

    const msg = createMsgSubmitProposal([faucet.address0], [msgUpdateParams], "test", Exec.EXEC_UNSPECIFIED);
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgFundTreasury", async () => {
    pendingWithoutSimapp();
    const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);
    const beforeAmount = (await client.foundation.treasury())[0] ?? coin("0", "cony");

    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const sendAmount = coin("1000", "cony");
    const msg = {
      typeUrl: "/lbm.foundation.v1.MsgFundTreasury",
      value: { from: faucet.address0, amount: [sendAmount] },
    };

    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);

    const afterAmount = await client.foundation.treasury();
    expect(coin(Decimal.fromAtomics(afterAmount[0].amount, 18).toString(), "cony")).toEqual(
      addCoins(coin(Decimal.fromAtomics(beforeAmount.amount, 18).toString(), "cony"), sendAmount),
    );
  });

  it("MsgWithdrawFromTreasury", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    // get withdraw grant before withdraw from treasury
    const msgGrant = createMsgGrant(authorityAddress, faucet.address2);
    const msg1 = createMsgSubmitProposal([faucet.address0], [msgGrant]);
    const result1 = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg1], defaultFee);
    assertIsDeliverTxSuccess(result1);

    const sendAmount = coin(100, "cony");
    const msgWithdraw = createMsgWithdrawFromTreasury(authorityAddress, faucet.address2, [sendAmount]);
    const msg2 = createMsgSubmitProposal([faucet.address0], [msgWithdraw], "test", Exec.EXEC_TRY);
    const result2 = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg2], defaultFee);
    assertIsDeliverTxSuccess(result2);
  });

  it("MsgUpdateMembers", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const msgUpdateMembers: MsgUpdateMembersEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgUpdateMembers",
      value: {
        authority: authorityAddress,
        memberUpdates: [{ address: faucet.address1, remove: false, metadata: "" }],
      },
    };
    const msg = createMsgSubmitProposal([faucet.address0], [msgUpdateMembers], "test", Exec.EXEC_TRY);
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgLeaveFoundation", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(1)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient2 = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );
    const msgLeaveFoundation: MsgLeaveFoundationEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgLeaveFoundation",
      value: {
        address: faucet.address1,
      },
    };
    const result = await signingFinschiaClient2.signAndBroadcast(
      faucet.address1,
      [msgLeaveFoundation],
      defaultFee,
    );
    assertIsDeliverTxSuccess(result);
  });

  it("MsgUpdateDecisionPolicy ThresholdDecisionPolicy", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const decisionPolicy = createThresholdDecisionPolicy("5");
    const msgDecisionPolicy = createMsgUpdateDecisionPolicy(authorityAddress, decisionPolicy);
    const msg = createMsgSubmitProposal(
      [faucet.address0],
      [msgDecisionPolicy],
      "test",
      Exec.EXEC_UNSPECIFIED,
    );
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgUpdateDecisionPolicy PercentageDecisionPolicy", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const decisionPolicy = createPercentageDecisionPolicy("0.6");
    const msgDecisionPolicy = createMsgUpdateDecisionPolicy(authorityAddress, decisionPolicy);
    const msg = createMsgSubmitProposal(
      [faucet.address0],
      [msgDecisionPolicy],
      "test",
      Exec.EXEC_UNSPECIFIED,
    );
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgGrant ReceiveFromTreasuryAuthorization", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const msgGrant = createMsgGrant(authorityAddress, faucet.address0);
    const msg = createMsgSubmitProposal([faucet.address0], [msgGrant]);
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });

  it("MsgGrant CreateValidatorAuthorization", async () => {
    pendingWithoutSimapp();
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(0)],
      prefix: simapp.prefix,
    });
    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const msgGrant: MsgGrantEncodeObject = {
      typeUrl: "/lbm.foundation.v1.MsgGrant",
      value: {
        authority: authorityAddress,
        grantee: faucet.address0,
        authorization: Any.fromPartial({
          typeUrl: "/lbm.stakingplus.v1.CreateValidatorAuthorization",
          value: Uint8Array.from(
            CreateValidatorAuthorization.encode({
              validatorAddress: validator.validatorAddress,
            }).finish(),
          ),
        }),
      },
    };
    const msg = createMsgSubmitProposal([faucet.address0], [msgGrant]);
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
    assertIsDeliverTxSuccess(result);
  });
});

describe("AminoTypes", () => {
  describe("to Amino", () => {
    it("MsgSubmitProposal", () => {
      const msgGrant = createMsgWithdrawFromTreasury(faucet.address0, faucet.address1, coins(1234, "cony"));
      const msg = createMsgSubmitProposal([faucet.address0], [msgGrant]);
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/lbm.foundation.v1.MsgSubmitProposal",
        value: msg.value,
      });
      const expected: AminoMsgSubmitProposal = {
        type: "lbm-sdk/MsgSubmitProposal",
        value: {
          proposers: [faucet.address0],
          metadata: undefined,
          messages: [
            {
              type: "lbm-sdk/MsgWithdrawFromTreasury",
              value: {
                authority: faucet.address0,
                to: faucet.address1,
                amount: coins(1234, "cony"),
              },
            },
          ],
          exec: 1,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("MsgUpdateParams", () => {
      const msg: MsgUpdateParams = {
        authority: faucet.address0,
        params: {
          foundationTax: "0",
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
            foundation_tax: "0.000000000000000000",
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
              remove: undefined,
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
              threshold: "10.000000000000000000",
              windows: {
                voting_period: "86400000000000",
                min_execution_period: "0",
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
          threshold: "10.000000000000000000",
          windows: {
            voting_period: "86400000000000",
            min_execution_period: "0",
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
          percentage: "10.000000000000000000",
          windows: {
            voting_period: "86400000000000",
            min_execution_period: "0",
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("from Amino", () => {
    it("MsgSubmitProposal", () => {
      const aminoMsg: AminoMsgSubmitProposal = {
        type: "lbm-sdk/MsgSubmitProposal",
        value: {
          proposers: [faucet.address0],
          metadata: "",
          messages: [
            {
              type: "lbm-sdk/MsgWithdrawFromTreasury",
              value: {
                authority: faucet.address0,
                to: faucet.address1,
                amount: coins(1234, "cony"),
              },
            },
          ],
          exec: 1,
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);

      const msgGrant = createMsgWithdrawFromTreasury(faucet.address0, faucet.address1, coins(1234, "cony"));
      const expected = createMsgSubmitProposal([faucet.address0], [msgGrant]);

      expect(msg).toEqual(expected);
    });

    it("MsgUpdateParams", () => {
      const aminoMsg: AminoMsgUpdateParams = {
        type: "lbm-sdk/MsgUpdateParams",
        value: {
          authority: faucet.address0,
          params: {
            foundation_tax: "0",
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: MsgUpdateParams = {
        authority: faucet.address0,
        params: {
          foundationTax: "0",
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

    it("ThresholdDecisionPolicy", () => {
      const aminoMsg: AminoThresholdDecisionPolicy = {
        type: "lbm-sdk/ThresholdDecisionPolicy",
        value: {
          threshold: "10",
          windows: {
            voting_period: "86400000000000",
            min_execution_period: "0",
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
          percentage: "0.600000000000000000",
          windows: {
            voting_period: "86400000000000",
            min_execution_period: "0",
          },
        },
      };
      const aminoTypes = new AminoTypes(createFoundationAminoConverters());
      const msg = aminoTypes.fromAmino(aminoMsg);
      const expectedValue: PercentageDecisionPolicy = {
        percentage: Decimal.fromUserInput("0.6", 18).atomics,
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
