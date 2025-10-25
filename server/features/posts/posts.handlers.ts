import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { createPost } from "./use-cases/create-post";
import { getPosts } from "./use-cases/get-posts";
import { getPostById } from "./use-cases/get-post-by-id";
import { updatePost } from "./use-cases/update-post";
import { deletePost } from "./use-cases/delete-post";
import {
  createPostBodySchema,
  postResponseSchema,
  updatePostBodySchema,
} from "./posts.schemas";

export async function listPostsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const posts = await getPosts(prisma);
    const validated = posts.map((p) => postResponseSchema.parse(p));
    return reply.status(200).send(validated);
  } catch (err) {
    console.error("listPostsHandler error", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getPostHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const id = anyReq.params?.id as string;
    const post = await getPostById(prisma, id);
    if (!post) return reply.status(404).send({ error: "Post not found" });
    const validated = postResponseSchema.parse(post);
    return reply.status(200).send(validated);
  } catch (err) {
    console.error("getPostHandler error", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createPostHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = createPostBodySchema.parse(request.body);
    const created = await createPost(prisma, userId, parsed as any);
    const validated = postResponseSchema.parse(created);
    return reply.status(201).send(validated);
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    return reply.status(400).send({ error: msg });
  }
}

export async function updatePostHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const id = anyReq.params?.id as string;
    const parsed = updatePostBodySchema.parse(request.body);
    const updated = await updatePost(prisma, id, userId, parsed as any);
    if (!updated) return reply.status(404).send({ error: "Post not found" });
    const validated = postResponseSchema.parse(updated);
    return reply.status(200).send(validated);
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    const status = msg === "Unauthorized" ? 401 : 400;
    return reply.status(status).send({ error: msg });
  }
}

export async function deletePostHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const userId: string | undefined = anyReq.user?.userId;
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });

    const id = anyReq.params?.id as string;
    const del = await deletePost(prisma, id, userId);
    if (!del) return reply.status(404).send({ error: "Post not found" });
    return reply.status(204).send();
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return reply.status(status).send({ error: msg });
  }
}
