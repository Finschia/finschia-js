import { decodeBech32Pubkey } from "./encoding";
import { createMultisigThresholdPubkey } from "./multisig";
import { MultisigThresholdPubkey } from "./pubkeys";

export const base64Matcher =
  /^(?:[a-zA-Z0-9+/]{4})*(?:|(?:[a-zA-Z0-9+/]{3}=)|(?:[a-zA-Z0-9+/]{2}==)|(?:[a-zA-Z0-9+/]{1}===))$/;

// ./build/wasmd keys add test1
// ./build/wasmd keys add test2
// ./build/wasmd keys add test3
// ./build/wasmd keys add testgroup1 --multisig=test1,test2,test3 --multisig-threshold 2
// ./build/wasmd keys add testgroup2 --multisig=test1,test2,test3 --multisig-threshold 1
// # By default pubkeys are sorted by its address data (https://github.com/cosmos/cosmos-sdk/blob/v0.42.2/client/keys/add.go#L172-L174)
// ./build/wasmd keys add testgroup3 --multisig=test3,test1 --multisig-threshold 2
// ./build/wasmd keys add testgroup4 --multisig=test3,test1 --nosort --multisig-threshold 2

export const test1 = decodeBech32Pubkey(
  "linkpub1cqmsrdepqgz0vs85hqfwar8eclrhnd47mmd6dvx0uy6yq3n5emn5dzxjv5vv2sjn0yz",
  // pubkey data: c03701b7210204f640f4b812ee8cf9c7c779b6bededba6b0cfe134404674cee74688d26518c5
  // address: link146asaycmtydq45kxc8evntqfgepagygelel00h
  // address data: aebb0e931b591a0ad2c6c1f2c9ac094643d41119
);
export const test2 = decodeBech32Pubkey(
  "linkpub1cqmsrdepqthd7ap6vech9kamz8uulgl0hu6352gz8gg7pk8yvdkltmtmwxxxg6u0lpy",
  // pubkey data: c03701b72102eedf743a667172dbbb11f9cfa3efbf351a29023a11e0d8e4636df5ed7b718d64
  // address: link1aaffxdz4dwcnjzumjm7h89yjw5c5wul88zvzuu
  // address data: ef529334556bb1390b9b96fd73949275314773e7
);
export const test3 = decodeBech32Pubkey(
  "linkpub1cqmsrdepqw88zyx2dvmwhrqwlgfv3h0e8pwvcj3cphwf04xsntksu2qx9avkyu9wprp",
  // pubkey data: c03701b721038e7110ca6b36eb8c0efa12c8ddf9385ccc4a380ddc97d4d09aed0E28062f5962
  // address: link1ey0w0xj9v48vk82ht6mhqdlh9wqkx8enkpjwpr
  // address data: c91ee79a45654ecb1d575eb77037f72b81631f33
);

// 2/3 multisig
export const testgroup1: MultisigThresholdPubkey = createMultisigThresholdPubkey([test1, test2, test3], 2);
export const testgroup1PubkeyBech32 =
  "linkpub1w7njrxqgqgfzdsphqxmjzqsy7eq0fwqja6x0n3780xmtahkm56cvlcf5gpr8fnh8g6ydyegcc5fzdsphqxmjzquwwygv56ekawxqa7sjerwljwzue39rsrwujl2dpxhdpc5qvt6evgfzdsphqxmjzqhwma6r5en3wtdmky0ee737l0e4rg5syws3urvwgcmd7hkhkuvvvs2ultdn";

// 1/3 multisig
export const testgroup2: MultisigThresholdPubkey = createMultisigThresholdPubkey([test1, test2, test3], 1);
export const testgroup2PubkeyBech32 =
  "linkpub1w7njrxqgqyfzdsphqxmjzqsy7eq0fwqja6x0n3780xmtahkm56cvlcf5gpr8fnh8g6ydyegcc5fzdsphqxmjzquwwygv56ekawxqa7sjerwljwzue39rsrwujl2dpxhdpc5qvt6evgfzdsphqxmjzqhwma6r5en3wtdmky0ee737l0e4rg5syws3urvwgcmd7hkhkuvvvsv5zfk8";

// 2/2 multisig
export const testgroup3: MultisigThresholdPubkey = createMultisigThresholdPubkey([test1, test3], 2);
export const testgroup3PubkeyBech32 =
  "linkpub1w7njrxqgqgfzdsphqxmjzqsy7eq0fwqja6x0n3780xmtahkm56cvlcf5gpr8fnh8g6ydyegcc5fzdsphqxmjzquwwygv56ekawxqa7sjerwljwzue39rsrwujl2dpxhdpc5qvt6evgqhumzn";

// 2/2 multisig with custom sorting
export const testgroup4: MultisigThresholdPubkey = createMultisigThresholdPubkey([test3, test1], 2, true);
export const testgroup4PubkeyBech32 =
  "linkpub1w7njrxqgqgfzdsphqxmjzquwwygv56ekawxqa7sjerwljwzue39rsrwujl2dpxhdpc5qvt6evgfzdsphqxmjzqsy7eq0fwqja6x0n3780xmtahkm56cvlcf5gpr8fnh8g6ydyegcc5jf2jms";
