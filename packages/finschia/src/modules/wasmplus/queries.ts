import { createPagination, createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import {
  QueryClientImpl,
  QueryInactiveContractResponse,
  QueryInactiveContractsResponse,
} from "@finschia/finschia-proto/lbm/wasm/v1/query";

export interface WasmplusExtension {
  readonly wasmplus: {
    readonly getInactiveContract: (address: string) => Promise<QueryInactiveContractResponse>;
    readonly getInactiveContracts: (paginationKey?: Uint8Array) => Promise<QueryInactiveContractsResponse>;
  };
}

export function setupWasmplusExtension(base: QueryClient): WasmplusExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    wasmplus: {
      getInactiveContract: async (address: string) => {
        const request = { address: address };
        return queryService.InactiveContract(request);
      },
      getInactiveContracts: async (paginationKey?: Uint8Array) => {
        const request = { pagination: createPagination(paginationKey) };
        return queryService.InactiveContracts(request);
      },
    },
  };
}
