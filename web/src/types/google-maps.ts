export interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: unknown) => GoogleMapInstance;
    Marker: new (options: unknown) => GoogleMarkerInstance;
    InfoWindow: new (options: unknown) => GoogleInfoWindowInstance;
    Polyline: new (options: unknown) => GooglePolylineInstance;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    SymbolPath: { CIRCLE: number };
    ControlPosition: { RIGHT_BOTTOM: number };
  };
}

export interface GoogleMapInstance {
  addListener: (event: string, callback: (e: GoogleMapMouseEvent) => void) => unknown;
  setCenter: (location: { lat: number; lng: number }) => void;
}

export interface GoogleMarkerInstance {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (event: string, callback: () => void) => void;
}

export interface GooglePolylineInstance {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (event: string, callback: () => void) => void;
}

export interface GoogleInfoWindowInstance {
  open: (map: GoogleMapInstance, marker: GoogleMarkerInstance) => void;
}

export interface GoogleMapMouseEvent {
  latLng: {
    lat: () => number;
    lng: () => number;
  };
}