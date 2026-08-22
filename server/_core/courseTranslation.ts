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
  // El catálogo base no necesita proveedor externo. Las traducciones asistidas
  // se incorporarán solo cuando haya contenidos revisados o un proveedor opcional.
  const result = { courses: base.courses.map((course) => ({ ...course, steps: [...course.steps] })) };
  cache.set(language, result);
  return result;
}
