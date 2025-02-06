import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { sendConfirmation } from "./templates";
import { sql } from "./config";
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
