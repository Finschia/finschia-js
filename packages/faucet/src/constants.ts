import { GasPrice } from "@cosmjs/stargate";

import { TokenConfiguration } from "./tokenmanager";
import { parseBankTokens } from "./tokens";

export const binaryName = "lbm-faucet";
export const memo: string | undefined = process.env.FAUCET_MEMO;
export const gasPrice = GasPrice.fromString(process.env.FAUCET_GAS_PRICE || "0.025cony");
export const gasLimitSend = process.env.FAUCET_GAS_LIMIT
  ? parseInt(process.env.FAUCET_GAS_LIMIT, 10)
  : 100_000;
export const concurrency: number = Number.parseInt(process.env.FAUCET_CONCURRENCY || "", 10) || 5;
export const port: number = Number.parseInt(process.env.FAUCET_PORT || "", 10) || 8000;
export const mnemonic: string | undefined = process.env.FAUCET_MNEMONIC;
export const addressPrefix = process.env.FAUCET_ADDRESS_PREFIX || "lbm";
export const pathPattern = process.env.FAUCET_PATH_PATTERN || "m/44'/438'/0'/0/a";
export const tokenConfig: TokenConfiguration = {
  bankTokens: parseBankTokens(process.env.FAUCET_TOKENS || "cony, stake"),
};
