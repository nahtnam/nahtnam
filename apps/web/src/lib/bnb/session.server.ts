import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { serverEnv } from "@repo/config/env/server";

const COOKIE_NAME = "nahtnam_bnb_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export function createBnbSessionCookie(options: { password: string }) {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const value = encryptSession({ expiresAt, password: options.password });

  return serializeCookie({
    maxAge: SESSION_SECONDS,
    value,
  });
}

export function clearBnbSessionCookie() {
  return serializeCookie({ maxAge: 0, value: "" });
}

export function getBnbSessionPassword(request: Request) {
  const value = readCookie({ cookieHeader: request.headers.get("cookie") });
  if (!value) {
    return;
  }

  const session = decryptSession(value);
  if (!session || session.expiresAt <= Date.now()) {
    return;
  }

  return session.password;
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  return origin === new URL(request.url).origin;
}

type BnbSession = {
  expiresAt: number;
  password: string;
};

function encryptionKey() {
  return createHash("sha256")
    .update(`bnb-session:${serverEnv.WORKOS_COOKIE_PASSWORD}`)
    .digest();
}

function encryptSession(session: BnbSession) {
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    encryptionKey(),
    initializationVector
  );
  cipher.setAAD(Buffer.from(COOKIE_NAME));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf-8"),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [initializationVector, encrypted, authenticationTag]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptSession(value: string) {
  const [initializationVectorValue, encryptedValue, authenticationTagValue] =
    value.split(".");

  if (
    !(initializationVectorValue && encryptedValue && authenticationTagValue)
  ) {
    return;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(initializationVectorValue, "base64url")
    );
    decipher.setAAD(Buffer.from(COOKIE_NAME));
    decipher.setAuthTag(Buffer.from(authenticationTagValue, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf-8");
    const parsed = JSON.parse(decrypted) as Partial<BnbSession>;

    if (
      typeof parsed.expiresAt !== "number" ||
      !Number.isFinite(parsed.expiresAt) ||
      typeof parsed.password !== "string" ||
      !parsed.password
    ) {
      return;
    }

    return parsed as BnbSession;
  } catch {
    // Authentication failures and malformed cookies are invalid sessions.
  }
}

function readCookie(options: { cookieHeader: string | null }) {
  const { cookieHeader } = options;
  if (!cookieHeader) {
    return;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...parts] = cookie.trim().split("=");
    if (name === COOKIE_NAME) {
      return decodeURIComponent(parts.join("="));
    }
  }
}

type SerializeCookieOptions = {
  maxAge: number;
  value: string;
};

function serializeCookie(options: SerializeCookieOptions) {
  const { maxAge, value } = options;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/api/bnb; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}
