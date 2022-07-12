import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PeriodicVestingAccount } from "lbmjs-types/cosmos/vesting/v1beta1/vesting";
import { Any } from "lbmjs-types/google/protobuf/any";

import { accountFromAny } from "./accounts";

describe("accounts", () => {
  describe("accountFromAny", () => {
    it("works for PeriodicVestingAccount", () => {
      // todo: check below query.
      // Queried from chain via `packages/cli/examples/get_akash_vesting_account.ts`.
      const any = Any.fromJSON({
        typeUrl: "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
        value:
          "ClYKVAorbGluazF6bDZhZzZjOG5sZmhqOHR3Z215N3R5cHQ5MzA1c3ZxZ2hnYzN2bRojCiECy1swF33L0emvgtLQzj7i4N9ZlzdeSjMgj2Qe4Nxhb+owMg==",
      });

      const account = accountFromAny(any);
      expect(account).toEqual({
        address: "link1zl6ag6c8nlfhj8twgmy7typt9305svqghgc3vm",
        ed25519PubKey: null,
        secp256k1PubKey: {
          key: fromBase64("AstbMBd9y9Hpr4LS0M4+4uDfWZc3XkozII9kHuDcYW/q"),
        },
        secp256r1PubKey: null,
        multisigPubKey: null,
        accountNumber: 50,
        sequence: 0,
      });
    });

    it("account", () => {
      const msg = PeriodicVestingAccount.fromPartial({
        baseVestingAccount: {
          baseAccount: {
            address: "link1zl6ag6c8nlfhj8twgmy7typt9305svqghgc3vm",
            ed25519PubKey: undefined,
            secp256k1PubKey: {
              key: fromBase64("AstbMBd9y9Hpr4LS0M4+4uDfWZc3XkozII9kHuDcYW/q"),
            },
            secp256r1PubKey: undefined,
            multisigPubKey: undefined,
            accountNumber: 50,
            sequence: 0,
          },
        },
      });
      const aminoMsg = PeriodicVestingAccount.encode(msg);
      expect(toBase64(aminoMsg.finish())).toEqual(
        "ClYKVAorbGluazF6bDZhZzZjOG5sZmhqOHR3Z215N3R5cHQ5MzA1c3ZxZ2hnYzN2bRojCiECy1swF33L0emvgtLQzj7i4N9ZlzdeSjMgj2Qe4Nxhb+owMg==",
      );
    });
  });
});
