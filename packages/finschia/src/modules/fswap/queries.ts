import { createPagination, createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import {
  QueryClientImpl,
  QuerySwappedResponse,
  QuerySwapsResponse,
} from "@finschia/finschia-proto/lbm/fswap/v1/query";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Swap } from "@finschia/finschia-proto/lbm/fswap/v1/fswap";

export interface FswapExtension {
  readonly fswap: {
    readonly swapped: (fromDenom: string, toDenom: string) => Promise<QuerySwappedResponse>;
    readonly totalSwappableToCoinAmount: (fromDenom: string, toDenom: string) => Promise<Coin | undefined>;
    readonly swaps: (paginationKey?: Uint8Array) => Promise<QuerySwapsResponse>;
    readonly swap: (fromDenom: string, toDenom: string) => Promise<Swap | undefined>;
  };
}

export function setupFswapExtension(base: QueryClient): FswapExtension {
  const rpc = createProtobufRpcClient(base);

  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    fswap: {
      swapped: async (fromDenom: string, toDenom: string) => {
        return await queryService.Swapped({ fromDenom: fromDenom, toDenom: toDenom });
      },
      totalSwappableToCoinAmount: async (fromDenom: string, toDenom: string) => {
        const response = await queryService.TotalSwappableToCoinAmount({
          fromDenom: fromDenom,
          toDenom: toDenom,
        });
        return response.swappableAmount;
      },
      swaps: async (paginationKey?: Uint8Array) => {
        return await queryService.Swaps({ pagination: createPagination(paginationKey) });
      },
      swap: async (fromDenom: string, toDenom: string) => {
        const resp = await queryService.Swap({ fromDenom: fromDenom, toDenom: toDenom });
        return resp.swap;
      },
    },
  };
}
