import { assert } from "@cosmjs/utils";
import { QueryClientImpl } from "lbmjs-types/lbm/token/v1/query";
import { Grant, TokenClass } from "lbmjs-types/lbm/token/v1/token";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface TokenExtension {
  readonly token: {
    readonly balance: (contractId: string, address: string) => Promise<string>;
    readonly supply: (contractId: string) => Promise<string>;
    readonly minted: (contractId: string) => Promise<string>;
    readonly burnt: (contractId: string) => Promise<string>;
    readonly tokenClass: (contractId: string) => Promise<TokenClass>;
    readonly tokenClasses: () => Promise<TokenClass[]>;
    readonly granteeGrants: (contractId: string, grantee: string) => Promise<Grant[]>;
    readonly approved: (contractId: string, address: string, approver: string) => Promise<boolean>;
    readonly approvers: (contractId: string, address: string) => Promise<string[]>;
  };
}

export function setupTokenExtension(base: QueryClient): TokenExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    token: {
      balance: async (contractId: string, address: string) => {
        const { amount } = await queryService.Balance({ contractId: contractId, address: address });
        assert(amount);
        return amount;
      },
      supply: async (contractId: string) => {
        const { amount } = await queryService.Supply({ contractId: contractId });
        assert(amount);
        return amount;
      },
      minted: async (contractId: string) => {
        const { amount } = await queryService.Minted({ contractId: contractId });
        assert(amount);
        return amount;
      },
      burnt: async (contractId: string) => {
        const { amount } = await queryService.Burnt({ contractId: contractId });
        assert(amount);
        return amount;
      },
      tokenClass: async (contractId: string) => {
        const { class: cls } = await queryService.TokenClass({ contractId: contractId });
        assert(cls);
        return cls;
      },
      tokenClasses: async () => {
        const { classes } = await queryService.TokenClasses({ pagination: undefined });
        return classes;
      },
      granteeGrants: async (contractId: string, grantee: string) => {
        const { grants } = await queryService.GranteeGrants({ contractId: contractId, grantee: grantee });
        return grants;
      },
      approved: async (contractId: string, address: string, approver: string) => {
        const { approved } = await queryService.Approved({
          contractId: contractId,
          proxy: address,
          approver: approver,
        });
        return approved;
      },
      approvers: async (contractId: string, address: string) => {
        const { approvers } = await queryService.Approvers({ contractId: contractId, address: address });
        return approvers;
      },
    },
  };
}
