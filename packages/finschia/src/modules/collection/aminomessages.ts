import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { Attribute, Coin } from "lbmjs-types/lbm/collection/v1/collection";
import {
  MintNFTParam,
  MsgAttach,
  MsgAuthorizeOperator,
  MsgBurnFT,
  MsgBurnNFT,
  MsgCreateContract,
  MsgDetach,
  MsgGrantPermission,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintFT,
  MsgMintNFT,
  MsgModify,
  MsgOperatorAttach,
  MsgOperatorBurnFT,
  MsgOperatorBurnNFT,
  MsgOperatorDetach,
  MsgOperatorSendFT,
  MsgOperatorSendNFT,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSendFT,
  MsgSendNFT,
} from "lbmjs-types/lbm/collection/v1/tx";

export interface AminoMsgSendFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgSendFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /**
     * the amount of the transfer.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgSendFT(msg: AminoMsg): msg is AminoMsgSendFT {
  return msg.type === "lbm-sdk/MsgSendFT";
}

export interface AminoMsgOperatorSendFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorSendFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address of the operator. */
    readonly operator: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /**
     * the amount of the transfer.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgOperatorSendFT(msg: AminoMsg): msg is AminoMsgOperatorSendFT {
  return msg.type === "lbm-sdk/MsgOperatorSendFT";
}

export interface AminoMsgSendNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgSendNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /** the token ids to transfer. */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgSendNFT(msg: AminoMsg): msg is AminoMsgSendNFT {
  return msg.type === "lbm-sdk/MsgSendNFT";
}

export interface AminoMsgOperatorSendNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorSendNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address of the operator. */
    readonly operator: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /** the token ids to transfer. */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgOperatorSendNFT(msg: AminoMsg): msg is AminoMsgOperatorSendNFT {
  return msg.type === "lbm-sdk/MsgOperatorSendNFT";
}

export interface AminoMsgAuthorizeOperator extends AminoMsg {
  readonly type: "lbm-sdk/collection/MsgAuthorizeOperator";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the holder who allows the manipulation of its token. */
    readonly holder: string;
    /** address which the manipulation is allowed to. */
    readonly operator: string;
  };
}

export function isAminoMsgAuthorizeOperator(msg: AminoMsg): msg is AminoMsgAuthorizeOperator {
  return msg.type === "lbm-sdk/collection/MsgAuthorizeOperator";
}

export interface AminoMsgRevokeOperator extends AminoMsg {
  readonly type: "lbm-sdk/MsgRevokeOperator";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the holder who allows the manipulation of its token. */
    readonly holder: string;
    /** address which the manipulation is allowed to. */
    readonly operator: string;
  };
}

export function isAminoMsgRevokeOperator(msg: AminoMsg): msg is AminoMsgRevokeOperator {
  return msg.type === "lbm-sdk/MsgRevokeOperator";
}

export interface AminoMsgCreateContract extends AminoMsg {
  readonly type: "lbm-sdk/MsgCreateContract";
  readonly value: {
    /** address which all the permissions on the contract will be granted to (not a permanent property). */
    readonly owner: string;
    /** name defines the human-readable name of the contract. */
    readonly name: string;
    /** uri for the contract image stored off chain. */
    readonly uri: string;
    /** meta is a brief description of the contract. */
    readonly meta: string;
  };
}

export function isAminoMsgCreateContract(msg: AminoMsg): msg is AminoMsgCreateContract {
  return msg.type === "lbm-sdk/MsgCreateContract";
}

export interface AminoMsgIssueFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgIssueFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** name defines the human-readable name of the token type. */
    readonly name: string;
    /** meta is a brief description of the token type. */
    readonly meta: string;
    /** decimals is the number of decimals which one must divide the amount by to get its user representation. */
    readonly decimals: number;
    /** mintable represents whether the token is allowed to be minted or burnt. */
    readonly mintable: boolean;
    /** the address of the grantee which must have the permission to issue a token. */
    readonly owner: string;
    /** the address to send the minted tokens to. mandatory. */
    readonly to: string;
    /**
     * the amount of tokens to mint on the issuance.
     * Note: if you provide negative amount, a panic may result.
     * Note: amount may be zero.
     */
    readonly amount: string;
  };
}

export function isAminoMsgIssueFT(msg: AminoMsg): msg is AminoMsgIssueFT {
  return msg.type === "lbm-sdk/MsgIssueFT";
}

export interface AminoMsgIssueNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgIssueNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** name defines the human-readable name of the token type. */
    readonly name: string;
    /** meta is a brief description of the token type. */
    readonly meta: string;
    /** the address of the grantee which must have the permission to issue a token. */
    readonly owner: string;
  };
}

export function isAminoMsgIssueNFT(msg: AminoMsg): msg is AminoMsgIssueNFT {
  return msg.type === "lbm-sdk/MsgIssueNFT";
}

export interface AminoMsgMintFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgIssueNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the grantee which has the permission for the mint. */
    readonly from: string;
    /** address which the minted tokens will be sent to. */
    readonly to: string;
    /**
     * the amount of the mint.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgMintFT(msg: AminoMsg): msg is AminoMsgMintFT {
  return msg.type === "lbm-sdk/MsgMintFT";
}

export interface AminoMsgMintNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgMintNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the grantee which has the permission for the mint. */
    readonly from: string;
    /** address which the minted token will be sent to. */
    readonly to: string;
    /** parameters for the minted tokens. */
    readonly params: MintNFTParam[];
  };
}

export function isAminoMsgMintNFT(msg: AminoMsg): msg is AminoMsgMintNFT {
  return msg.type === "lbm-sdk/MsgMintNFT";
}

export interface AminoMsgBurnFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurnFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which the tokens will be burnt from.
     * Note: it must have the permission for the burn.
     */
    readonly from: string;
    /**
     * the amount of the burn.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgBurnFT(msg: AminoMsg): msg is AminoMsgBurnFT {
  return msg.type === "lbm-sdk/MsgBurnFT";
}

export interface AminoMsgOperatorBurnFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorBurnFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which triggers the burn.
     * Note: it must have the permission for the burn.
     * Note: it must have been authorized by from.
     */
    readonly operator: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /**
     * the amount of the burn.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgOperatorBurnFT(msg: AminoMsg): msg is AminoMsgOperatorBurnFT {
  return msg.type === "lbm-sdk/MsgOperatorBurnFT";
}

export interface AminoMsgBurnNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurnNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which the tokens will be burnt from.
     * Note: it must have the permission for the burn.
     */
    readonly from: string;
    /**
     * the token ids to burn.
     * Note: id cannot start with zero.
     */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgBurnNFT(msg: AminoMsg): msg is AminoMsgBurnNFT {
  return msg.type === "lbm-sdk/MsgBurnNFT";
}

export interface AminoMsgOperatorBurnNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorBurnNFT";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which triggers the burn.
     * Note: it must have the permission for the burn.
     * Note: it must have been authorized by from.
     */
    readonly operator: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /**
     * the token ids to burn.
     * Note: id cannot start with zero.
     */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgOperatorBurnNFT(msg: AminoMsg): msg is AminoMsgOperatorBurnNFT {
  return msg.type === "lbm-sdk/MsgOperatorBurnNFT";
}

export interface AminoMsgModify extends AminoMsg {
  readonly type: "lbm-sdk/collection/MsgModify";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address of the grantee which must have modify permission. */
    readonly owner: string;
    /** token type of the token. */
    readonly tokenType: string;
    /**
     * token index of the token.
     * if index is empty, it would modify the corresponding token type.
     * if index is not empty, it would modify the corresponding nft.
     * Note: if token type is of FTs, the index cannot be empty.
     */
    readonly tokenIndex: string;
    /**
     * changes to apply.
     * on modifying collection: name, base_img_uri, meta.
     * on modifying token type and token: name, meta.
     */
    readonly changes: Attribute[];
  };
}

export function isAminoMsgModify(msg: AminoMsg): msg is AminoMsgModify {
  return msg.type === "lbm-sdk/collection/MsgModify";
}

export interface AminoMsgGrantPermission extends AminoMsg {
  readonly type: "lbm-sdk/collection/MsgGrantPermission";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the granter which must have the permission to give. */
    readonly from: string;
    /** address of the grantee. */
    readonly to: string;
    /** permission on the contract. */
    readonly permission: string;
  };
}

export function isAminoMsgGrantPermission(msg: AminoMsg): msg is AminoMsgGrantPermission {
  return msg.type === "lbm-sdk/collection/MsgGrantPermission";
}

export interface AminoMsgRevokePermission extends AminoMsg {
  readonly type: "lbm-sdk/collection/MsgRevokePermission";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the grantee which abandons the permission. */
    readonly from: string;
    /** permission on the contract. */
    readonly permission: string;
  };
}

export function isAminoMsgRevokePermission(msg: AminoMsg): msg is AminoMsgRevokePermission {
  return msg.type === "lbm-sdk/collection/MsgRevokePermission";
}

export interface AminoMsgAttach extends AminoMsg {
  readonly type: "lbm-sdk/MsgAttach";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to attach. */
    readonly tokenId: string;
    /** to token id which one attachs the token to. */
    readonly toTokenId: string;
  };
}

export function isAminoMsgAttach(msg: AminoMsg): msg is AminoMsgAttach {
  return msg.type === "lbm-sdk/MsgAttach";
}

export interface AminoMsgDetach extends AminoMsg {
  readonly type: "lbm-sdk/MsgDetach";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to detach. */
    readonly tokenId: string;
  };
}

export function isAminoMsgDetach(msg: AminoMsg): msg is AminoMsgDetach {
  return msg.type === "lbm-sdk/MsgDetach";
}

export interface AminoMsgOperatorAttach extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorAttach";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the operator. */
    readonly operator: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to attach. */
    readonly tokenId: string;
    /** to token id which one attachs the token to. */
    readonly toTokenId: string;
  };
}

export function isAminoMsgOperatorAttach(msg: AminoMsg): msg is AminoMsgOperatorAttach {
  return msg.type === "lbm-sdk/MsgOperatorAttach";
}

export interface AminoMsgOperatorDetach extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorDetach";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the operator. */
    readonly operator: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to detach. */
    readonly tokenId: string;
  };
}

export function isAminoMsgOperatorDetach(msg: AminoMsg): msg is AminoMsgOperatorDetach {
  return msg.type === "lbm-sdk/MsgOperatorDetach";
}

export function createCollectionAminoConverters(): AminoConverters {
  return {
    "/lbm.collection.v1.MsgSendFT": {
      aminoType: "lbm-sdk/MsgSendFT",
      toAmino: ({ contractId, from, to, amount }: MsgSendFT): AminoMsgSendFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, to, amount }: AminoMsgSendFT["value"]): MsgSendFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorSendFT": {
      aminoType: "lbm-sdk/MsgOperatorSendFT",
      toAmino: ({
        contractId,
        operator,
        from,
        to,
        amount,
      }: MsgOperatorSendFT): AminoMsgOperatorSendFT["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        to,
        amount,
      }: AminoMsgOperatorSendFT["value"]): MsgOperatorSendFT => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgSendNFT": {
      aminoType: "lbm-sdk/MsgSendNFT",
      toAmino: ({ contractId, from, to, tokenIds }: MsgSendNFT): AminoMsgSendNFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({ contractId, from, to, tokenIds }: AminoMsgSendNFT["value"]): MsgSendNFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorSendNFT": {
      aminoType: "lbm-sdk/MsgOperatorSendNFT",
      toAmino: ({
        contractId,
        operator,
        from,
        to,
        tokenIds,
      }: MsgOperatorSendNFT): AminoMsgOperatorSendNFT["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        to,
        tokenIds,
      }: AminoMsgOperatorSendNFT["value"]): MsgOperatorSendNFT => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.collection.v1.MsgAuthorizeOperator": {
      aminoType: "lbm-sdk/collection/MsgAuthorizeOperator",
      toAmino: ({
        contractId,
        holder,
        operator,
      }: MsgAuthorizeOperator): AminoMsgAuthorizeOperator["value"] => {
        return {
          contractId: contractId,
          holder: holder,
          operator: operator,
        };
      },
      fromAmino: ({
        contractId,
        holder,
        operator,
      }: AminoMsgAuthorizeOperator["value"]): MsgAuthorizeOperator => {
        return {
          contractId: contractId,
          holder: holder,
          operator: operator,
        };
      },
    },
    "/lbm.collection.v1.MsgRevokeOperator": {
      aminoType: "lbm-sdk/MsgRevokeOperator",
      toAmino: ({ contractId, holder, operator }: MsgRevokeOperator): AminoMsgRevokeOperator["value"] => {
        return {
          contractId: contractId,
          holder: holder,
          operator: operator,
        };
      },
      fromAmino: ({ contractId, holder, operator }: AminoMsgRevokeOperator["value"]): MsgRevokeOperator => {
        return {
          contractId: contractId,
          holder: holder,
          operator: operator,
        };
      },
    },
    "/lbm.collection.v1.MsgCreateContract": {
      aminoType: "lbm-sdk/MsgCreateContract",
      toAmino: ({ owner, name, uri, meta }: MsgCreateContract): AminoMsgCreateContract["value"] => {
        return {
          owner: owner,
          name: name,
          uri: uri,
          meta: meta,
        };
      },
      fromAmino: ({ owner, name, uri, meta }: AminoMsgCreateContract["value"]): MsgCreateContract => {
        return {
          owner: owner,
          name: name,
          uri: uri,
          meta: meta,
        };
      },
    },
    "/lbm.collection.v1.MsgIssueFT": {
      aminoType: "lbm-sdk/MsgIssueFT",
      toAmino: ({
        contractId,
        name,
        meta,
        decimals,
        mintable,
        owner,
        to,
        amount,
      }: MsgIssueFT): AminoMsgIssueFT["value"] => {
        return {
          contractId: contractId,
          name: name,
          meta: meta,
          decimals: decimals,
          mintable: mintable,
          owner: owner,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        contractId,
        name,
        meta,
        decimals,
        mintable,
        owner,
        to,
        amount,
      }: AminoMsgIssueFT["value"]): MsgIssueFT => {
        return {
          contractId: contractId,
          name: name,
          meta: meta,
          decimals: decimals,
          mintable: mintable,
          owner: owner,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgIssueNFT": {
      aminoType: "lbm-sdk/MsgIssueNFT",
      toAmino: ({ contractId, name, meta, owner }: MsgIssueNFT): AminoMsgIssueNFT["value"] => {
        return {
          contractId: contractId,
          name: name,
          meta: meta,
          owner: owner,
        };
      },
      fromAmino: ({ contractId, name, meta, owner }: AminoMsgIssueNFT["value"]): MsgIssueNFT => {
        return {
          contractId: contractId,
          name: name,
          meta: meta,
          owner: owner,
        };
      },
    },
    "/lbm.collection.v1.MsgMintFT": {
      aminoType: "lbm-sdk/MsgMintFT",
      toAmino: ({ contractId, from, to, amount }: MsgMintFT): AminoMsgMintFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, to, amount }: AminoMsgMintFT["value"]): MsgMintFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgMintNFT": {
      aminoType: "lbm-sdk/MsgMintNFT",
      toAmino: ({ contractId, from, to, params }: MsgMintNFT): AminoMsgMintNFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          params: params,
        };
      },
      fromAmino: ({ contractId, from, to, params }: AminoMsgMintNFT["value"]): MsgMintNFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          params: params,
        };
      },
    },
    "/lbm.collection.v1.MsgBurnFT": {
      aminoType: "lbm-sdk/MsgBurnFT",
      toAmino: ({ contractId, from, amount }: MsgBurnFT): AminoMsgBurnFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, amount }: AminoMsgBurnFT["value"]): MsgBurnFT => {
        return {
          contractId: contractId,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorBurnFT": {
      aminoType: "lbm-sdk/MsgOperatorBurnFT",
      toAmino: ({
        contractId,
        operator,
        from,
        amount,
      }: MsgOperatorBurnFT): AminoMsgOperatorBurnFT["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        amount,
      }: AminoMsgOperatorBurnFT["value"]): MsgOperatorBurnFT => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.collection.v1.MsgBurnNFT": {
      aminoType: "lbm-sdk/MsgBurnNFT",
      toAmino: ({ contractId, from, tokenIds }: MsgBurnNFT): AminoMsgBurnNFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({ contractId, from, tokenIds }: AminoMsgBurnNFT["value"]): MsgBurnNFT => {
        return {
          contractId: contractId,
          from: from,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorBurnNFT": {
      aminoType: "lbm-sdk/MsgOperatorBurnNFT",
      toAmino: ({
        contractId,
        operator,
        from,
        tokenIds,
      }: MsgOperatorBurnNFT): AminoMsgOperatorBurnNFT["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        tokenIds,
      }: AminoMsgOperatorBurnNFT["value"]): MsgOperatorBurnNFT => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.collection.v1.MsgModify": {
      aminoType: "lbm-sdk/collection/MsgModify",
      toAmino: ({
        contractId,
        owner,
        tokenType,
        tokenIndex,
        changes,
      }: MsgModify): AminoMsgModify["value"] => {
        return {
          contractId: contractId,
          owner: owner,
          tokenType: tokenType,
          tokenIndex: tokenIndex,
          changes: changes,
        };
      },
      fromAmino: ({
        contractId,
        owner,
        tokenType,
        tokenIndex,
        changes,
      }: AminoMsgModify["value"]): MsgModify => {
        return {
          contractId: contractId,
          owner: owner,
          tokenType: tokenType,
          tokenIndex: tokenIndex,
          changes: changes,
        };
      },
    },
    "/lbm.collection.v1.MsgGrantPermission": {
      aminoType: "lbm-sdk/collection/MsgGrantPermission",
      toAmino: ({
        contractId,
        from,
        to,
        permission,
      }: MsgGrantPermission): AminoMsgGrantPermission["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          permission: permission,
        };
      },
      fromAmino: ({
        contractId,
        from,
        to,
        permission,
      }: AminoMsgGrantPermission["value"]): MsgGrantPermission => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          permission: permission,
        };
      },
    },
    "/lbm.collection.v1.MsgRevokePermission": {
      aminoType: "lbm-sdk/collection/MsgRevokePermission",
      toAmino: ({ contractId, from, permission }: MsgRevokePermission): AminoMsgRevokePermission["value"] => {
        return {
          contractId: contractId,
          from: from,
          permission: permission,
        };
      },
      fromAmino: ({
        contractId,
        from,
        permission,
      }: AminoMsgRevokePermission["value"]): MsgRevokePermission => {
        return {
          contractId: contractId,
          from: from,
          permission: permission,
        };
      },
    },
    "/lbm.collection.v1.MsgAttach": {
      aminoType: "lbm-sdk/MsgAttach",
      toAmino: ({ contractId, from, tokenId, toTokenId }: MsgAttach): AminoMsgAttach["value"] => {
        return {
          contractId: contractId,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
      fromAmino: ({ contractId, from, tokenId, toTokenId }: AminoMsgAttach["value"]): MsgAttach => {
        return {
          contractId: contractId,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
    },
    "/lbm.collection.v1.MsgDetach": {
      aminoType: "lbm-sdk/MsgDetach",
      toAmino: ({ contractId, from, tokenId }: MsgDetach): AminoMsgDetach["value"] => {
        return {
          contractId: contractId,
          from: from,
          tokenId: tokenId,
        };
      },
      fromAmino: ({ contractId, from, tokenId }: AminoMsgDetach["value"]): MsgDetach => {
        return {
          contractId: contractId,
          from: from,
          tokenId: tokenId,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorAttach": {
      aminoType: "lbm-sdk/MsgOperatorAttach",
      toAmino: ({
        contractId,
        operator,
        from,
        tokenId,
        toTokenId,
      }: MsgOperatorAttach): AminoMsgOperatorAttach["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        tokenId,
        toTokenId,
      }: AminoMsgOperatorAttach["value"]): MsgOperatorAttach => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
    },
    "/lbm.collection.v1.MsgOperatorDetach": {
      aminoType: "lbm-sdk/MsgOperatorDetach",
      toAmino: ({
        contractId,
        operator,
        from,
        tokenId,
      }: MsgOperatorDetach): AminoMsgOperatorDetach["value"] => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenId: tokenId,
        };
      },
      fromAmino: ({
        contractId,
        operator,
        from,
        tokenId,
      }: AminoMsgOperatorDetach["value"]): MsgOperatorDetach => {
        return {
          contractId: contractId,
          operator: operator,
          from: from,
          tokenId: tokenId,
        };
      },
    },
  };
}
