import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>
        <p className="text-slate-600 mb-8">Última actualización: Julio 2026</p>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">1. Responsable del Tratamiento</h2>
            <p className="text-slate-700 mb-2"><strong>Belentani Studio</strong></p>
            <p className="text-slate-600">Email: legal@belentani.com</p>
            <p className="text-slate-600">Responsable de Protección de Datos (DPO): dpo@belentani.com</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">2. Datos que Recolectamos</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Nombre completo</li>
              <li>Email</li>
              <li>Teléfono (opcional)</li>
              <li>Información del CV (proporcionada por ti)</li>
              <li>Datos de pago (procesados por Stripe, no almacenados localmente)</li>
              <li>Dirección IP y user-agent (para seguridad)</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">3. Base Legal</h2>
            <p className="text-slate-700 mb-4">Tratamos tus datos bajo:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Contrato:</strong> Para prestar el servicio de generación de CVs</li>
              <li><strong>Consentimiento:</strong> Para marketing y cookies analíticas</li>
              <li><strong>Obligación Legal:</strong> Retención de transacciones (6 años)</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">4. Tus Derechos (GDPR)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">Derecho de Acceso</h3>
                <p className="text-slate-700">Puedes descargar TODOS tus datos en JSON desde tu panel.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Derecho de Rectificación</h3>
                <p className="text-slate-700">Edita tu perfil en cualquier momento.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Derecho al Olvido</h3>
                <p className="text-slate-700">Solicita eliminación de todos tus datos. Período de gracia: 30 días (recuperable).</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Derecho de Portabilidad</h3>
                <p className="text-slate-700">Exporta tus datos en formato estándar.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Derecho a Oposición</h3>
                <p className="text-slate-700">Oposición a marketing y perfilado.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">5. Retención de Datos</h2>
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tipo de Dato</th>
                  <th className="text-left py-2">Período</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Perfil de usuario</td>
                  <td>Mientras activo</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">CVs generados</td>
                  <td>Mientras activo + 30 días post-eliminación</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Transacciones</td>
                  <td>6 años (ley fiscal)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Logs de auditoría</td>
                  <td>1 año</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">6. Seguridad</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Encriptación AES-256 en reposo</li>
              <li>HTTPS/TLS 1.3 en tránsito</li>
              <li>Autenticación OAuth 2.0</li>
              <li>Auditoría completa de accesos</li>
              <li>Backups diarios encriptados</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">7. Brechas de Seguridad</h2>
            <p className="text-slate-700">Si ocurre una brecha de seguridad, notificaremos a la Autoridad Catalana de Protección de Datos (AAPD) en máximo 72 horas y te enviaremos un email con detalles.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">8. Cookies</h2>
            <p className="text-slate-700 mb-4">Usamos cookies para:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Necesarias:</strong> Autenticación y seguridad (no requieren consentimiento)</li>
              <li><strong>Analíticas:</strong> Google Analytics (requiere consentimiento)</li>
              <li><strong>Marketing:</strong> Remarketing (requiere consentimiento)</li>
            </ul>
            <p className="text-slate-700 mt-4">Puedes cambiar preferencias de cookies en cualquier momento.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">9. Contacto y Reclamaciones</h2>
            <p className="text-slate-700 mb-4">Para ejercer tus derechos o hacer consultas:</p>
            <p className="text-slate-700 mb-4"><strong>Belentani:</strong> legal@belentani.com</p>
            <p className="text-slate-700"><strong>AAPD (Autoridad Catalana):</strong> aapd@gencat.cat | +34 93 552 06 00</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">10. Cambios en esta Política</h2>
            <p className="text-slate-700">Nos reservamos el derecho de actualizar esta política. Notificaremos cambios significativos por email.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
