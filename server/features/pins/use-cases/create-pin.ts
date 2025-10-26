import { PrismaClient } from "@prisma/client";

// Haversine formula to compute distance between two lat/lon points in meters
function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function createPin(
  prisma: PrismaClient,
  data: { latitude: number; longitude: number; lastActionSummary?: string },
  // default radius to check (meters). Assumption: 50m radius to prevent nearby pins.
  radiusMeters = 50
) {
  // fetch nearby pins using a cheap bounding-box to limit candidates
  // convert meters to degrees (~111320 m per degree latitude)
  const lat = data.latitude;
  const degLat = radiusMeters / 111320;
  const degLon = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));

  const candidates = await prisma.pins.findMany({
    where: {
      latitude: {
        gte: data.latitude - degLat,
        lte: data.latitude + degLat,
      },
      longitude: {
        gte: data.longitude - degLon,
        lte: data.longitude + degLon,
      },
    },
  });

  for (const p of candidates) {
    const dist = haversineDistanceMeters(
      data.latitude,
      data.longitude,
      p.latitude,
      p.longitude
    );
    if (dist <= radiusMeters) {
      // too close to an existing pin — ignore creation
      return null;
    }
  }

  const created = await prisma.pins.create({
    data: {
      latitude: data.latitude,
      longitude: data.longitude,
      lastActionSummary: data.lastActionSummary ?? null,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      lastActionSummary: true,
    },
  });

  return created;
}
