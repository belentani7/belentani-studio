import { invokeLLM } from "./llm";

export const SUPPORTED_LANGUAGE_CODES = ["es", "en", "ca", "pt", "fr", "de", "it", "pl", "ro", "ar", "zh", "ja", "ko", "hi", "bn", "ru", "uk", "tr", "vi", "th", "id", "ms", "tl", "fa", "ur", "sw", "am", "so", "ne", "ta", "te", "ml", "kn", "gu", "mr", "bg", "cs", "hu", "el"] as const;
export type CourseLanguage = typeof SUPPORTED_LANGUAGE_CODES[number];
export type CourseContent = { id: string; title: string; text: string; steps: string[] };
export type CourseCatalog = { courses: CourseContent[] };

const base: CourseCatalog = { courses: [
  { id: "computer", title: "Informática desde cero", text: "Aprende a usar el móvil, el correo electrónico, los archivos, las contraseñas y los trámites digitales en España.", steps: ["Configurar un dispositivo", "Crear un correo y adjuntar documentos", "Reconocer fraudes y proteger tus cuentas"] },
  { id: "ai", title: "Inteligencia artificial práctica", text: "Usa herramientas de IA con criterio para estudiar, traducir, buscar empleo y mejorar textos.", steps: ["Qué puede y qué no puede hacer una IA", "Cómo escribir instrucciones claras", "Privacidad: nunca compartir datos sensibles"] },
  { id: "cv", title: "CV y búsqueda de empleo", text: "Prepara un CV profesional, entiende ofertas y practica una candidatura responsable.", steps: ["Organizar experiencia y habilidades", "Adaptar el CV a una oferta", "Revisar el resultado antes de enviarlo"] },
] };
const cache = new Map<CourseLanguage, CourseCatalog>([["es", base]]);

export function isSupportedCourseLanguage(value: string): value is CourseLanguage { return (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(value); }

export async function getTranslatedCourse(language: CourseLanguage): Promise<CourseCatalog> {
  const cached = cache.get(language);
  if (cached) return cached;
  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "Eres traductor educativo. Traduce todos los cursos sin añadir información, con lenguaje sencillo para personas adultas que aprenden informática. Devuelve solo JSON válido." },
      { role: "user", content: JSON.stringify({ language, catalog: base }) },
    ],
    reasoning: { effort: "minimal" },
    response_format: { type: "json_schema", json_schema: { name: "course_catalog_translation", strict: true, schema: { type: "object", properties: { courses: { type: "array", items: { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, text: { type: "string" }, steps: { type: "array", items: { type: "string" } } }, required: ["id", "title", "text", "steps"], additionalProperties: false } } }, required: ["courses"], additionalProperties: false } } },
  });
  const raw = response.choices?.[0]?.message?.content;
  const translated = JSON.parse(typeof raw === "string" ? raw : "{}");
  if (!Array.isArray(translated.courses) || translated.courses.length !== base.courses.length) throw new Error("Traducción inválida");
  const result = { courses: translated.courses.map((course: CourseContent, index: number) => ({ id: base.courses[index].id, title: String(course.title), text: String(course.text), steps: Array.isArray(course.steps) ? course.steps.slice(0, 5).map(String) : base.courses[index].steps })) };
  cache.set(language, result);
  return result;
}
