import Fastify from "fastify";
import cors from "@fastify/cors";
import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import { sendConfirmation, sendBoardingPass, sendRejection } from "./templates";
import { sql } from "./config";
import { ConfirmedUsers, LoginRequestBody, WebhookData } from "./types";

import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT || 6969);
const PASSWORD = process.env.PORTAL_PWD || "";

const fastify = Fastify();

fastify.register(cors, {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://magnus-25-verification-portal.vercel.app",
  ],
});

fastify.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return "za-warudo";
});

fastify.get(
  "/events",
  async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const fetchEvents = await sql`SELECT * FROM events`;
      const events: Record<string, string> = {};
      for (const event of fetchEvents) {
        events[event.id] = event.name;
      }
      fastify.log.info("Fetched Events:", events);
      reply.status(200).send(events);
    } catch (e) {
      fastify.log.fatal(e);
    }
  },
);

const createSHA256Hash = (data: string) => {
  return crypto.createHash("sha256").update(data.trim(), "utf8").digest("hex");
};

fastify.post(
  "/login",
  async (
    request: FastifyRequest<{ Body: LoginRequestBody }>,
    reply: FastifyReply,
  ) => {
    const requestBody = request.body;
    const userPasswordHash = createSHA256Hash(requestBody?.password);
    if (userPasswordHash === PASSWORD) {
      reply.status(200).send("correct");
    } else {
      reply.status(401).send("wrong");
    }
  },
);

fastify.post(
  "/send-confirmation",
  async (
    request: FastifyRequest<{ Body: ConfirmedUsers }>,
    reply: FastifyReply,
  ) => {
    const { event, emails, action } = request.body;
    if (
      !event ||
      !action ||
      !emails ||
      !Array.isArray(emails) ||
      emails.length === 0
    ) {
      return reply
        .code(400)
        .send({ error: "Invalid input. Missing event or emails." });
    }
    try {
      let registrationRows;
      if (action.trim() === "accept") {
        registrationRows = await sql`
        UPDATE registrations
        SET confirmed = true
        WHERE event_id = ${event} AND email = ANY(${emails})
        RETURNING name, email, college
      `;
      } else {
        registrationRows = await sql`
        SELECT name, email, college FROM registrations
        WHERE event_id = ${event} AND email = ANY(${emails})
      `;
      }
      const eventResult = await sql`
      SELECT name FROM events WHERE id = ${event}
    `;
      const eventName = eventResult.length > 0 ? eventResult[0].name : event;

      let mailPromises: Promise<any>[] = [];
      if (action.trim() === "accept") {
        mailPromises = registrationRows.map((row) =>
          sendBoardingPass(row.email, row.name, row.college, eventName),
        );
      } else {
        mailPromises = registrationRows.map((row) =>
          sendRejection(row.email, row.name, eventName),
        );
      }
      await Promise.allSettled(mailPromises);
      reply.send({ success: true, updated: registrationRows.length });
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  },
);

fastify.post(
  "/submit-form",
  async (request: FastifyRequest, _reply: FastifyReply) => {
    const webhookData = request.body as WebhookData;
    console.log("Received form data:", webhookData);

    const EVENT_ID = webhookData.event as string;

    try {
      let fetchEvent =
        await sql`SELECT name FROM events WHERE id = ${EVENT_ID}`;

      const eventName = fetchEvent[0]?.name as string;
      console.log("Events", console.log(fetchEvent));

      const userData = [];
      const promises = [];

      const teamLeadName = webhookData.responses
        .find((response) => response.question.trim() === "Name")
        ?.answer.trim() as string;
      const teamLeadCollegeName = webhookData.responses
        .find((response) => response.question.trim() === "College Name")
        ?.answer.trim() as string;
      const teamLeadEmail = webhookData.responses
        .find((response) => response.question.trim() === "Email")
        ?.answer.trim() as string;

      userData.push({
        name: teamLeadName,
        email: teamLeadEmail,
        college: teamLeadCollegeName,
      });

      promises.push(sendConfirmation(teamLeadEmail, teamLeadName, eventName));

      const numberOfMembers = Number(
        webhookData.responses
          .find(
            (response) => response.question.trim() === "Number of Team Members",
          )
          ?.answer.trim(),
      );

      for (let i = 1; i < numberOfMembers; i++) {
        const memberName = webhookData.responses
          .find(
            (response) => response.question.trim() === `Name of Member ${i}`,
          )
          ?.answer.trim() as string;
        const memberCollege = webhookData.responses
          .find(
            (response) =>
              response.question.trim() === `Member ${i} College Name`,
          )
          ?.answer.trim() as string;
        const memberEmail = webhookData.responses
          .find((response) => response.question.trim() === `Member ${i} Email`)
          ?.answer.trim() as string;

        if (memberName && memberEmail) {
          userData.push({
            name: memberName,
            email: memberEmail,
            college: memberCollege,
          });
          promises.push(sendConfirmation(memberEmail, memberName, eventName));
        }
      }
      await Promise.allSettled(promises);
      const dbInsertion = await sql`
        INSERT INTO registrations (name, email, event_id, college)
        VALUES ${sql(userData.map((data) => [data.name, data.email, EVENT_ID, data.college]))}
        ON CONFLICT (email, event_id) DO NOTHING
      `;
      console.log("Registrations inserted successfully", dbInsertion);
    } catch (e) {
      console.error("Error here:", e);
    }
  },
);

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
