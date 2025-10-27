import { PrismaClient, PostTypes } from "@prisma/client";

export async function updatePost(
  prisma: PrismaClient,
  postId: string,
  userId: string,
  data: {
    type?: PostTypes;
    text?: string | null;
    reported?: boolean;
    numberOfReports?: number;
  }
) {
  // ensure owner
  const existing = await prisma.posts.findUnique({
    where: { id: postId },
    include: { photos: true },
  });
  if (!existing) return null;
  if (existing.userId !== userId) throw new Error("Unauthorized");

  // if changing type, ensure photo count still valid
  const newType = data.type ?? existing.type;
  const allowed = newType === PostTypes.BOTH ? 2 : 1;
  if ((existing.photos?.length ?? 0) > allowed) {
    throw new Error("Existing photos exceed allowed number for new post type");
  }

  const updateData: Record<string, any> = {};
  if (data.type !== undefined) updateData.type = data.type;
  // distinguish between explicit null and undefined for text
  if (Object.prototype.hasOwnProperty.call(data, "text"))
    updateData.text = data.text;
  if (data.reported !== undefined) updateData.reported = data.reported;
  if (data.numberOfReports !== undefined)
    updateData.numberOfReports = data.numberOfReports;

  const updated = await prisma.posts.update({
    where: { id: postId },
    data: updateData,
    include: { photos: true },
  });

  return updated;
}
