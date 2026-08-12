import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));
vi.mock("./llm", () => ({ invokeLLM: invokeLLMMock }));

import { getTranslatedCourse, isSupportedCourseLanguage, SUPPORTED_LANGUAGE_CODES } from "./courseTranslation";

describe("courseTranslation", () => {
  beforeEach(() => invokeLLMMock.mockReset());

  it("declara exactamente 39 idiomas soportados", () => {
    expect(SUPPORTED_LANGUAGE_CODES).toHaveLength(39);
    expect(isSupportedCourseLanguage("es")).toBe(true);
    expect(isSupportedCourseLanguage("xx")).toBe(false);
  });

  it("sirve el catálogo base completo en español", async () => {
    const catalog = await getTranslatedCourse("es");
    expect(catalog.courses).toHaveLength(3);
    expect(catalog.courses.every((course) => course.title && course.steps.length > 0)).toBe(true);
  });

  it("traduce un idioma no español manteniendo la estructura", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ courses: [
      { id: "computer", title: "Computers from zero", text: "Learn digital basics.", steps: ["Set up a device"] },
      { id: "ai", title: "Practical artificial intelligence", text: "Use AI safely.", steps: ["Write clear instructions"] },
      { id: "cv", title: "CV and job search", text: "Prepare your CV.", steps: ["Organize skills"] },
    ] }) } }] });
    const catalog = await getTranslatedCourse("en");
    expect(invokeLLMMock).toHaveBeenCalledOnce();
    expect(catalog.courses).toHaveLength(3);
    expect(catalog.courses[0].title).toBe("Computers from zero");
    expect(catalog.courses[0].title).not.toBe("Informática desde cero");
  });
});
