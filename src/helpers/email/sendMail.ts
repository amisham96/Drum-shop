import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';

const connectionString = process.env['NEXT_COMMUNICATION_SERVICES_CONNECTION_STRING']!;
const client = new EmailClient(connectionString);

type EmailObjectType = {
  subject: string,
  plainText: string,
  html: string,
  recipientAddress: string
}

async function sendEmail(emailParams : EmailObjectType) {
  const POLLER_WAIT_TIME = 10

  const emailMessage = {
    senderAddress: 'DoNotReply@cf25aac3-74e4-4fa9-a983-3059364b755e.azurecomm.net',
    content: {
      subject: emailParams.subject,
      plainText: emailParams.plainText,
      html: emailParams.html,
    },
    recipients: {
      to: [{ address: emailParams.recipientAddress }],
    },
  };

  const poller = await client.beginSend(emailMessage);
  const result = await poller.pollUntilDone();

  if (result.status === 'Succeeded') {
    return { success: true, error: null }
  } else {
    return { success: false, error: result.error }
  }
}

export { sendEmail };
