🌱 AmbientAPP – Diagnóstico Ambiental para Empresas

Sistema web para evaluar, visualizar y mejorar el desempeño ambiental de pequeñas y medianas empresas.

⸻

📌 Descripción General

AmbientAPP es una aplicación web desarrollada para realizar un diagnóstico ambiental integral, permitiendo a las empresas medir sus impactos en tres componentes clave:
	•	Huella de Carbono (Alcances 1 y 2)
	•	Gestión del Agua
	•	Gestión de Residuos (incluye Ley REP Chile)

El sistema calcula automáticamente puntajes ambientales, genera visualizaciones (gráficos radar, donut y series históricas) y entrega recomendaciones personalizadas.
Además, incluye integración con la Ley REP, permitiendo comparar la generación de residuos con productos prioritarios declarados.

AmbientAPP está diseñada para consultoras ambientales, empresas asesoradas y equipos de sostenibilidad que necesiten un diagnóstico claro, visual y práctico.

⸻

🚀 Características Principales

🔥 Diagnóstico Ambiental Completo
	•	Cálculo de emisiones según Factores de Emisión Chile 2023 (MMA)
	•	Separación por Alcance 1 (combustibles) y Alcance 2 (electricidad)
	•	Gráfico doughnut interactivo con desglose por combustible
	•	Puntaje total y nivel (Bajo, Básico, Intermedio, Avanzado)

💧 Gestión del Agua
	•	Registro de consumo hídrico mensual
	•	Score automático según rangos de referencia
	•	Indicadores visuales en tarjetas-KPI

♻️ Ley REP – Residuos
	•	Registro de productos prioritarios (por empresa y año)
	•	Comparación “Total residuos vs productos prioritarios”
	•	Gráfico de barras y series históricas (% valorización)
	•	Análisis interpretativo automático

📊 Visualizaciones Avanzadas
	•	Gráfico Radar Ambiental (Carbono / Agua / Residuos)
	•	Tarjetas KPI (emisiones, dependencias, valorización, etc.)
	•	Visualización clara en formato de informe

👤 Gestión de Usuarios
	•	AdminSupremo
	•	EmpresaConsultora
	•	Consultor
Roles con permisos diferenciados para cargar evaluaciones y datos REP.

📄 Exportación PDF
	•	Generación de informe descargable para entregar al cliente
(Próxima etapa: Informe estandarizado PDF)

⸻

🧩 Tecnologías Utilizadas

Frontend
	•	React + Vite
	•	TailwindCSS
	•	Chart.js + chartjs-plugin-datalabels
	•	React Router
	•	Axios

Backend
	•	Node.js + Express
	•	MongoDB + Mongoose
	•	JSON Web Tokens (JWT)

Infraestructura
	•	API REST modular
	•	Arquitectura basada en controladores y modelos
	•	Manejo seguro de autenticación
