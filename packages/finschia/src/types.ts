import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
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

import {
  createCollectionAminoConverters,
  createFoundationAminoConverters,
  createTokenAminoConverters,
  createWasmplusAminoConverters,
} from "./modules";
import { collectionTypes } from "./modules/collection/messages";
import { foundationTypes } from "./modules/foundation/messages";
import { stakingplusTypes } from "./modules/stakingplus/messages";
import { tokenTypes } from "./modules/token/messages";
import { wasmTypes } from "./modules/wasm/messages";
import { wasmplusTypes } from "./modules/wasmplus/messages";

export const finschiaRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ...collectionTypes,
  ...foundationTypes,
  ...stakingplusTypes,
  ...tokenTypes,
  ...wasmTypes,
  ...wasmplusTypes,
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
  };
}

export function createDefaultTypes(): AminoConverters {
  return {
    ...createDefaultTypesWithoutFoundation(),
    ...createFoundationAminoConverters(),
  };
}
