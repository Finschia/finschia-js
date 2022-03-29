import { Uint64 } from "@cosmjs/math";
import { Coin } from "@lbmjs/amino";

/**
 * Takes a coins list like "819966000ucosm,700000000ustake" and parses it.
 *
 * This is a Stargate ready version of parseCoins from @lbmjs/amino.
 * It supports more denoms.
 */
export function parseCoins(input: string): Coin[] {
  return input
    .replace(/\s/g, "")
    .split(",")
    .filter(Boolean)
    .map((part) => {
      // Denom regex from Stargate (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/types/coin.go#L599-L601)
      const match = part.match(/^([0-9]+)([a-zA-Z][a-zA-Z0-9/]{2,127})$/);
      if (!match) throw new Error("Got an invalid coin string");
      return {
        amount: Uint64.fromString(match[1]).toString(),
        denom: match[2],
      };
    });
}
