import { PrismaClient, Users } from "@prisma/client";

export async function getUsers(prisma: PrismaClient): Promise<Users[]> {
  const users = await prisma.users.findMany();
  return users;
}
