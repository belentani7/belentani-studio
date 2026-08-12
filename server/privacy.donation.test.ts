import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (): TrpcContext => ({
  user: { id: 7, openId: "privacy-user", name: "Persona", email: "persona@example.com", loginMethod: "test", role: "user", creditsBalance: "0", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: { origin: "https://example.test" } } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("privacy and donation contracts", () => {
  it("exports only the user profile and owned collections", async () => {
    const result = await appRouter.createCaller(context()).privacy.dataExport();
    expect(result.profile.email).toBe("persona@example.com");
    expect(result).toHaveProperty("documents");
    expect(result).toHaveProperty("transactions");
    expect(result.profile).not.toHaveProperty("openId");
  });

  it("rejects donations below one euro before calling payment provider", async () => {
    await expect(appRouter.createCaller(context()).donation.createCheckout({ amount: 0 })).rejects.toThrow();
  });
});
