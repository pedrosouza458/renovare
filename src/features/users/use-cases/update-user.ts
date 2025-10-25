import { PrismaClient } from "@prisma/client";

export type UpdateUserInput = {
  username?: string;
  email?: string;
};

export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  data: UpdateUserInput
) {
  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      ...(data.username === undefined ? {} : { username: data.username }),
      ...(data.email === undefined ? {} : { email: data.email }),
    },
  });
  return updated;
}
