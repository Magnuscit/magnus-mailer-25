interface WebhookResponse {
  question: string;
  answer: string;
}

interface WebhookData {
  title: string;
  event: string;
  createdAt: string;
  responses: WebhookResponse[];
}

interface ConfirmedUsers {
  event: string;
  emails: string[];
  action: string;
}

interface LoginRequestBody {
  password: string;
}

export { WebhookData, ConfirmedUsers, LoginRequestBody };
