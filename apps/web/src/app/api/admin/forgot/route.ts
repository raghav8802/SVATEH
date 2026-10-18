import { z } from "zod";
import { passwordResetEmail } from "@svateh/core/emails";
import { createResetToken } from "@svateh/db";
import { handler, json, readJson } from "@/lib/api";
import { emailBrand, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

const schema = z.object({ email: z.email("Enter a valid email") });

export const POST = handler(async (req: Request) => {
  const { email } = schema.parse(await readJson(req));
  const token = await createResetToken("admin", email);
  if (token) {
    const b = await emailBrand();
    const m = passwordResetEmail(b, `${siteUrl()}/admin/reset?token=${token}`, true);
    await sendEmail({ to: email, subject: m.subject, html: m.html });
  }
  return json({ ok: true, message: "If this email belongs to an admin, a reset link is on its way." });
});
