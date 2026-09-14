import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// In production, you must set SESSION_SECRET in your environment variables.
// Using a fallback for development if not provided, but it is highly recommended to set it.
const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-in-production-12345";
const key = new TextEncoder().encode(secretKey);

const COOKIE_NAME = "session";
const SESSION_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  expires: Date;
  [key: string]: unknown;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_EXPIRATION);
  const session = await encrypt({ userId, expires });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;
  
  return await decrypt(session);
}

export async function getSessionFromRequest(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (!session) return null;
  
  return await decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
