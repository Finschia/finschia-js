import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { Change, Coin } from "lbmjs-types/lbm/collection/v1/collection";
import {
  MintNFTParam,
  MsgApprove,
  MsgAttach,
  MsgAttachFrom,
  MsgBurnFT,
  MsgBurnFTFrom,
  MsgBurnNFT,
  MsgBurnNFTFrom,
  MsgCreateContract,
  MsgDetach,
  MsgDetachFrom,
  MsgDisapprove,
  MsgGrantPermission,
  MsgIssueFT,
  MsgIssueNFT,
  MsgMintFT,
  MsgMintNFT,
  MsgModify,
  MsgRevokePermission,
  MsgTransferFT,
  MsgTransferFTFrom,
  MsgTransferNFT,
  MsgTransferNFTFrom,
} from "lbmjs-types/lbm/collection/v1/tx";

export interface AminoMsgTransferFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransferFT";
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

export function isAminoMsgTransferFT(msg: AminoMsg): msg is AminoMsgTransferFT {
  return msg.type === "lbm-sdk/MsgTransferFT";
}

export interface AminoMsgTransferFTFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransferFTFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address of the proxy. */
    readonly proxy: string;
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

export function isAminoMsgTransferFTFrom(msg: AminoMsg): msg is AminoMsgTransferFTFrom {
  return msg.type === "lbm-sdk/MsgTransferFTFrom";
}

export interface AminoMsgTransferNFT extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransferNFT";
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

export function isAminoMsgTransferNFT(msg: AminoMsg): msg is AminoMsgTransferNFT {
  return msg.type === "lbm-sdk/MsgTransferNFT";
}

export interface AminoMsgTransferNFTFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransferNFTFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** the address of the proxy. */
    readonly proxy: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /** the token ids to transfer. */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgTransferNFTFrom(msg: AminoMsg): msg is AminoMsgTransferNFTFrom {
  return msg.type === "lbm-sdk/MsgTransferNFTFrom";
}

export interface AminoMsgApprove extends AminoMsg {
  readonly type: "lbm-sdk/MsgApprove";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the approver who allows the manipulation of its token. */
    readonly approver: string;
    /** address which the manipulation is allowed to. */
    readonly proxy: string;
  };
}

export function isAminoMsgApprove(msg: AminoMsg): msg is AminoMsgApprove {
  return msg.type === "lbm-sdk/MsgApprove";
}

export interface AminoMsgDisapprove extends AminoMsg {
  readonly type: "lbm-sdk/MsgDisapprove";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the approver who allows the manipulation of its token. */
    readonly approver: string;
    /** address which the manipulation is allowed to. */
    readonly proxy: string;
  };
}

export function isAminoMsgDisapprove(msg: AminoMsg): msg is AminoMsgDisapprove {
  return msg.type === "lbm-sdk/MsgDisapprove";
}

export interface AminoMsgCreateContract extends AminoMsg {
  readonly type: "lbm-sdk/MsgCreateContract";
  readonly value: {
    /** address which all the permissions on the contract will be granted to (not a permanent property). */
    readonly owner: string;
    /** name defines the human-readable name of the contract. */
    readonly name: string;
    /** base img uri is an uri for the contract image stored off chain. */
    readonly baseImgUri: string;
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

export interface AminoMsgBurnFTFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurnFTFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which triggers the burn.
     * Note: it must have the permission for the burn.
     * Note: it must have been authorized by from.
     */
    readonly proxy: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /**
     * the amount of the burn.
     * Note: amount may be empty.
     */
    readonly amount: Coin[];
  };
}

export function isAminoMsgBurnFTFrom(msg: AminoMsg): msg is AminoMsgBurnFTFrom {
  return msg.type === "lbm-sdk/MsgBurnFTFrom";
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

export interface AminoMsgBurnNFTFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurnNFTFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /**
     * address which triggers the burn.
     * Note: it must have the permission for the burn.
     * Note: it must have been authorized by from.
     */
    readonly proxy: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /**
     * the token ids to burn.
     * Note: id cannot start with zero.
     */
    readonly tokenIds: string[];
  };
}

export function isAminoMsgBurnNFTFrom(msg: AminoMsg): msg is AminoMsgBurnNFTFrom {
  return msg.type === "lbm-sdk/MsgBurnNFTFrom";
}

export interface AminoMsgModify extends AminoMsg {
  readonly type: "lbm-sdk/MsgModify";
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
    readonly changes: Change[];
  };
}

export function isAminoMsgModify(msg: AminoMsg): msg is AminoMsgModify {
  return msg.type === "lbm-sdk/MsgModify";
}

export interface AminoMsgGrantPermission extends AminoMsg {
  readonly type: "lbm-sdk/MsgGrantPermission";
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
  return msg.type === "lbm-sdk/MsgGrantPermission";
}

export interface AminoMsgRevokePermission extends AminoMsg {
  readonly type: "lbm-sdk/MsgRevokePermission";
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
  return msg.type === "lbm-sdk/MsgRevokePermission";
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

export interface AminoMsgAttachFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgAttachFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the proxy. */
    readonly proxy: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to attach. */
    readonly tokenId: string;
    /** to token id which one attachs the token to. */
    readonly toTokenId: string;
  };
}

export function isAminoMsgAttachFrom(msg: AminoMsg): msg is AminoMsgAttachFrom {
  return msg.type === "lbm-sdk/MsgAttachFrom";
}

export interface AminoMsgDetachFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgDetachFrom";
  readonly value: {
    /** contract id associated with the contract. */
    readonly contractId: string;
    /** address of the proxy. */
    readonly proxy: string;
    /** address of the owner of the token. */
    readonly from: string;
    /** token id of the token to detach. */
    readonly tokenId: string;
  };
}

export function isAminoMsgDetachFrom(msg: AminoMsg): msg is AminoMsgDetachFrom {
  return msg.type === "lbm-sdk/MsgDetachFrom";
}

export function createCollectionAminoConverters(): AminoConverters {
  return {
    "/lbm.foundation.v1.MsgTransferFT": {
      aminoType: "lbm-sdk/MsgTransferFT",
      toAmino: ({ contractId, from, to, amount }: MsgTransferFT): AminoMsgTransferFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, to, amount }: AminoMsgTransferFT["value"]): MsgTransferFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.MsgTransferFTFrom": {
      aminoType: "lbm-sdk/MsgTransferFTFrom",
      toAmino: ({
        contractId,
        proxy,
        from,
        to,
        amount,
      }: MsgTransferFTFrom): AminoMsgTransferFTFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        contractId,
        proxy,
        from,
        to,
        amount,
      }: AminoMsgTransferFTFrom["value"]): MsgTransferFTFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.MsgTransferNFT": {
      aminoType: "lbm-sdk/MsgTransferNFT",
      toAmino: ({ contractId, from, to, tokenIds }: MsgTransferNFT): AminoMsgTransferNFT["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({ contractId, from, to, tokenIds }: AminoMsgTransferNFT["value"]): MsgTransferNFT => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.foundation.v1.MsgTransferNFTFrom": {
      aminoType: "lbm-sdk/MsgTransferNFTFrom",
      toAmino: ({
        contractId,
        proxy,
        from,
        to,
        tokenIds,
      }: MsgTransferNFTFrom): AminoMsgTransferNFTFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({
        contractId,
        proxy,
        from,
        to,
        tokenIds,
      }: AminoMsgTransferNFTFrom["value"]): MsgTransferNFTFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          to: to,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.foundation.v1.MsgApprove": {
      aminoType: "lbm-sdk/MsgApprove",
      toAmino: ({ contractId, approver, proxy }: MsgApprove): AminoMsgApprove["value"] => {
        return {
          contractId: contractId,
          approver: approver,
          proxy: proxy,
        };
      },
      fromAmino: ({ contractId, approver, proxy }: AminoMsgApprove["value"]): MsgApprove => {
        return {
          contractId: contractId,
          approver: approver,
          proxy: proxy,
        };
      },
    },
    "/lbm.foundation.v1.MsgDisapprove": {
      aminoType: "lbm-sdk/MsgDisapprove",
      toAmino: ({ contractId, approver, proxy }: MsgDisapprove): AminoMsgDisapprove["value"] => {
        return {
          contractId: contractId,
          approver: approver,
          proxy: proxy,
        };
      },
      fromAmino: ({ contractId, approver, proxy }: AminoMsgDisapprove["value"]): MsgDisapprove => {
        return {
          contractId: contractId,
          approver: approver,
          proxy: proxy,
        };
      },
    },
    "/lbm.foundation.v1.MsgCreateContract": {
      aminoType: "lbm-sdk/MsgCreateContract",
      toAmino: ({ owner, name, baseImgUri, meta }: MsgCreateContract): AminoMsgCreateContract["value"] => {
        return {
          owner: owner,
          name: name,
          baseImgUri: baseImgUri,
          meta: meta,
        };
      },
      fromAmino: ({ owner, name, baseImgUri, meta }: AminoMsgCreateContract["value"]): MsgCreateContract => {
        return {
          owner: owner,
          name: name,
          baseImgUri: baseImgUri,
          meta: meta,
        };
      },
    },
    "/lbm.foundation.v1.MsgIssueFT": {
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
    "/lbm.foundation.v1.MsgIssueNFT": {
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
    "/lbm.foundation.v1.MsgMintFT": {
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
    "/lbm.foundation.v1.MsgMintNFT": {
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
    "/lbm.foundation.v1.MsgBurnFT": {
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
    "/lbm.foundation.v1.MsgBurnFTFrom": {
      aminoType: "lbm-sdk/MsgBurnFTFrom",
      toAmino: ({ contractId, proxy, from, amount }: MsgBurnFTFrom): AminoMsgBurnFTFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, proxy, from, amount }: AminoMsgBurnFTFrom["value"]): MsgBurnFTFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.foundation.v1.MsgBurnNFT": {
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
    "/lbm.foundation.v1.MsgBurnNFTFrom": {
      aminoType: "lbm-sdk/MsgBurnNFTFrom",
      toAmino: ({ contractId, proxy, from, tokenIds }: MsgBurnNFTFrom): AminoMsgBurnNFTFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenIds: tokenIds,
        };
      },
      fromAmino: ({ contractId, proxy, from, tokenIds }: AminoMsgBurnNFTFrom["value"]): MsgBurnNFTFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenIds: tokenIds,
        };
      },
    },
    "/lbm.foundation.v1.MsgModify": {
      aminoType: "lbm-sdk/MsgModify",
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
    "/lbm.foundation.v1.MsgGrantPermission": {
      aminoType: "lbm-sdk/MsgGrantPermission",
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
    "/lbm.foundation.v1.MsgRevokePermission": {
      aminoType: "lbm-sdk/MsgRevokePermission",
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
    "/lbm.foundation.v1.MsgAttach": {
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
    "/lbm.foundation.v1.MsgDetach": {
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
    "/lbm.foundation.v1.MsgAttachFrom": {
      aminoType: "lbm-sdk/MsgAttachFrom",
      toAmino: ({
        contractId,
        proxy,
        from,
        tokenId,
        toTokenId,
      }: MsgAttachFrom): AminoMsgAttachFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
      fromAmino: ({
        contractId,
        proxy,
        from,
        tokenId,
        toTokenId,
      }: AminoMsgAttachFrom["value"]): MsgAttachFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenId: tokenId,
          toTokenId: toTokenId,
        };
      },
    },
    "/lbm.foundation.v1.MsgDetachFrom": {
      aminoType: "lbm-sdk/MsgDetachFrom",
      toAmino: ({ contractId, proxy, from, tokenId }: MsgDetachFrom): AminoMsgDetachFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenId: tokenId,
        };
      },
      fromAmino: ({ contractId, proxy, from, tokenId }: AminoMsgDetachFrom["value"]): MsgDetachFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          tokenId: tokenId,
        };
      },
    },
  };
}
