import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PrivacyPanel() {
  const data = trpc.privacy.dataExport.useQuery();
  const deletion = trpc.privacy.requestDeletion.useMutation();
  const [requested, setRequested] = useState(false);
  const exportData = () => {
    if (!data.data) return;
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "belentani-datos-personales.json"; link.click(); URL.revokeObjectURL(url);
  };
  const requestDeletion = async () => {
    if (!window.confirm("Se solicitará la eliminación permanente de tu cuenta y documentos. ¿Continuar?")) return;
    await deletion.mutateAsync(); setRequested(true); toast.success("Solicitud registrada");
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold text-slate-900">Privacidad y tus derechos</h1><p className="mt-2 text-slate-600">Consulta los datos guardados, descarga una copia o solicita la eliminación. Los documentos se archivan al solicitarla y la purga definitiva queda registrada con un plazo de 30 días.</p><Card className="mt-6 p-6"><h2 className="text-xl font-semibold">Datos almacenados</h2>{data.isLoading ? <p className="mt-3 text-slate-500">Cargando…</p> : <pre className="mt-4 max-h-72 overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(data.data?.profile, null, 2)}</pre>}<div className="mt-5 flex flex-wrap gap-3"><Button onClick={exportData} disabled={!data.data}>Descargar mis datos</Button><Button variant="outline" onClick={requestDeletion} disabled={deletion.isPending || requested}>{requested ? "Solicitud enviada" : "Solicitar eliminación"}</Button></div></Card></div></main>;
}
