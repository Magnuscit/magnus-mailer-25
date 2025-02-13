import { FastifyReply, FastifyRequest } from "fastify";
import { LoginRequestBody, ConfirmedUsers } from "../types";
import { sql } from "../config";
import { createSHA256Hash } from "../utils";
import { sendBoardingPass, sendRejection } from "../mail-templates";

const PASSWORD = process.env.PORTAL_PWD || "";

const fetchEvents = async (_request: FastifyRequest, reply: FastifyReply) => {
  const fetchEvents = await sql`SELECT * FROM events`;
  const events: Record<string, string> = {};
  for (const event of fetchEvents) {
    events[event.id] = event.name;
  }
  console.log("Fetched Events:", events);
  reply.status(200).send(events);
};

const login = async (
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
};

const sendConfirmation = async (
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
};

const PortalControllers = {
  sendConfirmation,
  fetchEvents,
  login,
};

export default PortalControllers;
