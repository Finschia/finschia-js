import { assert } from "@cosmjs/utils";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Coin, Contract, Grant, NFT, TokenType } from "lbmjs-types/lbm/collection/v1/collection";
import { QueryClientImpl } from "lbmjs-types/lbm/collection/v1/query";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface CollectionExtension {
  readonly collection: {
    readonly balance: (contractId: string, address: string, tokenId: string) => Promise<Coin>;
    readonly allBalances: (contractId: string, address: string) => Promise<Coin[]>; // Since 0.46.0
    readonly ftSupply: (contractId: string, tokenId: string) => Promise<string>;
    readonly ftMinted: (contractId: string, tokenId: string) => Promise<string>;
    readonly ftBurnt: (contractId: string, tokenId: string) => Promise<string>;
    readonly nftSupply: (contractId: string, tokenType: string) => Promise<string>;
    readonly nftMinted: (contractId: string, tokenType: string) => Promise<string>;
    readonly nftBurnt: (contractId: string, tokenType: string) => Promise<string>;
    readonly contract: (contractId: string) => Promise<Contract>;
    readonly tokenType: (contractId: string, tokenType: string) => Promise<TokenType>;
    readonly tokenTypes: (contractId: string) => Promise<TokenType[]>;
    readonly token: (contractId: string, tokenId: string) => Promise<Any>;
    readonly tokensWithTokenType: (contractId: string, tokenType: string) => Promise<Any[]>;
    readonly tokens: (contractId: string) => Promise<Any[]>;
    readonly root: (contractId: string, tokenId: string) => Promise<NFT>;
    readonly parent: (contractId: string, tokenId: string) => Promise<NFT>;
    readonly children: (contractId: string, tokenId: string) => Promise<NFT[]>;
    readonly granteeGrants: (contractId: string, grantee: string) => Promise<Grant[]>; // Since 0.46.0
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
      allBalances: async (contractId: string, address: string) => {
        const { balances } = await queryService.AllBalances({ contractId: contractId, address: address });
        assert(balances);
        return balances;
      },
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
        // let ret: FT | NFT | null;
        // if (token.typeUrl == "/lbm.collection.v1.FT") {
        //   ret = FT.decode(token.value);
        // } else if (token.typeUrl == "/lbm.collection.v1.NFT") {
        //   ret = NFT.decode(token.value);
        // }
        return token;
      },
      tokensWithTokenType: async (contractId: string, tokenType: string) => {
        const { tokens } = await queryService.TokensWithTokenType({
          contractId: contractId,
          tokenType: tokenType,
        });
        return tokens;
      },
      tokens: async (contractId: string) => {
        const { tokens } = await queryService.Tokens({ contractId: contractId });
        return tokens;
      },
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
      granteeGrants: async (contractId: string, grantee: string) => {
        const { grants } = await queryService.GranteeGrants({ contractId: contractId, grantee: grantee });
        return grants;
      },
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
