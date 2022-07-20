import { assert } from "@cosmjs/utils";
import { QueryClientImpl } from "lbmjs-types/lbm/token/v1/query";
import { Authorization, Grant, Permission, TokenClass } from "lbmjs-types/lbm/token/v1/token";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface TokenExtension {
  readonly token: {
    readonly balance: (contractId: string, address: string) => Promise<string>;
    readonly supply: (contractId: string) => Promise<string>;
    readonly minted: (contractId: string) => Promise<string>;
    readonly burnt: (contractId: string) => Promise<string>;
    readonly tokenClass: (contractId: string) => Promise<TokenClass>;
    readonly tokenClasses: () => Promise<TokenClass[]>;
    readonly grant: (contractId: string, grantee: string, permission: Permission) => Promise<Grant>;
    readonly granteeGrants: (contractId: string, grantee: string) => Promise<Grant[]>;
    readonly authorization: (contractId: string, operator: string, holder: string) => Promise<Authorization>;
    readonly operatorAuthorizations: (contractId: string, operator: string) => Promise<Authorization[]>;
    readonly approved: (contractId: string, address: string, approver: string) => Promise<boolean>;
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
      grant: async (contractId: string, grantee: string, permission: Permission) => {
        const { grant } = await queryService.Grant({
          contractId: contractId,
          grantee: grantee,
          permission: permission,
        });
        assert(grant);
        return grant;
      },
      granteeGrants: async (contractId: string, grantee: string) => {
        const { grants } = await queryService.GranteeGrants({ contractId: contractId, grantee: grantee });
        return grants;
      },
      authorization: async (contractId: string, operator: string, holder: string) => {
        const { authorization } = await queryService.Authorization({
          contractId: contractId,
          operator: operator,
          holder: holder,
        });
        assert(authorization);
        return authorization;
      },
      operatorAuthorizations: async (contractId: string, operator: string) => {
        const { authorizations } = await queryService.OperatorAuthorizations({
          contractId: contractId,
          operator: operator,
        });
        return authorizations;
      },
      approved: async (contractId: string, address: string, approver: string) => {
        const { approved } = await queryService.Approved({
          contractId: contractId,
          address: address,
          approver: approver,
        });
        return approved;
      },
    },
  };
}
