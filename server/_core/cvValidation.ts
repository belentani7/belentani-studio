import { z } from "zod";

const invisibleOrControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E]/g;
const htmlLikeTag = /<[^>]*>/g;

export function sanitizeInlineText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(invisibleOrControlCharacters, " ")
    .replace(htmlLikeTag, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(invisibleOrControlCharacters, " ")
    .replace(htmlLikeTag, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const inlineText = (min: number, max: number) => z.string().transform(sanitizeInlineText).pipe(z.string().min(min).max(max));
const optionalInlineText = (max: number) => z.string().optional().transform((value) => sanitizeInlineText(value ?? "")).pipe(z.string().max(max));
const optionalMultilineText = (max: number) => z.string().optional().transform((value) => sanitizeMultilineText(value ?? "")).pipe(z.string().max(max));
const phoneText = z.string().transform(sanitizeInlineText).pipe(z.string().min(3).max(40).regex(/^[0-9+().\-\s/]*$/)).optional();

const experienceSchema = z.object({
  company: optionalInlineText(160),
  position: optionalInlineText(160),
  duration: optionalInlineText(80),
  description: optionalMultilineText(1800),
}).strict();

const educationSchema = z.object({
  school: optionalInlineText(160),
  degree: optionalInlineText(160),
  year: optionalInlineText(40),
}).strict();

export const CVInputSchema = z.object({
  fullName: inlineText(2, 120),
  email: z.string().transform(sanitizeInlineText).pipe(z.string().email().max(320)),
  phone: phoneText,
  summary: optionalMultilineText(2500),
  experience: z.array(experienceSchema).max(12),
  education: z.array(educationSchema).max(8),
  skills: z.array(inlineText(1, 80)).max(40),
  photoUrl: z.string().regex(/^\/manus-storage\/users\/\d+\/photo_[A-Za-z0-9]+$/).optional(),
  location: optionalInlineText(160),
}).strict().superRefine((value, context) => {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 36_000) {
    context.addIssue({ code: "custom", message: "El CV supera el tamaño máximo permitido" });
  }
});

export type SanitizedCVInput = z.infer<typeof CVInputSchema>;
