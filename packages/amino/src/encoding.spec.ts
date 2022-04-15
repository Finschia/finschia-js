import { Bech32, fromBase64, fromHex } from "@cosmjs/encoding";
import {
  decodeAminoPubkey,
  decodeBech32Pubkey,
  encodeAminoPubkey,
  encodeBech32Pubkey,
  encodeSecp256k1Pubkey,
} from "./encoding";
import { Pubkey } from "./pubkeys";
import {
  testgroup1,
  testgroup1PubkeyBech32,
  testgroup2,
  testgroup2PubkeyBech32,
  testgroup3,
  testgroup3PubkeyBech32,
  testgroup4,
  testgroup4PubkeyBech32,
} from "./testutils.spec";

describe("encoding", () => {
  describe("encodeSecp256k1Pubkey", () => {
    it("encodes a compressed pubkey", () => {
      const pubkey = fromBase64("AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP");
      expect(encodeSecp256k1Pubkey(pubkey)).toEqual({
        type: "ostracon/PubKeySecp256k1",
        value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
      });
    });

    it("throws for uncompressed public keys", () => {
      const pubkey = fromBase64(
        "BE8EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQE7WHpoHoNswYeoFkuYpYSKK4mzFzMV/dB0DVAy4lnNU=",
      );
      expect(() => encodeSecp256k1Pubkey(pubkey)).toThrowError(/public key must be compressed secp256k1/i);
    });
  });

  describe("decodeAminoPubkey", () => {
    it("works for secp256k1", () => {
      const amino = Bech32.decode(
        // "cosmospub1addwnpepqd8sgxq7aw348ydctp3n5ajufgxp395hksxjzc6565yfp56scupfqhlgyg5",
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      ).data;
      expect(decodeAminoPubkey(amino)).toEqual({
        type: "ostracon/PubKeySecp256k1",
        // value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      });
    });

    it("works for ed25519", () => {
      // Encoded from `corald tendermint show-validator`
      // Decoded from http://localhost:26657/validators
      const amino = Bech32.decode(
        // "coralvalconspub1zcjduepqvxg72ccnl9r65fv0wn3amlk4sfzqfe2k36l073kjx2qyaf6sk23qw7j8wq",
        "linkvalconspub1ef0jhvpq05an85endwxngp3050gfe8k3dwlux8gffs6yj2hp4n02xqcqrlts626zgh",
      ).data;
      expect(decodeAminoPubkey(amino)).toEqual({
        type: "ostracon/PubKeyEd25519",
        // value: "YZHlYxP5R6olj3Tj3f7VgkQE5VaOvv9G0jKATqdQsqI=",
        value: "fTsz0zNrjTQGL6PQnJ7Ra7/DHQlMNEkq4azeowMAH9c=",
      });
    });

    it("works for sr25519", () => {
      pending("No test data available");
    });

    it("works for multisig", () => {
      // const pubkeyData = Bech32.decode(
      //   "cosmospub1addwnpepqd8sgxq7aw348ydctp3n5ajufgxp395hksxjzc6565yfp56scupfqhlgyg5",
      // ).data;
      // const pubkey = {
      //   type: "ostracon/PubKeySecp256k1",
      //   value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
      // };
      const pubkeyData = Bech32.decode(
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      ).data;
      const pubkey = {
        type: "ostracon/PubKeySecp256k1",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      };

      // const data1 = fromHex("22C1F7E20805");
      const data1 = fromHex("77A721980805");
      expect(decodeAminoPubkey(data1)).toEqual({
        type: "ostracon/PubKeyMultisigThreshold",
        value: {
          threshold: "5",
          pubkeys: [],
        },
      });

      // const data2 = Uint8Array.from([...fromHex("22C1F7E2081a"), 0x12, pubkeyData.length, ...pubkeyData]);
      const data2 = Uint8Array.from([...fromHex("77A72198081a"), 0x12, pubkeyData.length, ...pubkeyData]);
      expect(decodeAminoPubkey(data2)).toEqual({
        type: "ostracon/PubKeyMultisigThreshold",
        value: {
          threshold: "26",
          pubkeys: [pubkey],
        },
      });

      const data3 = Uint8Array.from([
        // ...fromHex("22C1F7E2081a"),
        ...fromHex("77A72198081a"),
        0x12,
        pubkeyData.length,
        ...pubkeyData,
        0x12,
        pubkeyData.length,
        ...pubkeyData,
      ]);
      expect(decodeAminoPubkey(data3)).toEqual({
        type: "ostracon/PubKeyMultisigThreshold",
        value: {
          threshold: "26",
          pubkeys: [pubkey, pubkey],
        },
      });

      // expect(() => decodeAminoPubkey(fromHex("22C1F7E20705"))).toThrowError(/expecting 0x08 prefix/i);
      expect(() => decodeAminoPubkey(fromHex("77A721980705"))).toThrowError(/expecting 0x08 prefix/i);
    });
  });

  describe("decodeBech32Pubkey", () => {
    it("works", () => {
      // expect(
      //   decodeBech32Pubkey("cosmospub1addwnpepqd8sgxq7aw348ydctp3n5ajufgxp395hksxjzc6565yfp56scupfqhlgyg5"),
      // ).toEqual({
      //   type: "ostracon/PubKeySecp256k1",
      //   value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
      // });
      expect(
        decodeBech32Pubkey("linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz"),
      ).toEqual({
        type: "ostracon/PubKeySecp256k1",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      });
    });

    it("works for enigma pubkey", () => {
      expect(
        decodeBech32Pubkey("enigmapub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2mhvjk4"),
      ).toEqual({
        type: "ostracon/PubKeySecp256k1",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      });
    });

    it("works for ed25519", () => {
      // Encoded from `corald tendermint show-validator`
      // Decoded from http://localhost:26657/validators
      const decoded = decodeBech32Pubkey(
        // "coralvalconspub1zcjduepqvxg72ccnl9r65fv0wn3amlk4sfzqfe2k36l073kjx2qyaf6sk23qw7j8wq",
        "linkvalconspub1ef0jhvpq05an85endwxngp3050gfe8k3dwlux8gffs6yj2hp4n02xqcqrlts626zgh",
      );
      expect(decoded).toEqual({
        type: "ostracon/PubKeyEd25519",
        // value: "YZHlYxP5R6olj3Tj3f7VgkQE5VaOvv9G0jKATqdQsqI=",
        value: "fTsz0zNrjTQGL6PQnJ7Ra7/DHQlMNEkq4azeowMAH9c=",
      });
    });

    it("works for multisig", () => {
      expect(decodeBech32Pubkey(testgroup1PubkeyBech32)).toEqual(testgroup1);
      expect(decodeBech32Pubkey(testgroup2PubkeyBech32)).toEqual(testgroup2);
      expect(decodeBech32Pubkey(testgroup3PubkeyBech32)).toEqual(testgroup3);
    });
  });

  describe("encodeAminoPubkey", () => {
    it("works for secp256k1", () => {
      const pubkey: Pubkey = {
        type: "ostracon/PubKeySecp256k1",
        // value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      };
      const expected = Bech32.decode(
        // "cosmospub1addwnpepqd8sgxq7aw348ydctp3n5ajufgxp395hksxjzc6565yfp56scupfqhlgyg5",
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      ).data;
      expect(encodeAminoPubkey(pubkey)).toEqual(expected);
    });

    it("works for ed25519", () => {
      // Decoded from http://localhost:26657/validators
      // Encoded from `corald tendermint show-validator`
      const pubkey: Pubkey = {
        type: "ostracon/PubKeyEd25519",
        // value: "YZHlYxP5R6olj3Tj3f7VgkQE5VaOvv9G0jKATqdQsqI=",
        value: "fTsz0zNrjTQGL6PQnJ7Ra7/DHQlMNEkq4azeowMAH9c=",
      };
      const expected = Bech32.decode(
        // "coralvalconspub1zcjduepqvxg72ccnl9r65fv0wn3amlk4sfzqfe2k36l073kjx2qyaf6sk23qw7j8wq",
        "linkvalconspub1ef0jhvpq05an85endwxngp3050gfe8k3dwlux8gffs6yj2hp4n02xqcqrlts626zgh",
      ).data;
      expect(encodeAminoPubkey(pubkey)).toEqual(expected);
    });
  });

  describe("encodeBech32Pubkey", () => {
    it("works for secp256k1", () => {
      const pubkey: Pubkey = {
        type: "ostracon/PubKeySecp256k1",
        // value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      };
      // expect(encodeBech32Pubkey(pubkey, "cosmospub")).toEqual(
      //   "cosmospub1addwnpepqd8sgxq7aw348ydctp3n5ajufgxp395hksxjzc6565yfp56scupfqhlgyg5",
      // );
      expect(encodeBech32Pubkey(pubkey, "linkpub")).toEqual(
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      );
    });

    it("works for ed25519", () => {
      // Decoded from http://localhost:26657/validators
      // Encoded from `corald tendermint show-validator`
      const pubkey: Pubkey = {
        type: "ostracon/PubKeyEd25519",
        // value: "YZHlYxP5R6olj3Tj3f7VgkQE5VaOvv9G0jKATqdQsqI=",
        value: "fTsz0zNrjTQGL6PQnJ7Ra7/DHQlMNEkq4azeowMAH9c=",
      };
      // expect(encodeBech32Pubkey(pubkey, "coralvalconspub")).toEqual(
      //   "coralvalconspub1zcjduepqvxg72ccnl9r65fv0wn3amlk4sfzqfe2k36l073kjx2qyaf6sk23qw7j8wq",
      // );
      expect(encodeBech32Pubkey(pubkey, "linkvalconspub")).toEqual(
        // "coralvalconspub1zcjduepqvxg72ccnl9r65fv0wn3amlk4sfzqfe2k36l073kjx2qyaf6sk23qw7j8wq",
        "linkvalconspub1ef0jhvpq05an85endwxngp3050gfe8k3dwlux8gffs6yj2hp4n02xqcqrlts626zgh",
      );
    });

    it("works for multisig", () => {
      const expected1 = Bech32.decode(testgroup1PubkeyBech32).data;
      expect(encodeAminoPubkey(testgroup1)).toEqual(expected1);

      const expected2 = Bech32.decode(testgroup2PubkeyBech32).data;
      expect(encodeAminoPubkey(testgroup2)).toEqual(expected2);

      const expected3 = Bech32.decode(testgroup3PubkeyBech32).data;
      expect(encodeAminoPubkey(testgroup3)).toEqual(expected3);

      const expected4 = Bech32.decode(testgroup4PubkeyBech32).data;
      expect(encodeAminoPubkey(testgroup4)).toEqual(expected4);
    });
  });
});
