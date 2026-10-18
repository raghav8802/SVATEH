import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CheckoutError, ValidationError } from "@svateh/db";

export class ApiError extends Error {
  constructor(message: string, public status = 400, public extra?: Record<string, unknown>) {
    super(message);
  }
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Wraps a route handler so thrown errors become friendly JSON responses. */
export function handler<A extends any[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e: any) {
      if (e instanceof ApiError) return json({ error: e.message, ...e.extra }, e.status);
      if (e instanceof ValidationError) return json({ error: e.problems[0], problems: e.problems }, 422);
      if (e instanceof CheckoutError) return json({ error: e.message }, e.status);
      if (e instanceof ZodError) {
        const problems = e.issues.map((i) => i.message);
        return json({ error: problems[0], problems, fields: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 422);
      }
      // Next.js uses thrown errors for redirect()/notFound(); let those through.
      if (e?.digest?.startsWith?.("NEXT_")) throw e;
      console.error(e);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  };
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new ApiError("Invalid request body.");
  }
}

/** Honeypot: bots fill hidden fields, people don't. */
export function isBot(body: any) {
  return typeof body?.website === "string" && body.website.length > 0;
}
