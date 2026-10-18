import { z } from "zod";
import { contactAckEmail, contactNotifyEmail } from "@svateh/core/emails";
import { saveContactMessage } from "@svateh/db";
import { handler, isBot, json, readJson } from "@/lib/api";
import { emailBrand, sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().max(20).optional().default(""),
  orderNumber: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().min(10, "Please write a little more so we can help").max(3000),
});

export const POST = handler(async (req: Request) => {
  const body = await readJson(req);
  if (isBot(body)) return json({ ok: true });
  const data = schema.parse(body);
  await saveContactMessage(data);
  const b = await emailBrand();
  const ack = contactAckEmail(b, data.name, data.message, b.responseTime);
  await sendEmail({ to: data.email, subject: ack.subject, html: ack.html, replyTo: b.contactEmail || undefined });
  if (b.notify) {
    const n = contactNotifyEmail(b, data);
    await sendEmail({ to: b.notify, subject: n.subject, html: n.html, replyTo: data.email });
  }
  return json({ ok: true });
});
