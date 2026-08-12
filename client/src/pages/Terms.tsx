import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Términos y Condiciones de Uso</h1>
        <p className="text-slate-600 mb-8">Última actualización: Julio 2026</p>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">1. Objeto y Ámbito</h2>
            <p className="text-slate-700 mb-4">Estos términos regulan el uso de la plataforma <strong>Belentani Studio</strong>, accesible en belentani.com y subdominios asociados, destinada a la creación asistida de currículums y formación digital.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">2. Gratuidad y Donaciones</h2>
            <p className="text-slate-700 mb-4">El servicio de generación de CVs, descarga de PDF, subida de foto y acceso a cursos multiidioma es 100% gratuito. Las aportaciones o donaciones voluntarias son libres, no otorgan privilegios adicionales ni constituyen contraprestación por un servicio comercial.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">3. Responsabilidad del Usuario</h2>
            <p className="text-slate-700 mb-4">El usuario garantiza que los datos introducidos en los formularios de currículum son veraces, exactos y le pertenecen o cuenta con autorización para su tratamiento. Queda prohibido el uso de la plataforma para fines ilícitos, suplantación de identidad o difusión de contenidos maliciosos.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">4. Propiedad Intelectual</h2>
            <p className="text-slate-700 mb-4">Los currículums generados pertenecen íntegramente al usuario que los crea. La estructura de la plataforma, diseño, código fuente y materiales didácticos están protegidos por derechos de propiedad intelectual titularidad de Belentani Studio.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">5. Limitación de Responsabilidad</h2>
            <p className="text-slate-700 mb-4">Belentani ofrece herramientas automatizadas de IA y plantillas orientativas, sin garantizar la obtención de ofertas laborales u entrevistas. La plataforma se proporciona "tal cual" sin garantías de disponibilidad ininterrumpida.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">6. Legislación y Fuero</h2>
            <p className="text-slate-700 mb-4">Cualquier controversia se regirá por la legislación española y europea, sometiéndose expresamente a los juzgados y tribunales de Barcelona, renunciando a cualquier otro fuero.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
