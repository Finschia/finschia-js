/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64 } from "@cosmjs/encoding";
import { AminoTypes } from "@cosmjs/stargate";
import { MsgStoreCode } from "lbmjs-types/cosmwasm/wasm/v1/tx";
import { AccessType } from "lbmjs-types/cosmwasm/wasm/v1/types";

import { AminoMsgStoreCode, createWasmAminoConverters } from "./aminomessages";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgStoreCode", () => {
      const msg: MsgStoreCode = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: undefined,
      };
      const aminoMsg = new AminoTypes(createWasmAminoConverters()).toAmino({
        typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
        value: msg,
      });
      const expected: AminoMsgStoreCode = {
        type: "wasm/MsgStoreCode",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: undefined,
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgStoreCode with access type", () => {
      const msg: MsgStoreCode = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: {
          permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS,
          address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          addresses: [],
        },
      };
      const aminoMsg = new AminoTypes(createWasmAminoConverters()).toAmino({
        typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
        value: msg,
      });
      const expected: AminoMsgStoreCode = {
        type: "wasm/MsgStoreCode",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: {
            permission: "OnlyAddress",
            address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
            addresses: undefined,
          },
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    it("works for MsgStoreCode", () => {
      const aminoMsg: AminoMsgStoreCode = {
        type: "wasm/MsgStoreCode",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
        },
      };
      const msg = new AminoTypes(createWasmAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgStoreCode = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: undefined,
      };
      expect(msg).toEqual({
        typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
        value: expectedValue,
      });
    });

    it("works for MsgStoreCode with access type", () => {
      const aminoMsg: AminoMsgStoreCode = {
        type: "wasm/MsgStoreCode",
        value: {
          sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          wasm_byte_code: "WUVMTE9XIFNVQk1BUklORQ==",
          instantiate_permission: {
            permission: "OnlyAddress",
            address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
            addresses: undefined,
          },
        },
      };
      const msg = new AminoTypes(createWasmAminoConverters()).fromAmino(aminoMsg);
      const expectedValue: MsgStoreCode = {
        sender: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        wasmByteCode: fromBase64("WUVMTE9XIFNVQk1BUklORQ=="),
        instantiatePermission: {
          permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS,
          address: "link1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          addresses: [],
        },
      };
      expect(msg).toEqual({
        typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
        value: expectedValue,
      });
    });
  });
});
