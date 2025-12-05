import { PrismaClient } from "@prisma/client";

export async function getPins(prisma: PrismaClient, lastActionSummary?: string) {
  const pins = await prisma.pins.findMany({
    where: lastActionSummary ? { lastActionSummary } : undefined,
    include: {
      posts: {
        include: { photos: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return pins;
}

