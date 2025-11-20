export default function AcercaDe() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-slate-800 leading-relaxed">

      <h1 className="text-3xl font-bold mb-6">Acerca de AmbientAPP</h1>

      <p className="mb-4">
        AmbientAPP es una herramienta diseñada para emprendedores, pymes, técnicos
        y consultores que necesitan evaluar de forma rápida e inicial el desempeño
        ambiental de una organización.
      </p>

      <p className="mb-4">
        Su propósito es ofrecer una evaluación simple, educativa y orientada
        a decisiones preliminares, sin reemplazar inventarios oficiales ni
        asesorías profesionales especializadas.
      </p>

      {/* --------------------------------------------------------- */}
      {/* ¿Qué evalúa AmbientAPP? */}
      {/* --------------------------------------------------------- */}
      <h2 className="text-2xl font-bold mt-10 mb-4">¿Qué evalúa AmbientAPP?</h2>

      <ul className="list-disc ml-6 mb-6 space-y-1">
        <li>Huella de carbono organizacional (estimación rápida de Alcance 1 y 2).</li>
        <li>Consumo hídrico y eficiencia básica.</li>
        <li>Gestión de residuos y cumplimiento inicial Ley REP.</li>
      </ul>

      <p className="mb-6">
        Las estimaciones se realizan utilizando factores públicos,
        lineamientos técnicos y promedios simplificados para fines educativos.
        Los valores <b> NO representan inventarios certificados</b> ni cumplen requisitos de reportabilidad para estándares como ISO 14064,
        GHG Protocol o certificaciones ESG.
      </p>

      {/* --------------------------------------------------------- */}
      {/* Metodología */}
      {/* --------------------------------------------------------- */}
      <h2 className="text-2xl font-bold mt-12 mb-4">Metodología utilizada</h2>

      <p className="mb-4">
        Para estimar el desempeño ambiental, AmbientAPP aplica una fórmula compuesta
        basada en tres dimensiones principales:
      </p>

      <ol className="list-decimal ml-6 space-y-2 mb-6">
        <li>
          <strong>Huella de Carbono (Alcance 1 y 2):</strong>
          <ul className="list-disc ml-6 mt-1 text-sm text-slate-700">
            <li>IPCC (Panel Intergubernamental de Cambio Climático)</li>
            <li>Herramientas públicas del Ministerio del Medio Ambiente (Chile)</li>
            <li>Factores promedio internacionales para combustibles líquidos</li>
          </ul>
        </li>

        <li>
          <strong>Huella Hídrica:</strong>  
          Estimación del consumo anual y clasificación según intensidad por tipo de actividad.
        </li>

        <li>
          <strong>Gestión de Residuos:</strong>  
          Proporción entre residuos generados y valorizados, integrando conceptos de
          economía circular y Ley REP.
        </li>
      </ol>

      <p className="mb-6">
        Cada dimensión se transforma a una escala de 0 a 33 puntos y luego se normaliza para
        obtener un puntaje final entre 0 y 100.
      </p>

      {/* --------------------------------------------------------- */}
      {/* Escala */}
      {/* --------------------------------------------------------- */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Escala de evaluación</h2>

      <p className="mb-6">
        AmbientAPP clasifica el desempeño ambiental en cuatro niveles:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">

        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-center">
          <h3 className="font-bold text-red-700">Nivel 1</h3>
          <p className="text-sm text-red-600">0 – 29 pts</p>
          <p className="text-xs mt-1 text-red-700">Bajo</p>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-center">
          <h3 className="font-bold text-rose-700">Nivel 2</h3>
          <p className="text-sm text-rose-600">30 – 59 pts</p>
          <p className="text-xs mt-1 text-rose-700">Básico</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-center">
          <h3 className="font-bold text-amber-700">Nivel 3</h3>
          <p className="text-sm text-amber-600">60 – 79 pts</p>
          <p className="text-xs mt-1 text-amber-700">Intermedio</p>
        </div>

        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50 text-center">
          <h3 className="font-bold text-sky-700">Nivel 4</h3>
          <p className="text-sm text-sky-600">80 – 100 pts</p>
          <p className="text-xs mt-1 text-sky-700">Avanzado</p>
        </div>

      </div>

      {/* Detalle de niveles */}
      <div className="space-y-6">

        <div>
          <h3 className="font-bold text-red-700">Nivel 1 — Bajo (0–29 pts)</h3>
          <p>
            La empresa presenta brechas mayores. No existen mediciones, los registros son mínimos
            y la gestión ambiental depende de la reacción ante incidentes.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-rose-700">Nivel 2 — Básico (30–59 pts)</h3>
          <p>
            Existen prácticas iniciales, algunas mediciones parciales y ciertos protocolos.
            La empresa reconoce su impacto, pero aún no cuenta con una estrategia integral.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-amber-700">Nivel 3 — Intermedio (60–79 pts)</h3>
          <p>
            Hay procesos formales, registros periódicos, cumplimiento legal adecuado
            e iniciativas de mejora ambiental. La gestión es proactiva.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sky-700">Nivel 4 — Avanzado (80–100 pts)</h3>
          <p>
            La sostenibilidad está integrada en la estrategia, con métricas avanzadas,
            monitoreo continuo, metas de reducción y una cultura ambiental consolidada.
          </p>
        </div>

      </div>

      {/* --------------------------------------------------------- */}
      {/* Aviso Importante */}
      {/* --------------------------------------------------------- */}
      <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <strong>Aviso importante:</strong>  
        AmbientAPP <u>no sustituye</u> inventarios oficiales de gases de efecto invernadero,
        reportes ESG, diagnósticos normativos ni auditorías ambientales.
        Su propósito es educativo y orientado a toma de decisiones preliminares.
      </div>

      {/* --------------------------------------------------------- */}
      {/* Footer */}
      {/* --------------------------------------------------------- */}
      <p className="mt-10 text-center text-sm text-slate-500">
        Desarrollado por @mellamowalter.cl — 2025.
      </p>

    </div>
  );
}