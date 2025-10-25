import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { createPin } from "./use-cases/create-pin";
import { getPins } from "./use-cases/get-pins";
import { getPinById } from "./use-cases/get-pin-by-id";
import { updatePin } from "./use-cases/update-pin";
import { deletePin } from "./use-cases/delete-pin";
import {
  createPinBodySchema,
  pinResponseSchema,
  updatePinBodySchema,
} from "./pins.schemas";

export async function listPinsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const pins = await getPins(prisma);
    const validated = pins.map((p) => pinResponseSchema.parse(p));
    return reply.status(200).send(validated);
  } catch (err) {
    console.error("listPinsHandler error", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getPinHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const id = anyReq.params?.id as string;
    const pin = await getPinById(prisma, id);
    if (!pin) return reply.status(404).send({ error: "Pin not found" });
    const validated = pinResponseSchema.parse(pin);
    return reply.status(200).send(validated);
  } catch (err) {
    console.error("getPinHandler error", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createPinHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const parsed = createPinBodySchema.parse(request.body);
    const pin = await createPin(prisma, parsed as any);
    if (!pin)
      return reply.status(409).send({ error: "A pin already exists nearby" });
    const validated = pinResponseSchema.parse(pin);
    return reply.status(201).send(validated);
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    return reply.status(400).send({ error: msg });
  }
}

export async function updatePinHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const id = anyReq.params?.id as string;
    const parsed = updatePinBodySchema.parse(request.body);
    const pin = await updatePin(prisma, id, parsed as any);
    const validated = pinResponseSchema.parse(pin);
    return reply.status(200).send(validated);
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    return reply.status(400).send({ error: msg });
  }
}

export async function deletePinHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const anyReq: any = request;
    const id = anyReq.params?.id as string;
    await deletePin(prisma, id);
    return reply.status(204).send();
  } catch (err: any) {
    const msg = err?.message ?? "Internal Server Error";
    return reply.status(500).send({ error: msg });
  }
}
