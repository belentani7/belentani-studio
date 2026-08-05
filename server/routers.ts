import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserDocuments, createDocument, createQualityReport, getQualityReports } from "./db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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
        fullName: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        summary: z.string().optional(),
        experience: z.array(z.object({ company: z.string(), position: z.string(), duration: z.string(), description: z.string() })),
        education: z.array(z.object({ school: z.string(), degree: z.string(), year: z.string() })),
        skills: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        const cvData = { title: `CV - ${input.fullName}`, content: JSON.stringify(input), keywords: input.skills };
        const docId = await createDocument(ctx.user.id, `CV - ${input.fullName}`, cvData);
        return { success: true, documentId: docId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDocuments(ctx.user.id);
    }),
  }),

  donation: router({
    createCheckout: publicProcedure
      .input(z.object({ amount: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{ price_data: { currency: "eur", product_data: { name: "Donación - Plataforma Educativa", description: "Apoya la educación de inmigrantes en España" }, unit_amount: input.amount * 100 }, quantity: 1 }],
          mode: "payment",
          success_url: `${ctx.req.headers.origin}/dashboard?donation=success`,
          cancel_url: `${ctx.req.headers.origin}/dashboard?donation=cancelled`,
        });
        return { checkoutUrl: session.url };
      }),
  }),

  quality: router({
    report: protectedProcedure
      .input(z.object({ documentId: z.number(), issue: z.string() }))
      .mutation(async ({ ctx, input }) => {
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
