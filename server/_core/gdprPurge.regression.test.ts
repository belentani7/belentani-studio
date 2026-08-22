import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");

describe("purga GDPR programada", () => {
  it("solo acepta identidades Heartbeat y delega la purga al helper de privacidad", () => {
    expect(serverSource).toContain('app.post("/api/scheduled/gdpr-purge"');
    expect(serverSource).toContain("if (!user.isCron || !user.taskUid) return res.status(403).json({ error: \"cron-only\" });");
    expect(serverSource).toContain("await purgeExpiredPrivacyData()");
  });

  it("protege también la migración periódica de CVs históricos", () => {
    expect(serverSource).toContain('app.post("/api/scheduled/cv-encryption-migration"');
    expect(serverSource).toContain("await migrateLegacyCVData()");
  });
});
