import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type CorrectionScope = "profile" | "documents" | "other";

export default function PrivacyPanel() {
  const data = trpc.privacy.dataExport.useQuery();
  const deletion = trpc.privacy.requestDeletion.useMutation();
  const correction = trpc.privacy.requestCorrection.useMutation();
  const [requested, setRequested] = useState(false);
  const [correctionScope, setCorrectionScope] = useState<CorrectionScope>("profile");
  const [correctionRequested, setCorrectionRequested] = useState(false);

  const exportData = () => {
    if (!data.data) return;
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "belentani-datos-personales.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const requestDeletion = async () => {
    if (!window.confirm("Se solicitará la eliminación permanente de tu cuenta y documentos. ¿Continuar?")) return;
    const result = await deletion.mutateAsync();
    if (!result.success) {
      toast.error("No se pudo registrar la solicitud. Inténtalo de nuevo.");
      return;
    }
    setRequested(true);
    toast.success("Solicitud registrada");
  };

  const requestCorrection = async () => {
    const result = await correction.mutateAsync({ scope: correctionScope });
    if (!result.success) {
      toast.error("No se pudo registrar la solicitud. Inténtalo de nuevo.");
      return;
    }
    setCorrectionRequested(true);
    toast.success("Solicitud de rectificación registrada");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Privacidad y tus derechos</h1>
          <p className="mt-2 text-slate-600">Consulta los datos guardados, descarga una copia, solicita una rectificación o pide la eliminación. Los documentos se archivan al solicitar la baja y la purga definitiva queda registrada con un plazo de 30 días.</p>
        </header>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Datos almacenados</h2>
          {data.isLoading ? <p className="mt-3 text-slate-500">Cargando…</p> : <pre className="mt-4 max-h-72 overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(data.data?.profile, null, 2)}</pre>}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={exportData} disabled={!data.data}>Descargar mis datos</Button>
            <Button variant="outline" onClick={requestDeletion} disabled={deletion.isPending || requested}>{requested ? "Solicitud enviada" : "Solicitar eliminación"}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Rectificar mis datos</h2>
          <p className="mt-2 text-sm text-slate-600">Indica la categoría que quieres corregir. Para reducir la exposición de datos, esta solicitud no recoge texto ni documentos adicionales.</p>
          <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor="correction-scope">Categoría</label>
          <select id="correction-scope" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900" value={correctionScope} onChange={(event) => setCorrectionScope(event.target.value as CorrectionScope)} disabled={correctionRequested || correction.isPending}>
            <option value="profile">Datos de perfil</option>
            <option value="documents">Datos de documentos</option>
            <option value="other">Otra categoría</option>
          </select>
          <Button className="mt-4" variant="outline" onClick={requestCorrection} disabled={correctionRequested || correction.isPending}>{correctionRequested ? "Solicitud registrada" : "Solicitar rectificación"}</Button>
        </Card>
      </div>
    </main>
  );
}
