import { assert } from "@cosmjs/utils";
import { QueryClientImpl } from "lbmjs-types/lbm/token/v1/query";
import { Approve, Grant, Token } from "lbmjs-types/lbm/token/v1/token";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface TokenExtension {
  readonly token: {
    readonly balance: (classId: string, address: string) => Promise<string>;
    readonly supply: (classId: string, type: string) => Promise<string>;
    readonly token: (classId: string) => Promise<Token>;
    readonly tokens: () => Promise<Token[]>;
    readonly grants: (classId: string, grantee: string) => Promise<Grant[]>;
    readonly approve: (classId: string, proxy: string, approver: string) => Promise<Approve>;
    readonly approves: (classId: string, proxy: string) => Promise<Approve[]>;
  };
}

export function setupTokenExtension(base: QueryClient): TokenExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    token: {
      balance: async (classId: string, address: string) => {
        const { amount } = await queryService.Balance({ classId: classId, address: address });
        assert(amount);
        return amount;
      },
      supply: async (classId: string, type: string) => {
        const { amount } = await queryService.Supply({ classId: classId, type: type });
        assert(amount);
        return amount;
      },
      token: async (classId: string) => {
        const { token } = await queryService.Token({ classId: classId });
        assert(token);
        return token;
      },
      tokens: async () => {
        const { tokens } = await queryService.Tokens({ pagination: undefined });
        return tokens;
      },
      grants: async (classId: string, grantee: string) => {
        const { grants } = await queryService.Grants({ classId: classId, grantee: grantee });
        return grants;
      },
      approve: async (classId: string, proxy: string, approver: string) => {
        const { approve } = await queryService.Approve({
          classId: classId,
          proxy: proxy,
          approver: approver,
        });
        assert(approve);
        return approve;
      },
      approves: async (classId: string, proxy: string) => {
        const { approves } = await queryService.Approves({ classId: classId, proxy: proxy });
        return approves;
      },
    },
  };
}
