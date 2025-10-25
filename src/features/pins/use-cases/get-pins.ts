import { PrismaClient } from "@prisma/client";

export async function getPins(prisma: PrismaClient) {
  return prisma.pins.findMany({
    select: {
      id: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      lastActionSummary: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
