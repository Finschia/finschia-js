/* eslint-disable @typescript-eslint/naming-convention */
import { coins } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsDeliverTxSuccess, logs, QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { assert } from "@cosmjs/utils";
import {
  BridgeStatus,
  bridgeStatusFromJSON,
  BridgeStatusMetadata,
  Params,
  Role,
  Vote,
  VoteOption,
} from "@finschia/finschia-proto/lbm/fbridge/v1/fbridge";

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
import {
  MsgAddVoteForRoleEncodeObject,
  MsgSetBridgeStatusEncodeObject,
  MsgSuggestRoleEncodeObject,
} from "./messages";
import { FbridgeExtension, setupFbridgeExtension } from "./queries";

export async function makeClientWithFbridge(
  rpcUrl: string,
): Promise<[QueryClient & FbridgeExtension, Tendermint34Client]> {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return [QueryClient.withExtensions(tmClient, setupFbridgeExtension), tmClient];
}

describe("FswapExtension", () => {
  const defaultFee = {
    amount: coins(250000, "cony"),
    gas: "1500000", // 1.5 million
  };

  const guardian = faucet.address3;
  const targetGuardian = faucet.address2;
  const targetGuardian2 = makeRandomAddress();

  let firstProposalId: string | undefined;
  let secondProposalId: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0), makeLinkPath(2), makeLinkPath(3)],
        prefix: simapp.prefix,
      });
      const client = await SigningFinschiaClient.connectWithSigner(
        simapp.tendermintUrlHttp,
        wallet,
        defaultSigningClientOptions,
      );

      // MsgSuggestRole
      {
        const roleMsg: MsgSuggestRoleEncodeObject = {
          typeUrl: "/lbm.fbridge.v1.MsgSuggestRole",
          value: {
            from: guardian,
            target: targetGuardian,
            role: Role.GUARDIAN,
          },
        };
        const result = await client.signAndBroadcast(guardian, [roleMsg], defaultFee);
        assertIsDeliverTxSuccess(result);

        // parse proposalId
        const parsedLogs = logs.parseRawLog(result.rawLog);
        const proposalValue = logs.findAttribute(
          parsedLogs,
          "lbm.fbridge.v1.EventSuggestRole",
          "proposal",
        ).value;
        firstProposalId = JSON.parse(proposalValue).id;
        assert(firstProposalId, "Missing proposal Id");
      }

      // MsgAddVoteForRole
      {
        const voteMsg: MsgAddVoteForRoleEncodeObject = {
          typeUrl: "/lbm.fbridge.v1.MsgAddVoteForRole",
          value: {
            from: guardian,
            proposalId: longify(firstProposalId),
            option: VoteOption.VOTE_OPTION_YES,
          },
        };
        const result = await client.signAndBroadcast(guardian, [voteMsg], defaultFee);
        assertIsDeliverTxSuccess(result);
      }

      // MsgSuggestRole (second) - for proposals and proposal query (since above proposal was deleted after confirmed)
      {
        const roleMsg: MsgSuggestRoleEncodeObject = {
          typeUrl: "/lbm.fbridge.v1.MsgSuggestRole",
          value: {
            from: guardian,
            target: targetGuardian2,
            role: Role.GUARDIAN,
          },
        };
        const result = await client.signAndBroadcast(guardian, [roleMsg], defaultFee);
        assertIsDeliverTxSuccess(result);

        // parse proposalId
        const parsedLogs = logs.parseRawLog(result.rawLog);
        const proposalValue = logs.findAttribute(
          parsedLogs,
          "lbm.fbridge.v1.EventSuggestRole",
          "proposal",
        ).value;
        secondProposalId = JSON.parse(proposalValue).id;
        assert(secondProposalId, "Missing proposal Id");
      }

      // MsgSetBridgeStatus
      {
        const msg: MsgSetBridgeStatusEncodeObject = {
          typeUrl: "/lbm.fbridge.v1.MsgSetBridgeStatus",
          value: {
            guardian: targetGuardian,
            status: BridgeStatus.BRIDGE_STATUS_INACTIVE,
          },
        };
        const result = await client.signAndBroadcast(targetGuardian, [msg], defaultFee);
        assertIsDeliverTxSuccess(result);
      }
    }
  });

  describe("query", () => {
    it("params", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const params = await client.fbridge.params();
      const expected: Params = {
        operatorTrustLevel: { numerator: longify(2), denominator: longify(3) },
        guardianTrustLevel: { numerator: longify(2), denominator: longify(3) },
        judgeTrustLevel: { numerator: longify(1), denominator: longify(1) },
        timelockPeriod: longify(86400000000000),
        proposalPeriod: longify(3600000000000),
        targetDenom: "pdt",
      };
      expect(params).toEqual(expected);

      tmClient.disconnect();
    });

    it("nextSeqSend", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const seq = await client.fbridge.nextSeqSend();
      expect(seq.toNumber()).toEqual(1);

      tmClient.disconnect();
    });

    it("seqToBlocknums", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      try {
        const blocks = await client.fbridge.seqToBlocknums([1, 2]);
        expect(blocks).toEqual([longify(1)]);
        expect(blocks.map((item) => item.toNumber())).toEqual([1]);
      } catch (e) {
        expect(e).withContext("sequence 1 not found: not found: invalid request");
      }

      tmClient.disconnect();
    });

    it("Members", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const guardians = await client.fbridge.members("guardian");
      expect(guardians).toEqual([guardian, targetGuardian]);

      const operators = await client.fbridge.members("operator");
      expect(operators).toEqual(["link1equ4n3uwyhapak5g3leq0avz85k0q6jcdy5w0f"]);

      const judges = await client.fbridge.members("judge");
      expect(judges).toEqual(["link14nvvrk4dz3k695t8740vqzjnvrwszwm69hw0ls"]);

      tmClient.disconnect();
    });

    it("member", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const role1 = await client.fbridge.member("link1dfyywjglcfptn72axxhsslpy8ep6wq7wujasma");
      expect(role1).toEqual("GUARDIAN");

      const role2 = await client.fbridge.member("link1equ4n3uwyhapak5g3leq0avz85k0q6jcdy5w0f");
      expect(role2).toEqual("OPERATOR");

      const role3 = await client.fbridge.member("link14nvvrk4dz3k695t8740vqzjnvrwszwm69hw0ls");
      expect(role3).toEqual("JUDGE");

      const role4 = await client.fbridge.member("link146asaycmtydq45kxc8evntqfgepagygelel00h");
      expect(role4).toBeUndefined();

      tmClient.disconnect();
    });

    it("proposals", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const response = await client.fbridge.proposals();
      expect(response.proposals.length == 1).toBeTrue();

      tmClient.disconnect();
    });

    it("proposal", async () => {
      pendingWithoutSimapp();
      assert(secondProposalId, "Missing proposalId");
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const response = await client.fbridge.proposal(secondProposalId);
      expect(response).toBeDefined();
      expect(response?.role).toEqual(Role.GUARDIAN);
      expect(response?.proposer).toEqual(guardian);
      expect(response?.target).toEqual(targetGuardian2);

      tmClient.disconnect();
    });

    it("votes", async () => {
      pendingWithoutSimapp();
      assert(firstProposalId, "Missing proposalId");
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const votes = await client.fbridge.votes(firstProposalId);
      const expectedVote: Vote = {
        proposalId: longify(firstProposalId),
        voter: guardian,
        option: VoteOption.VOTE_OPTION_YES,
      };
      expect(votes).toEqual([expectedVote]);

      tmClient.disconnect();
    });

    it("vote", async () => {
      pendingWithoutSimapp();
      assert(firstProposalId, "Missing proposalId");
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const voter = faucet.address0;
      const votes = await client.fbridge.vote(firstProposalId, voter);
      expect(votes).toBeUndefined();

      tmClient.disconnect();
    });

    it("bridgeStatus", async () => {
      pendingWithoutSimapp();
      const [client, tmClient] = await makeClientWithFbridge(simapp.tendermintUrl);

      const response = await client.fbridge.bridgeStatus();
      expect(response.status).toEqual(bridgeStatusFromJSON(1));
      const expected: BridgeStatusMetadata = {
        inactive: longify(1),
        active: longify(1),
      };
      expect(response.metadata).toEqual(expected);

      tmClient.disconnect();
    });
  });
});
