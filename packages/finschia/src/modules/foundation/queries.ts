import { Uint64 } from "@cosmjs/math";
import { createPagination, createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import {
  FoundationInfo,
  Member,
  Params,
  Proposal,
  TallyResult,
  Vote,
} from "lbmjs-types/lbm/foundation/v1/foundation";
import {
  QueryClientImpl,
  QueryGrantsResponse,
  QueryMembersResponse,
  QueryProposalsResponse,
  QueryVotesResponse,
} from "lbmjs-types/lbm/foundation/v1/query";

import { longify } from "../../utils";

export type FoundationProposalId = string | number | Long | Uint64;

export interface FoundationExtension {
  readonly foundation: {
    readonly params: () => Promise<Params | undefined>;
    readonly treasury: () => Promise<Coin[]>;
    readonly foundationInfo: () => Promise<FoundationInfo | undefined>;
    readonly member: (address: string) => Promise<Member | undefined>;
    readonly members: (paginationKey?: Uint8Array) => Promise<QueryMembersResponse>;
    readonly proposal: (proposalId: FoundationProposalId) => Promise<Proposal | undefined>;
    readonly proposals: (paginationKey?: Uint8Array) => Promise<QueryProposalsResponse>;
    readonly vote: (proposalId: FoundationProposalId, voter: string) => Promise<Vote | undefined>;
    readonly votes: (
      proposalId: FoundationProposalId,
      paginationKey?: Uint8Array,
    ) => Promise<QueryVotesResponse>;
    readonly tallyResult: (proposalId: FoundationProposalId) => Promise<TallyResult | undefined>;
    readonly grants: (
      grantee: string,
      msgTypeUrl: string,
      paginationKey?: Uint8Array,
    ) => Promise<QueryGrantsResponse>;
  };
}

export function setupFoundationExtension(base: QueryClient): FoundationExtension {
  const rpc = createProtobufRpcClient(base);

  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    foundation: {
      params: async () => {
        const response = await queryService.Params({});
        return response.params;
      },
      treasury: async () => {
        const response = await queryService.Treasury({});
        return response.amount;
      },
      foundationInfo: async () => {
        const response = await queryService.FoundationInfo({});
        return response.info;
      },
      member: async (address: string) => {
        const response = await queryService.Member({ address: address });
        return response.member;
      },
      members: async (paginationKey?: Uint8Array) => {
        return await queryService.Members({ pagination: createPagination(paginationKey) });
      },
      proposal: async (proposalId: FoundationProposalId) => {
        const response = await queryService.Proposal({ proposalId: longify(proposalId) });
        return response.proposal;
      },
      proposals: async (paginationKey?: Uint8Array) => {
        return await queryService.Proposals({ pagination: createPagination(paginationKey) });
      },
      vote: async (proposalId: FoundationProposalId, voter: string) => {
        const response = await queryService.Vote({ proposalId: longify(proposalId), voter: voter });
        return response.vote;
      },
      votes: async (proposalId: FoundationProposalId, paginationKey?: Uint8Array) => {
        return await queryService.Votes({
          proposalId: longify(proposalId),
          pagination: createPagination(paginationKey),
        });
      },
      tallyResult: async (proposalId: FoundationProposalId) => {
        const response = await queryService.TallyResult({ proposalId: longify(proposalId) });
        return response.tally;
      },
      grants: async (grantee: string, msgTypeUrl: string, paginationKey?: Uint8Array) => {
        return await queryService.Grants({
          grantee: grantee,
          msgTypeUrl: msgTypeUrl,
          pagination: createPagination(paginationKey),
        });
      },
    },
  };
}
