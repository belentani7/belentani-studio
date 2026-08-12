import { describe, expect, it } from "vitest";
import { applyCourseCatalog, fetchCourseCatalog, type CourseLesson } from "./courseCatalog";

describe("applyCourseCatalog", () => {
  it("reemplaza el contenido cuando llega una traducción completa", () => {
    const fallback: CourseLesson[] = [{ id: "one", title: "Español", text: "Texto", steps: ["Paso"] }];
    const translated = [{ id: "one", title: "English", text: "Text", steps: ["Step"] }];
    expect(applyCourseCatalog(fallback, translated)[0].title).toBe("English");
  });

  it("carga el catálogo traducido del endpoint y cambia el contenido", async () => {
    let requestedUrl = "";
    const fetcher = async (url: string) => { requestedUrl = url; return ({ ok: true, json: async () => ({ content: { courses: [{ id: "one", title: "English", text: "Text", steps: ["Step"] }] } }) }) as Response; };
    const fallback: CourseLesson[] = [{ id: "one", title: "Español", text: "Texto", steps: ["Paso"] }];
    const translated = await fetchCourseCatalog("en", fetcher);
    expect(requestedUrl).toBe("/api/courses/en");
    expect(applyCourseCatalog(fallback, translated)[0].title).toBe("English");
  });

  it("mantiene el fallback si la respuesta no es válida", () => {
    const fallback: CourseLesson[] = [{ id: "one", title: "Español", text: "Texto", steps: ["Paso"] }];
    expect(applyCourseCatalog(fallback, [])).toBe(fallback);
  });
});
