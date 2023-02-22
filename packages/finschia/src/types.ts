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
import { createWasmAminoConverters } from "./modules/wasm/aminomessages";
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

export function createDefaultTypesWithoutFoundation(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createGovAminoConverters(),
    ...createIbcAminoConverters(),
    ...createStakingAminoConverters(prefix),
    // ...createVestingAminoConverters(), this is omitted in cosmjs export
    ...createWasmAminoConverters(),
    ...createCollectionAminoConverters(),
    ...createTokenAminoConverters(),
    ...createWasmplusAminoConverters(),
  };
}

export function createDefaultTypes(prefix: string): AminoConverters {
  return {
    ...createDefaultTypesWithoutFoundation(prefix),
    ...createFoundationAminoConverters(),
  };
}
