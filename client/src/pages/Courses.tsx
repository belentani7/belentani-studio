import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLanguages, getLanguageName } from "@/lib/i18n";
import { applyCourseCatalog, fetchCourseCatalog } from "@/lib/courseCatalog";

type Lesson = { id: string; title: string; text: string; steps: string[] };
const fallback: Lesson[] = [
  { id: "computer", title: "Informática desde cero", text: "Aprende a usar el móvil, el correo electrónico, los archivos, las contraseñas y los trámites digitales en España.", steps: ["Configurar un dispositivo", "Crear un correo y adjuntar documentos", "Reconocer fraudes y proteger tus cuentas"] },
  { id: "ai", title: "Inteligencia artificial práctica", text: "Usa herramientas de IA con criterio para estudiar, traducir, buscar empleo y mejorar textos.", steps: ["Qué puede y qué no puede hacer una IA", "Cómo escribir instrucciones claras", "Privacidad: nunca compartir datos sensibles"] },
  { id: "cv", title: "CV y búsqueda de empleo", text: "Prepara un CV profesional, entiende ofertas y practica una candidatura responsable.", steps: ["Organizar experiencia y habilidades", "Adaptar el CV a una oferta", "Revisar el resultado antes de enviarlo"] },
];

export default function Courses() {
  const languages = useMemo(() => getLanguages(), []);
  const [language, setLanguage] = useState("es");
  const [lessons, setLessons] = useState<Lesson[]>(fallback);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourseCatalog(language).then((translated) => { if (active) setLessons(applyCourseCatalog(fallback, translated)); }).catch(() => { if (active) setLessons(fallback); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language]);

  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-5xl">
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="font-semibold text-blue-700">Belentani · Aprende gratis</p><h1 className="text-4xl font-bold text-slate-900">Material para avanzar en España</h1><p className="mt-2 max-w-2xl text-slate-600">Lecciones sencillas para personas inmigrantes con pocos recursos. Elige tu idioma y aprende a tu ritmo.</p></div><label className="text-sm font-medium text-slate-700">Idioma<select className="mt-1 block rounded-md border bg-white px-3 py-2" value={language} onChange={(e) => setLanguage(e.target.value)}>{Object.keys(languages).map((code) => <option key={code} value={code}>{getLanguageName(code)}</option>)}</select></label></div>
    {loading && <p className="mb-4 text-sm text-slate-500">Preparando el material en {getLanguageName(language)}…</p>}
    <div className="grid gap-5 md:grid-cols-3">{lessons.map((lesson) => <Card key={lesson.id} className="flex flex-col p-6"><h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{lesson.text}</p><Button className="mt-5" onClick={() => setOpen(open === lesson.id ? null : lesson.id)}>{open === lesson.id ? "Cerrar lección" : "Ver lección"}</Button>{open === lesson.id && <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol>}</Card>)}</div>
  </div></main>;
}
