import { addCoins } from "@cosmjs/amino";
import {
  Code,
  CodeDetails,
  Contract,
  ContractCodeHistoryEntry,
  JsonObject,
  setupWasmExtension,
  WasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { fromUtf8, toHex } from "@cosmjs/encoding";
import { Uint53 } from "@cosmjs/math";
import {
  Account,
  accountFromAny,
  AccountParser,
  AuthExtension,
  BankExtension,
  Block,
  BroadcastTxError,
  DeliverTxResponse,
  DistributionExtension,
  fromTendermintEvent,
  GovExtension,
  IndexedTx,
  isSearchByHeightQuery,
  isSearchBySentFromOrToQuery,
  isSearchByTagsQuery,
  MintExtension,
  QueryClient,
  SearchTxFilter,
  SearchTxQuery,
  SequenceResponse,
  setupAuthExtension,
  setupAuthzExtension,
  setupBankExtension,
  setupDistributionExtension,
  setupGovExtension,
  setupMintExtension,
  setupSlashingExtension,
  setupStakingExtension,
  StakingExtension,
  StargateClientOptions,
  TimeoutError,
} from "@cosmjs/stargate";
import { SlashingExtension } from "@cosmjs/stargate/build/modules";
import { AuthzExtension } from "@cosmjs/stargate/build/modules/authz/queries";
import {
  HttpEndpoint,
  Tendermint34Client,
  TendermintClient,
  toRfc3339WithNanoseconds,
} from "@cosmjs/tendermint-rpc";
import { assert, sleep } from "@cosmjs/utils";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { QueryDelegatorDelegationsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";
import { DelegationResponse } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import {
  CodeInfoResponse,
  QueryCodesResponse,
  QueryContractsByCodeResponse,
} from "cosmjs-types/cosmwasm/wasm/v1/query";
import { ContractCodeHistoryOperationType } from "cosmjs-types/cosmwasm/wasm/v1/types";

import {
  CollectionExtension,
  EvidenceExtension,
  FeeGrantExtension,
  FoundationExtension,
  IbcExtension,
  NodeExtension,
  setupCollectionExtension,
  setupEvidenceExtension,
  setupFeeGrantExtension,
  setupFoundationExtension,
  setupIbcExtension,
  setupNodeExtension,
  setupTokenExtension,
  setupTx2Extension,
  setupWasmplusExtension,
  TokenExtension,
  Tx2Extension,
  WasmplusExtension,
} from "./modules";

export type QueryClientWithExtensions = QueryClient &
  AuthExtension &
  BankExtension &
  AuthzExtension &
  SlashingExtension &
  CollectionExtension &
  DistributionExtension &
  EvidenceExtension &
  FeeGrantExtension &
  FoundationExtension &
  GovExtension &
  IbcExtension &
  MintExtension &
  StakingExtension &
  TokenExtension &
  Tx2Extension &
  WasmExtension &
  WasmplusExtension &
  NodeExtension;

function createQueryClientWithExtensions(tmClient: TendermintClient): QueryClientWithExtensions {
  return QueryClient.withExtensions(
    tmClient,
    setupAuthExtension,
    setupBankExtension,
    setupAuthzExtension,
    setupSlashingExtension,
    setupCollectionExtension,
    setupDistributionExtension,
    setupEvidenceExtension,
    setupFeeGrantExtension,
    setupFoundationExtension,
    setupGovExtension,
    setupIbcExtension,
    setupMintExtension,
    setupStakingExtension,
    setupTokenExtension,
    setupTx2Extension,
    setupWasmExtension,
    setupWasmplusExtension,
    setupNodeExtension,
  );
}

/** Use for testing only */
export interface PrivateFinschiaClient {
  readonly tmClient: TendermintClient | undefined;
  readonly queryClient: QueryClientWithExtensions | undefined;
}

export class FinschiaClient {
  private readonly tmClient: TendermintClient | undefined;
  private readonly queryClient: QueryClientWithExtensions | undefined;
  private readonly codesCache = new Map<number, CodeDetails>();
  private chainId: string | undefined;
  private readonly accountParser: AccountParser;

  public static async connect(
    endpoint: string | HttpEndpoint,
    options: StargateClientOptions = {},
  ): Promise<FinschiaClient> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new FinschiaClient(tmClient, options);
  }

  protected constructor(tmClient: TendermintClient | undefined, options: StargateClientOptions) {
    if (tmClient) {
      this.tmClient = tmClient;
      this.queryClient = createQueryClientWithExtensions(tmClient);
    }
    const { accountParser = accountFromAny } = options;
    this.accountParser = accountParser;
  }

  protected getTmClient(): TendermintClient | undefined {
    return this.tmClient;
  }

  protected forceGetTmClient(): TendermintClient {
    if (!this.tmClient) {
      throw new Error(
        "Tendermint client not available. You cannot use online functionality in offline mode.",
      );
    }
    return this.tmClient;
  }

  protected getQueryClient(): QueryClientWithExtensions | undefined {
    return this.queryClient;
  }

  protected forceGetQueryClient(): QueryClientWithExtensions {
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
        `Account '${address}' does not exist on chain. Send some tokens there before trying to query sequence.`,
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
            txIndex: result.txIndex,
            rawLog: result.rawLog,
            transactionHash: txId,
            events: result.events,
            gasUsed: result.gasUsed,
            gasWanted: result.gasWanted,
          }
        : pollForTx(txId);
    };

    const broadcasted = await this.forceGetTmClient().broadcastTxSync({ tx });
    if (broadcasted.code) {
      return Promise.reject(
        new BroadcastTxError(broadcasted.code, broadcasted.codespace ?? "", broadcasted.log),
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

  /**
   * getCodes() returns all codes and is just looping through all pagination pages.
   *
   * This is potentially inefficient and advanced apps should consider creating
   * their own query client to handle pagination together with the app's screens.
   */
  public async getCodes(): Promise<readonly Code[]> {
    const allCodes = [];

    let startAtKey: Uint8Array | undefined = undefined;
    do {
      const { codeInfos, pagination }: QueryCodesResponse =
        await this.forceGetQueryClient().wasm.listCodeInfo(startAtKey);
      const loadedCodes = codeInfos || [];
      allCodes.push(...loadedCodes);
      startAtKey = pagination?.nextKey;
    } while (startAtKey?.length !== 0);

    return allCodes.map((entry: CodeInfoResponse): Code => {
      assert(entry.creator && entry.codeId && entry.dataHash, "entry incomplete");
      return {
        id: entry.codeId.toNumber(),
        creator: entry.creator,
        checksum: toHex(entry.dataHash),
      };
    });
  }

  public async getCodeDetails(codeId: number): Promise<CodeDetails> {
    const cached = this.codesCache.get(codeId);
    if (cached) return cached;

    const { codeInfo, data } = await this.forceGetQueryClient().wasm.getCode(codeId);
    assert(
      codeInfo && codeInfo.codeId && codeInfo.creator && codeInfo.dataHash && data,
      "codeInfo missing or incomplete",
    );
    const codeDetails: CodeDetails = {
      id: codeInfo.codeId.toNumber(),
      creator: codeInfo.creator,
      checksum: toHex(codeInfo.dataHash),
      data: data,
    };
    this.codesCache.set(codeId, codeDetails);
    return codeDetails;
  }

  /**
   * getContracts() returns all contract instances for one code and is just looping through all pagination pages.
   *
   * This is potentially inefficient and advanced apps should consider creating
   * their own query client to handle pagination together with the app's screens.
   */
  public async getContracts(codeId: number): Promise<readonly string[]> {
    const allContracts = [];
    let startAtKey: Uint8Array | undefined = undefined;
    do {
      const { contracts, pagination }: QueryContractsByCodeResponse =
        await this.forceGetQueryClient().wasm.listContractsByCodeId(codeId, startAtKey);
      const loadedContracts = contracts || [];
      allContracts.push(...loadedContracts);
      startAtKey = pagination?.nextKey;
    } while (startAtKey?.length !== 0 && startAtKey !== undefined);

    return allContracts;
  }

  /**
   * Throws an error if no contract was found at the address
   */
  public async getContract(address: string): Promise<Contract> {
    const { address: retrievedAddress, contractInfo } = await this.forceGetQueryClient().wasm.getContractInfo(
      address,
    );
    if (!contractInfo) throw new Error(`No contract found at address "${address}"`);
    assert(retrievedAddress, "address missing");
    assert(contractInfo.codeId && contractInfo.creator && contractInfo.label, "contractInfo incomplete");
    return {
      address: retrievedAddress,
      codeId: contractInfo.codeId.toNumber(),
      creator: contractInfo.creator,
      admin: contractInfo.admin || undefined,
      label: contractInfo.label,
      ibcPortId: contractInfo.ibcPortId || undefined,
    };
  }

  /**
   * Throws an error if no contract was found at the address
   */
  public async getContractCodeHistory(address: string): Promise<readonly ContractCodeHistoryEntry[]> {
    const result = await this.forceGetQueryClient().wasm.getContractCodeHistory(address);
    if (!result) throw new Error(`No contract history found for address "${address}"`);
    const operations: Record<number, "Init" | "Genesis" | "Migrate"> = {
      [ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT]: "Init",
      [ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS]: "Genesis",
      [ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE]: "Migrate",
    };
    return (result.entries || []).map((entry): ContractCodeHistoryEntry => {
      assert(entry.operation && entry.codeId && entry.msg);
      return {
        operation: operations[entry.operation],
        codeId: entry.codeId.toNumber(),
        msg: JSON.parse(fromUtf8(entry.msg)),
      };
    });
  }

  /**
   * Returns the data at the key if present (raw contract dependent storage data)
   * or null if no data at this key.
   *
   * Promise is rejected when contract does not exist.
   */
  public async queryContractRaw(address: string, key: Uint8Array): Promise<Uint8Array | null> {
    // just test contract existence
    await this.getContract(address);

    const { data } = await this.forceGetQueryClient().wasm.queryContractRaw(address, key);
    return data ?? null;
  }

  /**
   * Makes a smart query on the contract, returns the parsed JSON document.
   *
   * Promise is rejected when contract does not exist.
   * Promise is rejected for invalid query format.
   * Promise is rejected for invalid response format.
   */
  public async queryContractSmart(address: string, queryMsg: JsonObject): Promise<JsonObject> {
    try {
      return await this.forceGetQueryClient().wasm.queryContractSmart(address, queryMsg);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith("not found: contract")) {
          throw new Error(`No contract found at address "${address}"`);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  public async queryMinimumGasPrice(): Promise<string | null> {
    return await this.forceGetQueryClient().node.config();
  }

  private async txsQuery(query: string): Promise<readonly IndexedTx[]> {
    const results = await this.forceGetTmClient().txSearchAll({ query: query });
    return results.txs.map((tx) => {
      return {
        height: tx.height,
        txIndex: tx.index,
        hash: toHex(tx.hash).toUpperCase(),
        code: tx.result.code,
        events: tx.result.events.map(fromTendermintEvent),
        rawLog: tx.result.log || "",
        tx: tx.tx,
        gasUsed: tx.result.gasUsed,
        gasWanted: tx.result.gasWanted,
      };
    });
  }
}
