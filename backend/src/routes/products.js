import { Router } from 'express'
import { prisma, toClientProduct } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
    res.json(products.map(toClientProduct))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to list products' })
  }
})

router.get('/barcode/:code', async (req, res) => {
  try {
    const clean = String(req.params.code).replace(/\s/g, '')
    const product = await prisma.product.findUnique({ where: { barcode: clean } })
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(toClientProduct(product))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to look up barcode' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } })
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(toClientProduct(product))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to load product' })
  }
})

export default router
