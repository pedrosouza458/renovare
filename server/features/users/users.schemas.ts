import { z } from "zod";

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check if CPF has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate CPF using the algorithm
  let sum = 0;
  let remainder;
  
  // Validate first digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Custom CPF schema
const cpfSchema = z.string().refine(validateCPF, {
  message: "Invalid CPF format",
});

export const userResponseSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  cpf: z.string(),
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
  cpf: cpfSchema,
  password: z.string().min(6),
  points: z.number().optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

// Schema for updating a user - all fields optional
export const updateUserBodySchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  cpf: cpfSchema.optional(),
  password: z.string().min(6).optional(),
  points: z.number().optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserScoreBodySchema = z.object({
  score: z.number(),
});

export type UpdateUserScoreBody = z.infer<typeof updateUserScoreBodySchema>;
