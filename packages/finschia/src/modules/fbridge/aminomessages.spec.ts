import { coins, Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { AminoTypes, assertIsDeliverTxFailure, assertIsDeliverTxSuccess } from "@cosmjs/stargate";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";
import { assertDefined } from "@cosmjs/utils";
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

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { longify } from "../../utils";
import { MsgSwapEncodeObject } from "../fswap/messages";
import {
  AminoMsgAddVoteForRole,
  AminoMsgSetBridgeStatus,
  AminoMsgSuggestRole,
  AminoMsgTransfer,
  createFbridgeAminoConverters,
} from "./aminomessages";
import {
  MsgAddVoteForRoleEncodeObject,
  MsgSetBridgeStatusEncodeObject,
  MsgSuggestRoleEncodeObject,
  MsgTransferEncodeObject,
} from "./messages";

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

describe("Amino Sign", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const fromAddr = faucet.address0;
  const swapFromAmount = "100000";
  const toAddr = "0xf7bAc63fc7CEaCf0589F25454Ecf5C2ce904997c";

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const msgSwap: MsgSwapEncodeObject = {
        typeUrl: "/lbm.fswap.v1.MsgSwap",
        value: {
          fromAddress: fromAddr,
          fromCoinAmount: { amount: swapFromAmount, denom: "cony" },
          toDenom: "pdt",
        },
      };
      const result = await signingFinschiaClient.signAndBroadcast(fromAddr, [msgSwap], defaultFee);
      assertIsDeliverTxSuccess(result);
    }
  });

  it("MsgTransfer", async () => {
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

    const beforeAmount = await signingFinschiaClient.getBalance(fromAddr, "pdt");

    const bridgingAmount = BigInt(swapFromAmount) * BigInt("148079656000000");
    const msgTransfer: MsgTransferEncodeObject = {
      typeUrl: "/lbm.fbridge.v1.MsgTransfer",
      value: {
        sender: fromAddr,
        receiver: toAddr,
        amount: bridgingAmount.toString(),
      },
    };
    const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msgTransfer], defaultFee);
    assertIsDeliverTxSuccess(result);
    const parsedLogs = parseRawLog(result.rawLog);
    expect(findAttribute(parsedLogs, "lbm.fbridge.v1.EventTransfer", "amount").value).toEqual(
      '"' + bridgingAmount.toString() + '"',
    );

    const afterAmount = await signingFinschiaClient.getBalance(fromAddr, "pdt");
    expect(afterAmount.amount).toEqual((BigInt(beforeAmount.amount) - bridgingAmount).toString());
  });

  it("MsgSuggestRole", async () => {
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

    const fakeGuardian = faucet.address0;
    const targetAddr = makeRandomAddress();

    const msgSuggestRole: MsgSuggestRoleEncodeObject = {
      typeUrl: "/lbm.fbridge.v1.MsgSuggestRole",
      value: {
        from: fakeGuardian,
        target: targetAddr,
        role: Role.GUARDIAN,
      },
    };
    // This request will success, but the result should fail.
    const result = await signingFinschiaClient.signAndBroadcast(fakeGuardian, [msgSuggestRole], defaultFee);
    assertIsDeliverTxFailure(result);
    assertDefined(result.rawLog);
    expect(result.rawLog).toContain("only guardian can execute this action: unauthorized");
  });

  it("MsgAddVoteForRole", async () => {
    pendingWithoutSimapp();
    const wallet = await Secp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
      hdPaths: [makeLinkPath(3)],
      prefix: simapp.prefix,
    });

    const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const guardian = faucet.address3;

    const msgAddVoteForRole: MsgAddVoteForRoleEncodeObject = {
      typeUrl: "/lbm.fbridge.v1.MsgAddVoteForRole",
      value: {
        from: guardian,
        proposalId: longify(10000),
        option: VoteOption.VOTE_OPTION_NO,
      },
    };
    // This request will success, but the result should fail.
    const result = await signingFinschiaClient.signAndBroadcast(guardian, [msgAddVoteForRole], defaultFee);
    assertIsDeliverTxFailure(result);
    assertDefined(result.rawLog);
    expect(result.rawLog).toContain("#10000 not found: unknown proposal");
  });

  it("MsgSetBridgeStatus", async () => {
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

    const fakeGuardian = faucet.address0;

    const msgAddVoteForRole: MsgSetBridgeStatusEncodeObject = {
      typeUrl: "/lbm.fbridge.v1.MsgSetBridgeStatus",
      value: {
        guardian: fakeGuardian,
        status: BridgeStatus.BRIDGE_STATUS_INACTIVE,
      },
    };
    // This request will success, but the result should fail.
    const result = await signingFinschiaClient.signAndBroadcast(
      fakeGuardian,
      [msgAddVoteForRole],
      defaultFee,
    );
    assertIsDeliverTxFailure(result);
    assertDefined(result.rawLog);
    expect(result.rawLog).toContain("only guardian has bridge switch: unauthorized");
  });
});
