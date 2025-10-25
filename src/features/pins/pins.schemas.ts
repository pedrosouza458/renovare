import { z } from "zod";
import { postResponseSchema } from "../posts/posts.schemas";

export const pinResponseSchema = z.object({
  // accept string-like ids and coerce non-strings to string
  id: z.preprocess((v) => (typeof v === "string" ? v : String(v)), z.string()),
  latitude: z.number(),
  longitude: z.number(),
  // accept Date objects from Prisma by coercing to ISO strings
  createdAt: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString() : v),
    z.string()
  ),
  updatedAt: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString() : v),
    z.string()
  ),
  lastActionSummary: z.string().nullable().optional(),
  // include posts associated with this pin (optional)
  posts: z.array(postResponseSchema).optional(),
});

export type PinResponse = z.infer<typeof pinResponseSchema>;

export const createPinBodySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  lastActionSummary: z.string().optional(),
});

export type CreatePinBody = z.infer<typeof createPinBodySchema>;

export const updatePinBodySchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lastActionSummary: z.string().optional(),
});

export type UpdatePinBody = z.infer<typeof updatePinBodySchema>;
