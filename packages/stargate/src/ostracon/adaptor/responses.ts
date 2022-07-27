/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64, fromHex } from "@cosmjs/encoding";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import * as responses from "@cosmjs/tendermint-rpc";
import { ValidatorPubkey } from "@cosmjs/tendermint-rpc";
import { fromRfc3339WithNanoseconds } from "@cosmjs/tendermint-rpc";

import {
  assertBoolean,
  assertNotEmpty,
  assertObject,
  assertString,
  dictionaryToStringMap,
  Integer,
} from "../encodings";

// yes, a different format for status and dump consensus state
interface RpcPubkey {
  readonly type: string;
  /** base64 encoded */
  readonly value: string;
}

function decodePubkey(data: RpcPubkey): ValidatorPubkey {
  switch (data.type) {
    // go-amino special code
    case "tendermint/PubKeyEd25519":
      return {
        algorithm: "ed25519",
        data: fromBase64(assertNotEmpty(data.value)),
      };
    case "tendermint/PubKeySecp256k1":
      return {
        algorithm: "secp256k1",
        data: fromBase64(assertNotEmpty(data.value)),
      };
    default:
      throw new Error(`unknown pubkey type: ${data.type}`);
  }
}

interface RpcNodeInfo {
  /** hex encoded */
  readonly id: string;
  /** IP and port */
  readonly listen_addr: string;
  readonly network: string;
  readonly version: string;
  readonly channels: string; // ???
  readonly moniker: string;
  readonly protocol_version: {
    readonly p2p: string;
    readonly block: string;
    readonly app: string;
  };
  /**
   * Additional information. E.g.
   * {
   *   "tx_index": "on",
   *   "rpc_address":"tcp://0.0.0.0:26657"
   * }
   */
  readonly other: Record<string, unknown>;
}

function decodeNodeInfo(data: RpcNodeInfo): responses.NodeInfo {
  return {
    id: fromHex(assertNotEmpty(data.id)),
    listenAddr: assertNotEmpty(data.listen_addr),
    network: assertNotEmpty(data.network),
    version: assertString(data.version), // Can be empty (https://github.com/cosmos/cosmos-sdk/issues/7963)
    channels: assertNotEmpty(data.channels),
    moniker: assertNotEmpty(data.moniker),
    other: dictionaryToStringMap(data.other),
    protocolVersion: {
      app: Integer.parse(assertNotEmpty(data.protocol_version.app)),
      block: Integer.parse(assertNotEmpty(data.protocol_version.block)),
      p2p: Integer.parse(assertNotEmpty(data.protocol_version.p2p)),
    },
  };
}

interface RpcSyncInfo {
  /** hex encoded */
  readonly latest_block_hash: string;
  /** hex encoded */
  readonly latest_app_hash: string;
  readonly latest_block_height: string;
  readonly latest_block_time: string;
  readonly catching_up: boolean;
}

function decodeSyncInfo(data: RpcSyncInfo): responses.SyncInfo {
  return {
    latestBlockHash: fromHex(assertNotEmpty(data.latest_block_hash)),
    latestAppHash: fromHex(assertNotEmpty(data.latest_app_hash)),
    latestBlockTime: fromRfc3339WithNanoseconds(assertNotEmpty(data.latest_block_time)),
    latestBlockHeight: Integer.parse(assertNotEmpty(data.latest_block_height)),
    catchingUp: assertBoolean(data.catching_up),
  };
}

// this is in status
interface RpcValidatorInfo {
  /** hex encoded */
  readonly address: string;
  readonly pub_key: RpcPubkey;
  readonly staking_power: string;
}

function decodeValidatorInfo(data: RpcValidatorInfo): responses.Validator {
  return {
    pubkey: decodePubkey(assertObject(data.pub_key)),
    votingPower: Integer.parse(assertNotEmpty(data.staking_power)),
    address: fromHex(assertNotEmpty(data.address)),
  };
}

interface RpcStatusResponse {
  readonly node_info: RpcNodeInfo;
  readonly sync_info: RpcSyncInfo;
  readonly validator_info: RpcValidatorInfo;
}

function decodeStatus(data: RpcStatusResponse): responses.StatusResponse {
  return {
    nodeInfo: decodeNodeInfo(data.node_info),
    syncInfo: decodeSyncInfo(data.sync_info),
    validatorInfo: decodeValidatorInfo(data.validator_info),
  };
}

export class Responses {
  public static decodeStatus(response: JsonRpcSuccessResponse): responses.StatusResponse {
    return decodeStatus(response.result as RpcStatusResponse);
  }
}
