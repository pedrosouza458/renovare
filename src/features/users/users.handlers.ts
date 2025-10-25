import { FastifyRegister, FastifyReply, FastifyRequest } from "fastify";
import { getUsers } from "./use-cases/get-users";
import {
  GetUserByIdParams,
  userResponseSchema,
  createUserBodySchema,
  updateUserBodySchema,
} from "./users.schemas";
import { getUserById } from "./use-cases/get-user-by-id";
import { prisma } from "../../lib/prisma";
import { registerUser } from "./use-cases/register-user";
import { updateUser } from "./use-cases/update-user";
import { deleteUser } from "./use-cases/delete-user";

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const usersList = await getUsers(prisma);

    // Debug: log how many users were fetched from DB for visibility
    console.debug(`getUsersHandler: fetched ${usersList.length} users`);

    const validatedUsers = usersList.map((user) =>
      userResponseSchema.parse(user)
    );

    return reply.status(200).send(validatedUsers);
  } catch (error) {
    console.error(
      "Get Users Error:",
      error instanceof Error ? error.stack ?? error.message : error
    );
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function registerUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const parsed = createUserBodySchema.parse(request.body);
    const user = await registerUser(prisma, parsed as any);
    return reply.code(201).send(user);
  } catch (err: any) {
    // Zod or create errors
    const message = err?.message ?? "Internal Server Error";
    return reply.status(400).send({ error: message });
  }
}

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: GetUserByIdParams }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const user = await getUserById(prisma, id);

    if (!user) {
      console.warn(`getUserById: no user found for id=${id}`);
      return reply.status(404).send({ message: "User not found" });
    }

    const validatedUser = userResponseSchema.parse(user);

    return reply.status(200).send(validatedUser);
  } catch (error) {
    console.log("Get Users Error: ", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function updateUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = updateUserBodySchema.parse(request.body);

    const user = await updateUser(prisma, userId, parsed as any);
    const validated = userResponseSchema.parse(user);

    return reply.status(200).send(validated);
  } catch (err: any) {
    const message = err?.message ?? "Internal Server Error";
    return reply.status(400).send({ error: message });
  }
}

export async function deleteUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    await deleteUser(prisma, userId);
    return reply.status(204).send();
  } catch (err: any) {
    const message = err?.message ?? "Internal Server Error";
    return reply.status(500).send({ error: message });
  }
}
