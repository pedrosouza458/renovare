import { PrismaClient } from "@prisma/client";

export async function getPostById(prisma: PrismaClient, id: string) {
  return prisma.posts.findUnique({ where: { id }, include: { photos: true } });
}
