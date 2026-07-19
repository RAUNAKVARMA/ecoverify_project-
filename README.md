# EcoVerify

**Trust scores for everyday products** — scan packaging, see evidence-backed scores, pick better alternatives.

Live: [ecoverify-live.vercel.app](https://ecoverify-live.vercel.app)  
Repo: [github.com/RAUNAKVARMA/ecoverify_project-](https://github.com/RAUNAKVARMA/ecoverify_project-)

---

## 90-second demo path (recruiters)

1. Open **Home** → skip intro (or watch the collage) → **Scan**.
2. **Search** `bamboo` or enter barcode/product ID `6` → land on **Product detail**.
3. Tap **Save**, then **View Better Alternatives**.
4. Open **History** — your scan is persisted on-device; star/export CSV.
5. Open **About** — product story in one scroll.

Brand demo (optional): **Brand** dashboard → `demo@brand.com` / `demo123`.

---

## What’s real vs demo

| Feature | Status |
|--------|--------|
| Scan via photo / barcode / search | Real UI + AI/classify pipeline with graceful fallbacks |
| Catalog match + Trust Score + EcoExplain | Real against local product catalog |
| Scan History | **Persisted in `localStorage`** on this device |
| Alternatives ranking | Real from catalog scores |
| Brand dashboard | Demo auth + demo actions (toasts, not production APIs) |
| On-device vision / Ollama / OpenAI | Optional — mock/heuristic if providers unavailable |

---

## Run locally

```bash
# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173

# Backend (optional, for /api/scan/classify)
cd backend
cp .env.example .env
npm install
npm run db:setup   # if using Postgres
npm run dev
# → http://127.0.0.1:10000
```

Vite proxies `/api` → `10000`. See `frontend/.env.example` and `backend/.env.example`.

---

## Stack

- React + Vite + Tailwind
- Express + Prisma (optional API)
- Hugging Face Transformers (on-device vision, optional)
- Ollama / OpenAI providers when configured

---

## Project layout

```
frontend/   # EcoVerify SPA
backend/    # Classify API + Prisma
```
