import { PrismaClient } from "@prisma/client";

export async function getPins(prisma: PrismaClient) {
  const pins = await prisma.pins.findMany({
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
