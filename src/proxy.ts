import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];
const AUTH_COOKIE = "logged_in";
const HOME_AFTER_LOGIN = "/admin/dashboard";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loggedIn = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!loggedIn && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (loggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL(HOME_AFTER_LOGIN, request.url));
  }

  if (loggedIn && pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|woff2?)$).*)",
  ],
};
