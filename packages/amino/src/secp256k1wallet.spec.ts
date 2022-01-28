/* eslint-disable @typescript-eslint/naming-convention */
import { Secp256k1, Secp256k1Signature, Sha256 } from "@cosmjs/crypto";
import { fromBase64, fromHex } from "@cosmjs/encoding";

import { Secp256k1Wallet } from "./secp256k1wallet";
import { serializeSignDoc, StdSignDoc } from "./signdoc";

describe("Secp256k1Wallet", () => {
  const defaultPrivkey = fromHex("8bf5b7d356901536d9e88c5315aa4b0d7e9872a12aceb56a5f819f72625b8f8d");
  const defaultAddress = "link123457dcx68m8jjg29d2znukpqytmhfq3e5e60s";
  const defaultPubkey = fromHex("02527dd0228f12a049dbd7d963147da1233ac1c84e9678832644b304e14d073d35");

  describe("fromKey", () => {
    it("works", async () => {
      const signer = await Secp256k1Wallet.fromKey(defaultPrivkey);
      expect(signer).toBeTruthy();
    });
  });

  describe("getAccounts", () => {
    it("resolves to a list of accounts", async () => {
      const signer = await Secp256k1Wallet.fromKey(defaultPrivkey);
      const accounts = await signer.getAccounts();
      expect(accounts.length).toEqual(1);
      expect(accounts[0]).toEqual({
        address: defaultAddress,
        algo: "secp256k1",
        pubkey: defaultPubkey,
      });
    });
  });

  describe("signAmino", () => {
    it("resolves to valid signature", async () => {
      const signer = await Secp256k1Wallet.fromKey(defaultPrivkey);
      const signDoc: StdSignDoc = {
        msgs: [],
        fee: { amount: [], gas: "23" },
        chain_id: "foochain",
        memo: "hello, world",
        sig_block_height: "10",
        sequence: "54",
      };
      const { signed, signature } = await signer.signAmino(defaultAddress, signDoc);
      expect(signed).toEqual(signDoc);
      const valid = await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(fromBase64(signature.signature)),
        new Sha256(serializeSignDoc(signed)).digest(),
        defaultPubkey,
      );
      expect(valid).toEqual(true);
    });
  });
});
