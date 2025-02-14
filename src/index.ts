import { Sentry } from "./config";
import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { Gfrom, Admin } from "./controllers";

import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT || 6969);

const fastify = Fastify();

Sentry.setupFastifyErrorHandler(fastify);

fastify.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "https://magnus-25-verification-portal.vercel.app",
  ],
});

fastify.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return "za-warudo";
});

fastify.get("/events", Admin.fetchEvents);
fastify.post("/login", Admin.login);
fastify.post("/send-confirmation", Admin.sendConfirmation);
fastify.post("/on-desk-registration", Admin.onDeskRegistration);
fastify.post("/user-events", Admin.fetchUserEvents);
fastify.post("/user-attendance", Admin.userAttendance);
fastify.post(
  "/individual-event-registrations",
  Admin.individualEventRegistrations,
);

fastify.post("/submit-form", Gfrom.hook);

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default async function handler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  await fastify.ready();
  fastify.server.emit("request", req, reply);
}
