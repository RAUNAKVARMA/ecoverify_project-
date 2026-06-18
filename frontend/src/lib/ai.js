/**
 * AI scanning helpers.
 *
 * Photo classification order:
 * 1. On-device CLIP (Transformers.js) — always available offline after first load
 * 2. Backend /api/scan/classify (Ollama / OpenAI / mock) when VITE_API_URL is set
 * 3. Browser OpenAI vision when VITE_OPENAI_API_KEY is set (enrichment)
 * 4. Filename heuristic mock
 */

import { classifyWithLocalModel } from './vision/localClassifier'

function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || ''
}

function getApiBase() {
  // Empty string → same-origin / Vite proxy (/api → backend)
  if (import.meta.env.VITE_API_URL === undefined) return ''
  return String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
}

async function callLLM(messages, { json = true } = {}) {
  const key = getApiKey()
  if (!key) return null

