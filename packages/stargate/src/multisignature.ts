import { Bech32 } from "@cosmjs/encoding";
import { MultisigThresholdPubkey, pubkeyToAddress, StdFee } from "@lbmjs/amino";
import { encodePubkey } from "@lbmjs/proto-signing";
import { CompactBitArray, MultiSignature } from "lbmjs-types/lbm/crypto/multisig/v1/multisig";
import { SignMode } from "lbmjs-types/lbm/tx/signing/v1/signing";
import { AuthInfo, SignerInfo } from "lbmjs-types/lbm/tx/v1/tx";
import { TxRaw } from "lbmjs-types/lbm/tx/v1/tx";
import Long from "long";

export function makeCompactBitArray(bits: readonly boolean[]): CompactBitArray {
  const byteCount = Math.ceil(bits.length / 8);
  const extraBits = bits.length - Math.floor(bits.length / 8) * 8;
  const bytes = new Uint8Array(byteCount); // zero-filled

  bits.forEach((value, index) => {
    const bytePos = Math.floor(index / 8);
    const bitPos = index % 8;
    // eslint-disable-next-line no-bitwise
    if (value) bytes[bytePos] |= 0b1 << (8 - 1 - bitPos);
  });

  return CompactBitArray.fromPartial({ elems: bytes, extraBitsStored: extraBits });
}

export function makeMultisignedTx(
  multisigPubkey: MultisigThresholdPubkey,
  sequence: number,
  fee: StdFee,
  bodyBytes: Uint8Array,
  signatures: Map<string, Uint8Array>,
  sigBlockHeight: number | string,
): TxRaw {
  const addresses = Array.from(signatures.keys());
  const prefix = Bech32.decode(addresses[0]).prefix;

  const signers: boolean[] = Array(multisigPubkey.value.pubkeys.length).fill(false);
  const signaturesList = new Array<Uint8Array>();
  for (let i = 0; i < multisigPubkey.value.pubkeys.length; i++) {
    const signerAddress = pubkeyToAddress(multisigPubkey.value.pubkeys[i], prefix);
    const signature = signatures.get(signerAddress);
    if (signature) {
      signers[i] = true;
      signaturesList.push(signature);
    }
  }

  const signerInfo: SignerInfo = {
    publicKey: encodePubkey(multisigPubkey),
    modeInfo: {
      multi: {
        bitarray: makeCompactBitArray(signers),
        modeInfos: signaturesList.map((_) => ({ single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON } })),
      },
    },
    sequence: Long.fromNumber(sequence),
  };

  const authInfo = AuthInfo.fromPartial({
    signerInfos: [signerInfo],
    fee: {
      amount: [...fee.amount],
      gasLimit: Long.fromString(fee.gas),
    },
    sigBlockHeight: sigBlockHeight.toString(),
  });

  const authInfoBytes = AuthInfo.encode(authInfo).finish();
  const signedTx = TxRaw.fromPartial({
    bodyBytes: bodyBytes,
    authInfoBytes: authInfoBytes,
    signatures: [MultiSignature.encode(MultiSignature.fromPartial({ signatures: signaturesList })).finish()],
  });
  return signedTx;
}
