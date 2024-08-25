import { Resend } from "resend";

export async function sendEmail(to: string, body: string) {
  const resend = new Resend(process.env.EMAIL_KEY!);

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: "Hello from Zapier",
    html: `<strong>${body}</strong>`,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}
