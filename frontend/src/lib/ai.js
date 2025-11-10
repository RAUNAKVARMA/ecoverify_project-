/**
 * AI scanning helpers.
 * Uses VITE_OPENAI_API_KEY when set; otherwise falls back to mock analysis.
 */

function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || ''
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

export async function classifyProductImage(file, onStage) {
  onStage?.('Stage 1 — Vision Classification: identifying product details…')
  const dataUrl = await fileToDataUrl(file)

  const live = await callLLM([
    {
      role: 'system',
      content:
        'You are a product vision classifier for EcoVerify. Return JSON with: product_name, product_type, brand, category, primary_materials, secondary_materials, certifications (array), sustainability_claims (array), reusability, packaging_type, confidence (0-100).',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Identify this product for sustainability analysis.' },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ]).catch(() => null)

  if (live) return live

  await delay(900)
  const nameHint = (file.name || '').toLowerCase()
  return {
    product_name: nameHint.includes('bottle') ? 'Reusable Water Bottle' : nameHint.includes('milk') ? 'Organic Milk Tetra Pack' : 'Eco Product',
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
    _mock: true,
  }
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

  await delay(1100)
  const risk = (classification.sustainability_claims || []).length > 1 && (classification.certifications || []).some((c) => /unverif/i.test(c))
    ? 'medium'
    : 'low'
  return {
    trust_score: 74,
    sub_scores: { certifications: 18, materials: 16, reusability: 14, supply_chain: 12, packaging: 14 },
    greenwashing_risk: risk,
    verified_claims: classification.certifications?.filter((c) => !/unverif/i.test(c)) || [],
    unverified_claims: classification.sustainability_claims || [],
    carbon_footprint_estimate: 'Medium — estimated 1.5–2.5kg CO2e',
    summary: 'Mock eco-rating based on visual classification. Add VITE_OPENAI_API_KEY for live AI scoring.',
    suggestions: ['Prefer verified certifications', 'Reduce virgin plastic packaging'],
    _mock: true,
  }
}

export async function validateBarcode(barcode, onStage) {
  onStage?.('Validating barcode format with AI…')
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

  await delay(700)
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
    notes: 'Mock validation — set VITE_OPENAI_API_KEY for live LLM validation.',
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
