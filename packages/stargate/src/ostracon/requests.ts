/* eslint-disable @typescript-eslint/naming-convention */

export interface BlockSearchParams {
  readonly query: string;
  readonly page?: number;
  readonly per_page?: number;
  readonly order_by?: string;
}
