import { PrismaClient } from "@prisma/client";

export async function getPosts(prisma: PrismaClient) {
  return prisma.posts.findMany({
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });
}
