import { PrismaClient, PostTypes } from "@prisma/client";

export async function getPosts(prisma: PrismaClient, type?: PostTypes) {
  return prisma.posts.findMany({
    where: type ? { type } : undefined,
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });
}
