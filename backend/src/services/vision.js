import { matchCatalogFromText, CATALOG } from '../catalog.js'

function providerMode() {
  return (process.env.AI_PROVIDER || 'auto').toLowerCase()
}

async function tryOllamaVision(base64, mime) {
  const base = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
  const model = process.env.OLLAMA_VISION_MODEL || 'llava'

  const prompt = `You classify retail product photos for EcoVerify.
Return ONLY JSON with keys:
product_name, brand, category, primary_materials, packaging_type, reusability,
confidence (0-100), product_detected (boolean), summary.
Prefer matching one of: ${CATALOG.map((c) => c.name).join(', ')}.`

  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      prompt,
      images: [base64],
    }),
  })

  if (!res.ok) throw new Error(`Ollama ${res.status}`)
  const data = await res.json()
  const parsed = typeof data.response === 'string' ? JSON.parse(data.response) : data.response
  return normalizeResult(parsed, 'ollama-llava')
}

async function tryOpenAIVision(base64, mime) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const dataUrl = `data:${mime};base64,${base64}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Classify product images for EcoVerify. Return JSON: product_name, brand, category, primary_materials, packaging_type, reusability, confidence (0-100), product_detected (boolean), summary.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this product.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  return normalizeResult(JSON.parse(content), 'openai')
}

function normalizeResult(raw, provider) {
  const matched = matchCatalogFromText(
    [raw.product_name, raw.brand, raw.category, raw.summary].filter(Boolean).join(' '),
  )

  return {
    product_detected: raw.product_detected !== false,
    product_name: raw.product_name || matched?.name || 'Unknown product',
    product_type: (raw.category || matched?.category || 'unknown').toLowerCase().replace(/\s+/g, '_'),
    brand: raw.brand || matched?.brand || 'Unknown',
    category: raw.category || matched?.category || 'Unknown',
    primary_materials: raw.primary_materials || 'unknown',
    secondary_materials: raw.secondary_materials || '',
    certifications: raw.certifications || [],
    sustainability_claims: raw.sustainability_claims || [],
    reusability: raw.reusability || 'unknown',
    packaging_type: raw.packaging_type || 'unknown',
    confidence: Number(raw.confidence) || (matched ? 70 : 40),
    detected_product_id: matched?.id || null,
    candidates: matched
      ? [
          {
            product_id: matched.id,
            product_name: matched.name,
            brand: matched.brand,
            category: matched.category,
            confidence: Number(raw.confidence) || 70,
          },
        ]
      : [],
    detections: [],
    summary: raw.summary || '',
    provider,
  }
}

function mockClassify(filename = '') {
  const hint = String(filename).toLowerCase()
  const matched =
    matchCatalogFromText(hint) ||
    CATALOG.find((c) => hint.includes(c.keywords[0])) ||
    CATALOG[5]

  return {
    product_detected: true,
    product_name: matched.name,
    product_type: matched.category.toLowerCase().replace(/\s+/g, '_'),
    brand: matched.brand,
    category: matched.category,
    primary_materials: 'mixed materials',
    secondary_materials: '',
    certifications: [],
    sustainability_claims: [],
    reusability: /bottle|bamboo|notebook/i.test(matched.name) ? 'high' : 'unknown',
    packaging_type: 'retail packaging',
    confidence: 58,
    detected_product_id: matched.id,
    candidates: [
      {
        product_id: matched.id,
        product_name: matched.name,
        brand: matched.brand,
        category: matched.category,
        confidence: 58,
      },
    ],
    detections: [],
    provider: 'mock',
    summary: 'Mock classification — start Ollama (llava) or set OPENAI_API_KEY for live vision.',
  }
}

/**
 * Classify an uploaded image buffer.
 * @param {{ buffer: Buffer, mimetype: string, originalname?: string }} file
 */
export async function classifyImageFile(file) {
  const mode = providerMode()
  const base64 = file.buffer.toString('base64')
  const mime = file.mimetype || 'image/jpeg'

  const tryOllama = mode === 'auto' || mode === 'ollama'
  const tryOpenAI = mode === 'auto' || mode === 'openai'

  if (tryOllama && mode !== 'mock') {
    try {
      return await tryOllamaVision(base64, mime)
    } catch (err) {
      if (mode === 'ollama') throw err
      console.warn('Ollama vision unavailable:', err.message)
    }
  }

  if (tryOpenAI && mode !== 'mock') {
    try {
      const result = await tryOpenAIVision(base64, mime)
      if (result) return result
    } catch (err) {
      if (mode === 'openai') throw err
      console.warn('OpenAI vision unavailable:', err.message)
    }
  }

  return mockClassify(file.originalname)
}
