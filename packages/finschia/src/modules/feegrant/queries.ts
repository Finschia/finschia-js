/* eslint-disable @typescript-eslint/naming-convention */
import { createPagination, createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import {
  QueryAllowancesByGranterResponse,
  QueryClientImpl,
} from "@finschia/finschia-proto/cosmos/feegrant/v1beta1/query";
import { QueryAllowanceResponse, QueryAllowancesResponse } from "cosmjs-types/cosmos/feegrant/v1beta1/query";

export interface FeeGrantExtension {
  readonly feegrant: {
    readonly allowance: (granter: string, grantee: string) => Promise<QueryAllowanceResponse>;
    readonly allowances: (grantee: string, paginationKey?: Uint8Array) => Promise<QueryAllowancesResponse>;
    readonly allowancesByGranter: (
      granter: string,
      paginationKey?: Uint8Array,
    ) => Promise<QueryAllowancesByGranterResponse>;
  };
}

export function setupFeeGrantExtension(base: QueryClient): FeeGrantExtension {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);

  return {
    feegrant: {
      allowance: async (granter: string, grantee: string) => {
        return await queryService.Allowance({ granter: granter, grantee: grantee });
      },
      allowances: async (grantee: string, paginationKey?: Uint8Array) => {
        return await queryService.Allowances({
          grantee: grantee,
          pagination: createPagination(paginationKey),
        });
      },
      allowancesByGranter: async (granter: string, paginationKey?: Uint8Array) => {
        return await queryService.AllowancesByGranter({
          granter,
          pagination: createPagination(paginationKey),
        });
      },
    },
  };
}
