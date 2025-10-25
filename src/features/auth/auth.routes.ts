import type { FastifyInstance } from "fastify";
import { loginHandler, profileHandler } from "./auth.handlers";
import { authenticate } from "../../plugins/authenticate";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", loginHandler);
  app.get("/profile", { preHandler: [authenticate] }, profileHandler);
  app.get("/", async (request, reply) => {
    return reply.send({ message: "Auth service is running" });
  });
}
