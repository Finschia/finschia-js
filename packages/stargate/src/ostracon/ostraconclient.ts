/* eslint-disable @typescript-eslint/naming-convention */
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import * as requests from "@cosmjs/tendermint-rpc";
import * as responses from "@cosmjs/tendermint-rpc";
import { HttpClient, HttpEndpoint, WebsocketClient } from "@cosmjs/tendermint-rpc";
import { Stream } from "xstream";

import { adaptorOstracon, Decoder, Encoder, Params, Responses } from "./adaptor";
import { createJsonRpcRequest } from "./jsonrpc";
import { BlockSearchParams } from "./requests";
import { BlockSearchResponse } from "./responses";
import { RpcClient } from "./rpcclient/rpcclient";

export class OstraconClient {
  public static async connect(endpoint: string | HttpEndpoint): Promise<OstraconClient> {
    if (typeof endpoint === "object") {
      return OstraconClient.create(new HttpClient(endpoint));
    } else {
      const useHttp = endpoint.startsWith("http://") || endpoint.startsWith("https://");
      const rpcClient = useHttp ? new HttpClient(endpoint) : new WebsocketClient(endpoint);
      return OstraconClient.create(rpcClient);
    }
  }

  public static async create(rpcClient: RpcClient): Promise<OstraconClient> {
    // For some very strange reason I don't understand, tests start to fail on some systems
    // (our CI) when skipping the status call before doing other queries. Sleeping a little
    // while did not help. Thus, we query the version as a way to say "hi" to the backend,
    // even in cases where we don't use the result.
    const _version = await this.detectVersion(rpcClient);
    const tendermintClient = await Tendermint34Client.create(rpcClient);
    return new OstraconClient(rpcClient, tendermintClient);
  }

  private static async detectVersion(client: RpcClient): Promise<string> {
    const req = createJsonRpcRequest(requests.Method.Status);
    const response = await client.execute(req);
    const result = response.result;

    if (!result || !result.node_info) {
      throw new Error("Unrecognized format for status response");
    }

    const version = result.node_info.version;
    if (typeof version !== "string") {
      throw new Error("Unrecognized version format: must be string");
    }
    return version;
  }

  private readonly tmClient: Tendermint34Client;
  private readonly client: RpcClient;
  private readonly p: Params;
  private readonly r: Responses;

  private constructor(client: RpcClient, tendermint: Tendermint34Client) {
    this.tmClient = tendermint;
    this.client = client;
    this.p = adaptorOstracon.params;
    this.r = adaptorOstracon.responses;
  }

  public disconnect(): void {
    this.tmClient.disconnect();
  }

  public async abciInfo(): Promise<responses.AbciInfoResponse> {
    return this.tmClient.abciInfo();
  }

  public async abciQuery(params: requests.AbciQueryParams): Promise<responses.AbciQueryResponse> {
    return this.tmClient.abciQuery(params);
  }

  public async block(height?: number): Promise<responses.BlockResponse> {
    return this.tmClient.block(height);
  }

  public async blockResults(height?: number): Promise<responses.BlockResultsResponse> {
    return this.tmClient.blockResults(height);
  }

  /**
   * Search for events that are in a block.
   *
   * NOTE
   * This method will error on any node that is running a Tendermint version lower than 0.34.9.
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/block_search
   */
  public async blockSearch(params: BlockSearchParams): Promise<BlockSearchResponse> {
    return this.tmClient.blockSearch(params);
  }

  public async blockSearchAll(params: BlockSearchParams): Promise<BlockSearchResponse> {
    return this.tmClient.blockSearchAll(params);
  }

  /**
   * Queries block headers filtered by minHeight <= height <= maxHeight.
   *
   * @param minHeight The minimum height to be included in the result. Defaults to 0.
   * @param maxHeight The maximum height to be included in the result. Defaults to infinity.
   */
  public async blockchain(minHeight?: number, maxHeight?: number): Promise<responses.BlockchainResponse> {
    return this.tmClient.blockchain(minHeight, maxHeight);
  }

  /**
   * Broadcast transaction to mempool and wait for response
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_sync
   */
  public async broadcastTxSync(
    params: requests.BroadcastTxParams,
  ): Promise<responses.BroadcastTxSyncResponse> {
    return this.tmClient.broadcastTxSync(params);
  }

  /**
   * Broadcast transaction to mempool and do not wait for result
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_async
   */
  public async broadcastTxAsync(
    params: requests.BroadcastTxParams,
  ): Promise<responses.BroadcastTxAsyncResponse> {
    return this.tmClient.broadcastTxAsync(params);
  }

  /**
   * Broadcast transaction to mempool and wait for block
   *
   * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_commit
   */
  public async broadcastTxCommit(
    params: requests.BroadcastTxParams,
  ): Promise<responses.BroadcastTxCommitResponse> {
    return this.tmClient.broadcastTxCommit(params);
  }

  public async commit(height?: number): Promise<responses.CommitResponse> {
    return this.tmClient.commit(height);
  }

  public async genesis(): Promise<responses.GenesisResponse> {
    return this.tmClient.genesis();
  }

  public async health(): Promise<responses.HealthResponse> {
    return this.tmClient.health();
  }

  public async status(): Promise<responses.StatusResponse> {
    const query: responses.StatusRequest = { method: requests.Method.Status };
    return this.doCall(query, this.p.encodeStatus, this.r.decodeStatus);
  }

  public subscribeNewBlock(): Stream<responses.NewBlockEvent> {
    return this.tmClient.subscribeNewBlock();
  }

  public subscribeNewBlockHeader(): Stream<responses.NewBlockHeaderEvent> {
    return this.tmClient.subscribeNewBlockHeader();
  }

  public subscribeTx(query?: string): Stream<responses.TxEvent> {
    return this.tmClient.subscribeTx(query);
  }

  /**
   * Get a single transaction by hash
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx
   */
  public async tx(params: requests.TxParams): Promise<responses.TxResponse> {
    return this.tmClient.tx(params);
  }

  /**
   * Search for transactions that are in a block
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx_search
   */
  public async txSearch(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    return this.tmClient.txSearch(params);
  }

  public async txSearchAll(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    return this.tmClient.txSearchAll(params);
  }

  public async validators(params: requests.ValidatorsParams): Promise<responses.ValidatorsResponse> {
    return this.tmClient.validators(params);
  }

  public async validatorsAll(height?: number): Promise<responses.ValidatorsResponse> {
    return this.tmClient.validatorsAll(height);
  }

  // doCall is a helper to handle the encode/call/decode logic
  private async doCall<T extends requests.Request, U extends responses.Response>(
    request: T,
    encode: Encoder<T>,
    decode: Decoder<U>,
  ): Promise<U> {
    const req = encode(request);
    const result = await this.client.execute(req);
    return decode(result);
  }
}
