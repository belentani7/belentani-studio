import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Download, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Experience = { company: string; position: string; duration: string; description: string };
type Education = { school: string; degree: string; year: string };
type CVForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  photoUrl: string;
};

const emptyExperience = (): Experience => ({ company: "", position: "", duration: "", description: "" });
const emptyEducation = (): Education => ({ school: "", degree: "", year: "" });
const steps = ["Datos", "Experiencia", "Formación", "Revisión"];

export default function Dashboard() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [skillsText, setSkillsText] = useState("");
  const [formData, setFormData] = useState<CVForm>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [emptyExperience()],
    education: [emptyEducation()],
    skills: [],
    photoUrl: "",
  });
  const generateCV = trpc.cv.generate.useMutation();
  const listCVs = trpc.cv.list.useQuery();

  useEffect(() => {
    if (user?.email && !formData.email) setFormData((current) => ({ ...current, email: user.email ?? "" }));
  }, [user?.email, formData.email]);

  const completedSections = useMemo(() => ({
    personal: Boolean(formData.fullName.trim() && formData.email.trim()),
    experience: formData.experience.some((item) => item.company.trim() || item.position.trim() || item.description.trim()),
    education: formData.education.some((item) => item.school.trim() || item.degree.trim()),
    skills: formData.skills.length > 0,
  }), [formData]);

  const updateForm = <K extends keyof CVForm>(key: K, value: CVForm[K]) => setFormData((current) => ({ ...current, [key]: value }));
  const updateExperience = (index: number, key: keyof Experience, value: string) => {
    setFormData((current) => ({ ...current, experience: current.experience.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  };
  const updateEducation = (index: number, key: keyof Education, value: string) => {
    setFormData((current) => ({ ...current, education: current.education.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  };

  const goNext = () => {
    if (step === 0 && !completedSections.personal) {
      toast.error("Escribe tu nombre y un email válido para continuar");
      return;
    }
    if (step === 2) updateForm("skills", skillsText.split(",").map((item) => item.trim()).filter(Boolean));
    setStep((current) => Math.min(3, current + 1));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("La foto debe ser JPG, PNG o WebP y pesar menos de 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch("/api/cv/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl: reader.result }) });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") throw new Error("Upload rechazado");
        updateForm("photoUrl", result.url);
        toast.success("Foto validada y lista para el PDF");
      } catch {
        toast.error("No se pudo subir la foto");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCV = async () => {
    if (!completedSections.personal) {
      toast.error("Faltan los datos personales obligatorios");
      setStep(0);
      return;
    }
    const payload = {
      ...formData,
      skills: skillsText.split(",").map((item) => item.trim()).filter(Boolean),
      experience: formData.experience.filter((item) => item.company.trim() || item.position.trim() || item.description.trim()),
      education: formData.education.filter((item) => item.school.trim() || item.degree.trim() || item.year.trim()),
    };
    try {
      await generateCV.mutateAsync(payload);
      toast.success("CV generado gratis en modo local. Ya puedes descargarlo desde Mis CVs");
      setStep(0);
      await listCVs.refetch();
    } catch {
      toast.error("No se pudo generar el CV. Revisa los campos e inténtalo de nuevo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-semibold text-blue-700">Belentani · Herramienta gratuita</p><h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Crea tu CV paso a paso</h1></div>
          <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm"><strong>{user?.name || "Tu cuenta"}</strong><span className="ml-2 text-slate-500">{user?.email || ""}</span></div>
        </header>

        <div className="mb-8 grid grid-cols-4 gap-2" aria-label="Progreso del formulario">
          {steps.map((label, index) => <button key={label} type="button" onClick={() => index <= step && setStep(index)} className={`rounded-lg px-2 py-3 text-xs font-semibold transition md:text-sm ${index === step ? "bg-blue-700 text-white" : index < step ? "bg-blue-100 text-blue-800" : "bg-white text-slate-500"}`}><span className="mr-1">{index < step ? "✓" : index + 1}</span>{label}</button>)}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <Card className="p-5 md:p-8">
            {step === 0 && <section className="space-y-5"><div><h2 className="text-2xl font-bold">Datos personales</h2><p className="mt-1 text-sm text-slate-600">Usa tus datos reales. El modo gratuito organiza tu CV con reglas locales y nunca inventa experiencia.</p></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Nombre completo<Input value={formData.fullName} maxLength={120} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Ej.: Ana López García" /></label><label className="text-sm font-medium">Email<Input type="email" value={formData.email} maxLength={320} onChange={(e) => updateForm("email", e.target.value)} placeholder="tu@email.com" /></label><label className="text-sm font-medium">Teléfono (opcional)<Input value={formData.phone} maxLength={40} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+34 600 000 000" /></label><label className="text-sm font-medium">Ciudad o localidad<Input value={formData.location} maxLength={160} onChange={(e) => updateForm("location", e.target.value)} placeholder="Barcelona" /></label></div><label className="block text-sm font-medium">Resumen profesional<Textarea value={formData.summary} maxLength={2500} onChange={(e) => updateForm("summary", e.target.value)} placeholder="Cuéntanos brevemente qué sabes hacer y qué trabajo buscas..." /></label><label className="block text-sm font-medium">Foto (opcional)<div className="mt-2 flex items-center gap-3"><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} /><Upload className="h-5 w-5 text-blue-700" /></div><span className="mt-1 block text-xs text-slate-500">Máximo 5 MB. Se valida y se incorpora al PDF.</span>{formData.photoUrl && <span className="mt-1 block text-xs font-semibold text-green-700">Foto lista</span>}</label></section>}

            {step === 1 && <section className="space-y-5"><div><h2 className="text-2xl font-bold">Experiencia laboral</h2><p className="mt-1 text-sm text-slate-600">Añade los trabajos más relevantes. Puedes dejar esta sección vacía si aún no tienes experiencia.</p></div>{formData.experience.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><span className="font-semibold">Experiencia {index + 1}</span>{formData.experience.length > 1 && <Button variant="ghost" size="sm" onClick={() => updateForm("experience", formData.experience.filter((_, i) => i !== index))}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button>}</div><div className="grid gap-3 md:grid-cols-2"><Input aria-label="Empresa" value={item.company} maxLength={160} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Empresa" /><Input aria-label="Puesto" value={item.position} maxLength={160} onChange={(e) => updateExperience(index, "position", e.target.value)} placeholder="Puesto" /><Input aria-label="Duración" value={item.duration} maxLength={80} onChange={(e) => updateExperience(index, "duration", e.target.value)} placeholder="Duración: 2022-2024" /><Textarea aria-label="Descripción" value={item.description} maxLength={1800} onChange={(e) => updateExperience(index, "description", e.target.value)} placeholder="Funciones y logros principales" /></div></div>)}<Button variant="outline" onClick={() => formData.experience.length < 12 && updateForm("experience", [...formData.experience, emptyExperience()])}><Plus className="mr-2 h-4 w-4" />Añadir experiencia</Button></section>}

            {step === 2 && <section className="space-y-5"><div><h2 className="text-2xl font-bold">Formación y habilidades</h2><p className="mt-1 text-sm text-slate-600">Indica estudios, cursos y capacidades que puedas demostrar.</p></div>{formData.education.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><span className="font-semibold">Formación {index + 1}</span>{formData.education.length > 1 && <Button variant="ghost" size="sm" onClick={() => updateForm("education", formData.education.filter((_, i) => i !== index))}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button>}</div><div className="grid gap-3 md:grid-cols-3"><Input aria-label="Centro" value={item.school} maxLength={160} onChange={(e) => updateEducation(index, "school", e.target.value)} placeholder="Centro o institución" /><Input aria-label="Título" value={item.degree} maxLength={160} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Título o curso" /><Input aria-label="Año" value={item.year} maxLength={40} onChange={(e) => updateEducation(index, "year", e.target.value)} placeholder="Año" /></div></div>)}<div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => formData.education.length < 8 && updateForm("education", [...formData.education, emptyEducation()])}><Plus className="mr-2 h-4 w-4" />Añadir formación</Button></div><label className="block text-sm font-medium">Habilidades separadas por comas<Textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Atención al cliente, limpieza, cocina, Excel..." /></label></section>}

            {step === 3 && <section className="space-y-5"><div><h2 className="text-2xl font-bold">Revisa antes de generar</h2><p className="mt-1 text-sm text-slate-600">El modo local gratuito organizará tus datos. Nunca inventa experiencia ni requiere un proveedor de IA.</p></div><div className="rounded-xl bg-slate-50 p-5"><h3 className="text-xl font-bold">{formData.fullName || "Tu nombre"}</h3><p className="text-sm text-slate-600">{[formData.email, formData.phone, formData.location].filter(Boolean).join(" · ")}</p><p className="mt-4 whitespace-pre-wrap text-sm">{formData.summary || "Sin resumen profesional."}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="font-semibold">Experiencia</h4><p className="text-sm text-slate-600">{formData.experience.filter((item) => item.company || item.position || item.description).length || 0} registros</p></div><div><h4 className="font-semibold">Formación</h4><p className="text-sm text-slate-600">{formData.education.filter((item) => item.school || item.degree || item.year).length || 0} registros</p></div></div><div className="mt-4"><h4 className="font-semibold">Habilidades</h4><p className="text-sm text-slate-600">{skillsText || "Añade alguna habilidad si tienes."}</p></div></div><Button className="w-full" onClick={handleGenerateCV} disabled={generateCV.isPending}>{generateCV.isPending ? "Preparando tu CV..." : "Generar CV y guardarlo"}</Button></section>}

            {step < 3 && <div className="mt-8 flex justify-between"><Button variant="outline" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft className="mr-2 h-4 w-4" />Atrás</Button><Button onClick={goNext}>Continuar<ArrowRight className="ml-2 h-4 w-4" /></Button></div>}
            {step === 3 && <Button variant="outline" className="mt-5" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />Editar datos</Button>}
          </Card>

          <aside className="space-y-4"><Card className="p-5"><h2 className="font-bold">Tu progreso</h2><div className="mt-4 space-y-3 text-sm"><p className={completedSections.personal ? "text-green-700" : "text-slate-500"}><Check className="mr-2 inline h-4 w-4" />Datos personales</p><p className={completedSections.experience ? "text-green-700" : "text-slate-500"}><Check className="mr-2 inline h-4 w-4" />Experiencia laboral</p><p className={completedSections.education ? "text-green-700" : "text-slate-500"}><Check className="mr-2 inline h-4 w-4" />Formación</p><p className={completedSections.skills ? "text-green-700" : "text-slate-500"}><Check className="mr-2 inline h-4 w-4" />Habilidades</p></div></Card><Card className="p-5"><h2 className="font-bold">Privacidad</h2><p className="mt-2 text-sm text-slate-600">Tus datos se usan para crear tu CV y se guardan en tu cuenta. Puedes exportarlos o solicitar su eliminación desde el panel de privacidad.</p></Card></aside>
        </div>

        <section className="mt-10"><h2 className="mb-4 text-2xl font-bold">Mis CVs</h2>{listCVs.isLoading ? <Card className="p-6 text-slate-600">Cargando tus documentos...</Card> : listCVs.data?.length === 0 ? <Card className="p-6 text-slate-600">Todavía no tienes CVs generados.</Card> : <div className="grid gap-4 md:grid-cols-2">{listCVs.data?.map((cv) => <Card key={cv.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-bold">{cv.title}</p><p className="text-sm text-slate-600">{new Date(cv.createdAt).toLocaleDateString()}</p></div><a className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50" href={`/api/cv/${cv.id}/pdf`}><Download className="mr-2 h-4 w-4" />PDF</a></Card>)}</div>}</section>
      </div>
    </div>
  );
}
