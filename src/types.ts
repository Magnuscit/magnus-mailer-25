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

interface OnDeskRegistrationDetails {
  events: string[];
  name: string;
  college: string;
  phone: string;
  email: string;
}

export {
  WebhookData,
  ConfirmedUsers,
  LoginRequestBody,
  OnDeskRegistrationDetails,
};
