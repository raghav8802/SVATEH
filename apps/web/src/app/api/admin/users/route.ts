import { z } from "zod";
import { createAdmin } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters"),
  role: z.enum(["owner", "manager", "editor"]),
});

export const POST = handler(async (req: Request) => {
  await requireAdminApi(["owner"]);
  try {
    return json({ user: await createAdmin(schema.parse(await readJson(req))) }, 201);
  } catch (e: any) {
    if (e?.name === "ZodError") throw e;
    throw new ApiError(e.message, 409);
  }
});
