import {
  createPagination,
  createProtobufRpcClient,
  QueryClient,
  setupTxExtension,
  TxExtension,
} from "@cosmjs/stargate";
import { GetBlockWithTxsResponse, ServiceClientImpl } from "@finschia/finschia-proto/lbm/tx/v1beta1/service";
import Long from "long";

export interface Tx2Extension extends TxExtension {
  readonly tx2: {
    readonly getBlockWithTxs: (height: Long, paginationKey?: Uint8Array) => Promise<GetBlockWithTxsResponse>;
  };
}

export function setupTx2Extension(base: QueryClient): Tx2Extension {
  const txExtension = setupTxExtension(base);
  const rpc = createProtobufRpcClient(base);

  // GetBlockWithTxs(request: GetBlockWithTxsRequest): Promise<GetBlockWithTxsResponse>;
  const queryService = new ServiceClientImpl(rpc);
  return {
    tx: txExtension.tx,
    tx2: {
      getBlockWithTxs: async (height: Long, paginationKey?: Uint8Array) => {
        return await queryService.GetBlockWithTxs({
          height: height,
          pagination: createPagination(paginationKey),
        });
      },
    },
  };
}
