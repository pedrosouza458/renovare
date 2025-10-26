import { z } from "zod";
import { PostTypes } from "@prisma/client";

export const postPhotoSchema = z.object({
  id: z
    .preprocess((v) => (typeof v === "string" ? v : String(v)), z.string())
    .optional(),
  url: z.string().refine((val) => {
    // Allow both regular URLs and data URLs
    return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:');
  }, { message: "Must be a valid URL or data URL" }),
  isBefore: z.boolean().optional(),
});

export const createPostBodySchema = z.object({
  type: z.nativeEnum(PostTypes),
  text: z.string().optional(),
  pinId: z.string(),
  photos: z.array(postPhotoSchema).min(1, "At least one photo is required"),
}).refine((data) => {
  // Validate photo count based on post type
  const requiredPhotos = data.type === 'BOTH' ? 2 : 1;
  if (data.photos.length !== requiredPhotos) {
    return false;
  }
  return true;
}, {
  message: "Invalid number of photos for post type",
  path: ["photos"],
});

export const updatePostBodySchema = z.object({
  type: z.nativeEnum(PostTypes).optional(),
  text: z.string().optional(),
  reported: z.boolean().optional(),
  numberOfReports: z.number().optional(),
});

export const postResponseSchema = z.object({
  id: z.preprocess((v) => (typeof v === "string" ? v : String(v)), z.string()),
  type: z.nativeEnum(PostTypes),
  text: z.string().nullable().optional(),
  reported: z.boolean(),
  numberOfReports: z.number(),
  userId: z.string(),
  pinId: z.string(),
  createdAt: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString() : v),
    z.string()
  ),
  photos: z.preprocess(
    (v) => (v === undefined ? [] : v),
    z.array(
      z.object({
        id: z.preprocess(
          (v) => (typeof v === "string" ? v : String(v)),
          z.string()
        ),
        url: z.string().url(),
        isBefore: z.boolean().nullable().optional(),
      })
    )
  ),
});

export type CreatePostBody = z.infer<typeof createPostBodySchema>;
export type UpdatePostBody = z.infer<typeof updatePostBodySchema>;
export type PostResponse = z.infer<typeof postResponseSchema>;
