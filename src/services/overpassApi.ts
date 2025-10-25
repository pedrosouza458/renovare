// Overpass API Integration for OpenStreetMap Water Data
// Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API

export interface WaterwayNode {
  id: number;
  lat: number;
  lng: number;
}

export interface WaterwayData {
  id: string;
  name: string;
  type: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface WaterwayElement {
  type: string;
  id: number;
  nodes?: number[];
  lat?: number;
  lon?: number;
  geometry?: Array<{ lat: number; lon: number }>; // Added geometry support
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
  // Processed coordinates for rendering
  coordinates?: WaterwayNode[];
  distance?: number;
}

export interface OverpassQueryParams {
  lat: number;
  lng: number;
  radius?: number; // in meters
  waterTypes?: string[]; // ['river', 'stream', 'canal', etc.]
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

class OverpassApiService {
  private readonly baseUrl = 'http://overpass-api.de/api/interpreter';

  /**
   * Build Overpass QL query for waterways around a location
   */
  private buildWaterwayQuery(params: OverpassQueryParams): string {
    const { lat, lng, radius = 10000 } = params;
    
    // Simplified query that gets all waterways with geometry data
    const query = `
      [out:json][timeout:30];
      (
        way(around:${radius},${lat},${lng})[waterway];
      );
      out geom;
    `;
    
    return query.trim();
  }

  /**
   * Get waterways near a location
   */
  async getWaterways(params: OverpassQueryParams): Promise<WaterwayData[]> {
    try {
      const query = this.buildWaterwayQuery(params);
      console.log('Overpass Query:', query);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OverpassResponse = await response.json();
      console.log('Overpass API Response:', data);

      if (!data.elements || data.elements.length === 0) {
        console.log('No waterways found in the response');
        return [];
      }

      // Transform the response into our format
      const waterways = data.elements
        .filter((element): element is WaterwayElement => 
          element.type === 'way' && 
          element.tags?.waterway !== undefined &&
          element.geometry !== undefined &&
          element.geometry.length > 0
        )
        .map((element): WaterwayData => ({
          id: element.id.toString(),
          name: element.tags.name || `${element.tags.waterway} (unnamed)`,
          type: element.tags.waterway!,
          coordinates: element.geometry!.map(coord => ({
            lat: coord.lat,
            lng: coord.lon
          }))
        }));

      console.log(`Found ${waterways.length} waterways with geometry data`);
      return waterways;
    } catch (error) {
      console.error('Error fetching waterways:', error);
      return [];
    }
  }

  /**
   * Search waterways by name
   */
  async searchWaterwaysByName(searchTerm: string, params: OverpassQueryParams): Promise<WaterwayData[]> {
    try {
      const allWaterways = await this.getWaterways(params);
      
      const filteredWaterways = allWaterways.filter(waterway =>
        waterway.name && 
        waterway.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log(`🔍 Found ${filteredWaterways.length} waterways matching "${searchTerm}"`);
      return filteredWaterways;
      
    } catch (error) {
      console.error('Error searching waterways:', error);
      throw new OverpassApiError(`Failed to search waterways: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get waterways of specific types (rivers, streams, canals, etc.)
   */
  async getWaterwaysByType(params: OverpassQueryParams): Promise<WaterwayData[]> {
    return this.getWaterways(params);
  }

  /**
   * Get major waterways only (with names and suitable for boats)
   */
  async getMajorWaterways(params: OverpassQueryParams): Promise<WaterwayData[]> {
    try {
      const allWaterways = await this.getWaterways(params);
      
      // Filter for major waterways: named rivers
      const majorWaterways = allWaterways.filter(waterway => 
        waterway.name && 
        waterway.type === 'river' &&
        !waterway.name.includes('(unnamed)')
      );
      
      console.log(`🚢 Found ${majorWaterways.length} major waterways`);
      return majorWaterways;
      
    } catch (error) {
      console.error('Error fetching major waterways:', error);
      throw new OverpassApiError(`Failed to fetch major waterways: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const overpassApi = new OverpassApiService();