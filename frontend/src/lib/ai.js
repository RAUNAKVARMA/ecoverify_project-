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
  const table = [
    { test: /bottle|thermos|hydro/, id: '6', name: 'Reusable Water Bottle', brand: 'HydroEco', category: 'Accessories' },
    { test: /shirt|tee|t-shirt|apparel|cotton/, id: '4', name: 'Organic Cotton T-Shirt', brand: 'FairWear', category: 'Fashion' },
    { test: /milk|tetra/, id: '1', name: 'Organic Milk Tetra Pack', brand: "Nature's Promise", category: 'Dairy' },
    { test: /honey/, id: '8', name: 'Organic Honey', brand: 'BeeNatural', category: 'Food' },
    { test: /brush|tooth/, id: '2', name: 'Bamboo Toothbrush Set', brand: 'EcoSmile', category: 'Personal Care' },
  ]
  const hit = table.find((row) => row.test.test(nameHint))
  if (!hit) {
    return {
      product_detected: false,
      product_name: 'Unknown',
      product_type: 'unknown',
      brand: 'Unknown',
      category: 'Unknown',
      primary_materials: 'unknown',
      secondary_materials: '',
      certifications: [],
      sustainability_claims: [],
      reusability: 'unknown',
      packaging_type: 'unknown',
      confidence: 0,
      detected_product_id: null,
      candidates: [],
      detections: [],
      provider: 'mock-filename',
      reason: 'Could not classify this image. Try a clearer product photo.',
      _mock: true,
    }
  }
  return {
    product_detected: true,
    product_name: hit.name,
    product_type: 'consumer_good',
    brand: hit.brand,
    category: hit.category,
    primary_materials: 'mixed materials',
    secondary_materials: 'packaging',
    certifications: ['Unverified visual claim'],
    sustainability_claims: ['Eco-friendly packaging'],
    reusability: 'unknown',
    packaging_type: 'retail packaging',
    confidence: 55,
    detected_product_id: hit.id,
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
      ? 'high'
      : trust < 65
        ? 'medium'
        : 'low'

  return {
    trust_score: trust,
    sub_scores: {
      certifications: Math.round(trust * 0.25),
      materials: Math.round(trust * 0.28),
      reusability: Math.round(trust * 0.2),
      supply_chain: Math.round(trust * 0.15),
      packaging: Math.round(trust * 0.12),
    },
    greenwashing_risk: risk,
    verified_claims: classification.certifications?.filter((c) => !/unverif/i.test(c)) || [],
    unverified_claims: classification.sustainability_claims || [],
    carbon_footprint_estimate:
      trust >= 80 ? 'Low' : trust >= 55 ? 'Medium — estimated 1.5–2.5kg CO2e' : 'High',
    summary: classification.provider?.includes('clip')
      ? `Scored from on-device vision match (${classification.product_name}, ${classification.confidence}% confidence).`
      : 'Heuristic eco-rating from visual classification.',
    suggestions: ['Prefer verified certifications', 'Reduce virgin plastic packaging'],
    _mock: !getApiKey(),
  }
}

export async function validateBarcode(barcode, onStage) {
  onStage?.('Validating barcode format…')
  const clean = String(barcode).replace(/\D/g, '')

  const live = await callLLM([
    {
      role: 'system',
      content:
        'Validate retail barcodes. Return JSON: format (EAN-13|UPC-A|Code 128|ISBN|Unknown), valid (boolean), confidence (0-100), clean_barcode, gs1_country_prefix, notes.',
    },
    { role: 'user', content: `Barcode: ${barcode}` },
  ]).catch(() => null)

  if (live) return live

  await delay(400)
  let format = 'Unknown'
  if (clean.length === 13) format = 'EAN-13'
  else if (clean.length === 12) format = 'UPC-A'
  else if (clean.length === 8) format = 'EAN-8'
  else if (clean.length > 0) format = 'Code 128'

  return {
    format,
    valid: clean.length >= 8,
    confidence: clean.length === 13 || clean.length === 12 ? 88 : 55,
    clean_barcode: clean || String(barcode).trim(),
    gs1_country_prefix: clean.startsWith('890') ? 'India (890)' : clean.slice(0, 3) || 'N/A',
    notes: 'Local format validation.',
    _mock: true,
  }
}

export function generateEcoExplain(product, adjustedScore, prefs = {}) {
  if (!product) return ''
  const parts = []
  parts.push(`This product scores ${Math.round(adjustedScore)}/100.`)

  const certs = product.breakdown?.certifications || []
  const verified = certs.filter((c) => /verified/i.test(c))
  if (verified.length) {
    parts.push(`It has ${verified.join(' and ')} which adds significant trust.`)
  } else if (certs.length) {
    parts.push(`Certification status: ${certs.join(', ')}.`)
  }

  if (product.breakdown?.materials_analysis) {
    parts.push(`Materials: ${product.breakdown.materials_analysis}.`)
  }
  if (product.breakdown?.supply_chain_transparency) {
    parts.push(`Supply chain transparency is ${product.breakdown.supply_chain_transparency.toLowerCase()}.`)
  }
  if (product.breakdown?.packaging_assessment) {
    parts.push(`Packaging assessment: ${product.breakdown.packaging_assessment}.`)
  }

  const priorities = prefs.priorities || []
  if (priorities.includes('Plastic Reduction')) {
    parts.push('Based on your preference for plastic reduction, packaging materials deserve extra scrutiny.')
  }
  if (priorities.includes('Climate')) {
    parts.push(`Climate focus: carbon footprint is listed as ${product.breakdown?.carbon_footprint || 'unavailable'}.`)
  }
  if (priorities.includes('Fair Trade')) {
    parts.push('Fair Trade priority: look for audited labor and supplier disclosures in the breakdown.')
  }
  if (priorities.includes('Animal Welfare')) {
    parts.push('Animal Welfare priority: verify sourcing claims and cruelty-free certifications carefully.')
  }

  if (prefs.sensitivity === 'strict') {
    parts.push('Strict sensitivity is applied, so borderline claims weigh more heavily against the score.')
  } else if (prefs.sensitivity === 'lenient') {
    parts.push('Lenient sensitivity is applied, giving more weight to pending certifications.')
  }

  return parts.join(' ')
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
