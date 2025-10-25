import { PrismaClient } from "@prisma/client";

export async function deletePost(
  prisma: PrismaClient,
  postId: string,
  userId: string
) {
  const existing = await prisma.posts.findUnique({ where: { id: postId } });
  if (!existing) return null;
  if (existing.userId !== userId) throw new Error("Unauthorized");

  // delete photos first to be safe, then delete post
  await prisma.postPhoto.deleteMany({ where: { postId } });
  const del = await prisma.posts.delete({ where: { id: postId } });
  return del;
}
