import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";

export type AuditAction = "login" | "logout" | "view_data" | "update_data" | "delete_data" | "export_data" | "payment" | "report_quality" | "cv_generated" | "cv_downloaded";
export type AuditDetails = { documentId?: number; provider?: "local" | "builtin"; status?: "success" | "failure"; bytes?: number };

/** Keeps operational metadata useful while excluding message text, IPs and user-agent strings. */
export function sanitizeAuditDetails(details: AuditDetails = {}): AuditDetails {
  const safe: AuditDetails = {};
  if (Number.isSafeInteger(details.documentId) && (details.documentId ?? 0) > 0) safe.documentId = details.documentId;
  if (details.provider === "local" || details.provider === "builtin") safe.provider = details.provider;
  if (details.status === "success" || details.status === "failure") safe.status = details.status;
  if (Number.isSafeInteger(details.bytes) && (details.bytes ?? 0) >= 0 && (details.bytes ?? 0) <= 50 * 1024 * 1024) safe.bytes = details.bytes;
  return safe;
}

export async function logAudit(userId: number, action: AuditAction, details: AuditDetails = {}) {
  const db = await getDb();
  if (!db) {
    console.warn("[AuditLog] Database unavailable");
    return;
  }

  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      details: sanitizeAuditDetails(details),
      timestamp: new Date(),
    });
  } catch {
    console.error("[AuditLog] write failed");
  }
}

export async function getAuditLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  try {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).limit(safeLimit).orderBy(desc(auditLogs.timestamp));
  } catch {
    console.error("[AuditLog] fetch failed");
    return [];
  }
}
