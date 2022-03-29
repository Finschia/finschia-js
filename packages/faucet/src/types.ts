import { Coin } from "@lbmjs/stargate";

export interface SendJob {
  readonly sender: string;
  readonly recipient: string;
  readonly amount: Coin;
}

export type MinimalAccount = {
  readonly address: string;
  readonly balance: readonly Coin[];
};
