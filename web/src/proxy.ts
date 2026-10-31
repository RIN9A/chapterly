import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, API_URL));
}

export const config = {
  matcher: "/api/v1/:path*",
};
