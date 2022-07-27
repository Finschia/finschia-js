import { BlockResponse } from "@cosmjs/tendermint-rpc";

export interface BlockSearchResponse {
  readonly blocks: readonly BlockResponse[];
  readonly totalCount: number;
}
