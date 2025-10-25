export interface WaterwayCoordinate {
  lat: number;
  lng: number;
}

export interface WaterwayData {
  id: string;
  name: string;
  type: WaterwayType;
  coordinates: WaterwayCoordinate[];
}

export type WaterwayType = 'river' | 'stream' | 'canal';

export interface Location {
  lat: number;
  lng: number;
}