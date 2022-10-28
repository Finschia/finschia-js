import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { Pair } from "lbmjs-types/lbm/token/v1/token";
import {
  MsgApprove,
  MsgBurn,
  MsgBurnFrom,
  MsgGrantPermission,
  MsgIssue,
  MsgMint,
  MsgModify,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSend,
  MsgTransferFrom,
} from "lbmjs-types/lbm/token/v1/tx";

export interface AminoMsgSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgSend";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** approver whose tokens are being sent. */
    readonly from: string;
    /** recipient of the tokens. */
    readonly to: string;
    /** number of tokens to send. */
    readonly amount: string;
  };
}

export function isAminoMsgSend(msg: AminoMsg): msg is AminoMsgSend {
  return msg.type === "lbm-sdk/MsgSend";
}

export interface AminoMsgTransferFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransferFrom";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** the address of the proxy. */
    readonly proxy: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /** the amount of the transfer. */
    readonly amount: string;
  };
}

export function isAminoMsgTransferFrom(msg: AminoMsg): msg is AminoMsgTransferFrom {
  return msg.type === "lbm-sdk/MsgTransferFrom";
}

export interface AminoMsgRevokeOperator extends AminoMsg {
  readonly type: "lbm-sdk/MsgRevokeOperator";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address of a holder which revokes the `operator` address as an operator. */
    readonly holder: string;
    /** address to rescind as an operator for `holder`. */
    readonly operator: string;
  };
}

export function isAminoMsgRevokeOperator(msg: AminoMsg): msg is AminoMsgRevokeOperator {
  return msg.type === "lbm-sdk/MsgRevokeOperator";
}

export interface AminoMsgApprove extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgApprove";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address of the token approver which approves the authorization. */
    readonly approver: string;
    /** address of the proxy which the authorization is granted to. */
    readonly proxy: string;
  };
}

export function isAminoMsgApprove(msg: AminoMsg): msg is AminoMsgApprove {
  return msg.type === "lbm-sdk/token/MsgApprove";
}

export interface AminoMsgIssue extends AminoMsg {
  readonly type: "lbm-sdk/MsgIssue";
  readonly value: {
    /** name defines the human-readable name of the token class. mandatory (not ERC20 compliant). */
    readonly name: string;
    /** symbol is an abbreviated name for token class. mandatory (not ERC20 compliant). */
    readonly symbol: string;
    /** image_uri is an uri for the image of the token class stored off chain. */
    readonly imageUri: string;
    /** meta is a brief description of token class. */
    readonly meta: string;
    /** decimals is the number of decimals which one must divide the amount by to get its user representation. */
    readonly decimals: number;
    /** mintable represents whether the token is allowed to mint. */
    readonly mintable: boolean;
    /** the address which all permissions on the token class will be granted to (not a permanent property). */
    readonly owner: string;
    /** the address to send the minted token to. mandatory. */
    readonly to: string;
    /** amount of tokens to mint on issuance. mandatory. */
    readonly amount: string;
  };
}

export function isAminoMsgIssue(msg: AminoMsg): msg is AminoMsgIssue {
  return msg.type === "lbm-sdk/MsgIssue";
}

export interface AminoMsgGrantPermission extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgGrantPermission";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address of the granter which must have the permission to give. */
    readonly from: string;
    /** address of the grantee. */
    readonly to: string;
    /** permission on the token class. */
    readonly permission: string;
  };
}

export function isAminoMsgGrantPermission(msg: AminoMsg): msg is AminoMsgGrantPermission {
  return msg.type === "lbm-sdk/token/MsgGrantPermission";
}

export interface AminoMsgRevokePermission extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgRevokePermission";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address of the grantee which abandons the permission. */
    readonly from: string;
    /** permission on the token class. */
    readonly permission: string;
  };
}

export function isAminoMsgRevokePermission(msg: AminoMsg): msg is AminoMsgRevokePermission {
  return msg.type === "lbm-sdk/token/MsgRevokePermission";
}

export interface AminoMsgMint extends AminoMsg {
  readonly type: "lbm-sdk/MsgMint";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address which triggers the mint. */
    readonly from: string;
    /** recipient of the tokens. */
    readonly to: string;
    /** number of tokens to mint. */
    readonly amount: string;
  };
}

export function isAminoMsgMint(msg: AminoMsg): msg is AminoMsgMint {
  return msg.type === "lbm-sdk/MsgMint";
}

export interface AminoMsgBurn extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurn";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address whose tokens are being burned. */
    readonly from: string;
    /** number of tokens to burn. */
    readonly amount: string;
  };
}

export function isAminoMsgBurn(msg: AminoMsg): msg is AminoMsgBurn {
  return msg.type === "lbm-sdk/MsgBurn";
}

export interface AminoMsgBurnFrom extends AminoMsg {
  readonly type: "lbm-sdk/MsgBurnFrom";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contractId: string;
    /** address which triggers the burn. */
    readonly proxy: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /** the amount of the burn. */
    readonly amount: string;
  };
}

export function isAminoMsgBurnFrom(msg: AminoMsg): msg is AminoMsgBurnFrom {
  return msg.type === "lbm-sdk/MsgBurnFrom";
}

export interface AminoMsgModify extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgModify";
  readonly value: {
    /** contract id associated with the contract. */
    contractId: string;
    /** the address of the grantee which must have modify permission. */
    owner: string;
    /** changes to apply. */
    changes: Pair[];
  };
}

export function isAminoMsgModify(msg: AminoMsg): msg is AminoMsgModify {
  return msg.type === "lbm-sdk/token/MsgModify";
}

export function createTokenAminoConverters(): AminoConverters {
  return {
    "/lbm.token.v1.MsgSend": {
      aminoType: "lbm-sdk/MsgSend",
      toAmino: ({ contractId, from, to, amount }: MsgSend): AminoMsgSend["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, to, amount }: AminoMsgSend["value"]): MsgSend => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgTransferFrom": {
      aminoType: "lbm-sdk/MsgTransferFrom",
      toAmino: ({ contractId, proxy, from, to, amount }: MsgTransferFrom): AminoMsgTransferFrom["value"] => {
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
      }: AminoMsgTransferFrom["value"]): MsgTransferFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgRevokeOperator": {
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
    "/lbm.token.v1.MsgApprove": {
      aminoType: "lbm-sdk/token/MsgApprove",
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
    "/lbm.token.v1.MsgIssue": {
      aminoType: "lbm-sdk/MsgIssue",
      toAmino: ({
        name,
        symbol,
        imageUri,
        meta,
        decimals,
        mintable,
        owner,
        to,
        amount,
      }: MsgIssue): AminoMsgIssue["value"] => {
        return {
          name: name,
          symbol: symbol,
          imageUri: imageUri,
          meta: meta,
          decimals: decimals,
          mintable: mintable,
          owner: owner,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        name,
        symbol,
        imageUri,
        meta,
        decimals,
        mintable,
        owner,
        to,
        amount,
      }: AminoMsgIssue["value"]): MsgIssue => {
        return {
          name: name,
          symbol: symbol,
          imageUri: imageUri,
          meta: meta,
          decimals: decimals,
          mintable: mintable,
          owner: owner,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgGrantPermission": {
      aminoType: "lbm-sdk/token/MsgGrantPermission",
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
    "/lbm.token.v1.MsgRevokePermission": {
      aminoType: "lbm-sdk/token/MsgRevokePermission",
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
    "/lbm.token.v1.MsgMint": {
      aminoType: "lbm-sdk/MsgMint",
      toAmino: ({ contractId, from, to, amount }: MsgMint): AminoMsgMint["value"] => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, to, amount }: AminoMsgMint["value"]): MsgMint => {
        return {
          contractId: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgBurn": {
      aminoType: "lbm-sdk/MsgBurn",
      toAmino: ({ contractId, from, amount }: MsgBurn): AminoMsgBurn["value"] => {
        return {
          contractId: contractId,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, from, amount }: AminoMsgBurn["value"]): MsgBurn => {
        return {
          contractId: contractId,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgBurnFrom": {
      aminoType: "lbm-sdk/MsgBurnFrom",
      toAmino: ({ contractId, proxy, from, amount }: MsgBurnFrom): AminoMsgBurnFrom["value"] => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ contractId, proxy, from, amount }: AminoMsgBurnFrom["value"]): MsgBurnFrom => {
        return {
          contractId: contractId,
          proxy: proxy,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgModify": {
      aminoType: "lbm-sdk/token/MsgModify",
      toAmino: ({ contractId, owner, changes }: MsgModify): AminoMsgModify["value"] => {
        return {
          contractId: contractId,
          owner: owner,
          changes: changes,
        };
      },
      fromAmino: ({ contractId, owner, changes }: AminoMsgModify["value"]): MsgModify => {
        return {
          contractId: contractId,
          owner: owner,
          changes: changes,
        };
      },
    },
  };
}
