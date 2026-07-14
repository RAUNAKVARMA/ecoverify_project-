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

    const byProduct = new Map()
    for (const row of classRaw) {
      const def = resolveLabelToProduct(row.label)
      if (!def) continue
      const prev = byProduct.get(def.id) || { def, score: 0, hits: [] }
      prev.score += row.score
      prev.hits.push({ label: row.label, score: row.score })
      byProduct.set(def.id, prev)
    }

    const ranked = [...byProduct.values()]
      .map((entry) => ({
        ...entry,
        score: entry.score / Math.max(1, entry.hits.length),
      }))
      .sort((a, b) => b.score - a.score)

    const top = ranked[0]
    const confidence = Math.round((top?.score || 0) * 100)
    const candidates = ranked.slice(0, 5).map((r) => ({
      product_id: r.def.id,
      product_name: r.def.name,
      brand: r.def.brand,
      category: r.def.category,
      confidence: Math.round(r.score * 100),
    }))

    if (!productDetected && confidence < 28) {
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
        confidence,
        detected_product_id: null,
        candidates,
        detections: presenceRaw.slice(0, 3).map((r) => ({
          label: r.label,
          score: Math.round(r.score * 100),
        })),
        provider: 'local-clip',
        reason: 'No clear product detected in the image.',
      }
    }

    const def = top?.def || CATALOG_CLASS_DEFS[0]
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
      reusability: /bottle|reusable|bamboo|notebook/i.test(def.name) ? 'high' : 'single-use',
      packaging_type: def.packaging,
      confidence: Math.max(confidence, productDetected ? 40 : confidence),
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
