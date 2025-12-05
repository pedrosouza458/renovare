import { PrismaClient, PostTypes } from "@prisma/client";

export async function getPosts(prisma: PrismaClient, type?: PostTypes, pinId?: string) {
  return prisma.posts.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(pinId ? { pinId } : {}),
    },
    include: { 
      photos: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
