import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-in-production-12345";
const key = new TextEncoder().encode(secretKey);

async function getValidSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

const protectedRoutes = [
  "/dashboard",
  "/trades",
  "/add-trade",
  "/calendar",
  "/analytics",
  "/journal",
  "/settings",
  "/import-trades",
];

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Fully validate the JWT — don't just check cookie presence
  const session = await getValidSession(request);

  if (isProtectedRoute && !session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clear any stale/invalid cookie to prevent redirect loops
    response.cookies.set(COOKIE_NAME, "", { expires: new Date(0), path: "/" });
    return response;
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
