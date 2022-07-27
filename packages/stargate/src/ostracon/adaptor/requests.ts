import { JsonRpcRequest } from "@cosmjs/json-rpc";
import * as requests from "@cosmjs/tendermint-rpc";

import { createJsonRpcRequest } from "../jsonrpc";

export class Params {
  public static encodeStatus(req: requests.StatusRequest): JsonRpcRequest {
    return createJsonRpcRequest(req.method);
  }
}
