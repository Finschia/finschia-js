import { JsonRpcRequest, JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import * as requests from "@cosmjs/tendermint-rpc";
import * as responses from "@cosmjs/tendermint-rpc";

export interface Adaptor {
  readonly params: Params;
  readonly responses: Responses;
  readonly hashTx: (tx: Uint8Array) => Uint8Array;
}

// Encoder is a generic that matches all methods of Params
export type Encoder<T extends requests.Request> = (req: T) => JsonRpcRequest;

// Decoder is a generic that matches all methods of Responses
export type Decoder<T extends responses.Response> = (res: JsonRpcSuccessResponse) => T;

export interface Params {
  readonly encodeStatus: (req: requests.StatusRequest) => JsonRpcRequest;
}

export interface Responses {
  readonly decodeStatus: (response: JsonRpcSuccessResponse) => responses.StatusResponse;
}
