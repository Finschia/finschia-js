import { pathToString } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@lbmjs/proto-signing";
import { SigningStargateClient } from "@lbmjs/stargate";

import { PathBuilder } from "./pathbuilder";

export async function createWallets(
  mnemonic: string,
  pathBuilder: PathBuilder,
  addressPrefix: string,
  numberOfDistributors: number,
  logging: boolean,
): Promise<ReadonlyArray<readonly [string, OfflineSigner]>> {
  const createWallet = DirectSecp256k1HdWallet.fromMnemonic;
  const wallets = new Array<readonly [string, OfflineSigner]>();

  // first account is the token holder
  const numberOfIdentities = 1 + numberOfDistributors;
  for (let i = 0; i < numberOfIdentities; i++) {
    const path = pathBuilder(i);
    const wallet = await createWallet(mnemonic, { hdPaths: [path], prefix: addressPrefix });
    const [{ address }] = await wallet.getAccounts();
    if (logging) {
      const role = i === 0 ? "token holder " : `distributor ${i}`;
      console.info(`Created ${role} (${pathToString(path)}): ${address}`);
    }
    wallets.push([address, wallet]);
  }

  return wallets;
}

export async function createClients(
  apiUrl: string,
  wallets: ReadonlyArray<readonly [string, OfflineSigner]>,
): Promise<ReadonlyArray<readonly [string, SigningStargateClient]>> {
  // we need one client per sender
  return Promise.all(
    wallets.map(
      async ([senderAddress, wallet]): Promise<
        readonly [string, SigningStargateClient]
      > => [
        senderAddress,
        await SigningStargateClient.connectWithSigner(apiUrl, wallet),
      ],
    ),
  );
}
