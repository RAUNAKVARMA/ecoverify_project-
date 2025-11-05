# EcoVerify Frontend

Sustainability Trust Score app — React (Vite) + Tailwind + shadcn-style UI.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Optional live AI

Create `frontend/.env`:

```
VITE_OPENAI_API_KEY=sk-...
```

Without a key, photo/barcode flows use realistic mock AI responses and still match the product database.

## Demo credentials

- Consumer Google sign-in: simulated on Home / Profile
- Brand: `demo@brand.com` / `demo123`
