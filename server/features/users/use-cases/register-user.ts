import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export type RegisterUserInput = {
  username: string;
  email: string;
  cpf: string;
  password: string;
  points?: number;
};

export async function registerUser(
  prisma: PrismaClient,
  data: RegisterUserInput
) {
  // check uniqueness
  const exists = await prisma.users.findFirst({
    where: { 
      OR: [
        { email: data.email }, 
        { username: data.username },
        { cpf: data.cpf }
      ] 
    },
  });

  if (exists) {
    throw new Error("User already exists with given email, username, or CPF");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.users.create({
    data: {
      username: data.username,
      email: data.email,
      cpf: data.cpf,
      password: hashed,
      points: data.points ?? 0,
    },
    select: { id: true, username: true, email: true, cpf: true, points: true },
  });

  return user;
}
