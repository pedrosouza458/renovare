import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export type RegisterUserInput = {
  username: string;
  email: string;
  password: string;
  points?: number;
};

export async function registerUser(
  prisma: PrismaClient,
  data: RegisterUserInput
) {
  // check uniqueness
  const exists = await prisma.users.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (exists) {
    throw new Error("User already exists with given email or username");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.users.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashed,
      points: data.points ?? 0,
    },
    select: { id: true, username: true, email: true, points: true },
  });

  return user;
}
