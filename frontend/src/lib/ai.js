/**
 * AI scanning helpers.
 *
 * Photo classification order:
 * 1. On-device CLIP (Transformers.js) — always available offline after first load
 * 2. Backend /api/scan/classify (Ollama / OpenAI / mock) when VITE_API_URL is set
 * 3. Browser OpenAI vision when VITE_OPENAI_API_KEY is set (enrichment)
 * 4. Filename heuristic mock
 */
