import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { CreateValidatorAuthorization } from "lbmjs-types/lbm/stakingplus/v1/authz";

export const stakingplusTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/lbm.stakingplus.v1.CreateValidatorAuthorization", CreateValidatorAuthorization],
];

export interface CreateValidatorAuthorizationEncodeObject extends EncodeObject {
  readonly typeUrl: "/lbm.stakingplus.v1.CreateValidatorAuthorization";
  readonly value: Partial<CreateValidatorAuthorization>;
}

export function isCreateValidatorAuthorizationEncodeObject(
  object: EncodeObject,
): object is CreateValidatorAuthorizationEncodeObject {
  return (
    (object as CreateValidatorAuthorizationEncodeObject).typeUrl ===
    "/lbm.stakingplus.v1.CreateValidatorAuthorization"
  );
}
