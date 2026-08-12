import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, FileText, Zap, Lock, BarChart3, Download } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const donation = trpc.donation.createCheckout.useMutation();
  const pricingPlans = [{ name: "Todo gratis", price: "0€", description: "Sin suscripción ni pago obligatorio", credits: "CV + cursos + PDF", features: ["Generación de CV con IA", "PDF descargable", "Foto opcional", "Cursos de informática e IA", "39 idiomas disponibles"], cta: "Crear mi CV", highlighted: true }];
  const handleDonation = async (amount: number) => { const result = await donation.mutateAsync({ amount }); if (result.checkoutUrl) window.open(result.checkoutUrl, "_blank", "noopener,noreferrer"); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">Belentani</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><Button variant="outline">Mi Panel</Button></Link>
            <Link href="/courses"><Button variant="outline">Cursos</Button></Link>
            <a href={getLoginUrl()}><Button>Acceder / Registrarse</Button></a>
          </div>
        </div>
      </nav>

      <section className="flex-1 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">Tu CV Perfecto en Minutos</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">Genera tu CV profesional gratis con inteligencia artificial, aprende informática y mejora tus oportunidades en España. Accesible, con controles de privacidad y pensado para todos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href={getLoginUrl()}><Button size="lg" className="px-8 py-6 text-lg">Comenzar Gratis</Button></a>
          <Link href="/courses"><Button size="lg" variant="outline" className="px-8 py-6 text-lg">Aprender gratis</Button></Link>
        </div>
        <div className="grid grid-cols-3 gap-8 text-center mb-16">
          <div><div className="text-3xl font-bold text-blue-600">0€</div><p className="text-slate-600">CV y cursos gratis</p></div>
          <div><div className="text-3xl font-bold text-blue-600">39</div><p className="text-slate-600">Idiomas disponibles</p></div>
          <div><div className="text-3xl font-bold text-blue-600">GDPR</div><p className="text-slate-600">Privacidad en el diseño</p></div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">¿Por qué elegir Belentani?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-slate-200"><Zap className="w-12 h-12 text-blue-600 mb-4"/><h3 className="text-lg font-semibold mb-2">IA Instantánea</h3><p className="text-slate-600">Crea tu CV optimizado para ATS en minutos.</p></Card>
            <Card className="p-6 border border-slate-200"><Download className="w-12 h-12 text-blue-600 mb-4"/><h3 className="text-lg font-semibold mb-2">PDF con Foto</h3><p className="text-slate-600">Descarga tu documento listo para enviar.</p></Card>
            <Card className="p-6 border border-slate-200"><BarChart3 className="w-12 h-12 text-blue-600 mb-4"/><h3 className="text-lg font-semibold mb-2">Cursos Libres</h3><p className="text-slate-600">Aprende informática e IA en 39 idiomas.</p></Card>
            <Card className="p-6 border border-slate-200"><Lock className="w-12 h-12 text-blue-600 mb-4"/><h3 className="text-lg font-semibold mb-2">Privacidad GDPR</h3><p className="text-slate-600">Controles de acceso, eliminación y exportación.</p></Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-16"><div className="mx-auto max-w-4xl px-4 text-center"><h2 className="text-3xl font-bold text-slate-900">Proyecto abierto y transparente</h2><p className="mt-3 text-slate-600">No cobramos por crear ni descargar tu CV. Si puedes y quieres apoyar el proyecto educativo, puedes hacer una donación voluntaria.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={() => handleDonation(3)} disabled={donation.isPending}>Apoyar con 3€</Button><Button variant="outline" onClick={() => handleDonation(5)} disabled={donation.isPending}>Apoyar con 5€</Button><Link href="/courses"><Button>Ver cursos gratis</Button></Link></div></div></section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">Belentani</span>
              </div>
              <p className="text-sm text-slate-400">Plataforma educativa y de CVs gratuita para impulsar la inserción laboral y digital en España y la Unión Europea.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Legal y Privacidad</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/privacy-panel" className="hover:text-white transition-colors">Panel GDPR (DSAR)</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Educación</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-white transition-colors">Cursos en 39 idiomas</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Generar CV con IA</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Contacto</h3>
              <p className="text-sm">Soporte y dudas:<br/><span className="text-slate-200">soporte@belentani.com</span></p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Belentani. Todos los derechos reservados. Cumplimiento estricto RGPD España / UE / Cataluña.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
