import { Uint53 } from "@cosmjs/math";
import { Coin } from "lbmjs-types/lbm/collection/v1/collection";

export function ftCoin(amount: number | string, tokenId: string): Coin {
  let outAmount: string;
  if (typeof amount === "number") {
    try {
      outAmount = new Uint53(amount).toString();
    } catch (_err) {
      throw new Error(
        "Given amount is not a safe integer. Consider using a string instead to overcome the limitations of JS numbers.",
      );
    }
  } else {
    if (!amount.match(/^[0-9]+$/)) {
      throw new Error("Invalid unsigned integer string format");
    }
    outAmount = amount.replace(/^0*/, "") || "0";
  }
  return {
    amount: outAmount,
    tokenId: tokenId,
  };
}

export function ftCoins(amount: number | string, tokenId: string): Coin[] {
  return [ftCoin(amount, tokenId)];
}
