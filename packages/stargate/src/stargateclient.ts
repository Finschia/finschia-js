/* eslint-disable @typescript-eslint/naming-convention */
import { addCoins } from "@cosmjs/amino";
import { toHex } from "@cosmjs/encoding";
import { Uint53 } from "@cosmjs/math";
import { HttpEndpoint, Tendermint34Client, toRfc3339WithNanoseconds } from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { QueryDelegatorDelegationsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";
import { DelegationResponse } from "cosmjs-types/cosmos/staking/v1beta1/staking";

import { Account, accountFromAny, AccountParser } from "./accounts";
import {
  AuthExtension,
  BankExtension,
  setupAuthExtension,
  setupBankExtension,
  setupStakingExtension,
  setupTxExtension,
  StakingExtension,
  TxExtension,
} from "./modules";
import { QueryClient } from "./queryclient";
import {
  isSearchByHeightQuery,
  isSearchBySentFromOrToQuery,
  isSearchByTagsQuery,
  SearchTxFilter,
  SearchTxQuery,
} from "./search";

export class TimeoutError extends Error {
  public readonly txId: string;

  public constructor(message: string, txId: string) {
    super(message);
    this.txId = txId;
  }
}

export interface BlockHeader {
  readonly version: {
    readonly block: string;
    readonly app: string;
  };
  readonly height: number;
  readonly chainId: string;
  /** An RFC 3339 time string like e.g. '2020-02-15T10:39:10.4696305Z' */
  readonly time: string;
}

export interface Block {
  /** The ID is a hash of the block header (uppercase hex) */
  readonly id: string;
  readonly header: BlockHeader;
  /** Array of raw transactions */
  readonly txs: readonly Uint8Array[];
}

/** A transaction that is indexed as part of the transaction history */
export interface IndexedTx {
  readonly height: number;
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly hash: string;
  /** Transaction execution error code. 0 on success. */
  readonly code: number;
  readonly rawLog: string;
  /**
   * Raw transaction bytes stored in Tendermint.
   *
   * If you hash this, you get the transaction hash (= transaction ID):
   *
   * ```js
   * import { sha256 } from "@cosmjs/crypto";
   * import { toHex } from "@cosmjs/encoding";
   *
   * const transactionId = toHex(sha256(indexTx.tx)).toUpperCase();
   * ```
   *
   * Use `decodeTxRaw` from @lbmjs/proto-signing to decode this.
   */
  readonly tx: Uint8Array;
  readonly gasUsed: number;
  readonly gasWanted: number;
}

export interface SequenceResponse {
  readonly accountNumber: number;
  readonly sequence: number;
}

/**
 * The response after successfully broadcasting a transaction.
 * Success or failure refer to the execution result.
 */
export interface DeliverTxResponse {
  readonly height: number;
  /** Error code. The transaction suceeded iff code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
  readonly data?: readonly MsgData[];
  readonly gasUsed: number;
  readonly gasWanted: number;
}

export function isDeliverTxFailure(result: DeliverTxResponse): boolean {
  return !!result.code;
}

export function isDeliverTxSuccess(result: DeliverTxResponse): boolean {
  return !isDeliverTxFailure(result);
}

/**
 * Ensures the given result is a success. Throws a detailed error message otherwise.
 */
export function assertIsDeliverTxSuccess(result: DeliverTxResponse): void {
  if (isDeliverTxFailure(result)) {
    throw new Error(
      `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`,
    );
  }
}

/**
 * Ensures the given result is a failure. Throws a detailed error message otherwise.
 */
export function assertIsDeliverTxFailure(result: DeliverTxResponse): void {
  if (isDeliverTxSuccess(result)) {
    throw new Error(
      `Transaction ${result.transactionHash} did not fail at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`,
    );
  }
}

/** Use for testing only */
export interface PrivateStargateClient {
  readonly tmClient: Tendermint34Client | undefined;
}

export interface StargateClientOptions {
  readonly accountParser?: AccountParser;
}

export class StargateClient {
  private readonly tmClient: Tendermint34Client | undefined;
  private readonly queryClient:
    | (QueryClient & AuthExtension & BankExtension & StakingExtension & TxExtension)
    | undefined;
  private chainId: string | undefined;
  private readonly accountParser: AccountParser;

  public static async connect(
    endpoint: string | HttpEndpoint,
    options: StargateClientOptions = {},
  ): Promise<StargateClient> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new StargateClient(tmClient, options);
  }

  protected constructor(tmClient: Tendermint34Client | undefined, options: StargateClientOptions) {
    if (tmClient) {
      this.tmClient = tmClient;
      this.queryClient = QueryClient.withExtensions(
        tmClient,
        setupAuthExtension,
        setupBankExtension,
        setupStakingExtension,
        setupTxExtension,
      );
    }
    const { accountParser = accountFromAny } = options;
    this.accountParser = accountParser;
  }

  protected getTmClient(): Tendermint34Client | undefined {
    return this.tmClient;
  }

  protected forceGetTmClient(): Tendermint34Client {
    if (!this.tmClient) {
      throw new Error(
        "Tendermint client not available. You cannot use online functionality in offline mode.",
      );
    }
    return this.tmClient;
  }

  protected getQueryClient():
    | (QueryClient & AuthExtension & BankExtension & StakingExtension & TxExtension)
    | undefined {
    return this.queryClient;
  }

  protected forceGetQueryClient(): QueryClient &
    AuthExtension &
    BankExtension &
    StakingExtension &
    TxExtension {
    if (!this.queryClient) {
      throw new Error("Query client not available. You cannot use online functionality in offline mode.");
    }
    return this.queryClient;
  }

  public async getChainId(): Promise<string> {
    if (!this.chainId) {
      const response = await this.forceGetTmClient().status();
      const chainId = response.nodeInfo.network;
      if (!chainId) throw new Error("Chain ID must not be empty");
      this.chainId = chainId;
    }

    return this.chainId;
  }

  public async getHeight(): Promise<number> {
    const status = await this.forceGetTmClient().status();
    return status.syncInfo.latestBlockHeight;
  }

  public async getAccount(searchAddress: string): Promise<Account | null> {
    try {
      const account = await this.forceGetQueryClient().auth.account(searchAddress);
      return account ? this.accountParser(account) : null;
    } catch (error: any) {
      if (/rpc error: code = NotFound/i.test(error.toString())) {
        return null;
      }
      throw error;
    }
  }

  public async getSequence(address: string): Promise<SequenceResponse> {
    const account = await this.getAccount(address);
    if (!account) {
      throw new Error(
        "Account does not exist on chain. Send some tokens there before trying to query sequence.",
      );
    }
    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
    };
  }

  public async getBlock(height?: number): Promise<Block> {
    const response = await this.forceGetTmClient().block(height);
    return {
      id: toHex(response.blockId.hash).toUpperCase(),
      header: {
        version: {
          block: new Uint53(response.block.header.version.block).toString(),
          app: new Uint53(response.block.header.version.app).toString(),
        },
        height: response.block.header.height,
        chainId: response.block.header.chainId,
        time: toRfc3339WithNanoseconds(response.block.header.time),
      },
      txs: response.block.txs,
    };
  }

  public async getBalance(address: string, searchDenom: string): Promise<Coin> {
    return this.forceGetQueryClient().bank.balance(address, searchDenom);
  }

  /**
   * Queries all balances for all denoms that belong to this address.
   *
   * Uses the grpc queries (which iterates over the store internally), and we cannot get
   * proofs from such a method.
   */
  public async getAllBalances(address: string): Promise<readonly Coin[]> {
    return this.forceGetQueryClient().bank.allBalances(address);
  }

  public async getBalanceStaked(address: string): Promise<Coin | null> {
    const allDelegations = [];
    let startAtKey: Uint8Array | undefined = undefined;
    do {
      const { delegationResponses, pagination }: QueryDelegatorDelegationsResponse =
        await this.forceGetQueryClient().staking.delegatorDelegations(address, startAtKey);

      const loadedDelegations = delegationResponses || [];
      allDelegations.push(...loadedDelegations);
      startAtKey = pagination?.nextKey;
    } while (startAtKey !== undefined && startAtKey.length !== 0);

    const sumValues = allDelegations.reduce(
      (previousValue: Coin | null, currentValue: DelegationResponse): Coin => {
        // Safe because field is set to non-nullable (https://github.com/cosmos/cosmos-sdk/blob/v0.45.3/proto/cosmos/staking/v1beta1/staking.proto#L295)
        assert(currentValue.balance);
        return previousValue !== null ? addCoins(previousValue, currentValue.balance) : currentValue.balance;
      },
      null,
    );

    return sumValues;
  }

  public async getDelegation(delegatorAddress: string, validatorAddress: string): Promise<Coin | null> {
    let delegatedAmount: Coin | undefined;
    try {
      delegatedAmount = (
        await this.forceGetQueryClient().staking.delegation(delegatorAddress, validatorAddress)
      ).delegationResponse?.balance;
    } catch (e: any) {
      if (e.toString().includes("key not found")) {
        // ignore, `delegatedAmount` remains undefined
      } else {
        throw e;
      }
    }
    return delegatedAmount || null;
  }

  public async getTx(id: string): Promise<IndexedTx | null> {
    const results = await this.txsQuery(`tx.hash='${id}'`);
    return results[0] ?? null;
  }

  public async searchTx(query: SearchTxQuery, filter: SearchTxFilter = {}): Promise<readonly IndexedTx[]> {
    const minHeight = filter.minHeight || 0;
    const maxHeight = filter.maxHeight || Number.MAX_SAFE_INTEGER;

    if (maxHeight < minHeight) return []; // optional optimization

    function withFilters(originalQuery: string): string {
      return `${originalQuery} AND tx.height>=${minHeight} AND tx.height<=${maxHeight}`;
    }

    let txs: readonly IndexedTx[];

    if (isSearchByHeightQuery(query)) {
      txs =
        query.height >= minHeight && query.height <= maxHeight
          ? await this.txsQuery(`tx.height=${query.height}`)
          : [];
    } else if (isSearchBySentFromOrToQuery(query)) {
      const sentQuery = withFilters(`message.module='bank' AND transfer.sender='${query.sentFromOrTo}'`);
      const receivedQuery = withFilters(
        `message.module='bank' AND transfer.recipient='${query.sentFromOrTo}'`,
      );
      const [sent, received] = await Promise.all(
        [sentQuery, receivedQuery].map((rawQuery) => this.txsQuery(rawQuery)),
      );
      const sentHashes = sent.map((t) => t.hash);
      txs = [...sent, ...received.filter((t) => !sentHashes.includes(t.hash))];
    } else if (isSearchByTagsQuery(query)) {
      const rawQuery = withFilters(query.tags.map((t) => `${t.key}='${t.value}'`).join(" AND "));
      txs = await this.txsQuery(rawQuery);
    } else {
      throw new Error("Unknown query type");
    }

    const filtered = txs.filter((tx) => tx.height >= minHeight && tx.height <= maxHeight);
    return filtered;
  }

  public disconnect(): void {
    if (this.tmClient) this.tmClient.disconnect();
  }

  /**
   * Broadcasts a signed transaction to the network and monitors its inclusion in a block.
   *
   * If broadcasting is rejected by the node for some reason (e.g. because of a CheckTx failure),
   * an error is thrown.
   *
   * If the transaction is not included in a block before the provided timeout, this errors with a `TimeoutError`.
   *
   * If the transaction is included in a block, a `DeliverTxResponse` is returned. The caller then
   * usually needs to check for execution success or failure.
   */
  public async broadcastTx(
    tx: Uint8Array,
    timeoutMs = 60_000,
    pollIntervalMs = 3_000,
  ): Promise<DeliverTxResponse> {
    let timedOut = false;
    const txPollTimeout = setTimeout(() => {
      timedOut = true;
    }, timeoutMs);

    const pollForTx = async (txId: string): Promise<DeliverTxResponse> => {
      if (timedOut) {
        throw new TimeoutError(
          `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
            timeoutMs / 10000
          } seconds.`,
          txId,
        );
      }
      await sleep(pollIntervalMs);
      const result = await this.getTx(txId);
      return result
        ? {
            code: result.code,
            height: result.height,
            rawLog: result.rawLog,
            transactionHash: txId,
            gasUsed: result.gasUsed,
            gasWanted: result.gasWanted,
          }
        : pollForTx(txId);
    };

    const broadcasted = await this.forceGetTmClient().broadcastTxSync({ tx });
    if (broadcasted.code) {
      return Promise.reject(
        new Error(
          `Broadcasting transaction failed with code ${broadcasted.code} (codespace: ${broadcasted.codeSpace}). Log: ${broadcasted.log}`,
        ),
      );
    }
    const transactionId = toHex(broadcasted.hash).toUpperCase();
    return new Promise((resolve, reject) =>
      pollForTx(transactionId).then(
        (value) => {
          clearTimeout(txPollTimeout);
          resolve(value);
        },
        (error) => {
          clearTimeout(txPollTimeout);
          reject(error);
        },
      ),
    );
  }

  private async txsQuery(query: string): Promise<readonly IndexedTx[]> {
    const results = await this.forceGetTmClient().txSearchAll({ query: query });
    return results.txs.map((tx) => {
      return {
        height: tx.height,
        hash: toHex(tx.hash).toUpperCase(),
        code: tx.result.code,
        rawLog: tx.result.log || "",
        tx: tx.tx,
        gasUsed: tx.result.gasUsed,
        gasWanted: tx.result.gasWanted,
      };
    });
  }
}
