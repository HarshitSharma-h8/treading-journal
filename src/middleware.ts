import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/",
  "/trades",
  "/add-trade",
  "/calendar",
  "/analytics",
  "/journal",
  "/settings",
];

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some((route) =>
    route === "/" ? path === "/" : path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  const session = request.cookies.get("session")?.value;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
