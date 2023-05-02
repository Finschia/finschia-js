import { addCoins, coin, coins } from "@cosmjs/amino";
import { Decimal } from "@cosmjs/math";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, logs, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";
import {
  MemberRequest,
  ThresholdDecisionPolicy,
} from "@finschia/finschia-proto/lbm/foundation/v1/foundation";
import Long from "long";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  defaultSigningClientOptions,
  faucet,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { longify } from "../../utils";
import {
  createMsgGrant,
  createMsgSubmitProposal,
  createMsgUpdateDecisionPolicy,
  createMsgUpdateMembers,
  createMsgWithdrawFromTreasury,
  createThresholdDecisionPolicy,
  isThresholdDecisionPolicyEncodeObject,
} from "./messages";
import { FoundationExtension, setupFoundationExtension } from "./queries";

export async function makeClientWithFoundation(
  rpcUrl: string,
): Promise<[QueryClient & FoundationExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupFoundationExtension), tmClient];
}

describe("FoundationExtension", () => {
  const defaultFee = {
    amount: coins(25000, "cony"),
    gas: "1500000", // 1.5 million
  };
  const authorityAddress = "link190vt0vxc8c8vj24a7mm3fjsenfu8f5yxxj76cp";

  describe("Params", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const params = await client.foundation.params();
      expect(params!.foundationTax).toEqual("0");

      tmClient.disconnect();
    });
  });

  describe("Treasury", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);
      const beforeAmount = (await client.foundation.treasury())[0] ?? coin("0", "cony");

      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
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

      tmClient.disconnect();
    });
  });

  describe("Foundation Info", () => {
    let foundationVersion: Long.Long | undefined;
    beforeAll(async () => {
      if (simappEnabled()) {
        const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);
        foundationVersion = (await client.foundation.foundationInfo())?.version;

        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        // proposal updateDicisionPolicy
        const decisionPolicy = createThresholdDecisionPolicy("5");
        const msgDecisionPolicy = createMsgUpdateDecisionPolicy(authorityAddress, decisionPolicy);
        const msg = createMsgSubmitProposal([faucet.address0], [msgDecisionPolicy]);
        const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        await sleep(75);
        tmClient.disconnect();
      }
    });

    it("works for version", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const foundationInfo = await client.foundation.foundationInfo();
      expect(foundationInfo).toBeDefined();
      expect(foundationInfo).not.toBeNull();
      expect(foundationInfo!.version).toEqual(foundationVersion!.add(longify(1)));

      tmClient.disconnect();
    });

    it("works for DecisionPolicy", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const foundationInfo = await client.foundation.foundationInfo();
      expect(foundationInfo).toBeDefined();
      expect(foundationInfo).not.toBeNull();
      expect(isThresholdDecisionPolicyEncodeObject(foundationInfo!.decisionPolicy!)).toBeTrue();

      // check threshold and windows
      const thresholdDecisionPolicy = ThresholdDecisionPolicy.decode(foundationInfo!.decisionPolicy!.value);
      expect(Decimal.fromAtomics(thresholdDecisionPolicy.threshold, 18).toString()).toEqual("5");

      tmClient.disconnect();
    });
  });

  describe("Grants and Treasury", () => {
    const granteeAddress = faucet.address0;

    beforeAll(async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        // proposal grant
        {
          const msgGrant = createMsgGrant(authorityAddress, granteeAddress);
          const msg = createMsgSubmitProposal([faucet.address0], [msgGrant]);
          const result = await client.signAndBroadcast(faucet.address0, [msg], defaultFee);
          assertIsDeliverTxSuccess(result);

          await sleep(75);
        }
      }
    });

    it("works for Grants", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const response = await client.foundation.grants(granteeAddress, "");
      expect(response.authorizations).toBeDefined();
      expect(response.authorizations).not.toBeNull();
      expect(response.authorizations.length).toEqual(1);

      tmClient.disconnect();
    });

    it("works for withdrawFromTreasury Grant", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);
      const beforeAmount = await client.foundation.treasury();

      // proposal withdrawFromTreasury
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const signingFinschiaClient = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrl,
        wallet,
        defaultSigningClientOptions,
      );

      const sendAmount = coin(100, "cony");
      const msgWithdraw = createMsgWithdrawFromTreasury(authorityAddress, granteeAddress, [sendAmount]);
      const msg = createMsgSubmitProposal([faucet.address0], [msgWithdraw]);
      const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
      assertIsDeliverTxSuccess(result);

      await sleep(75);

      const afterAmount = await client.foundation.treasury();

      expect(coin(Decimal.fromAtomics(beforeAmount[0].amount, 18).toString(), "cony")).toEqual(
        addCoins(coin(Decimal.fromAtomics(afterAmount[0].amount, 18).toString(), "cony"), sendAmount),
      );

      tmClient.disconnect();
    });
  });

  describe("Members", () => {
    const addedMember = faucet.address1;
    beforeAll(async () => {
      if (simappEnabled()) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
          hdPaths: [makeLinkPath(0)],
          prefix: simapp.prefix,
        });
        const client = await SigningFinschiaClient.connectWithSigner(
          simapp.tendermintUrl,
          wallet,
          defaultSigningClientOptions,
        );

        const memberRequest: MemberRequest = {
          address: addedMember,
          remove: false,
          metadata: "for member add test",
        };
        const memberRequestMsg = createMsgUpdateMembers(authorityAddress, [memberRequest]);

        const msg = createMsgSubmitProposal([faucet.address0], [memberRequestMsg]);
        const result = await client.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        await sleep(75);
      }
    });

    it("works for Members", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const response = await client.foundation.members();
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(response.members.length).toEqual(2);

      tmClient.disconnect();
    });

    it("works for Member", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const response = await client.foundation.member(addedMember);
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(response?.address).toEqual(addedMember);

      tmClient.disconnect();
    });
  });

  describe("Proposal", () => {
    let proposalId: Long;
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

        const sendAmount = coin(100, "cony");
        const msgWithdraw = createMsgWithdrawFromTreasury(authorityAddress, faucet.address1, [sendAmount]);
        const msg = createMsgSubmitProposal([faucet.address0], [msgWithdraw]);
        const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        const parsedLogs = logs.parseRawLog(result.rawLog);
        proposalId = Long.fromString(
          JSON.parse(
            logs.findAttribute(parsedLogs, "lbm.foundation.v1.EventSubmitProposal", "proposal").value,
          ).id,
          true,
        );

        await sleep(75);
      }
    });

    it("works for proposals", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.proposals();
      const proposals = result.proposals;
      expect(proposals.find((proposal) => proposal.id.eq(proposalId))).not.toBeUndefined();

      tmClient.disconnect();
    });

    it("works for proposal", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.proposal(proposalId);
      expect(result).not.toBeUndefined();
      expect(result!.id).toEqual(proposalId);

      tmClient.disconnect();
    });
  });

  describe("Vote", () => {
    let proposalId: Long;
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

        const sendAmount = coin(100, "cony");
        const msgWithdraw = createMsgWithdrawFromTreasury(authorityAddress, faucet.address2, [sendAmount]);
        const msg = createMsgSubmitProposal([faucet.address0], [msgWithdraw]);
        const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        const parsedLogs = logs.parseRawLog(result.rawLog);
        proposalId = Long.fromString(
          JSON.parse(
            logs.findAttribute(parsedLogs, "lbm.foundation.v1.EventSubmitProposal", "proposal").value,
          ).id,
          true,
        );

        await sleep(75);
      }
    });

    it("works for votes", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.votes(proposalId);
      const votes = result.votes;
      expect(votes.find((vote) => vote.proposalId.eq(proposalId))).not.toBeUndefined();

      tmClient.disconnect();
    });

    it("works for vote", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.vote(proposalId, faucet.address0);
      expect(result).not.toBeUndefined();
      expect(result!.proposalId).toEqual(proposalId);

      tmClient.disconnect();
    });
  });

  describe("Tally Result", () => {
    let proposalId: Long;
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

        const sendAmount = coin(100, "cony");
        const msgWithdraw = createMsgWithdrawFromTreasury(authorityAddress, faucet.address3, [sendAmount]);
        const msg = createMsgSubmitProposal([faucet.address0], [msgWithdraw]);
        const result = await signingFinschiaClient.signAndBroadcast(faucet.address0, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);

        const parsedLogs = logs.parseRawLog(result.rawLog);
        proposalId = Long.fromString(
          JSON.parse(
            logs.findAttribute(parsedLogs, "lbm.foundation.v1.EventSubmitProposal", "proposal").value,
          ).id,
          true,
        );

        await sleep(75);
      }
    });

    it("work", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFoundation(simapp.tendermintUrl);

      const result = await client.foundation.tallyResult(proposalId);
      expect(result).not.toBeUndefined();
      expect(Decimal.fromAtomics(result!.yesCount, 18).toString()).toEqual("1");
      expect(result!.noCount).toEqual("0");

      tmClient.disconnect();
    });
  });
});
