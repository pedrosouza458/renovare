import { PrismaClient } from "@prisma/client";

export async function getPins(prisma: PrismaClient) {
  const pins = await prisma.pins.findMany({
    include: { 
      posts: { 
        include: { photos: true },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  console.log('Pins from database:', pins.map(pin => ({ 
    id: pin.id.slice(-8), 
    lastActionSummary: pin.lastActionSummary, 
    postsCount: pin.posts?.length || 0 
  })));

  // Ensure posts[].photos is always an array (be defensive)
  return pins.map(pin => ({
    ...pin,
    posts: pin.posts?.map((p) => ({ ...p, photos: p.photos ?? [] })) ?? []
  }));
}
