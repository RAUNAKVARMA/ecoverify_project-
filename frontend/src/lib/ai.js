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

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      response_format: json ? { type: 'json_object' } : undefined,
    }),
  })

  if (!res.ok) throw new Error(`LLM request failed (${res.status})`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  return json ? JSON.parse(content) : content
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function classifyViaBackend(file, onStage) {
  // Prefer explicit API URL; otherwise try same-origin proxy (dev)
  const base = getApiBase()
  const url = `${base}/api/scan/classify`

  onStage?.('Checking EcoVerify vision API…')
  const form = new FormData()
  form.append('image', file)

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    // Soft-fail when backend isn't running
    if (res.status === 404 || res.status === 502 || res.status === 504) return null
    const text = await res.text().catch(() => '')
    throw new Error(text || `Vision API failed (${res.status})`)
  }

  return res.json()
}

async function enrichWithOpenAIVision(file, localResult, onStage) {
  const key = getApiKey()
  if (!key) return null

  onStage?.('Refining classification with cloud vision…')
  const dataUrl = await fileToDataUrl(file)

  const live = await callLLM([
    {
      role: 'system',
      content:
        'You are a product vision classifier for EcoVerify. Return JSON with: product_name, product_type, brand, category, primary_materials, secondary_materials, certifications (array), sustainability_claims (array), reusability, packaging_type, confidence (0-100). Prefer matching this local hint when plausible: ' +
        JSON.stringify({
          product_name: localResult?.product_name,
          brand: localResult?.brand,
          category: localResult?.category,
          detected_product_id: localResult?.detected_product_id,
        }),
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Identify this product for sustainability analysis.' },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ]).catch(() => null)

  if (!live) return null
  return {
    ...localResult,
    ...live,
    detected_product_id: live.detected_product_id || localResult?.detected_product_id || null,
