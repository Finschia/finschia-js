#!/usr/bin/env -S yarn node

/* eslint-disable @typescript-eslint/naming-convention */
const { SigningCosmWasmClient } = require("@lbmjs/cosmwasm-stargate");
const { DirectSecp256k1HdWallet } = require("@lbmjs/proto-signing");
const { calculateFee, GasPrice } = require("@lbmjs/stargate");
const fs = require("fs");

const endpoint = "http://localhost:26658";
const alice = {
  mnemonic: "mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have",
  address0: "link146asaycmtydq45kxc8evntqfgepagygelel00h",
  address1: "link1aaffxdz4dwcnjzumjm7h89yjw5c5wul88zvzuu",
  address2: "link1ey0w0xj9v48vk82ht6mhqdlh9wqkx8enkpjwpr",
  address3: "link1dfyywjglcfptn72axxhsslpy8ep6wq7wujasma",
  address4: "link1equ4n3uwyhapak5g3leq0avz85k0q6jcdy5w0f",
};

const inits = [
  {
    label: "From deploy_hackatom.js (0)",
    msg: {
      beneficiary: alice.address0,
      verifier: alice.address0,
    },
    admin: undefined,
  },
  {
    label: "From deploy_hackatom.js (1)",
    msg: {
      beneficiary: alice.address1,
      verifier: alice.address1,
    },
    admin: undefined,
  },
  {
    label: "From deploy_hackatom.js (2)",
    msg: {
      beneficiary: alice.address2,
      verifier: alice.address2,
    },
    admin: alice.address1,
  },
];

async function main() {
  const gasPrice = GasPrice.fromString("0.025cony");
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, { prefix: "link" });
  const client = await SigningCosmWasmClient.connectWithSigner(endpoint, wallet);

  const wasm = fs.readFileSync(__dirname + "/contracts/hackatom.wasm");
  const uploadFee = calculateFee(1_500_000, gasPrice);
  const uploadReceipt = await client.upload(
    alice.address0,
    wasm,
    uploadFee,
    "Upload hackatom contract",
  );
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  const instantiateFee = calculateFee(500_000, gasPrice);
  for (const { label, msg, admin } of inits) {
    const { contractAddress } = await client.instantiate(
      alice.address0,
      uploadReceipt.codeId,
      msg,
      label,
      instantiateFee,
      {
        memo: `Create a hackatom instance in deploy_hackatom.js`,
        admin: admin,
      },
    );
    console.info(`Contract instantiated at ${contractAddress}`);
  }
}

main().then(
  () => {
    console.info("All done, let the coins flow.");
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
