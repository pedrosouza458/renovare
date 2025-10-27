import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // fastify-jwt adds `jwtVerify` to the request at runtime
    await (request as any).jwtVerify();
  } catch (err) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
}
