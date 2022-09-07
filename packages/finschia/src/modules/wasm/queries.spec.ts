import { sha256 } from "@cosmjs/crypto";
import { fromAscii, fromHex, toAscii, toHex } from "@cosmjs/encoding";
import { DirectSecp256k1HdWallet, OfflineDirectSigner, Registry } from "@cosmjs/proto-signing";
import {
  assertIsDeliverTxSuccess,
  Coin,
  coin,
  coins,
  DeliverTxResponse,
  logs,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { MsgExecuteContract, MsgInstantiateContract, MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ContractCodeHistoryOperationType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { ContractStatus } from "lbmjs-types/cosmwasm/wasm/v1/types";
import Long from "long";

import { makeLinkPath } from "../../paths";
import { SigningFinschiaClient } from "../../signingfinschiaclient";
import {
  bech32AddressMatcher,
  ContractUploadInstructions,
  defaultSigningClientOptions,
  faucet,
  getHackatom,
  makeRandomAddress,
  makeWasmClient,
  pendingWithoutSimapp,
  simapp,
  simappEnabled,
} from "../../testutils.spec";
import {
  MsgExecuteContractEncodeObject,
  MsgInstantiateContractEncodeObject,
  MsgStoreCodeEncodeObject,
  wasmTypes,
} from "./messages";

const registry = new Registry(wasmTypes);

const eventTypeInstantiateContract = "instantiate";
const attributeTypeContractAddress = "_contract_address";

async function uploadContract(
  signer: OfflineDirectSigner,
  contract: ContractUploadInstructions,
): Promise<DeliverTxResponse> {
  const memo = "My first contract on chain";
  const theMsg: MsgStoreCodeEncodeObject = {
    typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
    value: MsgStoreCode.fromPartial({
      sender: faucet.address0,
      wasmByteCode: contract.data,
    }),
  };
  const fee: StdFee = {
    amount: coins(5000000, "cony"),
    gas: "89000000",
  };
  const firstAddress = (await signer.getAccounts())[0].address;
  const client = await SigningStargateClient.connectWithSigner(simapp.tendermintUrl, signer, {
    ...defaultSigningClientOptions,
    registry,
  });
  return client.signAndBroadcast(firstAddress, [theMsg], fee, memo);
}

async function instantiateContract(
  signer: OfflineDirectSigner,
  codeId: number,
  beneficiaryAddress: string,
  funds?: readonly Coin[],
): Promise<DeliverTxResponse> {
  const memo = "Create an escrow instance";
  const theMsg: MsgInstantiateContractEncodeObject = {
    typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
    value: MsgInstantiateContract.fromPartial({
      sender: faucet.address0,
      codeId: Long.fromNumber(codeId),
      label: "my escrow",
      msg: toAscii(
        JSON.stringify({
          verifier: faucet.address0,
          beneficiary: beneficiaryAddress,
        }),
      ),
      funds: funds ? [...funds] : [],
    }),
  };
  const fee: StdFee = {
    amount: coins(5000000, "cony"),
    gas: "89000000",
  };

  const firstAddress = (await signer.getAccounts())[0].address;
  const client = await SigningStargateClient.connectWithSigner(simapp.tendermintUrl, signer, {
    ...defaultSigningClientOptions,
    registry,
  });
  return client.signAndBroadcast(firstAddress, [theMsg], fee, memo);
}

async function executeContract(
  signer: OfflineDirectSigner,
  contractAddress: string,
  msg: Record<string, unknown>,
): Promise<DeliverTxResponse> {
  const memo = "Time for action";
  const theMsg: MsgExecuteContractEncodeObject = {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender: faucet.address0,
      contract: contractAddress,
      msg: toAscii(JSON.stringify(msg)),
      funds: [],
    }),
  };
  const fee: StdFee = {
    amount: coins(5000000, "cony"),
    gas: "89000000",
  };

  const firstAddress = (await signer.getAccounts())[0].address;
  const client = await SigningFinschiaClient.connectWithSigner(simapp.tendermintUrl, signer, {
    ...defaultSigningClientOptions,
    registry,
  });
  return client.signAndBroadcast(firstAddress, [theMsg], fee, memo);
}

describe("WasmExtension", () => {
  const hackatom = getHackatom();
  const hackatomConfigKey = toAscii("config");
  let hackatomCodeId: number | undefined;
  let hackatomContractAddress: string | undefined;

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const result = await uploadContract(wallet, hackatom);
      assertIsDeliverTxSuccess(result);
      hackatomCodeId = Number.parseInt(
        JSON.parse(result.rawLog!)[0]
          .events.find((event: any) => event.type === "store_code")
          .attributes.find((attribute: any) => attribute.key === "code_id").value,
        10,
      );

      const instantiateResult = await instantiateContract(wallet, hackatomCodeId, makeRandomAddress());
      assertIsDeliverTxSuccess(instantiateResult);
      hackatomContractAddress = JSON.parse(instantiateResult.rawLog!)[0]
        .events.find((event: any) => event.type === eventTypeInstantiateContract)
        .attributes.find((attribute: any) => attribute.key === attributeTypeContractAddress).value;
    }
  });

  describe("listCodeInfo", () => {
    it("has recently uploaded contract as last entry", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const { codeInfos } = await client.wasm.listCodeInfo();
      assert(codeInfos);
      const lastCode = codeInfos[codeInfos.length - 1];
      expect(lastCode.codeId.toNumber()).toEqual(hackatomCodeId);
      expect(lastCode.creator).toEqual(faucet.address0);
      expect(toHex(lastCode.dataHash)).toEqual(toHex(sha256(hackatom.data)));
    });
  });

  describe("getCode", () => {
    it("contains fill code information", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const { codeInfo, data } = await client.wasm.getCode(hackatomCodeId);
      assert(codeInfo);
      expect(codeInfo.codeId.toNumber()).toEqual(hackatomCodeId);
      expect(codeInfo.creator).toEqual(faucet.address0);
      expect(toHex(codeInfo.dataHash)).toEqual(toHex(sha256(hackatom.data)));
      expect(data).toEqual(hackatom.data);
    });
  });

  // TODO: move listContractsByCodeId tests out of here
  describe("getContractInfo", () => {
    it("works", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await makeWasmClient(simapp.tendermintUrl);

      // create new instance and compare before and after
      const { contracts: existingContracts } = await client.wasm.listContractsByCodeId(hackatomCodeId);
      assert(existingContracts);
      for (const address of existingContracts) {
        expect(address).toMatch(bech32AddressMatcher);
      }

      const beneficiaryAddress = makeRandomAddress();
      const funds = coins(707707, "cony");
      const result = await instantiateContract(wallet, hackatomCodeId, beneficiaryAddress, funds);
      assertIsDeliverTxSuccess(result);
      const myAddress = JSON.parse(result.rawLog!)[0]
        .events.find((event: any) => event.type === eventTypeInstantiateContract)
        .attributes!.find((attribute: any) => attribute.key === attributeTypeContractAddress).value;

      const { contracts: newContracts } = await client.wasm.listContractsByCodeId(hackatomCodeId);
      assert(newContracts);
      expect(newContracts.length).toEqual(existingContracts.length + 1);
      const newContract = newContracts[newContracts.length - 1];
      expect(newContract).toMatch(bech32AddressMatcher);

      const { contractInfo } = await client.wasm.getContractInfo(myAddress);
      assert(contractInfo);
      expect({ ...contractInfo }).toEqual({
        codeId: Long.fromNumber(hackatomCodeId, true),
        creator: faucet.address0,
        label: "my escrow",
        admin: "",
        ibcPortId: "",
        status: ContractStatus.CONTRACT_STATUS_ACTIVE,
        created: undefined,
        extension: undefined,
      });
      expect(contractInfo.admin).toEqual("");
    });

    it("rejects for non-existent address", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const nonExistentAddress = makeRandomAddress();
      await expectAsync(client.wasm.getContractInfo(nonExistentAddress)).toBeRejectedWithError(/not found/i);
    });
  });

  describe("getContractCodeHistory", () => {
    it("can list contract history", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await makeWasmClient(simapp.tendermintUrl);

      // create new instance and compare before and after
      const beneficiaryAddress = makeRandomAddress();
      const funds = coins(707707, "cony");
      const result = await instantiateContract(wallet, hackatomCodeId, beneficiaryAddress, funds);
      assertIsDeliverTxSuccess(result);

      const myAddress = JSON.parse(result.rawLog!)[0]
        .events.find((event: any) => event.type === eventTypeInstantiateContract)
        .attributes!.find((attribute: any) => attribute.key === attributeTypeContractAddress).value;

      const history = await client.wasm.getContractCodeHistory(myAddress);
      assert(history.entries);
      expect(history.entries).toContain(
        jasmine.objectContaining({
          codeId: Long.fromNumber(hackatomCodeId, true),
          operation: ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT,
          msg: toAscii(
            JSON.stringify({
              verifier: faucet.address0,
              beneficiary: beneficiaryAddress,
            }),
          ),
        }),
      );
    });

    it("returns empty list for non-existent address", async () => {
      pendingWithoutSimapp();
      assert(hackatomCodeId);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const nonExistentAddress = makeRandomAddress();
      const history = await client.wasm.getContractCodeHistory(nonExistentAddress);
      expect(history.entries).toEqual([]);
    });
  });

  describe("getAllContractState", () => {
    it("can get all state", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const { models } = await client.wasm.getAllContractState(hackatomContractAddress);
      assert(models);
      expect(models.length).toEqual(1);
      const data = models[0];
      expect(data.key).toEqual(hackatomConfigKey);
      const value = JSON.parse(fromAscii(data.value));
      expect(value.verifier).toMatch(bech32AddressMatcher);
      expect(value.beneficiary).toMatch(bech32AddressMatcher);
    });

    it("rejects for non-existent address", async () => {
      pendingWithoutSimapp();
      const client = await makeWasmClient(simapp.tendermintUrl);
      const nonExistentAddress = makeRandomAddress();
      await expectAsync(client.wasm.getAllContractState(nonExistentAddress)).toBeRejectedWithError(
        /not found/i,
      );
    });
  });

  describe("queryContractRaw", () => {
    it("can query by key", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const raw = await client.wasm.queryContractRaw(hackatomContractAddress, hackatomConfigKey);
      assert(raw.data, "must get result");
      const model = JSON.parse(fromAscii(raw.data));
      expect(model.verifier).toMatch(bech32AddressMatcher);
      expect(model.beneficiary).toMatch(bech32AddressMatcher);
    });

    it("returns empty for missing key", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const { data } = await client.wasm.queryContractRaw(hackatomContractAddress, fromHex("cafe0dad"));
      expect(data).toEqual(new Uint8Array());
    });

    it("returns null for non-existent address", async () => {
      pendingWithoutSimapp();
      const client = await makeWasmClient(simapp.tendermintUrl);
      const nonExistentAddress = makeRandomAddress();
      await expectAsync(
        client.wasm.queryContractRaw(nonExistentAddress, hackatomConfigKey),
      ).toBeRejectedWithError(/not found/i);
    });
  });

  describe("queryContractSmart", () => {
    it("can make smart queries", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const request = { verifier: {} };
      const result = await client.wasm.queryContractSmart(hackatomContractAddress, request);
      expect(result).toEqual({ verifier: faucet.address0 });
    });

    it("throws for invalid query requests", async () => {
      pendingWithoutSimapp();
      assert(hackatomContractAddress);
      const client = await makeWasmClient(simapp.tendermintUrl);
      const request = { nosuchkey: {} };
      await expectAsync(
        client.wasm.queryContractSmart(hackatomContractAddress, request),
      ).toBeRejectedWithError(/Error parsing into type hackatom::msg::QueryMsg: unknown variant/i);
    });

    it("throws for non-existent address", async () => {
      pendingWithoutSimapp();
      const client = await makeWasmClient(simapp.tendermintUrl);
      const nonExistentAddress = makeRandomAddress();
      const request = { verifier: {} };
      await expectAsync(client.wasm.queryContractSmart(nonExistentAddress, request)).toBeRejectedWithError(
        /not found/i,
      );
    });
  });

  describe("broadcastTx", () => {
    it("can upload, instantiate and execute wasm", async () => {
      pendingWithoutSimapp();
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic, {
        hdPaths: [makeLinkPath(0)],
        prefix: simapp.prefix,
      });
      const client = await makeWasmClient(simapp.tendermintUrl);

      const funds = [coin(1234, "cony"), coin(321, "stake")];
      const beneficiaryAddress = makeRandomAddress();

      let codeId: number;

      // upload
      {
        const result = await uploadContract(wallet, getHackatom());
        assertIsDeliverTxSuccess(result);
        const parsedLogs = logs.parseLogs(logs.parseRawLog(result.rawLog));
        const codeIdAttr = logs.findAttribute(parsedLogs, "store_code", "code_id");
        codeId = Number.parseInt(codeIdAttr.value, 10);
        expect(codeId).toBeGreaterThanOrEqual(1);
        expect(codeId).toBeLessThanOrEqual(200);
        const actionAttr = logs.findAttribute(parsedLogs, "message", "module");
        expect(actionAttr.value).toEqual("wasm");
      }

      let contractAddress: string;

      // instantiate
      {
        const result = await instantiateContract(wallet, codeId, beneficiaryAddress, funds);
        assertIsDeliverTxSuccess(result);
        const parsedLogs = logs.parseLogs(logs.parseRawLog(result.rawLog));
        const contractAddressAttr = logs.findAttribute(
          parsedLogs,
          eventTypeInstantiateContract,
          attributeTypeContractAddress,
        );
        contractAddress = contractAddressAttr.value;
        const amountAttr = logs.findAttribute(parsedLogs, "transfer", "amount");
        expect(amountAttr.value).toEqual("1234cony,321stake");
        const actionAttr = logs.findAttribute(parsedLogs, "message", "module");
        expect(actionAttr.value).toEqual("wasm");

        const balanceCony = await client.bank.balance(contractAddress, "cony");
        expect(balanceCony).toEqual(funds[0]);
        const balanceUstake = await client.bank.balance(contractAddress, "stake");
        expect(balanceUstake).toEqual(funds[1]);
      }

      // execute
      {
        const result = await executeContract(wallet, contractAddress, { release: {} });
        assertIsDeliverTxSuccess(result);
        const parsedLogs = logs.parseLogs(logs.parseRawLog(result.rawLog));
        const wasmEvent = parsedLogs.find(() => true)?.events.find((e) => e.type === "wasm");
        assert(wasmEvent, "Event of type wasm expected");
        expect(wasmEvent.attributes).toContain({ key: "action", value: "release" });
        expect(wasmEvent.attributes).toContain({
          key: "destination",
          value: beneficiaryAddress,
        });

        // Verify token transfer from contract to beneficiary
        const beneficiaryBalanceCony = await client.bank.balance(beneficiaryAddress, "cony");
        expect(beneficiaryBalanceCony).toEqual(funds[0]);
        const beneficiaryBalanceUstake = await client.bank.balance(beneficiaryAddress, "stake");
        expect(beneficiaryBalanceUstake).toEqual(funds[1]);
      }
    });
  });
});
