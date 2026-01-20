import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("Missing AUTH_JWT_SECRET");
    return new TextEncoder().encode("dev-insecure-auth-jwt-secret");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  address: string;
};

export async function signSessionJwt(payload: SessionPayload, ttlSeconds: number) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret);
}

export async function verifySessionJwt(token: string) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  const address = payload.address;
  if (typeof address !== "string" || address.length === 0) {
    throw new Error("Invalid session");
  }
  return { address };
}
