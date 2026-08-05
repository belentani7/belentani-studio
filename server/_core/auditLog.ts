import { eq, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { auditLogs } from '../../drizzle/schema';

export type AuditAction = 'login' | 'logout' | 'view_data' | 'update_data' | 'delete_data' | 'export_data' | 'payment' | 'report_quality';

export async function logAudit(
  userId: number,
  action: AuditAction,
  resourceType: string,
  resourceId: number,
  ipAddress: string,
  userAgent: string,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn('[AuditLog] Database unavailable');
    return;
  }

  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      status,
      errorMessage,
      timestamp: new Date(),
    } as any);
  } catch (error) {
    console.error('[AuditLog] Failed to log:', error);
  }
}

export async function getAuditLogs(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).limit(limit).orderBy(desc(auditLogs.timestamp));
  } catch (error) {
    console.error('[AuditLog] Failed to fetch:', error);
    return [];
  }
}
