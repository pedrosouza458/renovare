import { z } from "zod";
import { PostTypes } from "@prisma/client";

export const postPhotoSchema = z.object({
  id: z
    .preprocess((v) => (typeof v === "string" ? v : String(v)), z.string())
    .optional(),
  url: z.string().url(),
  isBefore: z.boolean().optional(),
});

export const createPostBodySchema = z.object({
  type: z.nativeEnum(PostTypes),
  text: z.string().optional(),
  pinId: z.string().uuid(),
  photos: z.array(postPhotoSchema).optional(),
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
