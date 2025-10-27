import { FastifyRegister, FastifyReply, FastifyRequest } from "fastify";
import { getUsers } from "./use-cases/get-users";
import {
  GetUserByIdParams,
  userResponseSchema,
  createUserBodySchema,
  updateUserBodySchema,
  updateUserScoreBodySchema,
} from "./users.schemas";
import { getUserById } from "./use-cases/get-user-by-id";
import { registerUser } from "./use-cases/register-user";
import { deleteUser } from "./use-cases/delete-user";
import { updateUser } from "./use-cases/update-user";
import { updateUserScore } from "./use-cases/update-user-score";
import { prisma } from "../../lib/prisma";

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

    // Generate JWT token for automatic login after registration
    const token = await reply.jwtSign({ userId: user.id });

    return reply.code(201).send({ token, user });
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

export async function updateUserScoreHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;

    // **401 Unauthorized check (remains the same)**
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = updateUserScoreBodySchema.parse(request.body);

    const user = await updateUserScore(prisma, userId, parsed.score);
    const validated = userResponseSchema.parse(user);

    return reply.status(200).send(validated);
  } catch (err: any) {
    // 💡 Specific error handling for Prisma's "record not found" on update
    // 💡 Generic error handling (Zod validation or other errors)
    const message = err?.message ?? "Internal Server Error";
    console.error("updateUserScoreHandler Error:", message, err.stack);

    // Assuming Zod errors are 400s, and other unexpected errors default to 500
    // Check if the error is from Zod/client input error to return 400
    const isClientError = err.name === "ZodError";

    return reply.status(isClientError ? 400 : 500).send({ error: message });
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
