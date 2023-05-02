import { toUtf8 } from "@cosmjs/encoding";
import { DirectSecp256k1HdWallet, OfflineDirectSigner, Registry } from "@cosmjs/proto-signing";
import {
  assertIsDeliverTxSuccess,
  calculateFee,
  coin,
  DeliverTxResponse,
  logs,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { MsgStoreCodeAndInstantiateContract } from "@finschia/finschia-proto/lbm/wasm/v1/tx";

import { makeLinkPath } from "../../paths";
import {
  defaultGasPrice,
  defaultSigningClientOptions,
  faucet,
  getHackatom,
  makeRandomAddress,
  makeWasmClient,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import { MsgStoreCodeAndInstantiateContractEncodeObject, wasmplusTypes } from "./messages";

const registry = new Registry(wasmplusTypes);

const eventTypeInstantiateContract = "instantiate";
const attributeTypeContractAddress = "_contract_address";

async function uploadAndInstantiate(
  signer: OfflineDirectSigner,
  beneficiaryAddress: string,
): Promise<DeliverTxResponse> {
  const memo = "My first contract on chain";
  const theMsg: MsgStoreCodeAndInstantiateContractEncodeObject = {
    typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract",
    value: MsgStoreCodeAndInstantiateContract.fromPartial({
      sender: faucet.address0,
      wasmByteCode: getHackatom().data,
      admin: "",
      label: "My Test label",
      msg: toUtf8(
        JSON.stringify({
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        }),
      ),
      funds: [coin(1234, "cony"), coin(321, "stake")],
    }),
  };

  const firstAddress = (await signer.getAccounts())[0].address;
  const client = await SigningStargateClient.connectWithSigner(simapp.tendermintUrl, signer, {
    ...defaultSigningClientOptions,
    registry,
  });
  return client.signAndBroadcast(firstAddress, [theMsg], calculateFee(3_000_000, defaultGasPrice), memo);
}

describe("WasmplusExtension", () => {
  let hackatomContractAddress: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const result = await uploadAndInstantiate(wallet, makeRandomAddress());

      assertIsDeliverTxSuccess(result);
      hackatomContractAddress = JSON.parse(result.rawLog!)[0]
        .events.find((event: any) => event.type === eventTypeInstantiateContract)
        .attributes.find((attribute: any) => attribute.key === attributeTypeContractAddress).value;
    }
  });

  describe("inactiveContract", () => {
    it("get status wether the contract by the contract address is active or not", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const result = await client.wasmplus.getInactiveContract(hackatomContractAddress);
      assert(result);
    });
  });

  describe("inactiveContracts", () => {
    it("get list of contract addresses that is inactive", async () => {
      pendingWithoutSimapp();
      const client = await makeWasmClient(simapp.tendermintUrl);
      const { addresses } = await client.wasmplus.getInactiveContracts();
      assert(addresses);
    });
  });

  describe("broadcastTx", () => {
    it("can upload and intantiate", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await makeWasmClient(simapp.tendermintUrl);

      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();

      const result = await uploadAndInstantiate(wallet, beneficiaryAddress);
      assertIsDeliverTxSuccess(result);

      const parsedLogs = logs.parseLogs(logs.parseRawLog(result.rawLog));
      const codeIdAttr = logs.findAttribute(parsedLogs, "store_code", "code_id");
      const codeId = Number.parseInt(codeIdAttr.value, 10);
      expect(codeId).toBeGreaterThanOrEqual(1);
      expect(codeId).toBeLessThanOrEqual(200);
      const actionAttr1 = logs.findAttribute(parsedLogs, "message", "module");
      expect(actionAttr1.value).toEqual("wasm");

      const contractAddressAttr = logs.findAttribute(parsedLogs, "instantiate", "_contract_address");
      const contractAddress = contractAddressAttr.value;
      const amountAttr = logs.findAttribute(parsedLogs, "transfer", "amount");
      expect(amountAttr.value).toEqual("1234cony,321stake");
      const actionAttr2 = logs.findAttribute(parsedLogs, "message", "module");
      expect(actionAttr2.value).toEqual("wasm");

      const balanceUcosm = await client.bank.balance(contractAddress, "cony");
      expect(balanceUcosm).toEqual(funds[0]);
      const balanceUstake = await client.bank.balance(contractAddress, "stake");
      expect(balanceUstake).toEqual(funds[1]);
    });
  });
});
