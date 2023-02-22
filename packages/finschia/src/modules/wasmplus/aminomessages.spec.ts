/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64, toUtf8 } from "@cosmjs/encoding";
import { AminoTypes, coins } from "@cosmjs/stargate";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { MsgStoreCodeAndInstantiateContract } from "lbmjs-types/lbm/wasm/v1/tx";

import { AminoMsgStoreCodeAndInstantiateContract, createWasmplusAminoConverters } from "./aminomessages";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgStoreCodeAndInstantiate", () => {
      const msg: MsgStoreCodeAndInstantiateContract = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: undefined,
        admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        label: "sticky",
        msg: toUtf8(`{"foo":"bar"}`),
        funds: coins(1234, "cony"),
      };
      const aminoMsg = new AminoTypes(createWasmplusAminoConverters()).toAmino({
        typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract",
        value: msg,
      });
      const expected: AminoMsgStoreCodeAndInstantiateContract = {
        type: "wasm/MsgStoreCodeAndInstantiateContract",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: undefined,
          admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          label: "sticky",
          msg: { foo: "bar" },
          funds: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgStoreCodeAndInstantiate with access type", () => {
      const msg: MsgStoreCodeAndInstantiateContract = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: {
          permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS,
          address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        },
        admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        label: "sticky",
        msg: toUtf8(`{"foo":"bar"}`),
        funds: coins(1234, "cony"),
      };
      const aminoMsg = new AminoTypes(createWasmplusAminoConverters()).toAmino({
        typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract",
        value: msg,
      });
      const expected: AminoMsgStoreCodeAndInstantiateContract = {
        type: "wasm/MsgStoreCodeAndInstantiateContract",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: {
            permission: "OnlyAddress",
            address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          },
          admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          label: "sticky",
          msg: { foo: "bar" },
          funds: coins(1234, "cony"),
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    it("works for MsgStoreCodeAndInstantiateContract", () => {
      const aminoMsg: AminoMsgStoreCodeAndInstantiateContract = {
        type: "wasm/MsgStoreCodeAndInstantiateContract",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: undefined,
          admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          label: "sticky",
          msg: { foo: "bar" },
          funds: coins(1234, "cony"),
        },
      };
      const msg = new AminoTypes(createWasmplusAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgStoreCodeAndInstantiateContract = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: undefined,
        admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        label: "sticky",
        msg: toUtf8(`{"foo":"bar"}`),
        funds: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract",
        value: expectedValue,
      });
    });

    it("works for MsgStoreCodeAndInstantiateContract with access type", () => {
      const aminoMsg: AminoMsgStoreCodeAndInstantiateContract = {
        type: "wasm/MsgStoreCodeAndInstantiateContract",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: {
            permission: "OnlyAddress",
            address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          },
          admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          label: "sticky",
          msg: { foo: "bar" },
          funds: coins(1234, "cony"),
        },
      };
      const msg = new AminoTypes(createWasmplusAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgStoreCodeAndInstantiateContract = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: {
          permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS,
          address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        },
        admin: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        label: "sticky",
        msg: toUtf8(`{"foo":"bar"}`),
        funds: coins(1234, "cony"),
      };
      expect(msg).toEqual({
        typeUrl: "/lbm.wasm.v1.MsgStoreCodeAndInstantiateContract",
        value: expectedValue,
      });
    });
  });
});
