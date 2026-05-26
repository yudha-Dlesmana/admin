import { NextResponse, type NextRequest } from "next/server";
import { API } from "@/lib/config";

const PUBLIC_PATH = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATH.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const refresh = req.cookies.get("refresh_token")?.value;
  let valid = false;
  if (refresh) {
    try {
      const res = await fetch(`${API.IAM}/auth/validate`, {
        headers: { cookie: `refresh_token=${refresh}` },
        cache: "no-store",
      });
      valid = res.ok;
    } catch {
      valid = false;
    }
  }
  if (isPublic && valid) return NextResponse.redirect(new URL("/", req.url));
  if (!isPublic && !valid) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff2?)).*)",
  ],
};
