import { FastifyRequest, FastifyReply } from "fastify";
import { sql } from "../config";
import { WebhookData } from "../types";
import { sendConfirmation } from "../mail-templates";

const hook = async (request: FastifyRequest, _reply: FastifyReply) => {
  const webhookData = request.body as WebhookData;
  console.log("Received form data:", webhookData);

  const EVENT_ID = webhookData.event as string;

  let fetchEvent = await sql`SELECT name FROM events WHERE id = ${EVENT_ID}`;

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
      .find((response) => response.question.trim() === "Number of Team Members")
      ?.answer.trim() || "2",
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
        college: memberCollege,
      });
      promises.push(sendConfirmation(memberEmail, memberName, eventName));
    }
  }
  const dbInsertion = await sql`
        INSERT INTO registrations (name, email, event_id, college)
        VALUES ${sql(userData.map((data) => [data.name, data.email, EVENT_ID, data.college]))}
        ON CONFLICT (email, event_id) DO NOTHING
  `;

  await Promise.allSettled(promises);
  console.log("Registrations inserted successfully", dbInsertion);
};

const formControllers = {
  hook,
};
export default formControllers;
