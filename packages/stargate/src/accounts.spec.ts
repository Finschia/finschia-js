import { fromBase64 } from "@cosmjs/encoding";
import { Any } from "lbmjs-types/google/protobuf/any";

import { accountFromAny } from "./accounts";

describe("accounts", () => {
  describe("accountFromAny", () => {
    it("works for PeriodicVestingAccount", () => {
      // todo: check below query.
      // Queried from chain via `packages/cli/examples/get_akash_vesting_account.ts`.
      const any = Any.fromJSON({
        typeUrl: "/lbm.vesting.v1.PeriodicVestingAccount",
        value:
          "CmwKVAorbGluazF6bDZhZzZjOG5sZmhqOHR3Z215N3R5cHQ5MzA1c3ZxZ2hnYzN2bRojCiECy1swF33L0emvgtLQzj7i4N9ZlzdeSjMgj2Qe4Nxhb+ooMhIOCgRjb255EgY1MDAwMDAorKSpjwYQnIipjwYaEwiQHBIOCgRjb255EgY1MDAwMDA=",
      });

      const account = accountFromAny(any);
      expect(account).toEqual({
        address: "link1zl6ag6c8nlfhj8twgmy7typt9305svqghgc3vm",
        ed25519PubKey: null,
        secp256k1PubKey: {
          key: fromBase64("AstbMBd9y9Hpr4LS0M4+4uDfWZc3XkozII9kHuDcYW/q"),
        },
        multisigPubKey: null,
        sequence: 50,
      });
    });
  });
});
