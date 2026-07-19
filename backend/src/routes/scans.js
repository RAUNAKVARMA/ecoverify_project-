import { Router } from 'express'
import { z } from 'zod'
import { prisma, toClientScan } from '../db.js'

const router = Router()

const createSchema = z.object({
  productId: z.string().min(1),
  source: z.enum(['photo', 'barcode', 'search', 'manual']).default('manual'),
  trustScore: z.number().int().min(0).max(100).optional(),
  saved: z.boolean().optional(),
  userEmail: z.string().email().optional().nullable(),
  classification: z.any().optional(),
  ecoRating: z.any().optional(),
})

router.get('/stats/summary', async (_req, res) => {
  try {
    const [totalScans, savedCount, products] = await Promise.all([
      prisma.scan.count(),
      prisma.scan.count({ where: { saved: true } }),
      prisma.scan.findMany({ select: { productId: true }, distinct: ['productId'] }),
    ])
    res.json({
      totalScans,
      savedCount,
      uniqueProducts: products.filter((p) => p.productId).length,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to load stats' })
  }
})

router.get('/', async (req, res) => {
  try {
    const email = req.query.email ? String(req.query.email) : null
    const scans = await prisma.scan.findMany({
      where: email ? { userEmail: email } : undefined,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    res.json(scans.map(toClientScan))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to list scans' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = createSchema.parse(req.body)
    const product = await prisma.product.findUnique({ where: { id: body.productId } })
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const scan = await prisma.scan.create({
      data: {
        productId: body.productId,
        source: body.source,
        trustScore: body.trustScore ?? product.trustScore,
        saved: body.saved ?? false,
        userEmail: body.userEmail || null,
        classification: body.classification ?? undefined,
        ecoRating: body.ecoRating ?? undefined,
      },
      include: { product: true },
    })
    res.status(201).json(toClientScan(scan))
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || 'Invalid scan payload' })
      return
    }
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to create scan' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const saved = Boolean(req.body?.saved)
    const scan = await prisma.scan.update({
      where: { id: String(req.params.id) },
      data: { saved },
      include: { product: true },
    })
    res.json(toClientScan(scan))
  } catch (err) {
    console.error(err)
    res.status(404).json({ error: 'Scan not found' })
  }
})

export default router
