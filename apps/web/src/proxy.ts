import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/session";

/** Optimistic gate for the admin area; every admin page and API re-checks the session against the database. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const open = ["/admin/login", "/admin/setup", "/admin/forgot", "/admin/reset"].some((p) => pathname.startsWith(p));
  if (open) return NextResponse.next();
  const session = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
