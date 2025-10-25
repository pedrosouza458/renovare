import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";

export async function registerJwt(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret",
  });
}
