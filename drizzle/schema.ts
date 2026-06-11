import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  creditsBalance: decimal("creditsBalance", { precision: 10, scale: 2 }).default("1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table: stores CV data and metadata
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  cvData: json("cvData").notNull(), // Stores structured CV data (personal, experience, education, skills)
  pdfUrl: varchar("pdfUrl", { length: 512 }), // S3 URL to generated PDF
  atsScore: int("atsScore"), // Last ATS analysis score (0-100)
  status: mysqlEnum("status", ["draft", "generated", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete: 30-day grace period before permanent deletion
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Transactions table: tracks all credit purchases and usage
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund", "admin_adjustment"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Positive for purchases, negative for usage
  stripePaymentId: varchar("stripePaymentId", { length: 255 }), // Stripe payment intent ID
  stripeChargeId: varchar("stripeChargeId", { length: 255 }), // Stripe charge ID
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  description: text("description"), // e.g., "CV Generation", "1 CV Credit Purchase"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * ATS Analyses table: stores ATS compatibility analysis results
 */
export const atsAnalyses = mysqlTable("atsAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  jobDescription: text("jobDescription").notNull(),
  score: int("score").notNull(), // 0-100 compatibility score
  missingKeywords: json("missingKeywords"), // Array of keywords not found in CV
  suggestions: json("suggestions"), // Array of improvement suggestions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AtsAnalysis = typeof atsAnalyses.$inferSelect;
export type InsertAtsAnalysis = typeof atsAnalyses.$inferInsert;

/**
 * Audit Logs table: tracks all user actions for security and compliance
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(), // e.g., "login", "cv_generated", "payment_received", "data_exported"
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  details: json("details"), // Additional context (document ID, payment amount, etc.)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Privacy Requests table: tracks GDPR DSAR and deletion requests
 */
export const privacyRequests = mysqlTable("privacyRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["data_export", "account_deletion", "data_correction"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  exportUrl: varchar("exportUrl", { length: 512 }), // Temporary URL to download exported data (expires in 7 days)
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  expiresAt: timestamp("expiresAt"), // For soft-deleted accounts: permanent deletion date (30 days after request)
});

export type PrivacyRequest = typeof privacyRequests.$inferSelect;
export type InsertPrivacyRequest = typeof privacyRequests.$inferInsert;