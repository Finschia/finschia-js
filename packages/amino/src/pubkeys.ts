export interface Pubkey {
  // type is one of the strings defined in pubkeyType
  // I don't use a string literal union here as that makes trouble with json test data:
  // https://github.com/cosmos/cosmjs/pull/44#pullrequestreview-353280504
  readonly type: string;
  readonly value: any;
}

export interface Ed25519Pubkey extends SinglePubkey {
  readonly type: "ostracon/PubKeyEd25519";
  readonly value: string;
}

export function isEd25519Pubkey(pubkey: Pubkey): pubkey is Ed25519Pubkey {
  return (pubkey as Ed25519Pubkey).type === "ostracon/PubKeyEd25519";
}

export interface Secp256k1Pubkey extends SinglePubkey {
  readonly type: "ostracon/PubKeySecp256k1";
  readonly value: string;
}

export function isSecp256k1Pubkey(pubkey: Pubkey): pubkey is Secp256k1Pubkey {
  return (pubkey as Secp256k1Pubkey).type === "ostracon/PubKeySecp256k1";
}

export const pubkeyType = {
  /** @see https://github.com/line/ostracon/blob/530dbec427cf89feb0104f045c39e17360b71c7b/crypto/ed25519/ed25519.go#L24 */
  secp256k1: "ostracon/PubKeySecp256k1" as const,
  /** @see https://github.com/line/ostracon/blob/530dbec427cf89feb0104f045c39e17360b71c7b/crypto/secp256k1/secp256k1.go#L21 */
  ed25519: "ostracon/PubKeyEd25519" as const,
  /** @see https://github.com/line/ostracon/blob/530dbec427cf89feb0104f045c39e17360b71c7b/crypto/sr25519/encoding.go#L12 */
  sr25519: "ostracon/PubKeySr25519" as const,
  multisigThreshold: "ostracon/PubKeyMultisigThreshold" as const,
};

/**
 * A pubkey which contains the data directly without further nesting.
 *
 * You can think of this as a non-multisig pubkey.
 */
export interface SinglePubkey extends Pubkey {
  // type is one of the strings defined in pubkeyType
  // I don't use a string literal union here as that makes trouble with json test data:
  // https://github.com/cosmos/cosmjs/pull/44#pullrequestreview-353280504
  readonly type: string;
  /**
   * The base64 encoding of the Amino binary encoded pubkey.
   *
   * Note: if type is Secp256k1, this must contain a 33 bytes compressed pubkey.
   */
  readonly value: string;
}

export function isSinglePubkey(pubkey: Pubkey): pubkey is SinglePubkey {
  const singPubkeyTypes: string[] = [pubkeyType.ed25519, pubkeyType.secp256k1, pubkeyType.sr25519];
  return singPubkeyTypes.includes(pubkey.type);
}

export interface MultisigThresholdPubkey extends Pubkey {
  readonly type: "ostracon/PubKeyMultisigThreshold";
  readonly value: {
    /** A string-encoded integer */
    readonly threshold: string;
    readonly pubkeys: readonly SinglePubkey[];
  };
}

export function isMultisigThresholdPubkey(pubkey: Pubkey): pubkey is MultisigThresholdPubkey {
  return (pubkey as MultisigThresholdPubkey).type === "ostracon/PubKeyMultisigThreshold";
}
