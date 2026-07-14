import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import scanRouter from './routes/scan.js'

const app = express()
const port = Number(process.env.PORT || 10000)
const origin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin,
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ecoverify-backend' })
})

app.use('/api/scan', scanRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({ error: err.message || 'Request failed' })
})

app.listen(port, () => {
  console.log(`EcoVerify API listening on http://127.0.0.1:${port}`)
  console.log(`AI_PROVIDER=${process.env.AI_PROVIDER || 'auto'}`)
})
