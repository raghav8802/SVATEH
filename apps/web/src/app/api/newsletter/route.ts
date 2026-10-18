import { z } from "zod";
import { welcomeEmail } from "@svateh/core/emails";
import { subscribe } from "@svateh/db";
import { handler, isBot, json, readJson } from "@/lib/api";
import { emailBrand, sendEmail } from "@/lib/email";

const schema = z.object({ email: z.email("Enter a valid email"), source: z.string().max(30).optional() });

export const POST = handler(async (req: Request) => {
  const body = await readJson(req);
  if (isBot(body)) return json({ ok: true });
  const { email, source } = schema.parse(body);
  const { created } = await subscribe(email, source ?? "footer");
  if (created) {
    const b = await emailBrand();
    const m = welcomeEmail(b);
    await sendEmail({ to: email, subject: m.subject, html: m.html });
  }
  return json({ ok: true, message: created ? "You’re in! Check your inbox." : "You’re already on the list — thank you!" });
});
