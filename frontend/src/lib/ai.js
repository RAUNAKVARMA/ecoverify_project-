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
    candidates: localResult?.candidates || [],
    detections: localResult?.detections || [],
    provider: 'openai+local-clip',
    product_detected: live.product_detected ?? localResult?.product_detected ?? true,
  }
}

function mockFromFilename(file) {
  const nameHint = (file.name || '').toLowerCase()
  return {
    product_detected: true,
    product_name: nameHint.includes('bottle')
      ? 'Reusable Water Bottle'
      : nameHint.includes('milk')
        ? 'Organic Milk Tetra Pack'
        : nameHint.includes('honey')
          ? 'Organic Honey'
          : nameHint.includes('brush')
            ? 'Bamboo Toothbrush Set'
            : 'Eco Product',
    product_type: 'consumer_good',
    brand: nameHint.includes('hydro') ? 'HydroEco' : "Nature's Promise",
    category: nameHint.includes('bottle') ? 'Accessories' : 'Food',
    primary_materials: 'mixed materials',
    secondary_materials: 'packaging',
    certifications: ['Unverified visual claim'],
    sustainability_claims: ['Eco-friendly packaging'],
    reusability: 'unknown',
    packaging_type: 'retail packaging',
    confidence: 62,
    detected_product_id: nameHint.includes('bottle')
      ? '6'
      : nameHint.includes('milk')
        ? '1'
        : nameHint.includes('honey')
          ? '8'
          : nameHint.includes('brush')
            ? '2'
            : null,
    candidates: [],
    detections: [],
    provider: 'mock-filename',
    _mock: true,
  }
}

/**
 * Stage 1 — detect + classify the uploaded product image.
 * Primary path: on-device CLIP. Fallbacks only if local model fails.
 */
export async function classifyProductImage(file, onStage) {
  onStage?.('Stage 1 — Vision: detecting and classifying product…')

  // 1) On-device CLIP (built-in)
  try {
    const local = await classifyWithLocalModel(file, onStage)

    // Optional OpenAI refinement when key is present and we have a detection
    if (local?.product_detected !== false && getApiKey()) {
      const enriched = await enrichWithOpenAIVision(file, local, onStage)
      if (enriched) return enriched
    }

    return local
  } catch (err) {
    console.warn('Local CLIP failed, trying server / cloud', err)
    onStage?.('On-device model unavailable — trying server / cloud…')
  }

  // 2) Backend vision API
  try {
    const remote = await classifyViaBackend(file, onStage)
    if (remote?.product_name) {
      return {
        ...remote,
        provider: remote.provider || 'backend',
      }
    }
  } catch (err) {
    console.warn('Backend classify failed', err)
  }

  // 3) Browser OpenAI vision (no local result)
  try {
    onStage?.('Trying cloud vision…')
    const dataUrl = await fileToDataUrl(file)
    const live = await callLLM([
      {
        role: 'system',
        content:
          'You are a product vision classifier for EcoVerify. Return JSON with: product_name, product_type, brand, category, primary_materials, secondary_materials, certifications (array), sustainability_claims (array), reusability, packaging_type, confidence (0-100), product_detected (boolean).',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identify this product for sustainability analysis.' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ])
    if (live) {
      return { ...live, provider: 'openai', candidates: [], detections: [] }
    }
  } catch (err) {
    console.warn('OpenAI vision failed', err)
  }

  // 4) Last-resort mock
  onStage?.('Using fallback classifier…')
  await delay(600)
  return mockFromFilename(file)
}

export async function analyzeEcoRating(classification, onStage) {
  onStage?.('Stage 2 — Eco-Rating Analysis: scoring certifications, materials, lifecycle…')

  const live = await callLLM([
    {
      role: 'system',
      content: `Score product sustainability 0-100. Rubric: Certifications max 30, Materials max 25, Reusability max 20, Supply chain max 15, Packaging max 10. Detect greenwashing. Return JSON: trust_score, sub_scores {certifications, materials, reusability, supply_chain, packaging}, greenwashing_risk (low|medium|high), verified_claims[], unverified_claims[], carbon_footprint_estimate, summary, suggestions[].`,
    },
    { role: 'user', content: JSON.stringify(classification) },
  ]).catch(() => null)

  if (live) return live

  // Heuristic score from classification confidence + materials cues
  await delay(700)
  const text = [
    classification.product_name,
    classification.primary_materials,
    classification.packaging_type,
    classification.reusability,
  ]
    .join(' ')
    .toLowerCase()

  let trust = 55
  if (/stainless|bamboo|recycled|glass|organic|compostable/.test(text)) trust += 18
  if (/plastic|pet|single-use|petroleum|microplastic/.test(text)) trust -= 15
  if (/reusable|refill/.test(text)) trust += 12
  if (classification.confidence) trust = Math.round(trust * 0.7 + classification.confidence * 0.3)
  trust = Math.max(15, Math.min(95, trust))

  const risk =
    /plastic|unverif|marketing|single-use/.test(text) && trust < 50
