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

  const created = await prisma.posts.create({
    data: postData,
    include: { photos: true },
  });

  return created;
}
