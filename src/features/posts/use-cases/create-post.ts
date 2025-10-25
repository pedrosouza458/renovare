import { PrismaClient, PostTypes } from "@prisma/client";

export async function createPost(
  prisma: PrismaClient,
  userId: string,
  data: {
    type: PostTypes;
    text?: string | null;
    pinId: string;
    photos?: Array<{ url: string; isBefore?: boolean | null }>;
  }
) {
  // enforce photo count constraints
  const photos = data.photos ?? [];
  const allowed = data.type === PostTypes.BOTH ? 2 : 1;
  if (photos.length > allowed) {
    throw new Error(
      `Too many photos for post type ${data.type}. Max ${allowed}`
    );
  }

  // ensure pin exists (each pin can have multiple posts)
  const pin = await prisma.pins.findUnique({ where: { id: data.pinId } });
  if (!pin) {
    throw new Error("Pin not found");
  }

  // create post with nested photos
  const postData: any = {
    type: data.type,
    text: data.text ?? null,
    userId,
    pinId: data.pinId,
  };

  if (photos.length) {
    postData.photos = {
      create: photos.map((p) => ({ url: p.url, isBefore: p.isBefore ?? null })),
    };
  }

  // map post type to points to award
  const pointsForType: Record<string, number> = {
    [PostTypes.BOTH]: 80,
    [PostTypes.ALERT]: 30, // WARNING was mapped to ALERT in enum (legacy name)
    [PostTypes.CLEANING]: 50,
  };

  const delta = pointsForType[data.type] ?? 0;

  // create post and increment user points atomically in a transaction
  const created = await prisma.$transaction(async (tx) => {
    const createdPost = await tx.posts.create({
      data: postData,
      include: { photos: true },
    });

    // increment user.points
    if (delta !== 0) {
      await tx.users.update({
        where: { id: userId },
        data: { points: { increment: delta } },
      });
    }

    return createdPost;
  });

  return created;
}
