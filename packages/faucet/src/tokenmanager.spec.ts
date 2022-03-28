import { TokenConfiguration, TokenManager } from "./tokenmanager";
import { MinimalAccount } from "./types";

const dummyConfig: TokenConfiguration = {
  bankTokens: ["utokenz", "mtrash"],
};

describe("TokenManager", () => {
  describe("constructor", () => {
    it("can be constructed", () => {
      const tm = new TokenManager(dummyConfig);
      expect(tm).toBeTruthy();
    });
  });

  describe("creditAmount", () => {
    const tm = new TokenManager(dummyConfig);

    beforeEach(() => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "";
    });

    it("returns 10_000_000 base tokens by default", () => {
      expect(tm.creditAmount("utokenz")).toEqual({
        amount: "10000000",
        denom: "utokenz",
      });
      expect(tm.creditAmount("mtrash")).toEqual({
        amount: "10000000",
        denom: "mtrash",
      });
    });

    it("returns value from env variable when set", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "22";
      expect(tm.creditAmount("mtrash")).toEqual({
        amount: "22",
        denom: "mtrash",
      });
    });

    it("returns default when env variable is set to empty", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "";
      expect(tm.creditAmount("mtrash")).toEqual({
        amount: "10000000",
        denom: "mtrash",
      });
    });

    it("returns big value (10^30) correctly when env variable is set to it", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "1000000000000000000000000000000";
      expect(tm.creditAmount("mtrash")).toEqual({
        amount: "1000000000000000000000000000000",
        denom: "mtrash",
      });
    });

    it("error when env variable is set to negative", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "-42";
      expect(() => tm.creditAmount("mtrash")).toThrowError(/Invalid amount: negative value/i)
    })
  });

  describe("refillAmount", () => {
    const tm = new TokenManager(dummyConfig);

    beforeEach(() => {
      process.env.FAUCET_REFILL_FACTOR = "";
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "";
    });

    it("returns 20*10_000_000' by default", () => {
      expect(tm.refillAmount("mtrash")).toEqual({
        amount: "200000000",
        denom: "mtrash",
      });
    });

    it("returns 20*22 when credit amount is 22", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "22";
      expect(tm.refillAmount("mtrash")).toEqual({
        amount: "440",
        denom: "mtrash",
      });
    });

    it("returns 30*10_000_000' when refill factor is 30", () => {
      process.env.FAUCET_REFILL_FACTOR = "30";
      expect(tm.refillAmount("mtrash")).toEqual({
        amount: "300000000",
        denom: "mtrash",
      });
    });

    it("returns 30*22 when refill factor is 30 and credit amount is 22", () => {
      process.env.FAUCET_REFILL_FACTOR = "30";
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "22";
      expect(tm.refillAmount("mtrash")).toEqual({
        amount: "660",
        denom: "mtrash",
      });
    });

    it("returns big value (20*10^30) correctly when env variable is set to 10^30", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "1000000000000000000000000000000";
      expect(tm.refillAmount("mtrash")).toEqual({
        amount: "20000000000000000000000000000000",
        denom: "mtrash",
      });
    });

    it("error when env variable is set to negative", () => {
      process.env.FAUCET_REFILL_FACTOR = "-42";
      expect(() => tm.refillAmount("mtrash")).toThrowError(/Invalid refill factor: negative value/i)
    });
  });

  describe("refillThreshold", () => {
    const tm = new TokenManager(dummyConfig);

    beforeEach(() => {
      process.env.FAUCET_REFILL_THRESHOLD = "";
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "";
    });

    it("returns 8*10_000_000 by default", () => {
      expect(tm.refillThreshold("mtrash")).toEqual({
        amount: "80000000",
        denom: "mtrash",
      });
    });

    it("returns 8*22 when credit amount is 22", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "22";
      expect(tm.refillThreshold("mtrash")).toEqual({
        amount: "176",
        denom: "mtrash",
      });
    });

    it("returns 5*10_000_000 when refill threshold is 5", () => {
      process.env.FAUCET_REFILL_THRESHOLD = "5";
      expect(tm.refillThreshold("mtrash")).toEqual({
        amount: "50000000",
        denom: "mtrash",
      });
    });

    it("returns 5*22 when refill threshold is 5 and credit amount is 22", () => {
      process.env.FAUCET_REFILL_THRESHOLD = "5";
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "22";
      expect(tm.refillThreshold("mtrash")).toEqual({
        amount: "110",
        denom: "mtrash",
      });
    });

    it("returns big value (8*10^30) correctly when env variable is set to 10^30", () => {
      process.env.FAUCET_CREDIT_AMOUNT_MTRASH = "1000000000000000000000000000000";
      expect(tm.refillThreshold("mtrash")).toEqual({
        amount: "8000000000000000000000000000000",
        denom: "mtrash",
      });
    });

    it("error when env variable is set to negative", () => {
      process.env.FAUCET_REFILL_THRESHOLD = "-42";
      expect(() => tm.refillThreshold("mtrash")).toThrowError(/Invalid refill threshold factor: negative value/i)
    });
  });

  describe("needsRefill", () => {
    const tm = new TokenManager(dummyConfig);

    beforeAll(() =>{
      process.env.FAUCET_REFILL_FACTOR = "";
      process.env.FAUCET_REFILL_THRESHOLD = "";
    });

    it("works for sufficient/insufficient balance", () => {
      const brokeAccount: MinimalAccount = {
        address: "cosmos1rtfrpqt3yd7c8g73m9rsaen7fft0h52m3v9v5a",
        balance: [
          {
            denom: "utokenz",
            amount: "3",
          },
        ],
      };
      const richAccount: MinimalAccount = {
        address: "cosmos1rtfrpqt3yd7c8g73m9rsaen7fft0h52m3v9v5a",
        balance: [
          {
            denom: "utokenz",
            amount: "3456789000000", // 3456789 TOKENZ
          },
        ],
      };
      expect(tm.needsRefill(brokeAccount, "utokenz")).toEqual(true);
      expect(tm.needsRefill(richAccount, "utokenz")).toEqual(false);
    });

    it("works for missing balance", () => {
      const emptyAccount: MinimalAccount = {
        address: "cosmos1rtfrpqt3yd7c8g73m9rsaen7fft0h52m3v9v5a",
        balance: [],
      };
      expect(tm.needsRefill(emptyAccount, "utokenz")).toEqual(true);
    });
  });
});
