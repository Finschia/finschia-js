import { Random } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { assert } from "@cosmjs/utils";
import { makeLinkPath, StargateClient } from "@lbmjs/stargate";

import { Faucet } from "./faucet";
import { TokenConfiguration } from "./tokenmanager";

function pendingWithoutSimapp(): void {
  if (!process.env.SIMAPP42_ENABLED && !process.env.SIMAPP44_ENABLED) {
    return pending("Set SIMAPP42_ENABLED or SIMAPP44_ENABLED to enabled Stargate node-based tests");
  }
}

const defaultTokenConfig: TokenConfiguration = {
  bankTokens: ["cony", "stake"],
};
const defaultAddressPrefix = "link";

function makeRandomAddress(): string {
  return toBech32(defaultAddressPrefix, Random.getBytes(20));
}

const faucetMnemonic =
  "mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have";

describe("Faucet", () => {
  const pathBuilder = makeLinkPath;

  const apiUrl = "localhost:26658";
  const stargate = true;
  let originalEnvVariable: string | undefined;

  beforeAll(() => {
    originalEnvVariable = process.env.FAUCET_CREDIT_AMOUNT_STAKE;
    process.env.FAUCET_CREDIT_AMOUNT_STAKE = "100000";
  });

  afterAll(() => {
    process.env.FAUCET_CREDIT_AMOUNT_STAKE = originalEnvVariable;
  });

  describe("stargate", () => {
    describe("constructor", () => {
      it("can be constructed", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        expect(faucet).toBeTruthy();
      });
    });

    describe("availableTokens", () => {
      it("is empty when no tokens are configured", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          { bankTokens: [] },
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const tickers = await faucet.availableTokens();
        expect(tickers).toEqual([]);
      });

      it("is not empty with default token config", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const tickers = await faucet.availableTokens();
        expect(tickers).toEqual(["cony", "stake"]);
      });
    });

    describe("send", () => {
      it("can send bank token", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const recipient = makeRandomAddress();
        await faucet.send({
          amount: {
            amount: "23456",
            denom: "cony",
          },
          sender: faucet.holderAddress,
          recipient: recipient,
        });

        const readOnlyClient = await StargateClient.connect(apiUrl);
        const account = await readOnlyClient.getAllBalances(recipient);
        assert(account);
        expect(account).toEqual([
          {
            amount: "23456",
            denom: "cony",
          },
        ]);
      });
    });

    describe("refill", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        await faucet.refill();
        const readOnlyClient = await StargateClient.connect(apiUrl);
        const distributorBalance = await readOnlyClient.getAllBalances(faucet.distributorAddresses[0]);
        assert(distributorBalance);
        expect(distributorBalance).toEqual([
          jasmine.objectContaining({
            denom: "cony",
          }),
          jasmine.objectContaining({
            denom: "stake",
          }),
        ]);
        expect(Number.parseInt(distributorBalance[0].amount, 10)).toBeGreaterThanOrEqual(80_000000);
        expect(Number.parseInt(distributorBalance[1].amount, 10)).toBeGreaterThanOrEqual(800000);
      });
    });

    describe("credit", () => {
      it("works for fee token", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const recipient = makeRandomAddress();
        await faucet.credit(recipient, "cony");

        const readOnlyClient = await StargateClient.connect(apiUrl);
        const balance = await readOnlyClient.getAllBalances(recipient);
        assert(balance);
        expect(balance).toEqual([
          {
            amount: "10000000",
            denom: "cony",
          },
        ]);
      });

      it("works for stake token", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const recipient = makeRandomAddress();
        await faucet.credit(recipient, "stake");

        const readOnlyClient = await StargateClient.connect(apiUrl);
        const balance = await readOnlyClient.getAllBalances(recipient);
        assert(balance);
        expect(balance).toEqual([
          {
            amount: "100000",
            denom: "stake",
          },
        ]);
      });
    });

    describe("configuredTokens", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          3,
          stargate,
        );
        const tickers = faucet.configuredTokens();
        expect(tickers).toEqual(["cony", "stake"]);
      });
    });

    describe("loadAccounts", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const faucet = await Faucet.make(
          apiUrl,
          defaultAddressPrefix,
          defaultTokenConfig,
          faucetMnemonic,
          pathBuilder,
          1,
          stargate,
        );
        const accounts = await faucet.loadAccounts();

        const readOnlyClient = await StargateClient.connect(apiUrl);
        const expectedHolderBalance = await readOnlyClient.getAllBalances(faucet.holderAddress);
        const expectedDistributorBalance = await readOnlyClient.getAllBalances(
          faucet.distributorAddresses[0],
        );
        assert(expectedHolderBalance);
        assert(expectedDistributorBalance);
        expect(accounts).toEqual([
          jasmine.objectContaining({
            address: faucet.holderAddress,
            balance: expectedHolderBalance,
          }),
          jasmine.objectContaining({
            address: faucet.distributorAddresses[0],
            balance: expectedDistributorBalance,
          }),
        ]);
      });
    });
  });
});
