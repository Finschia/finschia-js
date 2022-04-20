import { EncodeObject, GeneratedType } from "@lbmjs/proto-signing";
import { MsgMultiSend, MsgSend } from "lbmjs-types/lbm/bank/v1/tx";

export const bankTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.bank.v1.MsgMultiSend", MsgMultiSend],
  ["/lbm.bank.v1.MsgSend", MsgSend],
];

export interface MsgSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.bank.v1.MsgSend";
  readonly value: Partial<MsgSend>;
}

export function isMsgSendEncodeObject(encodeObject: EncodeObject): encodeObject is MsgSendEncodeObject {
  return (encodeObject as MsgSendEncodeObject).typeUrl === "/lbm.bank.v1.MsgSend";
}
