import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function loginUser(
  prisma: PrismaClient,
  email: string,
  password: string
) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    points: user.points,
  };
}
