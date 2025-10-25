import { FastifyInstance } from "fastify";
import {
  listPinsHandler,
  getPinHandler,
  createPinHandler,
  updatePinHandler,
  deletePinHandler,
} from "./pins.handlers";
import { authenticate } from "../../plugins/authenticate";

export async function pinRoutes(app: FastifyInstance) {
  app.get("/", listPinsHandler);
  app.get("/:id", getPinHandler);
  // require JWT for creating a pin (user must be authenticated even if pin doesn't store user)
  app.post("/", { preHandler: [authenticate] }, createPinHandler);
  app.patch("/:id", updatePinHandler);
  app.delete("/:id", deletePinHandler);
}
