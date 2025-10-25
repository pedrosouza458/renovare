import { z } from "zod";

export const userResponseSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  points: z.number().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const getUserByIdParamsSchema = z.object({
  id: z.uuid("Invalid user ID format"),
});

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;

// Schema for creating/registering a user
export const createUserBodySchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
  points: z.number().optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

// Schema for updating a user - all fields optional
export const updateUserBodySchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  points: z.number().optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserScoreBodySchema = z.object({
  score: z.number(),
});

export type UpdateUserScoreBody = z.infer<typeof updateUserScoreBodySchema>;
