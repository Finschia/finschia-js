import { StdSignature } from "./signature";
import { AminoMsg, StdFee, StdSignDoc } from "./signdoc";

/**
 * A Cosmos SDK StdTx
 *
 * @see https://docs.cosmos.network/master/modules/auth/03_types.html#stdtx
 */
export interface StdTx {
  readonly msg: readonly AminoMsg[];
  readonly fee: StdFee;
  readonly signatures: readonly StdSignature[];
  readonly sigBlockHeight: string;
  readonly memo: string | undefined;
}

export function isStdTx(txValue: unknown): txValue is StdTx {
  const { memo, msg, fee, signatures, sigBlockHeight } = txValue as StdTx;
  return (
    typeof memo === "string" &&
    Array.isArray(msg) &&
    typeof fee === "object" &&
    Array.isArray(signatures) &&
    sigBlockHeight === "string"
  );
}

export function makeStdTx(
  content: Pick<StdSignDoc, "msgs" | "fee" | "memo" | "sig_block_height">,
  signatures: StdSignature | readonly StdSignature[],
): StdTx {
  return {
    msg: content.msgs,
    fee: content.fee,
    memo: content.memo,
    sigBlockHeight: content.sig_block_height,
    signatures: Array.isArray(signatures) ? signatures : [signatures],
  };
}
