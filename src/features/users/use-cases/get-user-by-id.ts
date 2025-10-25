import { PrismaClient, Users } from "@prisma/client";

export async function getUserById(
  prisma: PrismaClient,
  id: string
): Promise<Users | null> {
  const users = await prisma.users.findUnique({
    where: {
      id,
    },
  });
  return users;
}
