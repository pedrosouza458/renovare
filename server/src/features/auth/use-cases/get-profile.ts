import { PrismaClient } from "@prisma/client";

export async function getProfile(prisma: PrismaClient, userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, cpf: true, points: true },
  });
  return user;
}
