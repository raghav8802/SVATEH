import { z } from "zod";
import { passwordResetEmail } from "@svateh/core/emails";
import { createResetToken } from "@svateh/db";
import { handler, json, readJson } from "@/lib/api";
import { emailBrand, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

const schema = z.object({ email: z.email("Enter a valid email") });

export const POST = handler(async (req: Request) => {
  const { email } = schema.parse(await readJson(req));
  const token = await createResetToken("customer", email);
  if (token) {
    const b = await emailBrand();
    const m = passwordResetEmail(b, `${siteUrl()}/account/reset?token=${token}`);
    await sendEmail({ to: email, subject: m.subject, html: m.html });
  }
  // Same response either way so emails can't be enumerated.
  return json({ ok: true, message: "If an account exists for this email, we’ve sent a reset link." });
});
