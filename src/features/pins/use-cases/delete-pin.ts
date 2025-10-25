import { PrismaClient } from "@prisma/client";

export async function deletePin(prisma: PrismaClient, pinId: string) {
  const deleted = await prisma.pins.delete({
    where: { id: pinId },
    select: { id: true, latitude: true, longitude: true },
  });
  return deleted;
}
