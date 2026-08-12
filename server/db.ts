import { and, eq, desc, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, documents, transactions, qualityReports, privacyRequests, auditLogs } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value !== undefined) {
        values[field] = value ?? null;
        updateSet[field] = value ?? null;
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(and(eq(documents.userId, userId), isNull(documents.deletedAt))).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(documentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  const document = result[0];
  return document?.userId === userId && !document.deletedAt ? document : undefined;
}

export async function setDocumentPdfUrl(documentId: number, userId: number, pdfUrl: string) {
  const db = await getDb();
  if (!db) return false;
  const document = await getDocumentById(documentId, userId);
  if (!document) return false;
  await db.update(documents).set({ pdfUrl, status: "generated" }).where(eq(documents.id, documentId));
  return true;
}

export async function createDocument(userId: number, title: string, cvData: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(documents).values({ userId, title, cvData, status: "generated" } as any);
  return (result as any)[0]?.insertId;
}

export async function createTransaction(userId: number, amount: string, stripePaymentId: string, stripeChargeId?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(transactions).values({ userId, type: "purchase", amount, stripePaymentId, stripeChargeId, status: "completed" } as any);
  return (result as any)[0]?.insertId;
}

export async function createQualityReport(userId: number, documentId: number, issue: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(qualityReports).values({ userId, documentId, issue, status: "pending" } as any);
  return (result as any)[0]?.insertId;
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
}

export async function getUserAuditLogs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.timestamp));
}

export async function getUserPrivacyRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(privacyRequests).where(eq(privacyRequests.userId, userId)).orderBy(desc(privacyRequests.requestedAt));
}

export async function requestAccountDeletion(userId: number) {
  const db = await getDb();
  if (!db) return false;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.update(documents).set({ deletedAt: new Date(), status: "archived" }).where(eq(documents.userId, userId));
  await db.insert(privacyRequests).values({ userId, type: "account_deletion", status: "pending", requestedAt: new Date(), expiresAt } as any);
  return true;
}

export async function purgeExpiredPrivacyData(now = new Date()) {
  const db = await getDb();
  if (!db) return { processed: 0 };
  const expired = await db.select().from(privacyRequests).where(and(eq(privacyRequests.type, "account_deletion"), eq(privacyRequests.status, "pending"), lt(privacyRequests.expiresAt, now)));
  let processed = 0;
  for (const request of expired) {
    await db.delete(qualityReports).where(eq(qualityReports.userId, request.userId));
    await db.delete(documents).where(eq(documents.userId, request.userId));
    await db.update(users).set({ openId: `deleted-${request.userId}-${request.id}`, name: null, email: null, loginMethod: "deleted" }).where(eq(users.id, request.userId));
    await db.update(privacyRequests).set({ status: "completed", completedAt: now }).where(eq(privacyRequests.id, request.id));
    processed += 1;
  }
  return { processed };
}

export async function getQualityReports() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(qualityReports).orderBy(desc(qualityReports.createdAt));
}
