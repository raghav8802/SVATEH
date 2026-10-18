import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin, getCustomer } from "@svateh/db";
import type { Role } from "@svateh/core";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, signSession, verifySession } from "./session";
import { ApiError } from "./api";

const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours
const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export type AdminSession = { id: string; email: string; name: string; role: Role };

export async function startAdminSession(a: AdminSession) {
  const token = await signSession({ sub: a.id, kind: "admin", email: a.email, name: a.name, role: a.role }, ADMIN_MAX_AGE);
  (await cookies()).set(ADMIN_COOKIE, token, cookieOpts(ADMIN_MAX_AGE));
}

export async function startCustomerSession(c: { id: string; email: string; name: string }) {
  const token = await signSession({ sub: c.id, kind: "customer", email: c.email, name: c.name }, CUSTOMER_MAX_AGE);
  (await cookies()).set(CUSTOMER_COOKIE, token, cookieOpts(CUSTOMER_MAX_AGE));
}

export async function endSession(kind: "admin" | "customer") {
  (await cookies()).delete(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE);
}

/** Verifies the cookie AND re-checks the database so disabled admins lose access immediately. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const s = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value, "admin");
  if (!s) return null;
  return getAdmin(s.sub);
}

export async function requireAdminPage(roles?: Role[]) {
  const a = await getAdminSession();
  if (!a) redirect("/admin/login");
  if (roles && !roles.includes(a.role)) redirect("/admin?denied=1");
  return a;
}

export async function requireAdminApi(roles?: Role[]) {
  const a = await getAdminSession();
  if (!a) throw new ApiError("Please sign in again.", 401);
  if (roles && !roles.includes(a.role)) throw new ApiError("Your role doesn’t have permission to do this.", 403);
  return a;
}

export async function getCustomerSession() {
  const s = await verifySession((await cookies()).get(CUSTOMER_COOKIE)?.value, "customer");
  if (!s) return null;
  return { id: s.sub, email: s.email, name: s.name ?? "" };
}

export async function getCustomerProfile() {
  const s = await getCustomerSession();
  return s ? getCustomer(s.id) : null;
}
