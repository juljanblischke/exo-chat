import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth.error === "RefreshTokenError") {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
