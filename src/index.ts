import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { sendConfirmation } from "./templates";
import { db } from "./config";
import { WebhookData } from "./types";

import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT || 6969);

const fastify = Fastify();

fastify.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return "za-warudo";
});

fastify.post(
  "/submit-form",
  async (request: FastifyRequest, _reply: FastifyReply) => {
    const webhookData = request.body as WebhookData;
    console.log("Received form data:", webhookData);

    const EVENT = webhookData.event as string;

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
      event: EVENT,
      college: teamLeadCollegeName,
    });

    promises.push(sendConfirmation(teamLeadEmail, teamLeadName, EVENT));

    const numberOfMembers = Number(
      webhookData.responses
        .find(
          (response) => response.question.trim() === "Number of Team Members",
        )
        ?.answer.trim(),
    );

    for (let i = 1; i < numberOfMembers; i++) {
      const memberName = webhookData.responses
        .find((response) => response.question.trim() === `Name of Member ${i}`)
        ?.answer.trim() as string;
      const memberCollege = webhookData.responses
        .find(
          (response) => response.question.trim() === `Member ${i} College Name`,
        )
        ?.answer.trim() as string;
      const memberEmail = webhookData.responses
        .find((response) => response.question.trim() === `Member ${i} Email`)
        ?.answer.trim() as string;

      if (memberName && memberEmail) {
        userData.push({
          name: memberName,
          email: memberEmail,
          event: EVENT,
          college: memberCollege,
        });
        promises.push(sendConfirmation(memberEmail, memberName, EVENT));
      }
    }
    await Promise.allSettled(promises);

    const query = `
      INSERT INTO registrations (name, email, event, college, present, confirmed)
      VALUES ${userData.map(() => "(?, ?, ?, ?, 0, 0)").join(", ")}
      ON CONFLICT (email, event) DO NOTHING;
    `;
    try {
      const dbInsertion = await db.execute({
        sql: query,
        args: userData.flatMap((data) => [
          data.name,
          data.email,
          data.event,
          data.college,
        ]),
      });
      console.log("Registrations inserted successfully", dbInsertion);
    } catch (e) {
      console.error("Error inserting registrations:", e);
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
