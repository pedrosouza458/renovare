import { FastifyInstance } from "fastify";
import {
  getUserByIdHandler,
  getUsersHandler,
  registerUserHandler,
  deleteUserHandler,
} from "./users.handlers";
import { authenticate } from "../../plugins/authenticate";

export async function userRoutes(app: FastifyInstance) {
  app.get("/", getUsersHandler);
  app.get("/:id", getUserByIdHandler);
  app.post("/", registerUserHandler);
  // protected routes that act on the authenticated user
  app.delete("/", { preHandler: [authenticate] }, deleteUserHandler);
}
