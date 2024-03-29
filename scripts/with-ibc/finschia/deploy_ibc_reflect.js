#!/usr/bin/env -S yarn node

/* eslint-disable @typescript-eslint/naming-convention */
const { SigningFinschiaClient, makeLinkPath } = require("@finschia/finschia");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { calculateFee, GasPrice } = require("@cosmjs/stargate");
const fs = require("fs");

const endpoint = "http://localhost:26658";
const alice = {
  mnemonic:
    "mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have",
  address0: "link146asaycmtydq45kxc8evntqfgepagygelel00h",
  address1: "link1aaffxdz4dwcnjzumjm7h89yjw5c5wul88zvzuu",
  address2: "link1ey0w0xj9v48vk82ht6mhqdlh9wqkx8enkpjwpr",
  address3: "link1dfyywjglcfptn72axxhsslpy8ep6wq7wujasma",
  address4: "link1equ4n3uwyhapak5g3leq0avz85k0q6jcdy5w0f",
};

const inits = [
  {
    label: "Instantiate IBC reflect",
    msg: {
      reflect_code_id: 222, // dummy value that will not work
    },
    admin: undefined,
  },
];

async function main() {
  const gasPrice = GasPrice.fromString("0.025cony");
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(alice.mnemonic, {
    hdPaths: [makeLinkPath(0)],
    prefix: "link",
  });
  const client = await SigningFinschiaClient.connectWithSigner(endpoint, wallet);

  const wasm = fs.readFileSync(__dirname + "/contracts/ibc_reflect.wasm");
  const uploadFee = calculateFee(2_500_000, gasPrice);
  const uploadReceipt = await client.upload(alice.address0, wasm, uploadFee, "Upload IBC reflect contract");
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  const instantiateFee = calculateFee(900_000, gasPrice);
  for (const { label, msg, admin } of inits) {
    const { contractAddress } = await client.instantiate(
      alice.address0,
      uploadReceipt.codeId,
      msg,
      label,
      instantiateFee,
      {
        memo: `Create a ibc_reflect instance in deploy_ibc_reflect.js`,
        admin: admin,
      },
    );
    console.info(`Contract instantiated at ${contractAddress}`);
  }
}

main().then(
  () => {
    console.info("All done, have fun with IBC.");
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
