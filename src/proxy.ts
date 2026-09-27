import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("PROXY RUNNING FOR:", pathname);
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken");

  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
