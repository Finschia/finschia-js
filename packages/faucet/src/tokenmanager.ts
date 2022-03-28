import { Coin } from "@cosmjs/launchpad";
import { Decimal } from "@cosmjs/math";

import { MinimalAccount } from "./types";

import BN from "bn.js";

const defaultCreditAmount = new BN(10_000_000, 10);

/** Send `factor` times credit amount on refilling */
const defaultRefillFactor = new BN(20, 10);

/** refill when balance gets below `factor` times credit amount */
const defaultRefillThresholdFactor = new BN(8, 10);

export interface TokenConfiguration {
  /** Supported tokens of the Cosmos SDK bank module */
  readonly bankTokens: readonly string[];
}

export class TokenManager {
  private readonly config: TokenConfiguration;

  public constructor(config: TokenConfiguration) {
    this.config = config;
  }

  /** The amount of tokens that will be sent to the user */
  public creditAmount(denom: string, factor: BN = new BN(1, 10)): Coin {
    const amountFromEnv = process.env[`FAUCET_CREDIT_AMOUNT_${denom.toUpperCase()}`];
    const amount = amountFromEnv ? new BN(amountFromEnv, 10) : defaultCreditAmount;
    const value = amount.mul(factor);
    if (value.isNeg()) {
      throw new Error("Invalid amount: negative value")
    };
    return {
      amount: value.toString(10),
      denom: denom,
    };
  }

  public refillAmount(denom: string): Coin {
    const factorFromEnv = new BN(process.env.FAUCET_REFILL_FACTOR || "0", 10);
    const factor = factorFromEnv.isZero() ? defaultRefillFactor : factorFromEnv;
    if (factor.isNeg()) {
      throw new Error("Invalid refill factor: negative value")
    };
    return this.creditAmount(denom, factor);
  }

  public refillThreshold(denom: string): Coin {
    const factorFromEnv = new BN(process.env.FAUCET_REFILL_THRESHOLD || "0", 10);
    const factor = factorFromEnv.isZero() ? defaultRefillThresholdFactor : factorFromEnv;
    if (factor.isNeg()) {
      throw new Error("Invalid refill threshold factor: negative value")
    };
    return this.creditAmount(denom, factor);
  }

  /** true iff the distributor account needs a refill */
  public needsRefill(account: MinimalAccount, denom: string): boolean {
    const balanceAmount = account.balance.find((b) => b.denom === denom);

    const balance = Decimal.fromAtomics(balanceAmount ? balanceAmount.amount : "0", 0);
    const thresholdAmount = this.refillThreshold(denom);
    const threshold = Decimal.fromAtomics(thresholdAmount.amount, 0);

    return balance.isLessThan(threshold);
  }
}
