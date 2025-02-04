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

export { WebhookData };
