import { PrismaClient } from "@prisma/client";

export async function updateUserScore(
  prisma: PrismaClient,
  userId: string,
  score: number
) {
  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      points: { increment: score },
    },
  });
  return updated;
}
