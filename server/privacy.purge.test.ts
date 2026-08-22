import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("contratos de privacidad", () => {
  it("archiva la cuenta durante 30 días y purga datos relacionales al vencer el plazo", () => {
    expect(dbSource).toContain("30 * 24 * 60 * 60 * 1000");
    expect(dbSource).toContain('set({ deletedAt: new Date(), status: "archived" })');
    expect(dbSource).toContain("await db.delete(qualityReports)");
    expect(dbSource).toContain("await db.delete(documents)");
    expect(dbSource).toContain('loginMethod: "deleted"');
  });

  it("incluye las colecciones propias en exportación sin exponer el identificador OAuth", () => {
    expect(routerSource).toContain("documents: await getUserDocuments(ctx.user.id, true)");
    expect(routerSource).toContain("auditLogs: await getUserAuditLogs(ctx.user.id)");
    expect(routerSource).toContain("privacyRequests: await getUserPrivacyRequests(ctx.user.id)");
    expect(routerSource).toContain("qualityReports: await getUserQualityReports(ctx.user.id)");
    expect(routerSource).not.toContain("openId: ctx.user.openId");
  });
});
