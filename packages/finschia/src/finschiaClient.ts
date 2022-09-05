import { GeneratedType, OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes,
  QueryClient,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { HttpEndpoint, Tendermint34Client } from "@cosmjs/tendermint-rpc";

import {
  CollectionExtension,
  collectionTypes,
  EvidenceExtension,
  FeeGrantExtension,
  feegrantTypes,
  FoundationExtension,
  foundationTypes,
  IbcExtension,
  ibcTypes,
  setupCollectionExtension,
  setupEvidenceExtension,
  setupFeeGrantExtension,
  setupFoundationExtension,
  setupIbcExtension,
  setupTokenExtension,
  TokenExtension,
  tokenTypes,
} from "./modules";

export const finschiaRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ...feegrantTypes,
  ...ibcTypes,
  ...tokenTypes,
  ...foundationTypes,
  ...collectionTypes,
];

function createDefaultRegistry(): Registry {
  return new Registry(finschiaRegistryTypes);
}
export class FinschiaClient extends SigningStargateClient {
  public override readonly registry: Registry;

  private readonly finschiaQueryClient:
    | (QueryClient &
        CollectionExtension &
        EvidenceExtension &
        FeeGrantExtension &
        FoundationExtension &
        IbcExtension &
        TokenExtension)
    | undefined;

  public static override async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new FinschiaClient(tmClient, signer, options);
  }

  public static override async offline(
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    return new FinschiaClient(undefined, signer, options);
  }

  protected constructor(
    tmClient: Tendermint34Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient, signer, options);

    const { registry = createDefaultRegistry() } = options;
    this.registry = registry;

    if (tmClient) {
      this.finschiaQueryClient = QueryClient.withExtensions(
        tmClient,
        setupCollectionExtension,
        setupEvidenceExtension,
        setupFeeGrantExtension,
        setupFoundationExtension,
        setupIbcExtension,
        setupTokenExtension,
      );
    }
  }

  protected getFinschiaQueryClient():
    | (QueryClient &
        CollectionExtension &
        EvidenceExtension &
        FeeGrantExtension &
        FoundationExtension &
        IbcExtension &
        TokenExtension)
    | undefined {
    return this.finschiaQueryClient;
  }

  protected forceGetFinschiaQueryClient(): QueryClient &
    CollectionExtension &
    EvidenceExtension &
    FeeGrantExtension &
    FoundationExtension &
    IbcExtension &
    TokenExtension {
    if (!this.finschiaQueryClient) {
      throw new Error("Query client not available. You cannot use online functionality in offline mode.");
    }
    return this.finschiaQueryClient;
  }
}
