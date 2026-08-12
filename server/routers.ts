import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserDocuments, getDocumentById, createDocument, createQualityReport, getQualityReports, getUserTransactions, getUserAuditLogs, getUserPrivacyRequests, requestAccountDeletion } from "./db";
import Stripe from "stripe";
import { enhanceCVWithAI } from "./_core/cvPipeline";

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
      .input(z.object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(320),
        phone: z.string().trim().max(40).optional(),
        summary: z.string().trim().max(2500).optional(),
        experience: z.array(z.object({ company: z.string().trim().max(160), position: z.string().trim().max(160), duration: z.string().trim().max(80), description: z.string().trim().max(1800) })).max(12),
        education: z.array(z.object({ school: z.string().trim().max(160), degree: z.string().trim().max(160), year: z.string().trim().max(40) })).max(8),
        skills: z.array(z.string().trim().min(1).max(80)).max(40),
        photoUrl: z.string().regex(/^\/manus-storage\/users\/\d+\/photo_[A-Za-z0-9]+$/).optional(),
        location: z.string().trim().max(160).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.photoUrl && !input.photoUrl.startsWith(`/manus-storage/users/${ctx.user.id}/photo_`)) throw new Error("Foto no perteneciente al usuario");
        const enhanced = await enhanceCVWithAI(input);
        const cvData = { ...enhanced, title: `CV - ${input.fullName}`, content: JSON.stringify(enhanced), keywords: input.skills };
        const docId = await createDocument(ctx.user.id, `CV - ${input.fullName}`, cvData);
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
      documents: await getUserDocuments(ctx.user.id),
      transactions: await getUserTransactions(ctx.user.id),
      auditLogs: await getUserAuditLogs(ctx.user.id),
      privacyRequests: await getUserPrivacyRequests(ctx.user.id),
    })),
    requestDeletion: protectedProcedure.mutation(async ({ ctx }) => ({ success: await requestAccountDeletion(ctx.user.id) })),
  }),

  quality: router({
    report: protectedProcedure
      .input(z.object({ documentId: z.number(), issue: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const document = await getDocumentById(input.documentId, ctx.user.id);
        if (!document) throw new Error("Documento no encontrado o no pertenece al usuario");
        const reportId = await createQualityReport(ctx.user.id, input.documentId, input.issue.slice(0, 4000));
        return { success: true, reportId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      return await getQualityReports();
    }),
  }),
});

export type AppRouter = typeof appRouter;
