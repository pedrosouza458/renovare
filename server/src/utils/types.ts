export type PostType = "alert" | "cleaning" | "both";

export class OverpassApiError extends Error {}
export type WaterwayType =
  | "river"
  | "stream"
  | "canal"
  | "drain"
  | "ditch"
  | "other";
export interface OverpassQueryParams {
  lat: number;
  lng: number;
  radius?: number;
}
