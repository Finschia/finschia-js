import { fromBase64, fromHex } from "@cosmjs/encoding";
import { Any } from "lbmjs-types/google/protobuf/any";
import { MsgSend } from "lbmjs-types/lbm/bank/v1/tx";
import { PubKey } from "lbmjs-types/lbm/crypto/secp256k1/keys";
import { SignMode } from "lbmjs-types/lbm/tx/signing/v1/signing";
import Long from "long";

import { decodeTxRaw } from "./decode";
import { faucet, testVectors } from "./testutils.spec";

describe("decode", () => {
  describe("decodeTxRaw", () => {
    it("works", () => {
      const pubkeyBytes = fromBase64(faucet.pubkey.value);
      const prefixedPubkeyBytes = Uint8Array.from(PubKey.encode({ key: pubkeyBytes }).finish());
      const testVector = testVectors[0];

      const expectedMsg: Any = {
        typeUrl: "/lbm.bank.v1.MsgSend",
        value: Uint8Array.from(
          MsgSend.encode({
            fromAddress: "link1xzyh64ze36dc5xv30np8a8lhzz8aqerptenuyr",
            toAddress: "link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705",
            amount: [
              {
                denom: "cony",
                amount: "1234567",
              },
            ],
          }).finish(),
        ),
      };

      const decoded = decodeTxRaw(fromHex(testVector.outputs.signedTxBytes));
      expect(decoded).toEqual({
        authInfo: {
          signerInfos: [
            {
              publicKey: {
                typeUrl: "/lbm.crypto.secp256k1.PubKey",
                value: prefixedPubkeyBytes,
              },
              modeInfo: {
                single: {
                  mode: SignMode.SIGN_MODE_DIRECT,
                },
                multi: undefined,
              },
              sequence: Long.fromNumber(0, true),
            },
          ],
          fee: {
            gasLimit: Long.fromNumber(200000, true),
            payer: "",
            granter: "",
            amount: [{ amount: "2000", denom: "cony" }],
          },
          sigBlockHeight: Long.fromNumber(0, true),
        },
        body: {
          memo: "",
          timeoutHeight: Long.UZERO,
          messages: [expectedMsg],
          extensionOptions: [],
          nonCriticalExtensionOptions: [],
        },
        signatures: [fromHex(testVector.outputs.signature)],
      });
    });
  });
});
