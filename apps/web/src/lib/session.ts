import { jwtVerify, SignJWT } from "jose";

/** Edge-safe JWT helpers (used by proxy.ts and server code). */

export const ADMIN_COOKIE = "svateh_admin";
export const CUSTOMER_COOKIE = "svateh_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (32+ characters).");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-0000");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; kind: "admin" | "customer"; email: string; name?: string; role?: string };

export async function signSession(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secret());
}

export async function verifySession(token: string | undefined, kind: SessionPayload["kind"]): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== kind || typeof payload.sub !== "string") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
