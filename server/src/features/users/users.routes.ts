import { FastifyInstance } from "fastify";
import {
  getUserByIdHandler,
  getUsersHandler,
  registerUserHandler,
  deleteUserHandler,
  updateUserHandler,
  updateUserScoreHandler,
} from "./users.handlers";
import { authenticate } from "../../plugins/authenticate";

export async function userRoutes(app: FastifyInstance) {
  app.get("/", getUsersHandler);
  app.get("/:id", getUserByIdHandler);
  app.post("/", registerUserHandler);
  app.put("/", { preHandler: [authenticate] }, updateUserHandler);
  app.put("/score", { preHandler: [authenticate] }, updateUserScoreHandler);
  app.delete("/", { preHandler: [authenticate] }, deleteUserHandler);
}
