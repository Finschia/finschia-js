import { Pubkey } from "@lbmjs/amino";
import { encodePubkey } from "@lbmjs/proto-signing";
import { Any } from "lbmjs-types/google/protobuf/any";
import { SignMode } from "lbmjs-types/lbm/tx/signing/v1/signing";
import {
  GetTxRequest,
  GetTxResponse,
  ServiceClientImpl,
  SimulateRequest,
  SimulateResponse,
} from "lbmjs-types/lbm/tx/v1/service";
import { AuthInfo, Fee, Tx, TxBody } from "lbmjs-types/lbm/tx/v1/tx";
import Long from "long";

import { QueryClient } from "./queryclient";
import { createProtobufRpcClient } from "./utils";

export interface TxExtension {
  readonly tx: {
    getTx: (txId: string) => Promise<GetTxResponse>;
    simulate: (
      messages: readonly Any[],
      memo: string | undefined,
      signer: Pubkey,
      sequence: number,
    ) => Promise<SimulateResponse>;
    // Add here with tests:
    // - broadcastTx
    // - getTxsEvent
  };
}

export function setupTxExtension(base: QueryClient): TxExtension {
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const rpc = createProtobufRpcClient(base);
  const queryService = new ServiceClientImpl(rpc);

  return {
    tx: {
      getTx: async (txId: string) => {
        const request: GetTxRequest = {
          hash: txId,
        };
        const response = await queryService.GetTx(request);
        return response;
      },
      simulate: async (
        messages: readonly Any[],
        memo: string | undefined,
        signer: Pubkey,
        sequence: number,
      ) => {
        const request = SimulateRequest.fromPartial({
          tx: Tx.fromPartial({
            authInfo: AuthInfo.fromPartial({
              fee: Fee.fromPartial({}),
              signerInfos: [
                {
                  publicKey: encodePubkey(signer),
                  sequence: Long.fromNumber(sequence, true),
                  modeInfo: { single: { mode: SignMode.SIGN_MODE_UNSPECIFIED } },
                },
              ],
            }),
            body: TxBody.fromPartial({
              messages: Array.from(messages),
              memo: memo,
            }),
            signatures: [new Uint8Array()],
          }),
          // Sending serialized `txBytes` is the future. But
          // this is not available in Comsos SDK 0.42.
          // txBytes: undefined,
        });
        const response = await queryService.Simulate(request);
        return response;
      },
    },
  };
}
