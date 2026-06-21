# agents.archi

**Sovereign Agentic Architecture Registry — Auditoría Forense de Agentes Autónomos**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Live Demo](https://img.shields.io/badge/Demo-live-green?logo=netlify)](https://agents.archi)

> **Live:** [`agents.archi`](https://agents.archi)

---

## Descripción

**agents.archi** es la firma adversarial de [Borja Moskv](https://github.com/borjamoskv). Un registro soberano de arquitectura agéntica que documenta y audita agentes autónomos mediante vectores, anatomía, ledger y pruebas criptográficas encadenadas en una sola operación.

El proyecto expone los patrones de diseño de agentes multi-agente, protocolos CORTEX e infraestructura Industrial Noir AI. Ideal para investigadores, arquitectos de sistemas y desarrolladores interesados en agentes autónomos auditables.

---

## Captura

![agents.archi — Audit Mission Mode](https://github.com/borjamoskv/agents-archi/raw/main/.github/screenshot.png *"agents.archi — Audit Mission Mode"*)

> ✨ *Industrial Noir — Auditoría en tiempo real con registros de trust, ledger y vectores activos.*

---

## Features

- 🔍 **Audit Mission Mode** — Registro de auditoría forense para agentes autónomos
- 🧬 **Anatomía del Agente** — Visualización de vectores, chokepoints y pruebas encadenadas
- 🛡️ **CORTEX Integration** — Backend ledger con pruebas de cumplimiento (C5-REAL, C5-HYBRID)
- 📊 **Trust Ledger** — Sistema de scoring con merkle roots y violation counts
- 🔐 **Badge SVG Generator** — Badges de auditoría generados dinámicamente
- 📩 **Waitlist** — Captura de emails con validación
- 💳 **Stripe Checkout** — Integración de pagos para planes PRO y TEAM
- ⚡ **Telemetría WebSocket** — Puente en tiempo real con M0SKV-10k-RS swarm engine

---

## Stack

| Capa | Tecnología |
|------|-----------|
| **Build** | [Vite](https://vitejs.dev) |
| **Frontend** | Vanilla JS + Vanilla CSS (0 frameworks) |
| **Backend** | Vercel Serverless Functions |
| **Hosting** | [Vercel](https://vercel.com) |
| **Pagos** | [Stripe](https://stripe.com) |
| **Bundles** | JavaScript 48.8% · CSS 34.2% · HTML 17.0% |

---

## Estructura del proyecto

```
agents-archi/
├── api/                      # Vercel Serverless Functions
│   ├── audit-request.js      # Endpoint de auditoría
│   ├── badged.jsv            # Generador de badges SVG
│   ├── create-checkout-session.js  # Stripe checkout
│   ├── verify.js             # Verificación de agentes
│   └── waitlist.js           # Captura waitlist
├── public/                   # Assets estáticos públicos
├── src/
│   ├── assets/               # Imágenes, fuentes
│   ├── components/           # Componentes UI modulares
│   ├── css/                  # Estilos Vanilla CSS
│   ├── data/
│   │   ├── architectTemplate.js
│   │   └── threats.js
│   ├── services/
│   │   ├── cortexApi.js      # CORTEX backend client
│   │   └── telemetry.js      # WebSocket telemetry
│   ├── ui/                   # UI components
│   ├── main.js               # Entry point (pure, zero deps)
│   └── style.css
├── index.html                # Landing page
├── vercel.json               # Vercel config (headers, CSP, rewrites)
├── package.json
├── .gitignore
└── README.md
```

---

## Instalación

```bash
# Clonar el repo
git clone https://github.com/borjamoskv/agents-archi.git
cd agents-archi

# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build
```

### Variables de entorno

Crea un archivo `.env` (o `VITE_TELEMETRY_WS_URL` en Vercel):

| Variable | Descripción |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `PRICE_ID_PRO` | Stripe Price ID para plan PRO |
| `PRICE_ID_TEAM` | Stripe Price ID para plan TEAM |
| `VITE_TELEMETRY_WS_URL` | URL del WebSocket de telemetría (ej: `ws://localhost:8000/ws`) |

> ⚠️ El frontend usa `import.meta.env` (Vite) para las variables del cliente y `process.env` para las serverless functions.

---

## API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/audit-request` | POST | Solicita auditoría forense de un agente |
| `/api/verify` | POST | Verifica estado de cumplimiento de un agente |
| `/api/waitlist` | POST | Registra email en waitlist |
| `/api/create-checkout-session` | POST | Crea sesión de checkout de Stripe |
| `/api/badge` | GET | Genera badge SVG de auditoría |

---

## Nivel de Cumplimiento (Compliance)

El sistema opera en varios modos de realidad según la disponibilidad del backend:

| Modo | Descripción |
|------|-------------|
| **C5-REAL** | Backend CORTEX activo. Auditoría forense completa. |
| **C5-HYBRID** | WebSocket disponible. Telemetría activa, datos sintéticos de respaldo. |
| **C5-SIM** | Sin backend. Datos sintéticos/demo para desarrollo. |

---

## Navegación del sitio

- **Misión** — Overview y vectors activos
- **Panorama** — Vista general del ledger
- **Metodología** — Protocolos de auditoría
- **Portafolio** — Agentes verificados
- **Registro** — Ledger de transacciones
- **Amenazas** — Threat taxonomy
- **Enjambre** — Swarm swarm intelligence
- **Consejo** — Council de auditoría

---

## Contribuir

Las contribuciones son bienvenidas. Para reportar bugs o sugerir features, abre un [issue](https://github.com/borjamoskv/agents-archi/issues).

1. Fork el proyecto
2. Crea tu branch de feature (`git checkout -b feature/algo-increible`)
3. Haz commit (`git commit -m 'feat: add feature'`)
4. Push (`git push origin feature/algo-increible`)
5. Abre un Pull Request

---

## License

[MIT](LICENSE) — © 2026 Borja Moskv

---

<p align="center">
  <sub>Built with 🖤 and ☕ by <a href="https://github.com/borjamoskv">@borjamoskv</a></sub>
</p>


---

```yaml
AESTHETIC:    INDUSTRIAL NOIR 2026 (#0A0A0A / #2B3BE5)
EPISTEMOLOGY: C5-REAL EDG V6 — Error Navigation System
CORE TENET:   Optimize for correction, not certainty. Uncertainty is telemetry, not weakness.
UPDATED:      June 2026 — Falsifiable Memory Infrastructure
```
