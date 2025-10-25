import { PrismaClient } from "@prisma/client";

export async function updatePin(
  prisma: PrismaClient,
  pinId: string,
  data: Record<string, any>
) {
  const updateData: Record<string, any> = {};
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.lastActionSummary !== undefined)
    updateData.lastActionSummary = data.lastActionSummary ?? null;

  const updated = await prisma.pins.update({
    where: { id: pinId },
    data: updateData,
    select: {
      id: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      lastActionSummary: true,
    },
  });

  return updated;
}
