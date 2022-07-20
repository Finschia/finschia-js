import { toBase64 } from "@cosmjs/encoding";
import { encodePubkey } from "@lbmjs/proto-signing";
import { PeriodicVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/vesting";
import { Any } from "cosmjs-types/google/protobuf/any";

import { accountFromAny } from "./accounts";

describe("accounts", () => {
  describe("accountFromAny", () => {
    it("works for PeriodicVestingAccount", () => {
      // todo: check below query.
      // Queried from chain via `packages/cli/examples/get_akash_vesting_account.ts`.
      const any = Any.fromJSON({
        typeUrl: "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
        value:
          "CnkKdworbGluazF6bDZhZzZjOG5sZmhqOHR3Z215N3R5cHQ5MzA1c3ZxZ2hnYzN2bRJGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQLLWzAXfcvR6a+C0tDOPuLg31mXN15KMyCPZB7g3GFv6hgy",
      });

      const account = accountFromAny(any);
      expect(account).toEqual({
        address: "link1zl6ag6c8nlfhj8twgmy7typt9305svqghgc3vm",
        pubKey: {
          type: "ostracon/PubKeySecp256k1",
          value: "AstbMBd9y9Hpr4LS0M4+4uDfWZc3XkozII9kHuDcYW/q",
        },
        accountNumber: 50,
        sequence: 0,
      });
    });

    it("account", () => {
      const msg = PeriodicVestingAccount.fromPartial({
        baseVestingAccount: {
          baseAccount: {
            address: "link1zl6ag6c8nlfhj8twgmy7typt9305svqghgc3vm",
            pubKey: encodePubkey({
              type: "ostracon/PubKeySecp256k1",
              value: "AstbMBd9y9Hpr4LS0M4+4uDfWZc3XkozII9kHuDcYW/q",
            }),
            accountNumber: 50,
            sequence: 0,
          },
        },
      });
      const aminoMsg = PeriodicVestingAccount.encode(msg).finish();
      expect(toBase64(aminoMsg)).toEqual(
        "CnkKdworbGluazF6bDZhZzZjOG5sZmhqOHR3Z215N3R5cHQ5MzA1c3ZxZ2hnYzN2bRJGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQLLWzAXfcvR6a+C0tDOPuLg31mXN15KMyCPZB7g3GFv6hgy",
      );
    });
  });
});
