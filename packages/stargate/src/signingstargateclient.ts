import { fromBase64 } from "@cosmjs/encoding";
import { Int53, Uint53 } from "@cosmjs/math";
import { assert, assertDefined } from "@cosmjs/utils";
import { encodeSecp256k1Pubkey, makeSignDoc as makeSignDocAmino, StdFee } from "@lbmjs/amino";
import { Tendermint34Client } from "@lbmjs/ostracon-rpc";
import {
  EncodeObject,
  encodePubkey,
  GeneratedType,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
} from "@lbmjs/proto-signing";
import { MsgTransfer } from "lbmjs-types/ibc/applications/transfer/v1/tx";
import {
  MsgAcknowledgement,
  MsgChannelCloseConfirm,
  MsgChannelCloseInit,
  MsgChannelOpenAck,
  MsgChannelOpenConfirm,
  MsgChannelOpenInit,
  MsgChannelOpenTry,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from "lbmjs-types/ibc/core/channel/v1/tx";
import { Height } from "lbmjs-types/ibc/core/client/v1/client";
import {
  MsgCreateClient,
  MsgSubmitMisbehaviour,
  MsgUpdateClient,
  MsgUpgradeClient,
} from "lbmjs-types/ibc/core/client/v1/tx";
import {
  MsgConnectionOpenAck,
  MsgConnectionOpenConfirm,
  MsgConnectionOpenInit,
  MsgConnectionOpenTry,
} from "lbmjs-types/ibc/core/connection/v1/tx";
import { MsgMultiSend } from "lbmjs-types/lbm/bank/v1/tx";
import { Coin } from "lbmjs-types/lbm/base/v1/coin";
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "lbmjs-types/lbm/distribution/v1/tx";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "lbmjs-types/lbm/gov/v1/tx";
import {
  MsgBeginRedelegate,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from "lbmjs-types/lbm/staking/v1/tx";
import {
  MsgApprove as TokenMsgApprove,
  MsgBurn as TokenMsgBurn,
  MsgBurnFrom as TokenMsgBurnFrom,
  MsgGrant as TokenMsgGrant,
  MsgIssue as TokenMsgIssue,
  MsgMint as TokenMsgMint,
  MsgModify as TokenMsgModify,
  MsgRevoke as TokenMsgRevoke,
  MsgTransfer as TokenMsgTransfer,
  MsgTransferFrom as TokenMsgTransferFrom,
} from "lbmjs-types/lbm/token/v1/tx";
import { SignMode } from "lbmjs-types/lbm/tx/signing/v1/signing";
import { TxRaw } from "lbmjs-types/lbm/tx/v1/tx";
import Long from "long";

import { AminoTypes } from "./aminotypes";
import {
  MsgDelegateEncodeObject,
  MsgSendEncodeObject,
  MsgTransferEncodeObject,
  MsgUndelegateEncodeObject,
  MsgWithdrawDelegatorRewardEncodeObject,
} from "./encodeobjects";
import { calculateFee, GasPrice } from "./fee";
import { DeliverTxResponse, StargateClient } from "./stargateclient";

export const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.bank.v1.MsgMultiSend", MsgMultiSend],
  ["/lbm.distribution.v1.MsgFundCommunityPool", MsgFundCommunityPool],
  ["/lbm.distribution.v1.MsgSetWithdrawAddress", MsgSetWithdrawAddress],
  ["/lbm.distribution.v1.MsgWithdrawDelegatorReward", MsgWithdrawDelegatorReward],
  ["/lbm.distribution.v1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission],
  ["/lbm.gov.v1.MsgDeposit", MsgDeposit],
  ["/lbm.gov.v1.MsgSubmitProposal", MsgSubmitProposal],
  ["/lbm.gov.v1.MsgVote", MsgVote],
  ["/lbm.staking.v1.MsgBeginRedelegate", MsgBeginRedelegate],
  ["/lbm.staking.v1.MsgCreateValidator", MsgCreateValidator],
  ["/lbm.staking.v1.MsgDelegate", MsgDelegate],
  ["/lbm.staking.v1.MsgEditValidator", MsgEditValidator],
  ["/lbm.staking.v1.MsgUndelegate", MsgUndelegate],
  ["/lbm.token.v1.MsgTransfer", TokenMsgTransfer],
  ["/lbm.token.v1.MsgTransferFrom", TokenMsgTransferFrom],
  ["/lbm.token.v1.MsgApprove", TokenMsgApprove],
  ["/lbm.token.v1.MsgIssue", TokenMsgIssue],
  ["/lbm.token.v1.MsgGrant", TokenMsgGrant],
  ["/lbm.token.v1.MsgRevoke", TokenMsgRevoke],
  ["/lbm.token.v1.MsgMint", TokenMsgMint],
  ["/lbm.token.v1.MsgBurn", TokenMsgBurn],
  ["/lbm.token.v1.MsgBurnFrom", TokenMsgBurnFrom],
  ["/lbm.token.v1.MsgModify", TokenMsgModify],
  ["/ibc.core.channel.v1.MsgChannelOpenInit", MsgChannelOpenInit],
  ["/ibc.core.channel.v1.MsgChannelOpenTry", MsgChannelOpenTry],
  ["/ibc.core.channel.v1.MsgChannelOpenAck", MsgChannelOpenAck],
  ["/ibc.core.channel.v1.MsgChannelOpenConfirm", MsgChannelOpenConfirm],
  ["/ibc.core.channel.v1.MsgChannelCloseInit", MsgChannelCloseInit],
  ["/ibc.core.channel.v1.MsgChannelCloseConfirm", MsgChannelCloseConfirm],
  ["/ibc.core.channel.v1.MsgRecvPacket", MsgRecvPacket],
  ["/ibc.core.channel.v1.MsgTimeout", MsgTimeout],
  ["/ibc.core.channel.v1.MsgTimeoutOnClose", MsgTimeoutOnClose],
  ["/ibc.core.channel.v1.MsgAcknowledgement", MsgAcknowledgement],
  ["/ibc.core.client.v1.MsgCreateClient", MsgCreateClient],
  ["/ibc.core.client.v1.MsgUpdateClient", MsgUpdateClient],
  ["/ibc.core.client.v1.MsgUpgradeClient", MsgUpgradeClient],
  ["/ibc.core.client.v1.MsgSubmitMisbehaviour", MsgSubmitMisbehaviour],
  ["/ibc.core.connection.v1.MsgConnectionOpenInit", MsgConnectionOpenInit],
  ["/ibc.core.connection.v1.MsgConnectionOpenTry", MsgConnectionOpenTry],
  ["/ibc.core.connection.v1.MsgConnectionOpenAck", MsgConnectionOpenAck],
  ["/ibc.core.connection.v1.MsgConnectionOpenConfirm", MsgConnectionOpenConfirm],
  ["/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer],
];

function createDefaultRegistry(): Registry {
  return new Registry(defaultRegistryTypes);
}

/**
 * Signing information for a single signer that is not included in the transaction.
 *
 * @see https://github.com/cosmos/cosmos-sdk/blob/v0.42.2/x/auth/signing/sign_mode_handler.go#L23-L37
 */
export interface SignerData {
  readonly accountNumber: number;
  readonly sequence: number;
  readonly chainId: string;
}

/** Use for testing only */
export interface PrivateSigningStargateClient {
  readonly registry: Registry;
}

export interface SigningStargateClientOptions {
  readonly registry?: Registry;
  readonly aminoTypes?: AminoTypes;
  readonly prefix?: string;
  readonly broadcastTimeoutMs?: number;
  readonly broadcastPollIntervalMs?: number;
  readonly gasPrice?: GasPrice;
}

export class SigningStargateClient extends StargateClient {
  public readonly registry: Registry;
  public readonly broadcastTimeoutMs: number | undefined;
  public readonly broadcastPollIntervalMs: number | undefined;

  private readonly signer: OfflineSigner;
  private readonly aminoTypes: AminoTypes;
  private readonly gasPrice: GasPrice | undefined;

  public static async connectWithSigner(
    endpoint: string,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    const tmClient = await Tendermint34Client.connect(endpoint);
    return new SigningStargateClient(tmClient, signer, options);
  }

  /**
   * Creates a client in offline mode.
   *
   * This should only be used in niche cases where you know exactly what you're doing,
   * e.g. when building an offline signing application.
   *
   * When you try to use online functionality with such a signer, an
   * exception will be raised.
   */
  public static async offline(
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    return new SigningStargateClient(undefined, signer, options);
  }

  protected constructor(
    tmClient: Tendermint34Client | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(tmClient);
    const { registry = createDefaultRegistry(), aminoTypes = new AminoTypes({ prefix: options.prefix }) } =
      options;
    this.registry = registry;
    this.aminoTypes = aminoTypes;
    this.signer = signer;
    this.broadcastTimeoutMs = options.broadcastTimeoutMs;
    this.broadcastPollIntervalMs = options.broadcastPollIntervalMs;
    this.gasPrice = options.gasPrice;
  }

  public async simulate(
    signerAddress: string,
    messages: readonly EncodeObject[],
    memo: string | undefined,
  ): Promise<number> {
    const anyMsgs = messages.map((m) => this.registry.encodeAsAny(m));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodeSecp256k1Pubkey(accountFromSigner.pubkey);
    const { sequence } = await this.getSequence(signerAddress);
    const { gasInfo } = await this.forceGetQueryClient().tx.simulate(anyMsgs, memo, pubkey, sequence);
    assertDefined(gasInfo);
    return Uint53.fromString(gasInfo.gasUsed.toString()).toNumber();
  }

  public async sendTokens(
    senderAddress: string,
    recipientAddress: string,
    amount: readonly Coin[],
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const sendMsg: MsgSendEncodeObject = {
      typeUrl: "/lbm.bank.v1.MsgSend",
      value: {
        fromAddress: senderAddress,
        toAddress: recipientAddress,
        amount: [...amount],
      },
    };
    return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
  }

  public async delegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const delegateMsg: MsgDelegateEncodeObject = {
      typeUrl: "/lbm.staking.v1.MsgDelegate",
      value: MsgDelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [delegateMsg], fee, memo);
  }

  public async undelegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const undelegateMsg: MsgUndelegateEncodeObject = {
      typeUrl: "/lbm.staking.v1.MsgUndelegate",
      value: MsgUndelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [undelegateMsg], fee, memo);
  }

  public async withdrawRewards(
    delegatorAddress: string,
    validatorAddress: string,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const withdrawMsg: MsgWithdrawDelegatorRewardEncodeObject = {
      typeUrl: "/lbm.distribution.v1.MsgWithdrawDelegatorReward",
      value: MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [withdrawMsg], fee, memo);
  }

  public async sendIbcTokens(
    senderAddress: string,
    recipientAddress: string,
    transferAmount: Coin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    /** timeout in seconds */
    timeoutTimestamp: number | undefined,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const timeoutTimestampNanoseconds = timeoutTimestamp
      ? Long.fromNumber(timeoutTimestamp).multiply(1_000_000_000)
      : undefined;
    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: MsgTransfer.fromPartial({
        sourcePort: sourcePort,
        sourceChannel: sourceChannel,
        sender: senderAddress,
        receiver: recipientAddress,
        token: transferAmount,
        timeoutHeight: timeoutHeight,
        timeoutTimestamp: timeoutTimestampNanoseconds,
      }),
    };
    return this.signAndBroadcast(senderAddress, [transferMsg], fee, memo);
  }

  public async signAndBroadcast(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    let usedFee: StdFee;
    if (fee == "auto" || typeof fee === "number") {
      assertDefined(this.gasPrice, "Gas price must be set in the client options when auto gas is used.");
      const gasEstimation = await this.simulate(signerAddress, messages, memo);
      const muliplier = typeof fee === "number" ? fee : 1.4;
      usedFee = calculateFee(Math.round(gasEstimation * muliplier), this.gasPrice);
    } else {
      usedFee = fee;
    }
    const txRaw = await this.sign(signerAddress, messages, usedFee, memo);
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.broadcastTx(txBytes, this.broadcastTimeoutMs, this.broadcastPollIntervalMs);
  }

  /**
   * Gets account number and sequence from the API, creates a sign doc,
   * creates a single signature and assembles the signed transaction.
   *
   * The sign mode (SIGN_MODE_DIRECT or SIGN_MODE_LEGACY_AMINO_JSON) is determined by this client's signer.
   *
   * You can pass signer data (account number, sequence and chain ID) explicitly instead of querying them
   * from the chain. This is needed when signing for a multisig account, but it also allows for offline signing
   * (See the SigningStargateClient.offline constructor).
   */
  public async sign(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData,
  ): Promise<TxRaw> {
    let signerData: SignerData;
    if (explicitSignerData) {
      signerData = explicitSignerData;
    } else {
      const { accountNumber, sequence } = await this.getSequence(signerAddress);
      const chainId = await this.getChainId();
      signerData = {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: chainId,
      };
    }

    return isOfflineDirectSigner(this.signer)
      ? this.signDirect(signerAddress, messages, fee, memo, signerData)
      : this.signAmino(signerAddress, messages, fee, memo, signerData);
  }

  private async signAmino(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData,
  ): Promise<TxRaw> {
    assert(!isOfflineDirectSigner(this.signer));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const msgs = messages.map((msg) => this.aminoTypes.toAmino(msg));
    const signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence);
    const { signature, signed } = await this.signer.signAmino(signerAddress, signDoc);
    const signedTxBody = {
      messages: signed.msgs.map((msg) => this.aminoTypes.fromAmino(msg)),
      memo: signed.memo,
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/lbm.tx.v1.TxBody",
      value: signedTxBody,
    };
    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
    const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signed.sequence).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signed.fee.amount,
      signedGasLimit,
      signMode,
    );
    return TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private async signDirect(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData,
  ): Promise<TxRaw> {
    assert(isOfflineDirectSigner(this.signer));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
    const txBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/lbm.tx.v1.TxBody",
      value: {
        messages: messages,
        memo: memo,
      },
    };
    const txBodyBytes = this.registry.encode(txBodyEncodeObject);
    const gasLimit = Int53.fromString(fee.gas).toNumber();
    const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence }], fee.amount, gasLimit);
    const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
    const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);
    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }
}
