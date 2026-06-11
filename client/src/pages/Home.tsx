import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, FileText, Zap, Lock, BarChart3, Download } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Zap,
      title: "Generación Instantánea",
      description: "Crea tu CV profesional en minutos con inteligencia artificial",
    },
    {
      icon: BarChart3,
      title: "Optimización ATS",
      description: "Análisis de compatibilidad con sistemas de selección automática",
    },
    {
      icon: Download,
      title: "Descarga en PDF",
      description: "Obtén tu CV listo para enviar a cualquier empresa",
    },
    {
      icon: Lock,
      title: "100% Seguro",
      description: "Tus datos están protegidos con encriptación de nivel empresarial",
    },
  ];

  const pricingPlans = [
    {
      name: "Plan Gratuito",
      price: "0€",
      description: "Prueba Belentani sin compromiso",
      credits: "1 CV de prueba",
      features: ["1 CV generado", "Descarga en PDF", "Sin tarjeta de crédito requerida"],
      cta: "Comenzar Gratis",
      highlighted: false,
    },
    {
      name: "1 CV",
      price: "0,99€",
      description: "Perfecto para una candidatura",
      credits: "1 crédito",
      features: ["1 CV generado", "Descarga en PDF", "Análisis ATS básico"],
      cta: "Comprar Ahora",
      highlighted: true,
    },
    {
      name: "5 CVs",
      price: "2,99€",
      description: "Mejor valor para múltiples candidaturas",
      credits: "5 créditos",
      features: ["5 CVs generados", "Descargas en PDF", "Análisis ATS ilimitado"],
      cta: "Comprar Ahora",
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      name: "María García",
      role: "Ingeniera de Software",
      text: "Conseguí 3 entrevistas en una semana usando CVs optimizados de Belentani. ¡Increíble!",
      avatar: "MG",
    },
    {
      name: "Juan López",
      role: "Especialista en Marketing",
      text: "El análisis ATS me mostró exactamente qué palabras clave faltaban. Muy útil.",
      avatar: "JL",
    },
    {
      name: "Ana Martínez",
      role: "Desarrolladora Frontend",
      text: "Por menos de 1€ conseguí un CV profesional. No hay mejor relación calidad-precio.",
      avatar: "AM",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">Belentani</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Mi Panel</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline">Iniciar Sesión</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>Registrarse Gratis</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Tu CV Perfecto en Minutos
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Genera CVs profesionales optimizados para sistemas de selección automática (ATS) con inteligencia artificial. Accesible, seguro y a menos de 1€.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href={getLoginUrl()}>
            <Button size="lg" className="px-8 py-6 text-lg">
              Comenzar Gratis
            </Button>
          </a>
          <a href="#pricing">
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
              Ver Precios
            </Button>
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-8 text-center mb-16">
          <div>
            <div className="text-3xl font-bold text-blue-600">0€</div>
            <p className="text-slate-600">Plan gratuito sin tarjeta</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">0,99€</div>
            <p className="text-slate-600">Por CV profesional</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <p className="text-slate-600">Seguridad GDPR</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            ¿Por qué elegir Belentani?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">
            Precios Accesibles para Todos
          </h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Sin suscripción, sin sorpresas. Paga solo por lo que usas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 border-2 transition-all ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-50 shadow-xl scale-105"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Más Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <p className="text-slate-600 text-sm mt-2">{plan.credits}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={getLoginUrl()} className="block">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-700 italic">\"{ testimonial.text}\"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para tu primer CV?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Únete a miles de usuarios que ya están consiguiendo más entrevistas con Belentani.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Comenzar Gratis Ahora
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">Belentani</span>
              </div>
              <p className="text-sm">CVs profesionales con IA, accesibles para todos.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#pricing" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Características</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white">Términos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:hola@belentani.com" className="hover:text-white">hola@belentani.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Belentani. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
