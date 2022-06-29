/* eslint-disable @typescript-eslint/naming-convention */
import {
  QueryAllEvidenceResponse,
  QueryClientImpl,
  QueryEvidenceResponse,
} from "lbmjs-types/cosmos/evidence/v1beta1/query";

import { createPagination, createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface EvidenceExtension {
  readonly evidence: {
    evidence: (evidenceHash: Uint8Array) => Promise<QueryEvidenceResponse>;
    allEvidence: (paginationKey?: Uint8Array) => Promise<QueryAllEvidenceResponse>;
  };
}

export function setupEvidenceExtension(base: QueryClient): EvidenceExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    evidence: {
      evidence: async (evidenceHash: Uint8Array) => {
        return await queryService.Evidence({ evidenceHash: evidenceHash });
      },
      allEvidence: async (paginationKey?: Uint8Array) => {
        return await queryService.AllEvidence({ pagination: createPagination(paginationKey) });
      },
    },
  };
}
