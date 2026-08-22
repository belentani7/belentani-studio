import { beforeEach, describe, expect, it, vi } from "vitest";

import { getTranslatedCourse, isSupportedCourseLanguage, SUPPORTED_LANGUAGE_CODES } from "./courseTranslation";

describe("courseTranslation", () => {
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

  it("mantiene el catálogo local estructurado para idiomas preparados sin llamar a proveedores", async () => {
    const catalog = await getTranslatedCourse("en");
    expect(catalog.courses).toHaveLength(3);
    expect(catalog.courses[0].title).toBe("Informática desde cero");
    expect(catalog.courses[0].steps).not.toBeUndefined();
  });
});
