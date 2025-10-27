import { PrismaClient } from "@prisma/client";

export async function deleteUser(prisma: PrismaClient, userId: string) {
  // return some info about deleted user for auditing if needed
  const deleted = await prisma.users.delete({
    where: { id: userId },
    select: { id: true, username: true, email: true },
  });
  return deleted;
}
