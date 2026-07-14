import { Router } from 'express'
import multer from 'multer'
import { classifyImageFile } from '../services/vision.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'))
      return
    }
    cb(null, true)
  },
})

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.AI_PROVIDER || 'auto',
    ollama: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    visionModel: process.env.OLLAMA_VISION_MODEL || 'llava',
  })
})

router.post('/classify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Missing image file field "image"' })
      return
    }

    const result = await classifyImageFile(req.file)
    res.json(result)
  } catch (err) {
    console.error('classify error', err)
    res.status(500).json({ error: err.message || 'Classification failed' })
  }
})

export default router
