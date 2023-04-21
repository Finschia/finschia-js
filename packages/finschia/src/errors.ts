// error class for https://github.com/cosmos/cosmjs/blob/main/packages/stargate/src/queryclient/queryclient.ts#L582
export class QueryRpcFailError extends Error {
  public readonly code: number;
  public readonly log: string;

  public constructor(code: number, log: string) {
    super(`Query failed with (${code}): ${log}`);
    this.code = code;
    this.log = log;
  }
}
