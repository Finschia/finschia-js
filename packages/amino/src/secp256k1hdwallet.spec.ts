/* eslint-disable @typescript-eslint/naming-convention */
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, fromHex } from "@cosmjs/encoding";

import { makeLinkPath } from "./paths";
import { extractKdfConfiguration, Secp256k1HdWallet } from "./secp256k1hdwallet";
import { serializeSignDoc, StdSignDoc } from "./signdoc";
import { base64Matcher } from "./testutils.spec";
import { executeKdf, KdfConfiguration } from "./wallet";

describe("Secp256k1HdWallet", () => {
  // m/44'/438'/0'/0/0
  // pubkey: 03b2788d880a6103e37bb7f92fb43d590190e8e549fc250a6115ac5a17b2e2ad8a
  const defaultMnemonic = "special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling";
  const defaultPubkey = fromHex("03b2788d880a6103e37bb7f92fb43d590190e8e549fc250a6115ac5a17b2e2ad8a");
  const defaultAddress = "link16wjhpz2h4anh6p8haezmry2aj3psxekr30ltw0";

  describe("fromMnemonic", () => {
    it("works", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
      expect(wallet).toBeTruthy();
      expect(wallet.mnemonic).toEqual(defaultMnemonic);
    });

    it("works with options", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic, {
        bip39Password: "password123",
        hdPaths: [makeLinkPath(123)],
        prefix: "yolo",
      });
      expect(wallet.mnemonic).toEqual(defaultMnemonic);
      const [account] = await wallet.getAccounts();
      expect(account.pubkey).not.toEqual(defaultPubkey);
      expect(account.address.slice(0, 4)).toEqual("yolo");
    });

    it("works with explicitly undefined options", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic, {
        bip39Password: undefined,
        hdPaths: undefined,
        prefix: undefined,
      });
      expect(wallet.mnemonic).toEqual(defaultMnemonic);
      const [account] = await wallet.getAccounts();
      expect(account.pubkey).toEqual(defaultPubkey);
      expect(account.address).toEqual(defaultAddress);
    });
  });

  describe("generate", () => {
    it("defaults to 12 words", async () => {
      const wallet = await Secp256k1HdWallet.generate();
      expect(wallet.mnemonic.split(" ").length).toEqual(12);
    });

    it("can use different mnemonic lengths", async () => {
      expect((await Secp256k1HdWallet.generate(12)).mnemonic.split(" ").length).toEqual(12);
      expect((await Secp256k1HdWallet.generate(15)).mnemonic.split(" ").length).toEqual(15);
      expect((await Secp256k1HdWallet.generate(18)).mnemonic.split(" ").length).toEqual(18);
      expect((await Secp256k1HdWallet.generate(21)).mnemonic.split(" ").length).toEqual(21);
      expect((await Secp256k1HdWallet.generate(24)).mnemonic.split(" ").length).toEqual(24);
    });
  });

  describe("deserialize", () => {
    it("can restore", async () => {
      const original = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
      const password = "123";
      const serialized = await original.serialize(password);
      const deserialized = await Secp256k1HdWallet.deserialize(serialized, password);
      const accounts = await deserialized.getAccounts();

      expect(deserialized.mnemonic).toEqual(defaultMnemonic);
      expect(accounts).toEqual([
        {
          algo: "secp256k1",
          address: defaultAddress,
          pubkey: defaultPubkey,
        },
      ]);
    });

    it("can restore multiple accounts", async () => {
      const mnemonic =
        "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
      const prefix = "wasm";
      const accountNumbers = [0, 1, 2, 3, 4];
      const hdPaths = accountNumbers.map(makeLinkPath);
      const original = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: hdPaths,
        prefix: prefix,
      });
      const password = "123";
      const serialized = await original.serialize(password);
      const deserialized = await Secp256k1HdWallet.deserialize(serialized, password);
      const accounts = await deserialized.getAccounts();

      expect(deserialized.mnemonic).toEqual(mnemonic);
      // These values are taken from the generate_addresses.js script in the scripts/wasmd directory
      expect(accounts).toEqual([
        {
          algo: "secp256k1",
          pubkey: fromBase64("Av5a6+1yql0DfiZ5MUZvAUYm7NcOA0PVI9cK2Vvo1GQV"),
          address: "wasm1xzyh64ze36dc5xv30np8a8lhzz8aqerp5tztkq",
        },
        {
          algo: "secp256k1",
          pubkey: fromBase64("A9ISSVVDtbe6n0BuJJzDRqgjPN1rSpOgDRT49R4a/t+S"),
          address: "wasm19rxarjv9mjs6vjpgggxycaaqcq4f5vcnnjtwr8",
        },
        {
          algo: "secp256k1",
          pubkey: fromBase64("AlfQ6KU1IEFcEoerKUXwSG8rkrcvW6hm53igOrMYd8k2"),
          address: "wasm19e0vej36r9ykh5ag4f9q4x0kzulfcsc0gqlqsd",
        },
        {
          algo: "secp256k1",
          pubkey: fromBase64("AgMF2XGIV1G2OkK9PhfEjifBSe/jazEWhAysB6WU+8R3"),
          address: "wasm1apvgvdjxtnmvh9j23pwh4xsuwhsaef5nf6q88f",
        },
        {
          algo: "secp256k1",
          pubkey: fromBase64("AmMobOwPjuWkZDKvJJ5QZ61X0J8V0/rCUDNoKx77eiLH"),
          address: "wasm1jk0fyfks54yz8spcd6h93n44cqdyzctc0fwnp9",
        },
      ]);
    });
  });

  describe("deserializeWithEncryptionKey", () => {
    it("can restore", async () => {
      const password = "123";
      let serialized: string;
      {
        const original = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
        const anyKdfParams: KdfConfiguration = {
          algorithm: "argon2id",
          params: {
            outputLength: 32,
            opsLimit: 4,
            memLimitKib: 3 * 1024,
          },
        };
        const encryptionKey = await executeKdf(password, anyKdfParams);
        serialized = await original.serializeWithEncryptionKey(encryptionKey, anyKdfParams);
      }

      {
        const kdfConfiguration = extractKdfConfiguration(serialized);
        const encryptionKey = await executeKdf(password, kdfConfiguration);
        const deserialized = await Secp256k1HdWallet.deserializeWithEncryptionKey(serialized, encryptionKey);
        expect(deserialized.mnemonic).toEqual(defaultMnemonic);
        expect(await deserialized.getAccounts()).toEqual([
          {
            algo: "secp256k1",
            address: defaultAddress,
            pubkey: defaultPubkey,
          },
        ]);
      }
    });

    it("can restore multiple accounts", async () => {
      const mnemonic =
        "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
      const prefix = "wasm";
      const password = "123";
      const accountNumbers = [0, 1, 2, 3, 4];
      const hdPaths = accountNumbers.map(makeLinkPath);
      let serialized: string;
      {
        const original = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: prefix, hdPaths: hdPaths });
        const anyKdfParams: KdfConfiguration = {
          algorithm: "argon2id",
          params: {
            outputLength: 32,
            opsLimit: 4,
            memLimitKib: 3 * 1024,
          },
        };
        const encryptionKey = await executeKdf(password, anyKdfParams);
        serialized = await original.serializeWithEncryptionKey(encryptionKey, anyKdfParams);
      }

      {
        const kdfConfiguration = extractKdfConfiguration(serialized);
        const encryptionKey = await executeKdf(password, kdfConfiguration);
        const deserialized = await Secp256k1HdWallet.deserializeWithEncryptionKey(serialized, encryptionKey);
        const accounts = await deserialized.getAccounts();

        expect(deserialized.mnemonic).toEqual(mnemonic);
        expect(deserialized.mnemonic).toEqual(mnemonic);
        // These values are taken from the generate_addresses.js script in the scripts/wasmd directory
        expect(accounts).toEqual([
          {
            algo: "secp256k1",
            pubkey: fromBase64("Av5a6+1yql0DfiZ5MUZvAUYm7NcOA0PVI9cK2Vvo1GQV"),
            address: "wasm1xzyh64ze36dc5xv30np8a8lhzz8aqerp5tztkq",
          },
          {
            algo: "secp256k1",
            pubkey: fromBase64("A9ISSVVDtbe6n0BuJJzDRqgjPN1rSpOgDRT49R4a/t+S"),
            address: "wasm19rxarjv9mjs6vjpgggxycaaqcq4f5vcnnjtwr8",
          },
          {
            algo: "secp256k1",
            pubkey: fromBase64("AlfQ6KU1IEFcEoerKUXwSG8rkrcvW6hm53igOrMYd8k2"),
            address: "wasm19e0vej36r9ykh5ag4f9q4x0kzulfcsc0gqlqsd",
          },
          {
            algo: "secp256k1",
            pubkey: fromBase64("AgMF2XGIV1G2OkK9PhfEjifBSe/jazEWhAysB6WU+8R3"),
            address: "wasm1apvgvdjxtnmvh9j23pwh4xsuwhsaef5nf6q88f",
          },
          {
            algo: "secp256k1",
            pubkey: fromBase64("AmMobOwPjuWkZDKvJJ5QZ61X0J8V0/rCUDNoKx77eiLH"),
            address: "wasm1jk0fyfks54yz8spcd6h93n44cqdyzctc0fwnp9",
          },
        ]);
      }
    });
  });

  describe("getAccounts", () => {
    it("resolves to a list of accounts", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
      const accounts = await wallet.getAccounts();
      expect(accounts.length).toEqual(1);
      expect(accounts[0]).toEqual({
        address: defaultAddress,
        algo: "secp256k1",
        pubkey: defaultPubkey,
      });
    });

    it("creates the same address as Go implementation", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(
        "oyster design unusual machine spread century engine gravity focus cave carry slot",
      );
      const [{ address }] = await wallet.getAccounts();
      expect(address).toEqual("link1m74nj9caexugrtdexx4f6wdrgy59jrlf06xrsu");
    });
  });

  describe("signAmino", () => {
    it("resolves to valid signature", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
      const signDoc: StdSignDoc = {
        msgs: [],
        fee: { amount: [], gas: "23" },
        chain_id: "foochain",
        memo: "hello, world",
        sig_block_height: "10",
        sequence: "54",
      };
      const { signed, signature } = await wallet.signAmino(defaultAddress, signDoc);
      expect(signed).toEqual(signDoc);
      const valid = await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(fromBase64(signature.signature)),
        sha256(serializeSignDoc(signed)),
        defaultPubkey,
      );
      expect(valid).toEqual(true);
    });
  });

  describe("serialize", () => {
    it("can save with password", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
      const serialized = await wallet.serialize("123");
      expect(JSON.parse(serialized)).toEqual({
        type: "secp256k1wallet-v1",
        kdf: {
          algorithm: "argon2id",
          params: {
            outputLength: 32,
            opsLimit: 24,
            memLimitKib: 12 * 1024,
          },
        },
        encryption: {
          algorithm: "xchacha20poly1305-ietf",
        },
        data: jasmine.stringMatching(base64Matcher),
      });
    });
  });

  describe("serializeWithEncryptionKey", () => {
    it("can save with password", async () => {
      const wallet = await Secp256k1HdWallet.fromMnemonic(defaultMnemonic);

      const key = fromHex("aabb221100aabb332211aabb33221100aabb221100aabb332211aabb33221100");
      const customKdfConfiguration: KdfConfiguration = {
        algorithm: "argon2id",
        params: {
          outputLength: 32,
          opsLimit: 321,
          memLimitKib: 11 * 1024,
        },
      };
      const serialized = await wallet.serializeWithEncryptionKey(key, customKdfConfiguration);
      expect(JSON.parse(serialized)).toEqual({
        type: "secp256k1wallet-v1",
        kdf: customKdfConfiguration,
        encryption: {
          algorithm: "xchacha20poly1305-ietf",
        },
        data: jasmine.stringMatching(base64Matcher),
      });
    });
  });
});
