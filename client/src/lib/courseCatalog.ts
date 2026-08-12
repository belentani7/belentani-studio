export type CourseLesson = { id: string; title: string; text: string; steps: string[] };

export async function fetchCourseCatalog(language: string, fetcher: typeof fetch = fetch): Promise<CourseLesson[]> {
  const response = await fetcher(`/api/courses/${language}`);
  if (!response.ok) throw new Error("No se pudo cargar el idioma");
  const body = await response.json();
  return Array.isArray(body?.content?.courses) ? body.content.courses as CourseLesson[] : [];
}

export function applyCourseCatalog(fallback: CourseLesson[], translated: unknown): CourseLesson[] {
  if (!Array.isArray(translated) || translated.length !== fallback.length) return fallback;
  const valid = translated.every((item) => item && typeof item.title === "string" && typeof item.text === "string" && Array.isArray(item.steps));
  return valid ? translated as CourseLesson[] : fallback;
}
