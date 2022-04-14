import { Bech32, fromHex, toBase64 } from "@cosmjs/encoding";
import { createMultisigThresholdPubkey } from "./multisig";
import { pubkeyToAddress, pubkeyToRawAddress } from "./addresses";
import { decodeBech32Pubkey } from "./encoding";
import { MultisigThresholdPubkey } from "./pubkeys";

describe("addresses", () => {
  describe("pubkeyToRawAddress", () => {
    it("works for Secp256k1", () => {
      const pubkey = {
        type: "ostracon/PubKeySecp256k1",
        value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
      };
      expect(pubkeyToRawAddress(pubkey)).toEqual(
        Bech32.decode("cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r").data,
      );
    });

    it("works for Ed25519", () => {
      const pubkey = {
        type: "ostracon/PubKeyEd25519",
        value: toBase64(fromHex("12ee6f581fe55673a1e9e1382a0829e32075a0aa4763c968bc526e1852e78c95")),
      };
      expect(pubkeyToRawAddress(pubkey)).toEqual(
        Bech32.decode("cosmos1pfq05em6sfkls66ut4m2257p7qwlk448h8mysz").data,
      );
    });

    it("works for multisig", () => {
      const test1 = decodeBech32Pubkey(
        // "wasmpub1addwnpepqwxttx8w2sfs6d8cuzqcuau84grp8xsw95qzdjkmvc44tnckskdxw3zw2km",
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      );
      const test2 = decodeBech32Pubkey(
        // "wasmpub1addwnpepq2gx7x7e29kge5a4ycunytyqr0u8ynql5h583s8r9wdads9m3v8ks6y0nhc",
        "linkpub1cqmsrdepqthd7ap6vech9kamz8uulgl0hu6352gz8gg7pk8yvdkltmtmwxxxg6u0lpy",
      );
      const test3 = decodeBech32Pubkey(
        // "wasmpub1addwnpepq0xfx5vavxmgdkn0p6x0l9p3udttghu3qcldd7ql08wa3xy93qq0xuzvtxc",
        "linkpub1cqmsrdepqw88zyx2dvmwhrqwlgfv3h0e8pwvcj3cphwf04xsntksu2qx9avkyu9wprp",
      );

      // const testgroup1: MultisigThresholdPubkey = {
      //   type: "ostracon/PubKeyMultisigThreshold",
      //   value: {
      //     threshold: "2",
      //     pubkeys: [test1, test2, test3],
      //   },
      // };
      const testgroup1: MultisigThresholdPubkey = createMultisigThresholdPubkey([test1, test2, test3], 2);
      expect(pubkeyToRawAddress(testgroup1)).toEqual(fromHex("82AE389333BFDE681A91477597573668A23E9B1E"));
      // expect(pubkeyToRawAddress(testgroup1)).toEqual(fromHex("0892a77fab2fa7e192c3b7b2741e6682f3abb72f"));
    });
  });

  describe("pubkeyToAddress", () => {
    it("works for Secp256k1", () => {
      // const prefix = "cosmos";
      const prefix = "link";
      const pubkey = {
        type: "ostracon/PubKeySecp256k1",
        // value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
        value: "AgT2QPS4Eu6M+cfHeba+3tumsM/hNEBGdM7nRojSZRjF",
      };
      // expect(pubkeyToAddress(pubkey, prefix)).toEqual("cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r");
      expect(pubkeyToAddress(pubkey, prefix)).toEqual("link146asaycmtydq45kxc8evntqfgepagygelel00h");
    });

    it("works for Ed25519", () => {
      const prefix = "cosmos";
      const pubkey = {
        type: "ostracon/PubKeyEd25519",
        value: toBase64(fromHex("12ee6f581fe55673a1e9e1382a0829e32075a0aa4763c968bc526e1852e78c95")),
      };
      expect(pubkeyToAddress(pubkey, prefix)).toEqual("cosmos1pfq05em6sfkls66ut4m2257p7qwlk448h8mysz");
    });

    it("works for multisig", () => {
      const test1 = decodeBech32Pubkey(
        // "wasmpub1addwnpepqwxttx8w2sfs6d8cuzqcuau84grp8xsw95qzdjkmvc44tnckskdxw3zw2km",
        "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
      );
      const test2 = decodeBech32Pubkey(
        // "wasmpub1addwnpepq2gx7x7e29kge5a4ycunytyqr0u8ynql5h583s8r9wdads9m3v8ks6y0nhc",
        "linkpub1cqmsrdepqthd7ap6vech9kamz8uulgl0hu6352gz8gg7pk8yvdkltmtmwxxxg6u0lpy",
      );
      const test3 = decodeBech32Pubkey(
        // "wasmpub1addwnpepq0xfx5vavxmgdkn0p6x0l9p3udttghu3qcldd7ql08wa3xy93qq0xuzvtxc",
        "linkpub1cqmsrdepqw88zyx2dvmwhrqwlgfv3h0e8pwvcj3cphwf04xsntksu2qx9avkyu9wprp",
      );

      // const testgroup1: MultisigThresholdPubkey = {
      //   type: "ostracon/PubKeyMultisigThreshold",
      //   value: {
      //     threshold: "2",
      //     pubkeys: [test1, test2, test3],
      //   },
      // };
      const testgroup1: MultisigThresholdPubkey = createMultisigThresholdPubkey([test1, test2, test3], 2);
      expect(pubkeyToAddress(testgroup1, "link")).toEqual("link1s2hr3yenhl0xsx53ga6ew4ekdz3raxc7cq9y5j");
      // expect(pubkeyToAddress(testgroup1, "wasm")).toEqual("wasm1pzf2wlat97n7rykrk7e8g8nxste6hde0r8jqsy");
    });
  });
});
