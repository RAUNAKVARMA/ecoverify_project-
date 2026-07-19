import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import scanRouter from './routes/scan.js'
import productsRouter from './routes/products.js'
import scansRouter from './routes/scans.js'
import { prisma } from './db.js'

const app = express()
const port = Number(process.env.PORT || 10000)

const allowedOrigins = String(process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, health checks) often omit Origin
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, service: 'ecoverify-backend', database: 'up' })
  } catch {
    res.status(503).json({ ok: false, service: 'ecoverify-backend', database: 'down' })
  }
})

app.use('/api/scan', scanRouter)
app.use('/api/products', productsRouter)
app.use('/api/scans', scansRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({ error: err.message || 'Request failed' })
})

app.listen(port, () => {
  console.log(`EcoVerify API listening on http://127.0.0.1:${port}`)
  console.log(`AI_PROVIDER=${process.env.AI_PROVIDER || 'auto'}`)
  console.log(`CORS_ORIGIN=${allowedOrigins.join(', ')}`)
})
