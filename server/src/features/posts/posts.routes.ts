import { FastifyInstance } from "fastify";
import {
  listPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
} from "./posts.handlers";
import { authenticate } from "../../plugins/authenticate";

export async function postRoutes(app: FastifyInstance) {
  app.get("/", listPostsHandler);
  app.get("/:id", getPostHandler);
  app.post("/", { preHandler: [authenticate] }, createPostHandler);
  app.patch("/:id", { preHandler: [authenticate] }, updatePostHandler);
  app.delete("/:id", { preHandler: [authenticate] }, deletePostHandler);
}
