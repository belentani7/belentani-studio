import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    summary: "",
    experience: [{ company: "", position: "", duration: "", description: "" }],
    education: [{ school: "", degree: "", year: "" }],
    skills: [] as string[],
    location: "",
    photoUrl: "",
  });

  const generateCV = trpc.cv.generate.useMutation();
  const listCVs = trpc.cv.list.useQuery();

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      toast.error("La foto debe ser JPG, PNG o WebP y pesar menos de 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch("/api/cv/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl: reader.result }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error");
        setFormData((current) => ({ ...current, photoUrl: result.url }));
        toast.success("Foto añadida al CV");
      } catch { toast.error("No se pudo subir la foto"); }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCV = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Completa nombre y email");
      return;
    }
    try {
      const result = await generateCV.mutateAsync(formData);
      toast.success("CV generado exitosamente");
      setStep(1);
      listCVs.refetch();
    } catch (error) {
      toast.error("Error generando CV");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Mi Panel - Belentani</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="font-bold mb-4">Mi Perfil</h2>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Nombre:</strong> {user?.name || "Usuario"}
              </p>
              <p className="text-sm text-slate-600 mb-4">
                <strong>Email:</strong> {user?.email || "N/A"}
              </p>
              <Button onClick={() => setStep(1)} className="w-full">
                Generar CV
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {step === 1 ? (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Nuevo CV</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Foto (opcional)</label>
                    <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
                    {formData.photoUrl && <p className="text-xs text-green-700 mt-1">Foto lista para incluirse en el PDF</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+34..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciudad o localidad</label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Barcelona, España" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Resumen Profesional</label>
                    <Textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Describe tu experiencia..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Habilidades (separadas por comas)</label>
                    <Input
                      value={formData.skills.join(", ")}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="Python, JavaScript, React..."
                    />
                  </div>
                  <Button onClick={handleGenerateCV} disabled={generateCV.isPending} className="w-full">
                    {generateCV.isPending ? "Generando..." : "Generar CV gratis"}
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* CVs List */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Mis CVs</h2>
              {listCVs.data?.length === 0 ? (
                <Card className="p-6 text-center text-slate-600">
                  No tienes CVs generados aún
                </Card>
              ) : (
                <div className="space-y-4">
                  {listCVs.data?.map((cv) => (
                    <Card key={cv.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{cv.title}</p>
                        <p className="text-sm text-slate-600">{new Date(cv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <a className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50" href={`/api/cv/${cv.id}/pdf`}>Descargar PDF</a>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
