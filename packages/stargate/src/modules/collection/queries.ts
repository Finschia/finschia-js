import { assert } from "@cosmjs/utils";
import { Any } from "cosmjs-types/google/protobuf/any";
import {
  Authorization,
  Coin,
  Contract,
  FTClass,
  Grant,
  NFT,
  NFTClass,
  Permission,
  TokenType,
} from "lbmjs-types/lbm/collection/v1/collection";
import { QueryClientImpl } from "lbmjs-types/lbm/collection/v1/query";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface CollectionExtension {
  readonly collection: {
    readonly balance: (contractId: string, address: string, tokenId: string) => Promise<Coin>;
    // readonly allBalances: (contractId: string, address: string) => Promise<Coin[]>; // Since 0.46.0
    // readonly supply: (contractId: string, classId: string) => Promise<string>; // Since 0.46.0
    // readonly minted: (contractId: string, classId: string) => Promise<string>; // Since 0.46.0
    // readonly burnt: (contractId: string, classId: string) => Promise<string>; // Since 0.46.0
    readonly ftSupply: (contractId: string, tokenId: string) => Promise<string>;
    readonly ftMinted: (contractId: string, tokenId: string) => Promise<string>;
    readonly ftBurnt: (contractId: string, tokenId: string) => Promise<string>;
    readonly nftSupply: (contractId: string, tokenType: string) => Promise<string>;
    readonly nftMinted: (contractId: string, tokenType: string) => Promise<string>;
    readonly nftBurnt: (contractId: string, tokenType: string) => Promise<string>;
    readonly contract: (contractId: string) => Promise<Contract>;
    // readonly contracts: () => Promise<Contract[]>; // Since 0.46.0
    // readonly ftClass: (contractId: string, classId: string) => Promise<FTClass>; // Since 0.46.0
    // readonly nftClass: (contractId: string, classId: string) => Promise<NFTClass>; // Since 0.46.0
    // readonly tokenClassTypeName: (contractId: string, classId: string) => Promise<string>; // Since 0.46.0
    readonly tokenType: (contractId: string, tokenType: string) => Promise<TokenType>;
    readonly tokenTypes: (contractId: string) => Promise<TokenType[]>;
    readonly token: (contractId: string, tokenId: string) => Promise<Any>;
    readonly tokens: (contractId: string) => Promise<Any[]>;
    // readonly nft: (contractId: string, tokenId: string) => Promise<NFT>; // Since 0.46.0
    // readonly owner: (contractId: string, tokenId: string) => Promise<string>; // Since 0.46.0
    readonly root: (contractId: string, tokenId: string) => Promise<NFT>;
    readonly parent: (contractId: string, tokenId: string) => Promise<NFT>;
    readonly children: (contractId: string, tokenId: string) => Promise<NFT[]>;
    // readonly grant: (contractId: string, grantee: string, permission: Permission) => Promise<Grant>; // Since 0.46.0
    // readonly granteeGrants: (contractId: string, grantee: string) => Promise<Grant[]>; // Since 0.46.0
    // readonly authorization: (contractId: string, operator: string, holder: string) => Promise<Authorization>; // Since 0.46.0
    // readonly operatorAuthorizations: (contractId: string, operator: string) => Promise<Authorization[]>; // Since 0.46.0
    readonly approved: (contractId: string, address: string, approver: string) => Promise<boolean>;
    readonly approvers: (contractId: string, address: string) => Promise<string[]>;
  };
}

export function setupCollectionExtension(base: QueryClient): CollectionExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);

  return {
    collection: {
      balance: async (contractId: string, address: string, tokenId: string) => {
        const { balance } = await queryService.Balance({
          contractId: contractId,
          address: address,
          tokenId: tokenId,
        });
        assert(balance);
        return balance;
      },
      // allBalances: async (contractId: string, address: string) => {
      //   const { balances } = await queryService.AllBalances({ contractId: contractId, address: address });
      //   assert(balances);
      //   return balances;
      // },
      // supply: async (contractId: string, classId: string) => {
      //   const { supply } = await queryService.Supply({ contractId: contractId, classId: classId });
      //   assert(supply);
      //   return supply;
      // },
      // minted: async (contractId: string, classId: string) => {
      //   const { minted } = await queryService.Minted({ contractId: contractId, classId: classId });
      //   assert(minted);
      //   return minted;
      // },
      // burnt: async (contractId: string, classId: string) => {
      //   const { burnt } = await queryService.Burnt({ contractId: contractId, classId: classId });
      //   assert(burnt);
      //   return burnt;
      // },
      ftSupply: async (contractId: string, tokenId: string) => {
        const { supply } = await queryService.FTSupply({ contractId: contractId, tokenId: tokenId });
        assert(supply);
        return supply;
      },
      ftMinted: async (contractId: string, tokenId: string) => {
        const { minted } = await queryService.FTMinted({ contractId: contractId, tokenId: tokenId });
        assert(minted);
        return minted;
      },
      ftBurnt: async (contractId: string, tokenId: string) => {
        const { burnt } = await queryService.FTBurnt({ contractId: contractId, tokenId: tokenId });
        assert(burnt);
        return burnt;
      },
      nftSupply: async (contractId: string, tokenType: string) => {
        const { supply } = await queryService.NFTSupply({ contractId: contractId, tokenType: tokenType });
        assert(supply);
        return supply;
      },
      nftMinted: async (contractId: string, tokenType: string) => {
        const { minted } = await queryService.NFTMinted({ contractId: contractId, tokenType: tokenType });
        assert(minted);
        return minted;
      },
      nftBurnt: async (contractId: string, tokenType: string) => {
        const { burnt } = await queryService.NFTBurnt({ contractId: contractId, tokenType: tokenType });
        assert(burnt);
        return burnt;
      },
      contract: async (contractId: string) => {
        const { contract } = await queryService.Contract({ contractId: contractId });
        assert(contract);
        return contract;
      },
      // contracts: async () => {
      //   const { contracts } = await queryService.Contracts({});
      //   return contracts;
      // },
      // ftClass: async (contractId: string, classId: string) => {
      //   const ftClass = await queryService.FTClass({ contractId: contractId, classId: classId });
      //   assert(ftClass);
      //   assert(ftClass.class);
      //   return ftClass.class;
      // },
      // nftClass: async (contractId: string, classId: string) => {
      //   const nftClass = await queryService.NFTClass({ contractId: contractId, classId: classId });
      //   assert(nftClass);
      //   assert(nftClass.class);
      //   return nftClass.class;
      // },
      // tokenClassTypeName: async (contractId: string, classId: string) => {
      //   const { name } = await queryService.TokenClassTypeName({ contractId: contractId, classId: classId });
      //   return name;
      // },
      tokenType: async (contractId: string, sTokenType: string) => {
        const { tokenType } = await queryService.TokenType({ contractId: contractId, tokenType: sTokenType });
        assert(tokenType);
        return tokenType;
      },
      tokenTypes: async (contractId: string) => {
        const { tokenTypes } = await queryService.TokenTypes({ contractId: contractId });
        return tokenTypes;
      },
      token: async (contractId: string, tokenId: string) => {
        const { token } = await queryService.Token({ contractId: contractId, tokenId: tokenId });
        assert(token);
        return token;
      },
      tokens: async (contractId: string) => {
        const { tokens } = await queryService.Tokens({ contractId: contractId });
        return tokens;
      },
      // nft: async (contractId: string, tokenId: string) => {
      //   const { token } = await queryService.NFT({ contractId: contractId, tokenId: tokenId });
      //   assert(token);
      //   return token;
      // },
      // owner: async (contractId: string, tokenId: string) => {
      //   const { owner } = await queryService.Owner({ contractId: contractId, tokenId: tokenId });
      //   return owner;
      // },
      root: async (contractId: string, tokenId: string) => {
        const { root } = await queryService.Root({ contractId: contractId, tokenId: tokenId });
        assert(root);
        return root;
      },
      parent: async (contractId: string, tokenId: string) => {
        const { parent } = await queryService.Parent({ contractId: contractId, tokenId: tokenId });
        assert(parent);
        return parent;
      },
      children: async (contractId: string, tokenId: string) => {
        const { children } = await queryService.Children({ contractId: contractId, tokenId: tokenId });
        return children;
      },
      // grant: async (contractId: string, grantee: string, permission: Permission) => {
      //   const { grant } = await queryService.Grant({
      //     contractId: contractId,
      //     grantee: grantee,
      //     permission: permission,
      //   });
      //   assert(grant);
      //   return grant;
      // },
      // granteeGrants: async (contractId: string, grantee: string) => {
      //   const { grants } = await queryService.GranteeGrants({ contractId: contractId, grantee: grantee });
      //   return grants;
      // },
      // authorization: async (contractId: string, operator: string, holder: string) => {
      //   const { authorization } = await queryService.Authorization({
      //     contractId: contractId,
      //     operator: operator,
      //     holder: holder,
      //   });
      //   assert(authorization);
      //   return authorization;
      // },
      // operatorAuthorizations: async (contractId: string, operator: string) => {
      //   const { authorizations } = await queryService.OperatorAuthorizations({
      //     contractId: contractId,
      //     operator: operator,
      //   });
      //   return authorizations;
      // },
      approved: async (contractId: string, address: string, approver: string) => {
        const { approved } = await queryService.Approved({
          contractId: contractId,
          address: address,
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
