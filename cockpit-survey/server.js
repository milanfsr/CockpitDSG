require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

const app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: `https://${process.env.ALLOWED_ORIGIN}` }))
app.use(express.json({ limit: '2mb' }))

// ── Serve React frontend ──────────────────────────────────────────────────────
const DIST = path.join(__dirname, 'dist')
app.use(express.static(DIST))

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1) })

// ── Response schema ───────────────────────────────────────────────────────────
const responseSchema = new mongoose.Schema({
  created_at:      { type: Date, default: Date.now },
  persona:         { type: Object, required: true },
  swipe_results:   { type: Object, required: true },
  zone_results:    { type: Object, default: {} },
  display_results: { type: Object, default: {} },
})
const Response = mongoose.model('Response', responseSchema)

// ── Middleware: verify JWT ────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── API Routes ────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Login — credentials checked server-side only, never sent to frontend
app.post('/api/login', (req, res) => {
  const { id, password } = req.body

  if (
    id       !== process.env.SURVEY_ID ||
    password !== process.env.SURVEY_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ authorized: true }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  res.json({ token })
})

// Submit survey response
app.post('/api/submit', requireAuth, async (req, res) => {
  try {
    const { persona, swipe_results, zone_results, display_results } = req.body

    if (!persona || !swipe_results) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const doc = await Response.create({
      persona,
      swipe_results,
      zone_results:    zone_results    || {},
      display_results: display_results || {},
    })

    res.json({ success: true, id: doc._id })
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ error: 'Failed to save response' })
  }
})

// ── Catch-all: serve React for any non-API route ──────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
