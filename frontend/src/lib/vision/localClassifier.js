/**
 * On-device product detection + classification using CLIP (Transformers.js).
 * Runs fully in the browser — no API key required for Stage 1 vision.
 * Loaded lazily so the landing page stays light.
 */

import {
  PRESENCE_LABELS,
  PRODUCT_PRESENCE_SET,
  ALL_PRODUCT_LABELS,
  CATALOG_CLASS_DEFS,
  resolveLabelToProduct,
  isOutOfScopeLabel,
  MIN_MATCH_SCORE,
  MIN_MATCH_MARGIN,
} from './labels'

let classifierPromise = null

async function getClassifier(onStage) {
  if (!classifierPromise) {
    onStage?.('Loading on-device vision model (CLIP)… first run may take a minute')
    classifierPromise = import('@huggingface/transformers')
      .then(async ({ pipeline, env }) => {
        env.allowLocalModels = false
        env.useBrowserCache = true
        return pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32')
      })
      .catch((err) => {
        classifierPromise = null
        throw err
      })
  }
  return classifierPromise
}

function fileToObjectUrl(file) {
  return URL.createObjectURL(file)
}

function unknownResult({ confidence, candidates, presenceRaw, classRaw, reason }) {
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
    confidence: Math.round(confidence || 0),
    detected_product_id: null,
    candidates: candidates || [],
    detections: (classRaw || []).slice(0, 5).map((r) => ({
      label: r.label,
      score: Math.round(r.score * 100),
      product_id: resolveLabelToProduct(r.label)?.id || null,
    })),
    presence: presenceRaw?.[0]
      ? {
          top_label: presenceRaw[0].label,
          score: Math.round(presenceRaw[0].score * 100),
          product_detected: PRODUCT_PRESENCE_SET.has(presenceRaw[0].label),
        }
      : undefined,
    provider: 'local-clip',
    reason: reason || 'No confident catalog match for this image.',
  }
}

/**
 * @param {File|Blob} file
 * @param {(msg: string) => void} [onStage]
 */
export async function classifyWithLocalModel(file, onStage) {
  const url = fileToObjectUrl(file)
  try {
    const classifier = await getClassifier(onStage)

    onStage?.('Detecting whether a product is in the photo…')
    const presenceRaw = await classifier(url, PRESENCE_LABELS)
    const presenceTop = presenceRaw[0]
    const productDetected = PRODUCT_PRESENCE_SET.has(presenceTop.label)

    onStage?.('Classifying product type against EcoVerify catalog…')
    const classRaw = await classifier(url, ALL_PRODUCT_LABELS)

    const topClass = classRaw[0]
    if (topClass && isOutOfScopeLabel(topClass.label) && topClass.score >= MIN_MATCH_SCORE) {
      return unknownResult({
        confidence: topClass.score * 100,
        candidates: [],
        presenceRaw,
        classRaw,
        reason: `Image looks like “${topClass.label}”, not an EcoVerify catalog product.`,
      })
    }

    const byProduct = new Map()
    for (const row of classRaw) {
      if (isOutOfScopeLabel(row.label)) continue
      const def = resolveLabelToProduct(row.label)
      if (!def) continue
      const prev = byProduct.get(def.id) || { def, score: 0, hits: 0, best: 0 }
      // Prefer strongest label hit; don't dilute with weak sibling prompts
      prev.best = Math.max(prev.best, row.score)
      prev.score += row.score
      prev.hits += 1
      byProduct.set(def.id, prev)
    }

    const ranked = [...byProduct.values()]
      .map((entry) => ({
        ...entry,
        // Blend max hit + mean so one strong apparel label beats many weak bottle scores
        score: entry.best * 0.7 + (entry.score / Math.max(1, entry.hits)) * 0.3,
      }))
      .sort((a, b) => b.score - a.score)

    const top = ranked[0]
    const second = ranked[1]
    const confidence = Math.round((top?.score || 0) * 100)
    const candidates = ranked.slice(0, 5).map((r) => ({
      product_id: r.def.id,
      product_name: r.def.name,
      brand: r.def.brand,
      category: r.def.category,
      confidence: Math.round(r.score * 100),
    }))

    const margin = (top?.score || 0) - (second?.score || 0)
    const strongEnough =
      top &&
      top.score >= MIN_MATCH_SCORE &&
      margin >= MIN_MATCH_MARGIN &&
      (productDetected || top.score >= MIN_MATCH_SCORE + 0.08)

    if (!strongEnough) {
      return unknownResult({
        confidence,
        candidates,
        presenceRaw,
        classRaw,
        reason: !productDetected
          ? 'No clear retail product detected in the image.'
          : `Closest catalog guess was “${top?.def?.name || 'unknown'}” at ${confidence}% — too uncertain to match.`,
      })
    }

    const def = top.def
    return {
      product_detected: true,
      product_name: def.name,
      product_type: def.category.toLowerCase().replace(/\s+/g, '_'),
      brand: def.brand,
      category: def.category,
      primary_materials: def.materials,
      secondary_materials: '',
      certifications: [],
      sustainability_claims: [],
      reusability: /bottle|reusable|bamboo|notebook|cotton|shirt/i.test(def.name)
        ? 'high'
        : 'single-use',
      packaging_type: def.packaging,
      confidence,
      detected_product_id: def.id,
      candidates,
      detections: classRaw.slice(0, 5).map((r) => ({
        label: r.label,
        score: Math.round(r.score * 100),
        product_id: resolveLabelToProduct(r.label)?.id || null,
      })),
      presence: {
        top_label: presenceTop.label,
        score: Math.round(presenceTop.score * 100),
        product_detected: productDetected,
      },
      provider: 'local-clip',
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Warm the model in the background so the first scan is faster. */
export function preloadVisionModel() {
  return getClassifier().catch(() => null)
}
