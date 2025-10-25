export interface OverpassQueryParams {
  lat: number;
  lng: number;
  radius?: number;
  waterTypes?: string[];
}

export interface WaterwayNode {
  id: number;
  lat: number;
  lng: number;
}

export interface WaterwayElement {
  type: string;
  id: number;
  nodes?: number[];
  lat?: number;
  lon?: number;
  geometry?: Array<{ lat: number; lon: number }>;
  tags: {
    name?: string;
    waterway?: string;
    boat?: string;
    draft?: string;
    motorboat?: string;
    ship?: string;
    wikipedia?: string;
    layer?: string;
    tunnel?: string;
  };
  coordinates?: WaterwayNode[];
  distance?: number;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: WaterwayElement[];
}

export class OverpassApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OverpassApiError';
  }
}