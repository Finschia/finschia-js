/* eslint-disable @typescript-eslint/naming-convention */
import {
  QueryAllowanceResponse,
  QueryAllowancesResponse,
  QueryClientImpl,
} from "lbmjs-types/cosmos/feegrant/v1beta1/query";

import { createPagination, createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface FeeGrantExtension {
  readonly feegrant: {
    readonly allowance: (granter: string, grantee: string) => Promise<QueryAllowanceResponse>;
    readonly allowances: (grantee: string, paginationKey?: Uint8Array) => Promise<QueryAllowancesResponse>;
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
    },
  };
}
