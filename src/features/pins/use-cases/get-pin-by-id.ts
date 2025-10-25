import { PrismaClient } from "@prisma/client";

export async function getPinById(prisma: PrismaClient, id: string) {
  return prisma.pins.findUnique({
    where: { id },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      lastActionSummary: true,
    },
  });
}
