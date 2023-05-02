import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { QueryClientImpl } from "@finschia/finschia-proto/lbm/token/v1/query";
import { Contract, Grant } from "@finschia/finschia-proto/lbm/token/v1/token";

export interface TokenExtension {
  readonly token: {
    readonly balance: (contractId: string, address: string) => Promise<string>;
    readonly supply: (contractId: string) => Promise<string>;
    readonly minted: (contractId: string) => Promise<string>;
    readonly burnt: (contractId: string) => Promise<string>;
    readonly contract: (contractId: string) => Promise<Contract>;
    readonly granteeGrants: (contractId: string, grantee: string) => Promise<Grant[]>;
    readonly isOperatorFor: (contractId: string, operator: string, holder: string) => Promise<boolean>;
    readonly holdersByOperator: (contractId: string, address: string) => Promise<string[]>;
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
      contract: async (contractId: string) => {
        const { contract } = await queryService.Contract({ contractId: contractId });
        assert(contract);
        return contract;
      },
      granteeGrants: async (contractId: string, grantee: string) => {
        const { grants } = await queryService.GranteeGrants({ contractId: contractId, grantee: grantee });
        return grants;
      },
      isOperatorFor: async (contractId: string, operator: string, holder: string) => {
        const { authorized } = await queryService.IsOperatorFor({
          contractId,
          operator,
          holder,
        });
        return authorized;
      },
      holdersByOperator: async (contractId: string, operator: string) => {
        const { holders } = await queryService.HoldersByOperator({
          contractId,
          operator,
        });
        return holders;
      },
    },
  };
}
