import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACCESS_DURATION_MS } from "./_core/adminAccess";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
type CookieCall = { name: string; value: string; options: Record<string, unknown> };

function createContext(cookie = ""): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];
  const user: AuthenticatedUser = {
    id: 81,
    openId: "passphrase-test-user",
    email: "test@example.com",
    name: "Passphrase Test",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    ctx: {
      user,
      req: { protocol: "https", headers: cookie ? { cookie } : {} } as TrpcContext["req"],
      res: {
        cookie: (name: string, value: string, options: Record<string, unknown>) => {
          cookies.push({ name, value, options });
        },
        clearCookie: () => undefined,
      } as TrpcContext["res"],
    },
    cookies,
  };
}

describe("auth.authorizeAdmin", () => {
  it("authorizes a signed-in user only with the configured managed passphrase and mints a time-bounded cookie", async () => {
    const suppliedPassphrase = process.env.ADMIN_ACCESS_PASSPHRASE;
    expect(suppliedPassphrase).toBeTypeOf("string");
    expect(suppliedPassphrase?.length).toBeGreaterThan(0);

    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.authorizeAdmin({ passphrase: suppliedPassphrase! })).resolves.toEqual({
      authorized: true,
      expiresInSeconds: ADMIN_ACCESS_DURATION_MS / 1000,
    });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({
      name: ADMIN_ACCESS_COOKIE,
      options: { httpOnly: true, sameSite: "none", secure: true, path: "/", maxAge: ADMIN_ACCESS_DURATION_MS },
    });

    const authorized = createContext(`${ADMIN_ACCESS_COOKIE}=${cookies[0]!.value}`);
    await expect(appRouter.createCaller(authorized.ctx).auth.adminAccess()).resolves.toEqual({ authorized: true });
  });

  it("rejects an incorrect passphrase without minting an administrator cookie", async () => {
    const { ctx, cookies } = createContext();
    await expect(appRouter.createCaller(ctx).auth.authorizeAdmin({ passphrase: "incorrect-passphrase" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(cookies).toHaveLength(0);
  });
});
