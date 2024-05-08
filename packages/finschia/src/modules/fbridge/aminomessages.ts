/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg } from "@cosmjs/amino";
import { AminoConverters } from "@cosmjs/stargate";
import {
  bridgeStatusFromJSON,
  roleFromJSON,
  voteOptionFromJSON,
} from "@finschia/finschia-proto/lbm/fbridge/v1/fbridge";
import {
  MsgAddVoteForRole,
  MsgSetBridgeStatus,
  MsgSuggestRole,
  MsgTransfer,
} from "@finschia/finschia-proto/lbm/fbridge/v1/tx";

import { longify } from "../../utils";

export interface AminoMsgTransfer extends AminoMsg {
  readonly type: "lbm-sdk/MsgTransfer";
  readonly value: {
    readonly sender: string;
    readonly receiver: string;
    readonly amount: string;
  };
}

export function isAminoMsgTransfer(msg: AminoMsg): msg is AminoMsgTransfer {
  return msg.type === "lbm-sdk/MsgTransfer";
}

export interface AminoMsgSuggestRole extends AminoMsg {
  readonly type: "lbm-sdk/MsgSuggestRole";
  readonly value: {
    readonly from: string;
    readonly target: string;
    readonly role: number;
  };
}

export function isAminoMsgSuggestRole(msg: AminoMsg): msg is AminoMsgSuggestRole {
  return msg.type === "lbm-sdk/MsgSuggestRole";
}

export interface AminoMsgAddVoteForRole extends AminoMsg {
  readonly type: "lbm-sdk/MsgAddVoteForRole";
  readonly value: {
    /** the guardian address */
    readonly from: string;
    /** the proposal ID */
    readonly proposal_id: string;
    /** the vote option */
    readonly option: number;
  };
}

export function isAminoMsgAddVoteForRole(msg: AminoMsg): msg is AminoMsgAddVoteForRole {
  return msg.type === "lbm-sdk/MsgAddVoteForRole";
}

export interface AminoMsgSetBridgeStatus extends AminoMsg {
  readonly type: "lbm-sdk/MsgSetBridgeStatus";
  readonly value: {
    /** the guardian address */
    readonly guardian: string;
    readonly status: number;
  };
}

export function isAminoMsgSetBridgeStatus(msg: AminoMsg): msg is AminoMsgSetBridgeStatus {
  return msg.type === "lbm-sdk/MsgSetBridgeStatus";
}

export function createFbridgeAminoConverters(): AminoConverters {
  return {
    "/lbm.fbridge.v1.MsgTransfer": {
      aminoType: "lbm-sdk/MsgTransfer",
      toAmino: ({ sender, receiver, amount }: MsgTransfer): AminoMsgTransfer["value"] => {
        return {
          sender: sender,
          receiver: receiver,
          amount: amount,
        };
      },
      fromAmino: ({ sender, receiver, amount }: AminoMsgTransfer["value"]): MsgTransfer => {
        return {
          sender: sender,
          receiver: receiver,
          amount: amount,
        };
      },
    },
    "/lbm.fbridge.v1.MsgSuggestRole": {
      aminoType: "lbm-sdk/MsgSuggestRole",
      toAmino: ({ from, target, role }: MsgSuggestRole): AminoMsgSuggestRole["value"] => {
        return {
          from: from,
          target: target,
          role: roleFromJSON(role),
        };
      },
      fromAmino: ({ from, target, role }: AminoMsgSuggestRole["value"]): MsgSuggestRole => {
        return {
          from: from,
          target: target,
          role: role,
        };
      },
    },
    "/lbm.fbridge.v1.MsgAddVoteForRole": {
      aminoType: "lbm-sdk/MsgAddVoteForRole",
      toAmino: ({ from, proposalId, option }: MsgAddVoteForRole): AminoMsgAddVoteForRole["value"] => {
        return {
          from: from,
          proposal_id: proposalId.toString(),
          option: option,
        };
      },
      fromAmino: ({ from, proposal_id, option }: AminoMsgAddVoteForRole["value"]): MsgAddVoteForRole => {
        return {
          from: from,
          proposalId: longify(proposal_id),
          option: voteOptionFromJSON(option),
        };
      },
    },
    "/lbm.fbridge.v1.MsgSetBridgeStatus": {
      aminoType: "lbm-sdk/MsgSetBridgeStatus",
      toAmino: ({ guardian, status }: MsgSetBridgeStatus): AminoMsgSetBridgeStatus["value"] => {
        return {
          guardian: guardian,
          status: status,
        };
      },
      fromAmino: ({ guardian, status }: AminoMsgSetBridgeStatus["value"]): MsgSetBridgeStatus => {
        return {
          guardian: guardian,
          status: bridgeStatusFromJSON(status),
        };
      },
    },
  };
}
