import React, { useState } from 'react';
import { Check, X, Leaf, BarChart3, Droplet, Recycle, FileText, Users, TrendingUp, Send } from 'lucide-react';

export default function AmbientAppLanding() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    telefono: '',
    mensaje: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    // Crear el mailto con los datos del formulario
    const subject = encodeURIComponent(`Solicitud de Demo - ${formData.empresa}`);
    const body = encodeURIComponent(
      `Nombre: ${formData.nombre}\n` +
      `Email: ${formData.email}\n` +
      `Empresa: ${formData.empresa}\n` +
      `Teléfono: ${formData.telefono || 'No proporcionado'}\n\n` +
      `Mensaje:\n${formData.mensaje || 'Sin mensaje adicional'}`
    );

    // Cambia este email por el tuyo
    const mailtoLink = `mailto:ambientapp@mellamowalter.cl?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
      setFormStatus('success');
      setFormData({ nombre: '', email: '', empresa: '', telefono: '', mensaje: '' });
      setTimeout(() => setFormStatus(''), 5000);
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const plans = [
    {
      name: 'Free',
      price: 'Gratis',
      description: 'Perfecto para empezar',
      features: [
        { text: '1 Usuario', included: true },
        { text: '3 Evaluaciones / mes', included: true },
        { text: 'Indicadores Básicos', included: true },
        { text: 'PDF con Marca de Agua', included: true },
        { text: 'Recomendaciones Básicas', included: true },
        { text: 'Multiempresa', included: false },
        { text: 'Exportaciones CSV', included: false },
        { text: 'Panel Histórico', included: false }
      ],
      cta: 'Comenzar Gratis',
      highlighted: false
    },
    {
      name: 'Pro',
      price: 'Consultar',
      description: 'Para equipos profesionales',
      features: [
        { text: '5 Usuarios', included: true },
        { text: '20 Evaluaciones / mes', included: true },
        { text: 'Indicadores Completos', included: true },
        { text: 'PDF Profesional', included: true },
        { text: 'Recomendaciones Completas', included: true },
        { text: 'Multiempresa', included: true },
        { text: 'Exportaciones CSV', included: true },
        { text: 'Panel Histórico', included: true }
      ],
      cta: 'Solicitar Demo',
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8" />
              <span className="text-2xl font-bold">AmbientAPP</span>
            </div>
            <a href="#demo" className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Solicitar Demo
            </a>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Diagnóstico Ambiental Inteligente para tu Empresa
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
            Mide, visualiza y mejora tu desempeño ambiental en minutos. Huella de Carbono, Gestión del Agua y Residuos en una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo" className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition shadow-lg">
              Solicitar Demo Gratuita
            </a>
            <a href="#features" className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition">
              Conocer Más
            </a>
          </div>
        </div>
      </header>

      {/* Problema/Solución */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            ¿Gastando tiempo y dinero en diagnósticos ambientales manuales?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Las consultorías tradicionales son costosas, lentas y entregan informes estáticos que quedan obsoletos rápidamente. Las empresas necesitan visibilidad constante de su impacto ambiental.
          </p>
          <div className="bg-green-100 border-l-4 border-green-600 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              <strong>AmbientAPP automatiza todo el proceso:</strong> Ingresa tus datos, obtén diagnósticos instantáneos con visualizaciones profesionales y recomendaciones personalizadas. Todo en minutos, no semanas.
            </p>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Todo lo que necesitas en una plataforma
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-12 h-12 text-green-600" />,
                title: 'Huella de Carbono',
                description: 'Calcula emisiones según Factores de Emisión Chile 2023. Alcances 1 y 2 con gráficos interactivos.'
              },
              {
                icon: <Droplet className="w-12 h-12 text-blue-600" />,
                title: 'Gestión del Agua',
                description: 'Monitorea consumo hídrico mensual con scores automáticos y KPIs visuales.'
              },
              {
                icon: <Recycle className="w-12 h-12 text-emerald-600" />,
                title: 'Gestión de Residuos + LEY REP',
                description: 'Registro de productos prioritarios, comparaciones y análisis de valorización.'
              },
              {
                icon: <TrendingUp className="w-12 h-12 text-purple-600" />,
                title: 'Visualizaciones Avanzadas',
                description: 'Gráficos radar, donut y series históricas para análisis profundo.'
              },
              {
                icon: <FileText className="w-12 h-12 text-orange-600" />,
                title: 'Informes PDF',
                description: 'Genera reportes profesionales descargables para tus clientes o stakeholders.'
              },
              {
                icon: <Users className="w-12 h-12 text-indigo-600" />,
                title: 'Multiusuario',
                description: 'Gestión de roles: AdminSupremo, EmpresaConsultora y Consultor.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Tan simple como 1, 2, 3
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[
              { step: '01', title: 'Registra tus datos', description: 'Ingresa consumos de combustibles, electricidad, agua y residuos de forma rápida y sencilla.' },
              { step: '02', title: 'Obtén diagnóstico automático', description: 'El sistema calcula emisiones, scores y niveles de desempeño al instante.' },
              { step: '03', title: 'Visualiza y actúa', description: 'Analiza gráficos interactivos, descarga informes PDF y recibe recomendaciones personalizadas.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="bg-green-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Comienza gratis o accede a todas las funcionalidades profesionales
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 ${plan.highlighted
                    ? 'bg-gradient-to-b from-green-600 to-emerald-700 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200'
                  }`}
              >
                {plan.highlighted && (
                  <div className="bg-yellow-400 text-green-900 text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">
                    MÁS POPULAR
                  </div>
                )}
                <h3 className={`text-3xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-800'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-800'}`}>
                    {plan.price}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`w-6 h-6 flex-shrink-0 ${plan.highlighted ? 'text-green-200' : 'text-green-600'}`} />
                      ) : (
                        <X className={`w-6 h-6 flex-shrink-0 ${plan.highlighted ? 'text-green-300' : 'text-gray-400'}`} />
                      )}
                      <span className={feature.included ? '' : 'opacity-50'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#demo"
                  className={`block w-full py-4 rounded-lg font-bold text-center transition ${plan.highlighted
                      ? 'bg-white text-green-600 hover:bg-green-50'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Quién Es */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Diseñado para
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'Consultoras Ambientales',
              description: 'Ofrece diagnósticos profesionales a tus clientes en minutos. Gestiona múltiples empresas desde una sola plataforma.'
            },
            {
              title: 'PYMEs',
              description: 'Mide y mejora tu desempeño ambiental sin necesidad de contratar consultorías costosas.'
            },
            {
              title: 'Equipos de Sostenibilidad',
              description: 'Monitorea indicadores clave, genera reportes históricos y toma decisiones basadas en datos.'
            }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario Demo */}
      <section id="demo" className="bg-gradient-to-r from-green-600 to-emerald-700 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 text-center">
              Solicita una Demo Gratuita
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Descubre cómo AmbientAPP puede transformar tu gestión ambiental
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email corporativo *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="juan@empresa.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Mensaje
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Cuéntanos sobre tus necesidades..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={formStatus === 'sending' || !formData.nombre || !formData.email || !formData.empresa}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {formStatus === 'sending' ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Solicitar Demo
                  </>
                )}
              </button>

              {formStatus === 'success' && (
                <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                  <p className="text-green-800 font-semibold">
                    ¡Gracias! Tu cliente de correo se abrirá para enviar la solicitud.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-white">AmbientAPP</span>
          </div>
          <p className="mb-4">Diagnóstico Ambiental Inteligente para Empresas</p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="#demo" className="hover:text-white transition">
              Contacto
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 AmbientAPP. Creado por @mellamowalter.cl
          </p>
        </div>
      </footer>
    </div>
  );
}