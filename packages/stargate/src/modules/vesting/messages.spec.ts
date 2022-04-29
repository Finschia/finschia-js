import { coin, coins } from "@lbmjs/amino";
import { DirectSecp256k1HdWallet } from "@lbmjs/proto-signing";
import { MsgCreateVestingAccount } from "lbmjs-types/lbm/vesting/v1/tx";
import Long from "long";

import { SigningStargateClient } from "../../signingstargateclient";
import { assertIsDeliverTxSuccess } from "../../stargateclient";
import {
  defaultSigningClientOptions,
  faucet,
  makeRandomAddress,
  pendingWithoutSimapp,
  simapp,
} from "../../testutils.spec";

describe("vestingTypes", () => {
  it("can sign MsgCreateVestingAccount with sign mode direct", async () => {
    pendingWithoutSimapp();
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
    const client = await SigningStargateClient.connectWithSigner(
      simapp.tendermintUrl,
      wallet,
      defaultSigningClientOptions,
    );

    const memo = "Vesting is cool!";
    const recipient = makeRandomAddress();
    const vestingMsg = {
      typeUrl: "/lbm.vesting.v1.MsgCreateVestingAccount",
      value: MsgCreateVestingAccount.fromPartial({
        fromAddress: faucet.address0,
        toAddress: recipient,
        amount: coins(1234, "cony"),
        endTime: Long.fromString("1838718434"),
        delayed: true,
      }),
    };

    const result = await client.signAndBroadcast(faucet.address0, [vestingMsg], "auto", memo);
    assertIsDeliverTxSuccess(result);
    const balance = await client.getBalance(recipient, "cony");
    expect(balance).toEqual(coin(1234, "cony"));

    client.disconnect();
  });
});
