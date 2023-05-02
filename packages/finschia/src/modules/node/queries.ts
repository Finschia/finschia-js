import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { ServiceClientImpl } from "@finschia/finschia-proto/cosmos/base/node/v1beta1/query";

export interface NodeExtension {
  readonly node: {
    readonly config: () => Promise<string | null>;
  };
}

export function setupNodeExtension(base: QueryClient): NodeExtension {
  const rpc = createProtobufRpcClient(base);

  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new ServiceClientImpl(rpc);

  return {
    node: {
      config: async () => {
        const response = await queryService.Config({});
        return response.minimumGasPrice ?? null;
      },
    },
  };
}
