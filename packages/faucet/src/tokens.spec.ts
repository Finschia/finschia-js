import { parseBankToken, parseBankTokens } from "./tokens";

describe("tokens", () => {
  describe("parseBankToken", () => {
    it("works", () => {
      expect(parseBankToken("cony")).toEqual("cony");
    });

    it("allows using whitespace", () => {
      expect(parseBankToken(" cony\n")).toEqual("cony");
    });
  });

  describe("parseBankTokens", () => {
    it("works for one", () => {
      expect(parseBankTokens("cony")).toEqual(["cony"]);
    });

    it("works for two", () => {
      expect(parseBankTokens("cony,mstake")).toEqual(["cony", "mstake"]);
    });

    it("ignores whitespace", () => {
      expect(parseBankTokens("cony, mstake\n")).toEqual(["cony", "mstake"]);
    });

    it("ignores empty elements", () => {
      expect(parseBankTokens("cony,mstake,")).toEqual(["cony", "mstake"]);
    });
  });
});
