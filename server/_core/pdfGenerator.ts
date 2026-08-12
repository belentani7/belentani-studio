import PDFDocument from "pdfkit";

export type CVPdfData = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{ company: string; position: string; duration: string; description: string }>;
  education: Array<{ school: string; degree: string; year: string }>;
  skills: string[];
  photoUrl?: string;
  photoBuffer?: Buffer;
};

async function loadPhoto(photoUrl?: string): Promise<Buffer | undefined> {
  if (!photoUrl || !photoUrl.startsWith("/manus-storage/")) return undefined;
  const response = await fetch(new URL(photoUrl, "http://localhost"));
  if (!response.ok) return undefined;
  return Buffer.from(await response.arrayBuffer());
}

export async function generateCVPDF(data: CVPdfData): Promise<Buffer> {
    const photo = data.photoBuffer || await loadPhoto(data.photoUrl);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor("#17324d").fontSize(24).font("Helvetica-Bold").text(data.fullName || "Currículum", { continued: false });
    if (photo) {
      try { doc.image(photo, 455, 45, { fit: [92, 92], align: "center", valign: "center" }); } catch { /* foto inválida: se mantiene el CV sin foto */ }
    }
    doc.moveDown(0.25).fillColor("#4b5563").fontSize(10).font("Helvetica").text([data.email, data.phone, data.location].filter(Boolean).join(" · "));
    doc.moveDown(1);

    const section = (title: string) => doc.fillColor("#17324d").fontSize(12).font("Helvetica-Bold").text(title.toUpperCase()).moveDown(0.25);
    if (data.summary) { section("Perfil profesional"); doc.fillColor("#1f2937").fontSize(10).font("Helvetica").text(data.summary, { lineGap: 2 }).moveDown(0.8); }
    if (data.experience?.length) {
      section("Experiencia");
      for (const item of data.experience) {
        doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text(`${item.position} — ${item.company}`);
        doc.fillColor("#6b7280").fontSize(9).font("Helvetica-Oblique").text(item.duration || "");
        doc.fillColor("#1f2937").fontSize(10).font("Helvetica").text(item.description || "", { lineGap: 1 }).moveDown(0.55);
      }
    }
    if (data.education?.length) {
      section("Educación");
      for (const item of data.education) doc.fillColor("#1f2937").fontSize(10).font("Helvetica").text(`${item.degree} — ${item.school} (${item.year})`).moveDown(0.25);
      doc.moveDown(0.45);
    }
    if (data.skills?.length) { section("Competencias"); doc.fillColor("#1f2937").fontSize(10).font("Helvetica").text(data.skills.join(" · ")); }
    doc.end();
  });
}
