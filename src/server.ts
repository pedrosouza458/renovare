import "dotenv/config";
import fastify from "fastify";
import { userRoutes } from "./features/users/users.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { pinRoutes } from "./features/pins/pins.routes";
import { registerJwt } from "./plugins/jwt";

const app = fastify({ logger: true });

async function main() {
  // register jwt plugin first
  await registerJwt(app);

  // register auth routes at /auth
  app.register(authRoutes, { prefix: "/auth" });

  // register user routes under /users
  app.register(userRoutes, { prefix: "/users" });

  // register pin routes under /pins
  app.register(pinRoutes, { prefix: "/pins" });

  // expose a simple routes dump for debugging
  app.get("/_routes", async () => {
    return { routes: (app as any).printRoutes() };
  });

  await app.ready();
  app.log.info(app.printRoutes());

  await app.listen({ port: Number(process.env.PORT ?? 3000) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
