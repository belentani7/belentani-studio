import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserDocuments, getDocumentById, createDocument, createQualityReport, getQualityReports, getUserTransactions, getUserAuditLogs, getUserPrivacyRequests, getUserQualityReports, requestAccountDeletion, requestDataCorrection, recordOperationMetric } from "./db";
import Stripe from "stripe";
import { enhanceCV, getCVProviderStatus } from "./_core/cvPipeline";
import { CVInputSchema } from "./_core/cvValidation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const DEFAULT_PUBLIC_ORIGIN = "https://belentani-mtmcq4q9.manus.space";
export function getSafeOrigin(req: { headers: { origin?: string | string[] } }) {
  const raw = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
  try {
    const origin = new URL(raw || DEFAULT_PUBLIC_ORIGIN);
    const allowed = origin.protocol === "https:" && origin.hostname === "belentani-mtmcq4q9.manus.space";
    const local = origin.protocol === "http:" && (origin.hostname === "localhost" || origin.hostname === "127.0.0.1");
    return allowed || local ? origin.origin : DEFAULT_PUBLIC_ORIGIN;
  } catch { return DEFAULT_PUBLIC_ORIGIN; }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  cv: router({
    generate: protectedProcedure
      .input(CVInputSchema)
      .mutation(async ({ ctx, input }) => {
        if (input.photoUrl && !input.photoUrl.startsWith(`/manus-storage/users/${ctx.user.id}/photo_`)) throw new Error("Foto no perteneciente al usuario");
        const provider = getCVProviderStatus();
        const inputBytes = Buffer.byteLength(JSON.stringify(input), "utf8");
        let docId: number | null = null;
        try {
          const enhanced = await enhanceCV(input);
          docId = await createDocument(ctx.user.id, "CV profesional", enhanced);
          if (!docId) throw new Error("No se pudo guardar el CV");
          await recordOperationMetric({ operation: "cv_generated", provider: provider.id, estimatedCostMicros: 0, inputBytes, outputBytes: 0, status: "success" });
        } catch {
          await recordOperationMetric({ operation: "cv_generated", provider: provider.id, estimatedCostMicros: 0, inputBytes, outputBytes: 0, status: "failure" });
          throw new Error("No se pudo crear el CV");
        }
        return { success: true, documentId: docId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDocuments(ctx.user.id);
    }),
  }),

  donation: router({
    createCheckout: publicProcedure
      .input(z.object({ amount: z.number().int().min(1).max(500) }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{ price_data: { currency: "eur", product_data: { name: "Donación - Plataforma Educativa", description: "Apoya la educación de inmigrantes en España" }, unit_amount: input.amount * 100 }, quantity: 1 }],
          mode: "payment",
          success_url: `${getSafeOrigin(ctx.req)}/dashboard?donation=success`,
          cancel_url: `${getSafeOrigin(ctx.req)}/dashboard?donation=cancelled`,
          metadata: { purpose: "voluntary_education_donation" },
        });
        return { checkoutUrl: session.url };
      }),
  }),

  privacy: router({
    dataExport: protectedProcedure.query(async ({ ctx }) => ({
      profile: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email, createdAt: ctx.user.createdAt },
      documents: await getUserDocuments(ctx.user.id, true),
      transactions: await getUserTransactions(ctx.user.id),
      auditLogs: await getUserAuditLogs(ctx.user.id),
      privacyRequests: await getUserPrivacyRequests(ctx.user.id),
      qualityReports: await getUserQualityReports(ctx.user.id),
    })),
    requestDeletion: protectedProcedure.mutation(async ({ ctx }) => ({ success: await requestAccountDeletion(ctx.user.id) })),
    requestCorrection: protectedProcedure
      .input(z.object({ scope: z.enum(["profile", "documents", "other"]) }).strict())
      .mutation(async ({ ctx, input }) => ({ success: await requestDataCorrection(ctx.user.id, input.scope) })),
  }),

  quality: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      return await getUserQualityReports(ctx.user.id);
    }),

    report: protectedProcedure
      .input(z.object({ documentId: z.number().int().positive(), issue: z.string().trim().min(1).max(4000) }).strict())
      .mutation(async ({ ctx, input }) => {
        const document = await getDocumentById(input.documentId, ctx.user.id);
        if (!document) throw new Error("Documento no encontrado o no pertenece al usuario");
        const reportId = await createQualityReport(ctx.user.id, input.documentId, input.issue);
        return { success: true, reportId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      return await getQualityReports();
    }),
  }),
});

export type AppRouter = typeof appRouter;
