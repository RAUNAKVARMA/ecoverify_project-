# EcoVerify

**AI-assisted sustainability verification for everyday products.**

EcoVerify helps consumers cut through greenwashing. Scan a product by photo, barcode, or search and get an instant **Trust Score (0–100)** with claim breakdowns, risk flags, and better alternatives.

🌐 **Live demo:** [ecoverify-live.vercel.app](https://ecoverify-live.vercel.app)

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://ecoverify-live.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## Why EcoVerify

Most shoppers want to buy sustainably, but product claims are hard to verify. EcoVerify turns that into a 30-second check:

| Without EcoVerify | With EcoVerify |
| --- | --- |
| Vague “eco-friendly” labels | Quantified Trust Score (0–100) |
| Manual research across sites | Instant scan via photo / barcode / search |
| No visibility into greenwashing | Risk levels + claim verification cues |
| Hard to compare options | Ranked greener alternatives |

---

## Features

### Consumer
- **Quick Scan** — photo upload (dual-model AI pipeline), barcode entry, or text search
- **Trust Score** — circular score with Low / Medium / High trust labels
- **Score breakdown** — certifications, materials, supply chain, carbon, packaging
- **Greenwashing risk** — low / medium / high flags with clear messaging
- **EcoExplain** — readable explanation of why a product scored the way it did
- **Sensitivity controls** — Strict / Balanced / Lenient scoring adjustments
- **Priority concerns** — plastic, climate, fair trade, animal welfare
- **Alternatives** — higher-trust products with filters (price, category, availability)
- **Scan history** — timeline, saved items, CSV export (demo)
- **Profile & preferences** — language, notifications, offline mode toggle

### Brand
- **Brand Dashboard** — sign-in / register with demo auth
- **Product table** — SKU, trust score, verification status
- **Analytics** — scan volume, score trends, common queries
- **Claims management** — submit claims, update certifications, respond to reports

### Legal & support
- FAQ, Privacy Policy, Terms of Service, Data Usage Policy

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, React Router |
| Build | Vite 8 |
| Styling | Tailwind CSS 4, shadcn-style components |
| Icons | lucide-react |
| Dates | date-fns |
| Hosting | Vercel (SPA + rewrites) |
| Data | Client-side mock catalog + optional LLM API |

Optional live AI (photo / barcode): set `VITE_OPENAI_API_KEY` in `frontend/.env`. Without a key, scans use realistic mock analysis and still match the product database.

---

## Quick start

```bash
git clone https://github.com/RAUNAKVARMA/ecoverify_app.git
cd ecoverify_app/frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |

---

## Demo guide

### Try a scan in seconds
1. Open **Home**
2. Enter product ID `1`–`12` in the barcode field (or paste a sample barcode)
3. Click **Scan** → Product Detail with Trust Score
4. Open **View Better Alternatives**

### Sample products

| ID | Product | Brand | Score | Risk |
| --- | --- | --- | --- | --- |
| 6 | Reusable Water Bottle | HydroEco | 91 | Low |
| 2 | Bamboo Toothbrush Set | EcoSmile | 89 | Low |
| 3 | Green Tea Bottles | PureBrew | 45 | High |
| 7 | Dish Soap Liquid | CleanGreen | 35 | High |
| 11 | Energy Drink | PowerRush | 28 | High |

### Demo accounts

| Role | Credentials |
| --- | --- |
| Consumer (simulated Google) | Use **Sign in with Google** on Home / Profile |
| Brand | `demo@brand.com` / `demo123` |

---

## App routes

| Route | Page |
| --- | --- |
| `/` | Home / Scan |
| `/ProductDetail` | Sustainability analysis |
| `/Alternatives` | Better product suggestions |
| `/History` | Past scans |
| `/Profile` | Settings & stats |
| `/BrandDashboard` | Brand portal |
| `/FAQ` | Help |
| `/Privacy` · `/Terms` · `/DataUsage` | Legal |

---

## Project structure

```text
ecoverify_app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Layout, UI primitives, Home widgets
│   │   ├── components/data/     # Mock products & helpers
│   │   ├── context/             # Auth & preferences
│   │   ├── lib/                 # AI helpers, barcode history, utils
│   │   ├── pages/               # Route pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
├── .github/workflows/           # CI build
├── vercel.json                  # Root Vercel build config
└── README.md
```

---

## Trust Score methodology (prototype)

Scores are composed from weighted signals (max 100):

| Category | Max points |
| --- | --- |
| Certifications | 30 |
| Materials sustainability | 25 |
| Reusability & lifecycle | 20 |
| Supply chain transparency | 15 |
| Packaging | 10 |

User sensitivity can shift displayed scores (±10). Greenwashing risk is derived from unverified or marketing-only claims.

---

## Environment variables

Create `frontend/.env` (optional):

```env
VITE_OPENAI_API_KEY=sk-...
```

Used for:
- Vision classification of uploaded product photos
- Eco-rating analysis
- Barcode format validation

If unset, EcoVerify falls back to mock AI responses.

---

## Deployment

Production is hosted on Vercel:

- **App:** https://ecoverify-live.vercel.app
- **Root directory / build:** Vite app under `frontend/`
- **SPA routing:** `vercel.json` rewrites to `index.html`

CI runs `npm ci` + `npm run build` on push via GitHub Actions.

---

## Roadmap

- [ ] Persist scans to a real backend / database
- [ ] Native barcode camera scanning
- [ ] Broader certification dataset & live claim verification
- [ ] Brand SSO and document verification workflow
- [ ] Mobile app shell

---

## License

This project is provided for portfolio / educational use unless otherwise stated by the author.

---

Built by [RAUNAKVARMA](https://github.com/RAUNAKVARMA) · Live at [ecoverify-live.vercel.app](https://ecoverify-live.vercel.app)
