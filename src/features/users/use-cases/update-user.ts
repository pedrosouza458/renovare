import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  data: Record<string, any>
) {
  const updateData: Record<string, any> = { ...data };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, username: true, email: true, points: true },
  });

  return updated;
}
