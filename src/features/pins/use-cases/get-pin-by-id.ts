import { PrismaClient } from "@prisma/client";

export async function getPinById(prisma: PrismaClient, id: string) {
  const pin = await prisma.pins.findUnique({
    where: { id },
    include: { posts: { include: { photos: true } } },
  });

  if (!pin) return null;

  // Ensure posts[].photos is always an array (Prisma should return [] when none, but be defensive)
  if (pin.posts) {
    pin.posts = pin.posts.map((p) => ({ ...p, photos: p.photos ?? [] }));
  }

  return pin;
}
