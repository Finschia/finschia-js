import { Slip10RawIndex } from "@cosmjs/crypto";

import { makeLinkPath } from "./paths";

describe("paths", () => {
  describe("makeLinkPath", () => {
    it("works", () => {
      // m/44'/438'/0'/0/0
      expect(makeLinkPath(0)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(438),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(0),
      ]);
      // m/44'/438'/0'/0/123
      expect(makeLinkPath(123)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(438),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(123),
      ]);
    });
  });
});
