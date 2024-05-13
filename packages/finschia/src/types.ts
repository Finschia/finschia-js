import { createWasmAminoConverters, wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import {
  AminoConverters,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
} from "@cosmjs/stargate";

// eslint-disable-next-line import/no-cycle
import {
  createCollectionAminoConverters,
  createFbridgeAminoConverters,
  createFoundationAminoConverters,
  createFswapAminoConverters,
  createTokenAminoConverters,
  createWasmplusAminoConverters,
} from "./modules";
import { collectionTypes } from "./modules/collection/messages";
import { fbridgeTypes } from "./modules/fbridge/messages";
import { foundationTypes } from "./modules/foundation/messages";
import { fswapTypes } from "./modules/fswap/messages";
import { stakingplusTypes } from "./modules/stakingplus/messages";
import { tokenTypes } from "./modules/token/messages";
import { wasmplusTypes } from "./modules/wasmplus/messages";

export const finschiaRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ...collectionTypes,
  ...foundationTypes,
  ...stakingplusTypes,
  ...tokenTypes,
  ...wasmTypes,
  ...wasmplusTypes,
  ...fswapTypes,
  ...fbridgeTypes,
];

export function createDefaultRegistry(): Registry {
  return new Registry(finschiaRegistryTypes);
}

export function createDefaultTypesWithoutFoundation(): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createGovAminoConverters(),
    ...createIbcAminoConverters(),
    ...createStakingAminoConverters(),
    ...createVestingAminoConverters(),
    ...createWasmAminoConverters(),
    ...createCollectionAminoConverters(),
    ...createTokenAminoConverters(),
    ...createWasmplusAminoConverters(),
    ...createFswapAminoConverters(),
    ...createFbridgeAminoConverters(),
  };
}

export function createDefaultTypes(): AminoConverters {
  return {
    ...createDefaultTypesWithoutFoundation(),
    ...createFoundationAminoConverters(),
  };
}
