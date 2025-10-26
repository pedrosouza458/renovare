// Overpass API Integration for OpenStreetMap Water Data
// Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API

import type {
  WaterwayData,
  OverpassQueryParams,
  OverpassResponse,
  WaterwayElement,
  WaterwayType,
} from "../types";
import { OverpassApiError } from "../types";
import { OVERPASS_CONFIG } from "../constants";

class OverpassApiService {
  private readonly baseUrl = OVERPASS_CONFIG.BASE_URL;

  /**
   * Build Overpass QL query for waterways around a location
   * @param params - Query parameters including location and radius
   * @returns Formatted Overpass QL query string
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
   * Helper function to implement exponential backoff retry logic
   * @param fn - Function to retry
   * @param retries - Number of retries
   * @param delay - Initial delay in milliseconds
   */
  private async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;

      // If it's a 504 error or other timeout, retry
      if (
        error instanceof Error &&
        (error.message.includes("504") || error.message.includes("timeout"))
      ) {
        console.log(
          `Retrying request after ${delay}ms. Retries left: ${retries}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2);
      }

      throw error;
    }
  }

  /**
   * Get waterways near a location
   * @param params - Query parameters including location and radius
   * @returns Promise resolving to array of waterway data
   */
  async getWaterways(params: OverpassQueryParams): Promise<WaterwayData[]> {
    try {
      const query = this.buildWaterwayQuery(params);

      const response = await this.retry(async () => {
        const res = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(query)}`,
          // Add timeout to the fetch request
          signal: AbortSignal.timeout(OVERPASS_CONFIG.TIMEOUT),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res;
      });

      const data: OverpassResponse = await response.json();

      if (!data.elements || data.elements.length === 0) {
        return [];
      }

      // Transform the response into our format
      const waterways = data.elements
        .filter(
          (element): element is WaterwayElement =>
            element.type === "way" &&
            element.tags?.waterway !== undefined &&
            element.geometry !== undefined &&
            element.geometry.length > 0
        )
        .map(
          (element): WaterwayData => ({
            id: element.id.toString(),
            name: element.tags.name || `${element.tags.waterway} (unnamed)`,
            type: (element.tags.waterway as WaterwayType) || "stream",
            coordinates: element.geometry!.map((coord) => ({
              lat: coord.lat,
              lng: coord.lon,
            })),
          })
        );

      return waterways;
    } catch (error) {
      throw new OverpassApiError(
        `Failed to fetch waterways: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Search waterways by name
   * @param searchTerm - Term to search for in waterway names
   * @param params - Query parameters including location and radius
   * @returns Promise resolving to filtered array of waterway data
   */
  async searchWaterwaysByName(
    searchTerm: string,
    params: OverpassQueryParams
  ): Promise<WaterwayData[]> {
    try {
      const allWaterways = await this.getWaterways(params);

      const filteredWaterways = allWaterways.filter(
        (waterway) =>
          waterway.name &&
          waterway.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredWaterways;
    } catch (error) {
      throw new OverpassApiError(
        `Failed to search waterways: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get waterways of specific types (rivers, streams, canals, etc.)
   * @param params - Query parameters including location and radius
   * @returns Promise resolving to array of waterway data
   */
  async getWaterwaysByType(
    params: OverpassQueryParams
  ): Promise<WaterwayData[]> {
    return this.getWaterways(params);
  }

  /**
   * Get major waterways only (with names and suitable for boats)
   * @param params - Query parameters including location and radius
   * @returns Promise resolving to filtered array of major waterway data
   */
  async getMajorWaterways(
    params: OverpassQueryParams
  ): Promise<WaterwayData[]> {
    try {
      const allWaterways = await this.getWaterways(params);

      // Filter for major waterways: named rivers
      const majorWaterways = allWaterways.filter(
        (waterway) =>
          waterway.name &&
          waterway.type === "river" &&
          !waterway.name.includes("(unnamed)")
      );

      return majorWaterways;
    } catch (error) {
      throw new OverpassApiError(
        `Failed to fetch major waterways: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export singleton instance
export const overpassApi = new OverpassApiService();
