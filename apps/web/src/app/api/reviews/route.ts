import { z } from "zod";
import { submitReview } from "@svateh/db";
import { handler, isBot, json, readJson } from "@/lib/api";

const schema = z.object({
  productId: z.string().regex(/^[a-f0-9]{24}$/i),
  name: z.string().trim().min(2, "Please enter your name").max(60),
  email: z.email("Enter the email you ordered with"),
  rating: z.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().min(2, "Add a short title").max(100),
  body: z.string().trim().min(10, "Tell us a little more").max(2000),
  shade: z.string().trim().max(60).optional().default(""),
  images: z.array(z.url()).max(4).optional().default([]),
});

export const POST = handler(async (req: Request) => {
  const body = await readJson(req);
  if (isBot(body)) return json({ ok: true });
  const data = schema.parse(body);
  await submitReview(data);
  return json({ ok: true, message: "Thank you! Your review will appear once it’s been checked." });
});
