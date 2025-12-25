import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Leaf } from 'lucide-react'
import QuickScan from '@/components/home/QuickScan'
import { products } from '@/components/data/productData'

const u = (id, w = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const P = {
  sky: u('photo-1506905925346-21bda4d32df4', 1600),
  palms: u('photo-1509423350716-97f9360b4e09', 900),
  sunflower: u('photo-1597848212624-a19eb35e2651', 800),
  hands: u('photo-1542601906990-b4d3fb778b09', 800),
  produce: u('photo-1542838132-92c53300491e', 800),
  forest: u('photo-1441974231531-c6227db76b6e', 800),
  market: u('photo-1504674900247-0877df9cc836', 700),
  bottle: products[5].image.replace('w=200', 'w=600'),
  honey: products[7].image.replace('w=200', 'w=600'),
  bamboo: products[1].image.replace('w=200', 'w=600'),
  milk: products[0].image.replace('w=200', 'w=600'),
  citrus: u('photo-1611080626919-7cf5a9dbab5b', 600),
  berries: u('photo-1464454709131-ffd692591ee5', 600),
  coconut: products[9].image.replace('w=200', 'w=600'),
  herbs: u('photo-1416879595882-3373a0480b5b', 600),
  tomatoes: u('photo-1518977956812-cd3dbadaaf31', 600),
  moss: u('photo-1469474968028-56623f02e42e', 600),
  leaves: u('photo-1518531933037-91b2f5f229cc', 700),
  field: u('photo-1500382017468-9049fed747ef', 800),
  beach: u('photo-1507525428034-b723cf961d3e', 1000),
  lemon: u('photo-1590502593747-42a996133562', 600),
  bread: u('photo-1509440159596-0249088772ff', 600),
  tea: products[2].image.replace('w=200', 'w=600'),
}

/** Earth plate for the continuous open peak (green hills — not beach) */
const EARTH = u('photo-1501854140801-50d01698950b', 1200)

const WORDMARKS = [
  { id: 'script', className: 'wm-script', label: 'EcoVerify' },
  { id: 'bold', className: 'wm-bold', label: 'EcoVerify' },
  { id: 'outline', className: 'wm-outline', label: 'EcoVerify' },
]

/**
 * Option A — one continuous collage.
 * Wave 1 (seed): plants + goods land → earth opens
 * Wave 2: rest of wreath fills in → phones
 */
const SEED_CLS = new Set(['pc-palms', 'pc-leaves', 'pc-sun', 'pc-bottle', 'pc-honey', 'pc-bamboo'])

const RAW_PIECES = [
  { src: P.palms, shape: 'tall', cls: 'pc-palms', rot: -8, from: 'bottomleft', z: 8 },
  { src: P.leaves, shape: 'tall', cls: 'pc-leaves', rot: 7, from: 'topright', z: 7 },
  { src: P.beach, shape: 'torn', cls: 'pc-beach', rot: 0, from: 'bottom', z: 6 },
  { src: P.sky, shape: 'sky', cls: 'pc-sky-sync', rot: 0, from: 'top', z: 2, isSky: true },
  { src: P.field, shape: 'torn', cls: 'pc-field', rot: -6, from: 'left', z: 5 },
  { src: P.forest, shape: 'torn', cls: 'pc-forest', rot: 8, from: 'right', z: 5 },
  { src: P.sunflower, shape: 'round', cls: 'pc-sun', rot: 12, from: 'top', z: 14 },
  { src: P.hands, shape: 'polaroid', cls: 'pc-hands', rot: -10, from: 'bottomleft', z: 16, caption: 'real dirt.' },
  { src: P.market, shape: 'polaroid', cls: 'pc-market', rot: 8, from: 'topright', z: 15, caption: 'shop wise' },
  { src: P.bottle, shape: 'round', cls: 'pc-bottle', rot: -16, from: 'topleft', z: 17 },
  { src: P.honey, shape: 'round', cls: 'pc-honey', rot: 18, from: 'topright', z: 17 },
  { src: P.bamboo, shape: 'squircle', cls: 'pc-bamboo', rot: -5, from: 'left', z: 12 },
  { src: P.berries, shape: 'round', cls: 'pc-berries', rot: -20, from: 'right', z: 16 },
  { src: P.citrus, shape: 'round', cls: 'pc-citrus', rot: 14, from: 'bottomright', z: 16 },
  { src: P.moss, shape: 'squircle', cls: 'pc-moss', rot: 5, from: 'top', z: 11 },
  { src: P.herbs, shape: 'squircle', cls: 'pc-herbs', rot: -9, from: 'left', z: 11 },
  { src: P.coconut, shape: 'round', cls: 'pc-coco', rot: -12, from: 'right', z: 13 },
  { src: P.milk, shape: 'squircle', cls: 'pc-milk', rot: 7, from: 'bottom', z: 12 },
  { src: P.tomatoes, shape: 'round', cls: 'pc-tomato', rot: 15, from: 'bottomleft', z: 15 },
  { src: P.lemon, shape: 'round', cls: 'pc-avo', rot: -13, from: 'left', z: 15 },
  { src: P.bread, shape: 'squircle', cls: 'pc-bread', rot: 9, from: 'right', z: 10 },
  { src: P.tea, shape: 'round', cls: 'pc-tea', rot: -7, from: 'topleft', z: 14 },
].filter((p) => !p.isSky)

const seedList = RAW_PIECES.filter((p) => SEED_CLS.has(p.cls))
const restList = RAW_PIECES.filter((p) => !SEED_CLS.has(p.cls))

const PIECES = [
  ...seedList.map((item, i) => ({
    ...item,
    delay: 0.06 + i * 0.09,
    spin: (i % 2 === 0 ? 1 : -1) * (28 + (i % 4) * 8),
  })),
  ...restList.map((item, i) => ({
    ...item,
    delay: 0.85 + i * 0.07,
    spin: (i % 2 === 0 ? 1 : -1) * (32 + (i % 5) * 10),
  })),
]

const NOTES = [
  { text: 'look closer!', cls: 'sc-1', rot: -8, from: 'left' },
  { text: 'Look up \u2191', cls: 'sc-3', rot: -4, from: 'bottomleft' },
  { text: 'FRIENDS of earth!', cls: 'sc-2', rot: 6, from: 'right' },
  { text: 'is it truly green?', cls: 'sc-4', rot: 5, from: 'topright' },
  { text: 'trace it.', cls: 'sc-5', rot: -6, from: 'bottom' },
].map((item, i) => ({
  ...item,
  delay: 1.35 + i * 0.08,
  spin: (i % 2 === 0 ? -1 : 1) * 18,
}))

const STICKERS = [
  { text: 'Trust 91', cls: 'st-trust', rot: -7, from: 'topleft' },
  { text: 'SCAN', cls: 'st-scan', rot: 10, from: 'topright' },
  { text: 'no greenwash', cls: 'st-green', rot: -3, from: 'left' },
  { text: '72 / 100', cls: 'st-score', rot: 6, from: 'right' },
  { text: 'verified', cls: 'st-ok', rot: -9, from: 'top' },
].map((item, i) => ({
  ...item,
  delay: 1.45 + i * 0.08,
  spin: (i % 2 === 0 ? 1 : -1) * 24,
}))

const ASSEMBLE_MS = Math.round((Math.max(
  PIECES[PIECES.length - 1].delay,
  NOTES[NOTES.length - 1].delay,
  STICKERS[STICKERS.length - 1].delay,
) + 1.05) * 1000)

/** Earth opens after seed lands, then soft-fades as wreath completes */
const EARTH_OPEN_AT = 420
const EARTH_FADE_AT = 1680

function SafeImg({ src, className, alt = '' }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={className}
      loading="eager"
      decoding="async"
      onError={() => setOk(false)}
    />
  )
}

function PieceCutout({ item, build }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div
      className={`piece piece-${item.shape} piece-from-${item.from} ${item.cls} ${build ? 'is-in' : ''}`}
      style={{
        '--rot': `${item.rot}deg`,
        '--spin': `${item.spin || 0}deg`,
        '--delay': `${item.delay}s`,
        '--z': item.z,
        '--d': 1 + item.z * 0.03,
        backgroundImage: `url(${item.src})`,
      }}
    >
      <img
        src={item.src}
        alt=""
        draggable={false}
        loading="eager"
        decoding="async"
        onError={() => setOk(false)}
      />
      {item.caption && <span className="piece-caption">{item.caption}</span>}
    </div>
  )
}

function LetterWordmark({ text, className, active }) {
  return (
    <h1 className={`wm-logo ${className} ${active ? 'is-active' : ''}`} aria-hidden={!active}>
      {text.split('').map((ch, i) => (
        <span key={`${ch}-${i}`} className="wm-letter" style={{ '--i': i }}>
          {ch}
        </span>
      ))}
    </h1>
  )
}

function ScanPage({ onBack }) {
  return (
    <div className="app-shell animate-fade-up">
      <button type="button" className="back-collage" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="app-home-hero">
        <p className="text-xs font-medium tracking-[0.2em] text-[var(--color-ink)]/45 uppercase">EcoVerify</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Know if it&apos;s truly green.
        </h1>
        <p className="mt-2 max-w-lg text-sm text-[var(--color-ink)]/60">
          Scan a product for an instant Trust Score — and catch greenwashing before you buy.
        </p>
        <div className="mt-6">
          <QuickScan />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [phase, setPhase] = useState('wordmarks')
  const [wmIndex, setWmIndex] = useState(0)
  const [build, setBuild] = useState(false)
  const [earthOpen, setEarthOpen] = useState(false)
  const [earthFade, setEarthFade] = useState(false)
  const [phones, setPhones] = useState(false)
  const stageRef = useRef(null)
  const timers = useRef([])
  const mouse = useRef({ x: 0, y: 0, cx: 0, cy: 0 })
  const raf = useRef(0)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  /** One continuous collage: seed → earth open → wreath → phones */
  const startCollage = () => {
    clearTimers()
    setWmIndex(2)
    setPhase('assemble')
    setBuild(true)
    setEarthOpen(false)
    setEarthFade(false)
    setPhones(false)

    timers.current.push(window.setTimeout(() => setEarthOpen(true), EARTH_OPEN_AT))
    timers.current.push(window.setTimeout(() => setEarthFade(true), EARTH_FADE_AT))
    timers.current.push(window.setTimeout(() => {
      setPhase('collage')
      setPhones(true)
      setEarthOpen(false)
    }, ASSEMBLE_MS))
  }

  const skipIntro = () => {
    clearTimers()
    setWmIndex(2)
    setPhase('collage')
    setBuild(true)
    setEarthOpen(false)
    setEarthFade(false)
    setPhones(true)
  }

  useEffect(() => {
    ;[...Object.values(P), EARTH, ...PIECES.map((p) => p.src)].forEach((src) => {
      const i = new Image()
      i.src = src
    })

    clearTimers()
    setWmIndex(0)
    setBuild(false)
    setEarthOpen(false)
    setEarthFade(false)
    setPhones(false)
    setPhase('wordmarks')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('collage')
      setBuild(true)
      setPhones(true)
      return clearTimers
    }

    timers.current.push(window.setTimeout(() => setWmIndex(1), 700))
    timers.current.push(window.setTimeout(() => setWmIndex(2), 1400))
    timers.current.push(window.setTimeout(startCollage, 1900))

    return clearTimers
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || (phase !== 'assemble' && phase !== 'collage')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      mouse.current.cx += (mouse.current.x - mouse.current.cx) * 0.07
      mouse.current.cy += (mouse.current.y - mouse.current.cy) * 0.07
      stage.style.setProperty('--mx', `${mouse.current.cx * 28}px`)
      stage.style.setProperty('--my', `${mouse.current.cy * 18}px`)
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    raf.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [phase])

  if (phase === 'scan') {
    return <ScanPage onBack={() => setPhase('collage')} />
  }

  const inCollage = phase === 'assemble' || phase === 'collage'
  const showSkip = phase === 'wordmarks' || phase === 'assemble'

  return (
    <div
      ref={stageRef}
      className={[
        'amo-stage',
        phase === 'wordmarks' ? 'is-wordmarks' : '',
        phase === 'assemble' ? 'is-assemble is-collage is-build' : '',
        phase === 'collage' ? 'is-collage is-build' : '',
        build ? 'is-build' : '',
        earthOpen ? 'is-earth-open' : '',
        earthFade ? 'is-earth-fade' : '',
        phones ? 'is-phones' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
