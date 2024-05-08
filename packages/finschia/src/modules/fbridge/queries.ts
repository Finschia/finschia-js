import { Uint64 } from "@cosmjs/math";
import { createPagination, createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Params, RoleProposal, Vote } from "@finschia/finschia-proto/lbm/fbridge/v1/fbridge";
import {
  QueryBridgeStatusResponse,
  QueryClientImpl,
  QueryProposalsResponse,
} from "@finschia/finschia-proto/lbm/fbridge/v1/query";
import Long from "long";

import { getLastLineOfError, longify } from "../../utils";

export type FbridgeProposalId = string | number | Long | Uint64;

export interface FbridgeExtension {
  readonly fbridge: {
    readonly params: () => Promise<Params | undefined>;
    readonly nextSeqSend: () => Promise<Long>;
    readonly seqToBlocknums: (seqs: (string | number | Long | Uint64)[]) => Promise<Long[]>;
    /** the role name (guardian, operator, judge) */
    readonly members: (role: string) => Promise<string[]>;
    readonly member: (address: string) => Promise<string | undefined>;
    readonly proposals: (paginationKey?: Uint8Array) => Promise<QueryProposalsResponse>;
    readonly proposal: (proposalId: FbridgeProposalId) => Promise<RoleProposal | undefined>;
    readonly votes: (proposalId: FbridgeProposalId) => Promise<Vote[]>;
    readonly vote: (proposalId: FbridgeProposalId, voter: string) => Promise<Vote | undefined>;
    readonly bridgeStatus: () => Promise<QueryBridgeStatusResponse>;
  };
}

export function setupFbridgeExtension(base: QueryClient): FbridgeExtension {
  const rpc = createProtobufRpcClient(base);

  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    fbridge: {
      params: async () => {
        const response = await queryService.Params({});
        return response.params;
      },
      nextSeqSend: async () => {
        const response = await queryService.NextSeqSend({});
        return response.seq;
      },
      seqToBlocknums: async (seqs: (string | number | Long | Uint64)[]) => {
        const response = await queryService.SeqToBlocknums({ seqs: seqs.map((item) => longify(item)) });
        return response.blocknums;
      },
      members: async (role: string) => {
        const response = await queryService.Members({ role: role });
        return response.members;
      },
      member: async (address: string) => {
        try {
          const response = await queryService.Member({ address: address });
          return response.role;
        } catch (e) {
          if (e instanceof Error) {
            if (getLastLineOfError(e).includes("role not found")) {
              return undefined;
            }
          }
          throw e;
        }
      },
      proposals: async (paginationKey?: Uint8Array) => {
        return await queryService.Proposals({ pagination: createPagination(paginationKey) });
      },
      proposal: async (proposalId: FbridgeProposalId) => {
        try {
          const response = await queryService.Proposal({ proposalId: longify(proposalId) });
          return response.proposal;
        } catch (e) {
          if (e instanceof Error) {
            if (getLastLineOfError(e).includes("key not found")) {
              return undefined;
            }
          }
          throw e;
        }
      },
      votes: async (proposalId: FbridgeProposalId) => {
        const response = await queryService.Votes({ proposalId: longify(proposalId) });
        return response.votes;
      },
      vote: async (proposalId: FbridgeProposalId, voter: string) => {
        try {
          const response = await queryService.Vote({ proposalId: longify(proposalId), voter: voter });
          return response.vote;
        } catch (e) {
          if (e instanceof Error) {
            if (getLastLineOfError(e).includes("key not found")) {
              return undefined;
            }
          }
          throw e;
        }
      },
      bridgeStatus: async () => {
        return await queryService.BridgeStatus({});
      },
    },
  };
}
