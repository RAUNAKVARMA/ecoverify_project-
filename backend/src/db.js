import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__ecoverifyPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__ecoverifyPrisma = prisma
}

export function toClientProduct(p) {
  if (!p) return null
  const certs = Array.isArray(p.certifications) ? p.certifications : []
  return {
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    image: p.image,
    trust_score: p.trustScore,
    greenwashing_risk: p.greenwashingRisk,
    breakdown: {
      certifications: certs,
      materials_analysis: p.materialsAnalysis,
      supply_chain_transparency: p.supplyChainTransparency,
      packaging_assessment: p.packagingAssessment,
      carbon_footprint: p.carbonFootprint,
    },
  }
}

export function toClientScan(s) {
  return {
    id: s.id,
    productId: s.productId,
    timestamp: s.createdAt.toISOString(),
    saved: s.saved,
    source: s.source,
    trustScore: s.trustScore ?? undefined,
    userEmail: s.userEmail ?? undefined,
    product: s.product ? toClientProduct(s.product) : undefined,
  }
}
