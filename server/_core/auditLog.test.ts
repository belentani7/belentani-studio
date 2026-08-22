import { describe, expect, it } from "vitest";
import { sanitizeAuditDetails } from "./auditLog";

describe("auditLog", () => {
  it("solo conserva metadatos operativos permitidos", () => {
    expect(sanitizeAuditDetails({ documentId: 42, provider: "local", status: "success", bytes: 1024 })).toEqual({ documentId: 42, provider: "local", status: "success", bytes: 1024 });
    expect(sanitizeAuditDetails({ documentId: -1, bytes: 999999999, provider: "local" })).toEqual({ provider: "local" });
  });
});
