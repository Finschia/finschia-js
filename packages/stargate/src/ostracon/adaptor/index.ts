import { sha256 } from "@cosmjs/crypto";

import { Params } from "./requests";
import { Responses } from "./responses";
import { Adaptor } from "./types";

export { Decoder, Encoder, Params, Responses } from "./types";

export const adaptorOstracon: Adaptor = {
  params: Params,
  responses: Responses,
  hashTx: sha256,
};
