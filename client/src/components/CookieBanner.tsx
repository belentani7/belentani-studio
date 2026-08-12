import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(localStorage.getItem("belentani-cookie-consent") !== "1"); }, []);
  if (!visible) return null;
  const accept = () => { localStorage.setItem("belentani-cookie-consent", "1"); setVisible(false); };
  return <aside className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-xl border bg-white p-4 shadow-xl"><p className="text-sm text-slate-700">Usamos únicamente cookies necesarias para iniciar sesión y proteger la plataforma. No activamos analítica ni publicidad sin permiso.</p><div className="mt-3 flex justify-end gap-2"><button className="rounded-md border px-4 py-2 text-sm" onClick={accept}>Aceptar</button></div></aside>;
}
