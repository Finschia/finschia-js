/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import { Attribute } from "@finschia/finschia-proto/lbm/token/v1/token";
import {
  MsgAuthorizeOperator,
  MsgBurn,
  MsgGrantPermission,
  MsgIssue,
  MsgMint,
  MsgModify,
  MsgOperatorBurn,
  MsgOperatorSend,
  MsgRevokeOperator,
  MsgRevokePermission,
  MsgSend,
} from "@finschia/finschia-proto/lbm/token/v1/tx";

export interface AminoMsgSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgSend";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
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

export interface AminoMsgOperatorSend extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorSend";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
    /** the address of the operator. */
    readonly operator: string;
    /** the address which the transfer is from. */
    readonly from: string;
    /** the address which the transfer is to. */
    readonly to: string;
    /** the amount of the transfer. */
    readonly amount: string;
  };
}

export function isAminoMsgOperatorSend(msg: AminoMsg): msg is AminoMsgOperatorSend {
  return msg.type === "lbm-sdk/MsgOperatorSend";
}

export interface AminoMsgRevokeOperator extends AminoMsg {
  readonly type: "lbm-sdk/MsgRevokeOperator";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
    /** address of a holder which revokes the `operator` address as an operator. */
    readonly holder: string;
    /** address to rescind as an operator for `holder`. */
    readonly operator: string;
  };
}

export function isAminoMsgRevokeOperator(msg: AminoMsg): msg is AminoMsgRevokeOperator {
  return msg.type === "lbm-sdk/MsgRevokeOperator";
}

// todo : how to distinguish between token lbm-sdk/MsgAuthorizeOperator and collection lbm-sdk/MsgAuthorizeOperator
export interface AminoMsgAuthorizeOperator extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgAuthorizeOperator";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
    /** address of the token holder which approves the authorization. */
    readonly holder: string;
    /** address of the operator which the authorization is granted to. */
    readonly operator: string;
  };
}

export function isAminoMsgAuthorizeOperator(msg: AminoMsg): msg is AminoMsgAuthorizeOperator {
  return msg.type === "lbm-sdk/token/MsgAuthorizeOperator";
}

export interface AminoMsgIssue extends AminoMsg {
  readonly type: "lbm-sdk/MsgIssue";
  readonly value: {
    /** name defines the human-readable name of the token class. mandatory (not ERC20 compliant). */
    readonly name: string;
    /** symbol is an abbreviated name for token class. mandatory (not ERC20 compliant). */
    readonly symbol: string;
    /** uri for the image of the token class stored off chain. */
    readonly uri: string;
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

// todo : how to distinguish between token lbm-sdk/MsgGrantPermission and collection lbm-sdk/MsgGrantPermission
export interface AminoMsgGrantPermission extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgGrantPermission";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
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

// todo : how to distinguish between token lbm-sdk/MsgRevokePermission and collection lbm-sdk/MsgRevokePermission
export interface AminoMsgRevokePermission extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgRevokePermission";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
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
    readonly contract_id: string;
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
    readonly contract_id: string;
    /** address whose tokens are being burned. */
    readonly from: string;
    /** number of tokens to burn. */
    readonly amount: string;
  };
}

export function isAminoMsgBurn(msg: AminoMsg): msg is AminoMsgBurn {
  return msg.type === "lbm-sdk/MsgBurn";
}

export interface AminoMsgOperatorBurn extends AminoMsg {
  readonly type: "lbm-sdk/MsgOperatorBurn";
  readonly value: {
    /** contract id associated with the token class. */
    readonly contract_id: string;
    /** address which triggers the burn. */
    readonly operator: string;
    /** address which the tokens will be burnt from. */
    readonly from: string;
    /** the amount of the burn. */
    readonly amount: string;
  };
}

export function isAminoMsgOperatorBurn(msg: AminoMsg): msg is AminoMsgOperatorBurn {
  return msg.type === "lbm-sdk/MsgOperatorBurn";
}

// todo : how to distinguish between token lbm-sdk/MsgModify and collection lbm-sdk/MsgModify
export interface AminoMsgModify extends AminoMsg {
  readonly type: "lbm-sdk/token/MsgModify";
  readonly value: {
    /** contract id associated with the contract. */
    contract_id: string;
    /** the address of the grantee which must have modify permission. */
    owner: string;
    /** changes to apply. */
    changes: Attribute[];
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
          contract_id: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contract_id, from, to, amount }: AminoMsgSend["value"]): MsgSend => {
        return {
          contractId: contract_id,
          from: from,
          to: to,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgOperatorSend": {
      aminoType: "lbm-sdk/MsgOperatorSend",
      toAmino: ({
        contractId,
        operator,
        from,
        to,
        amount,
      }: MsgOperatorSend): AminoMsgOperatorSend["value"] => {
        return {
          contract_id: contractId,
          operator: operator,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({
        contract_id,
        operator,
        from,
        to,
        amount,
      }: AminoMsgOperatorSend["value"]): MsgOperatorSend => {
        return {
          contractId: contract_id,
          operator: operator,
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
          contract_id: contractId,
          holder: holder,
          operator: operator,
        };
      },
      fromAmino: ({ contract_id, holder, operator }: AminoMsgRevokeOperator["value"]): MsgRevokeOperator => {
        return {
          contractId: contract_id,
          holder: holder,
          operator: operator,
        };
      },
    },
    "/lbm.token.v1.MsgAuthorizeOperator": {
      aminoType: "lbm-sdk/token/MsgAuthorizeOperator",
      toAmino: ({
        contractId,
        holder,
        operator,
      }: MsgAuthorizeOperator): AminoMsgAuthorizeOperator["value"] => {
        return {
          contract_id: contractId,
          holder: holder,
          operator: operator,
        };
      },
      fromAmino: ({
        contract_id,
        holder,
        operator,
      }: AminoMsgAuthorizeOperator["value"]): MsgAuthorizeOperator => {
        return {
          contractId: contract_id,
          holder: holder,
          operator: operator,
        };
      },
    },
    "/lbm.token.v1.MsgIssue": {
      aminoType: "lbm-sdk/MsgIssue",
      toAmino: ({
        name,
        symbol,
        uri,
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
          uri: uri,
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
        uri,
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
          uri: uri,
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
          contract_id: contractId,
          from: from,
          to: to,
          permission: permission,
        };
      },
      fromAmino: ({
        contract_id,
        from,
        to,
        permission,
      }: AminoMsgGrantPermission["value"]): MsgGrantPermission => {
        return {
          contractId: contract_id,
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
          contract_id: contractId,
          from: from,
          permission: permission,
        };
      },
      fromAmino: ({
        contract_id,
        from,
        permission,
      }: AminoMsgRevokePermission["value"]): MsgRevokePermission => {
        return {
          contractId: contract_id,
          from: from,
          permission: permission,
        };
      },
    },
    "/lbm.token.v1.MsgMint": {
      aminoType: "lbm-sdk/MsgMint",
      toAmino: ({ contractId, from, to, amount }: MsgMint): AminoMsgMint["value"] => {
        return {
          contract_id: contractId,
          from: from,
          to: to,
          amount: amount,
        };
      },
      fromAmino: ({ contract_id, from, to, amount }: AminoMsgMint["value"]): MsgMint => {
        return {
          contractId: contract_id,
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
          contract_id: contractId,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({ contract_id, from, amount }: AminoMsgBurn["value"]): MsgBurn => {
        return {
          contractId: contract_id,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgOperatorBurn": {
      aminoType: "lbm-sdk/MsgOperatorBurn",
      toAmino: ({ contractId, operator, from, amount }: MsgOperatorBurn): AminoMsgOperatorBurn["value"] => {
        return {
          contract_id: contractId,
          operator: operator,
          from: from,
          amount: amount,
        };
      },
      fromAmino: ({
        contract_id,
        operator,
        from,
        amount,
      }: AminoMsgOperatorBurn["value"]): MsgOperatorBurn => {
        return {
          contractId: contract_id,
          operator: operator,
          from: from,
          amount: amount,
        };
      },
    },
    "/lbm.token.v1.MsgModify": {
      aminoType: "lbm-sdk/token/MsgModify",
      toAmino: ({ contractId, owner, changes }: MsgModify): AminoMsgModify["value"] => {
        return {
          contract_id: contractId,
          owner: owner,
          changes: [...changes],
        };
      },
      fromAmino: ({ contract_id, owner, changes }: AminoMsgModify["value"]): MsgModify => {
        return {
          contractId: contract_id,
          owner: owner,
          changes: [...changes],
        };
      },
    },
  };
}
