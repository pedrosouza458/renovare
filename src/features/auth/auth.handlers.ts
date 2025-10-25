import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { loginUser } from "./use-cases/login-user";
import { getProfile } from "./use-cases/get-profile";

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body: any = request.body;
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return reply.status(400).send({ error: "email and password are required" });
  }

  const user = await loginUser(prisma, email, password);
  if (!user) return reply.status(401).send({ error: "Invalid credentials" });

  const token = await reply.jwtSign({ userId: user.id });

  return reply.send({ token, user });
}

export async function profileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const anyReq: any = request;
  const userId: string | undefined = anyReq.user?.userId;
  if (!userId) return reply.status(401).send({ error: "Unauthorized" });

  const user = await getProfile(prisma, userId);
  if (!user) return reply.status(404).send({ error: "User not found" });

  return reply.send({ user });
}
