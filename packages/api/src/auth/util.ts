import "server-only";
import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../constants";

export const SESSION_COOKIE_NAME = AUTH_COOKIE.NAME;
const SESSION_DURATION_MS = AUTH_COOKIE.DURATION_MS;

// Standard Cookie Options
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// JWT Secret - lazily evaluated to avoid crashing on import in test environments
function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return compare(password, hash);
}

/**
 * CREATES A NEW JWT SESSION
 * Encodes userId, role, and department into a signed token and sets a secure cookie.
 */
export async function createSession(
  userId: number,
  role: string,
  email: string,
  firstName: string | null,
  middleName: string | null,
  lastName: string | null,
  suffix: string | null,
  staffDepartment?: string | null
) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Create the JWT with user metadata for stateless middleware checks
  const token = await new SignJWT({
    userId,
    role,
    email,
    firstName,
    middleName,
    lastName,
    suffix,
    staffDepartment,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Match SESSION_DURATION_MS roughly
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    ...SESSION_COOKIE_OPTIONS,
    expires: expiresAt,
  });
}

/**
 * FAST SESSION DECRYPTION
 * Used by Middleware to check authorization without hitting the database.
 */
export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as {
      userId: number;
      role: string;
      email: string;
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
      suffix: string | null;
      staffDepartment?: string | null;
    };
  } catch (error) {
    return null;
  }
}

/**
 * DELETES THE CURRENT SESSION
 * Simply clears the cookie. No DB cleanup needed for stateless JWTs.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
