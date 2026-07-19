import { useEffect, useRef, useState } from 'react'
import MagneticLink from '@/components/MagneticLink'
import { useCountUp } from '@/hooks/useMotion'

/** Local Mixkit downloads + CDN fallbacks (stock, free license). */
const VIDEO = {
  canopy: {
    local: '/video/canopy.mp4',
    cdn: 'https://assets.mixkit.co/videos/50837/50837-720.mp4',
    poster:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=70',
  },
  leaves: {
    local: '/video/leaves.mp4',
    cdn: 'https://assets.mixkit.co/videos/50847/50847-720.mp4',
    poster:
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=70',
  },
  trees: {
    local: '/video/trees.mp4',
    cdn: 'https://assets.mixkit.co/active_storage/video_items/100182/1721167927/100182-video-720.mp4',
    poster:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=70',
  },
}

const CLAIMS = [
  { pretence: '100% natural', truth: 'Undefined term', tone: 'warn' },
  { pretence: 'Eco-friendly', truth: 'No standard', tone: 'warn' },
  { pretence: 'Carbon neutral', truth: 'Offset only', tone: 'mid' },
  { pretence: 'Ocean plastic', truth: 'Trace amount', tone: 'mid' },
  { pretence: 'Certified green', truth: 'Self-issued', tone: 'warn' },
  { pretence: 'Plant based', truth: 'Check % share', tone: 'ok' },
]

const CHAPTERS = [
  {
    id: 'scan',
    step: '01',
    title: 'See the signal',
    body: 'Packaging marks, materials, and claims become readable data — not vibe.',
    video: VIDEO.trees,
  },
  {
    id: 'score',
    step: '02',
    title: 'Weigh the evidence',
    body: 'A trust score from 0–100. When claims outrun proof, the number falls.',
    video: VIDEO.canopy,
  },
  {
    id: 'pick',
    step: '03',
    title: 'Choose better',
    body: 'Higher-trust alternatives in the same aisle — so the next pick is clearer.',
    video: VIDEO.leaves,
  },
]

/** Muted autoplay loop — resumes when visible, pauses when offscreen. */
function AutoVideo({
  src,
  className = '',
  poster,
  style,
  priority = false,
}) {
  const ref = useRef(null)
  const primary = src?.local || src?.cdn || ''
  const fallback = src?.local && src?.cdn ? src.cdn : ''

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    el.muted = true
    el.defaultMuted = true
    el.setAttribute('muted', '')
    el.playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')

    let cancelled = false
    const tryPlay = () => {
      if (cancelled) return
      el.muted = true
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }

    // Don't let IO pause before first layout paint
    const boot = window.setTimeout(tryPlay, 50)
    el.addEventListener('loadeddata', tryPlay)
    el.addEventListener('canplay', tryPlay)

    const onVis = () => {
      if (document.hidden) el.pause()
      else tryPlay()
    }
    document.addEventListener('visibilitychange', onVis)

    let io
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tryPlay()
          else if (entry.intersectionRatio === 0) el.pause()
        },
        { threshold: [0, 0.05, 0.2] },
      )
      io.observe(el)
    }

    return () => {
      cancelled = true
      window.clearTimeout(boot)
      el.removeEventListener('loadeddata', tryPlay)
      el.removeEventListener('canplay', tryPlay)
      document.removeEventListener('visibilitychange', onVis)
      io?.disconnect()
    }
  }, [primary, fallback])

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={primary}
      poster={poster || src?.poster}
      muted
      autoPlay
      loop
      playsInline
      preload={priority ? 'auto' : 'metadata'}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
      onError={(e) => {
        const el = e.currentTarget
        if (fallback && el.src !== fallback && !el.dataset.fallback) {
          el.dataset.fallback = '1'
          el.src = fallback
          el.load()
          el.play?.()?.catch?.(() => {})
        }
      }}
    />
  )
}

function useScrollProgress(ref) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const tick = () => {
      const rect = el.getBoundingClientRect()
      const total = Math.max(1, el.offsetHeight - window.innerHeight)
      setP(Math.min(1, Math.max(0, -rect.top / total)))
      raf = 0
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
  return p
}

function HorizontalRail() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const p = useScrollProgress(sectionRef)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const max = Math.max(0, track.scrollWidth - window.innerWidth)
    track.style.transform = `translate3d(${-p * max}px, 0, 0)`
  }, [p])

  return (
    <section className="av4-rail" ref={sectionRef} aria-label="Greenwash claims">
      <div className="av4-rail-sticky">
        <header className="av4-rail-head">
          <p className="av4-eyebrow">Scroll through the fog</p>
          <h2>
            Pretty words.
            <em> Thin proof.</em>
          </h2>
        </header>
        <div className="av4-rail-viewport">
          <div className="av4-rail-track" ref={trackRef}>
            {CLAIMS.map((c, i) => (
              <article key={c.pretence} className={`av4-claim av4-claim--${c.tone}`} style={{ '--i': i }}>
                <span className="av4-claim-index">0{i + 1}</span>
                <h3>{c.pretence}</h3>
                <p>
                  Reads as <strong>{c.truth}</strong>
                </p>
                <div className="av4-claim-bar" aria-hidden />
              </article>
            ))}
          </div>
        </div>
        <div className="av4-rail-meter" aria-hidden>
          <span style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>
    </section>
  )
}

function PinStory() {
  const sectionRef = useRef(null)
  const p = useScrollProgress(sectionRef)
  const active = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length * 0.999))
  const chapter = CHAPTERS[active]

  return (
    <section className="av4-pin" ref={sectionRef} id="how">
      <div className="av4-pin-sticky">
        <div className="av4-pin-media av4-pin-media--video" style={{ '--focus': p }}>
          {CHAPTERS.map((c, i) => (
            <div key={c.id} className={`av4-pin-layer ${i === active ? 'is-on' : ''}`}>
              <AutoVideo src={c.video} poster={c.video.poster} />
            </div>
          ))}
          <div className="av4-pin-hud" aria-hidden>
            <i className="tl" />
            <i className="tr" />
            <i className="bl" />
            <i className="br" />
            <span className="av4-pin-live">REC · LIVE FIELD</span>
          </div>
          <div className="av4-pin-scan" style={{ transform: `translateY(${p * 100}%)` }} />
        </div>
        <div className="av4-pin-copy">
          <p className="av4-eyebrow">The loop</p>
          <div className="av4-pin-steps" aria-hidden>
            {CHAPTERS.map((c, i) => (
              <span key={c.id} className={i === active ? 'is-on' : ''}>
                {c.step}
              </span>
            ))}
          </div>
          <h2 key={chapter.id} className="av4-pin-title">
            {chapter.title}
          </h2>
          <p key={`${chapter.id}-b`} className="av4-pin-body">
            {chapter.body}
          </p>
        </div>
      </div>
    </section>
  )
}

function TruthSwap() {
  const [on, setOn] = useState(false)

  return (
    <section className="av4-swap" id="story">
      <div className="av4-swap-grid">
        <div className="av4-swap-copy">
          <p className="av4-eyebrow av4-reveal">Look closer</p>
          <h2 className="av4-display av4-reveal">
            Labels look green.
            <br />
            <span className="av4-italic">Proof is hard.</span>
          </h2>
          <p className="av4-body av4-reveal">
            Packaging shouts sustainability. Marks blur together. Shoppers guess —
            and greenwash wins by default.
          </p>
          <button
            type="button"
            className={`av4-truthcard ${on ? 'is-truth' : ''}`}
            onClick={() => setOn((v) => !v)}
            aria-pressed={on}
          >
            <span className="av4-truthcard-face av4-truthcard-claim">
              <small>Shelf claim</small>
              <strong>100% eco</strong>
              <em>tap to verify</em>
            </span>
            <span className="av4-truthcard-face av4-truthcard-proof">
              <small>Evidence</small>
              <strong>weak proof</strong>
              <em>score 34 · thin trail</em>
            </span>
          </button>
        </div>

        <div className="av4-filmstrip av4-reveal" aria-hidden>
          <AutoVideo src={VIDEO.leaves} className="av4-filmstrip-video" />
          <div className="av4-filmstrip-sprockets">
            {Array.from({ length: 10 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <p className="av4-filmstrip-cap">field reel · auto</p>
        </div>
      </div>
    </section>
  )
}

function ScoreMoment() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const score = useCountUp(91, visible, 1800)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="av4-score" ref={ref}>
      <div className="av4-score-stage">
        <AutoVideo src={VIDEO.trees} className="av4-score-bg" />
        <div className="av4-score-veil" />
        <div className="av4-score-inner">
          <p className="av4-eyebrow av4-reveal">Under the hood</p>
          <h2 className="av4-display av4-reveal">
            Evidence tips
            <br />
            the scale
          </h2>
          <div className={`av4-score-orb ${visible ? 'is-in' : ''}`}>
            <svg viewBox="0 0 200 200" className="av4-score-ring">
              <circle cx="100" cy="100" r="88" className="av4-score-track" />
              <circle
                cx="100"
                cy="100"
                r="88"
                className="av4-score-progress"
                style={{ strokeDashoffset: visible ? 552 - (552 * score) / 100 : 552 }}
              />
            </svg>
            <div className="av4-score-num">
              <strong>{score}</strong>
              <span>trust</span>
            </div>
          </div>
          <p className="av4-body av4-reveal av4-center">
            Vision reads the pack. Signals weigh the claim. A quiet number lands.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  const [boot, setBoot] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setBoot(true), 40)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className={`about-page about-page--v4 about-page--video ${boot ? 'is-boot' : ''}`}>
      <div className="av4-progress" aria-hidden>
        <div className="av4-progress-fill" />
      </div>

      {/* Full-bleed autoplay video — type sits on live footage */}
      <section className="av5-hero">
        <div className="av5-hero-stage">
          <AutoVideo src={VIDEO.canopy} className="av5-hero-video" priority />
          <div className="av5-hero-scrim" aria-hidden />
          <div className="av5-hero-grain" aria-hidden />

          <div className="av5-hero-brand">
            <p className="av5-hero-kicker">Live field reel</p>
            <h1 className="av5-hero-title">EcoVerify</h1>
          </div>

          <div className="av5-hero-frame" aria-hidden>
            <span className="av5-corner tl" />
            <span className="av5-corner tr" />
            <span className="av5-corner bl" />
            <span className="av5-corner br" />
            <span className="av5-rec">
              <i /> AUTO · MUTED LOOP
            </span>
          </div>
        </div>

        <div className="av5-hero-dock">
          <p className="av4-eyebrow av4-hero-in" style={{ '--d': '0.08s' }}>
            Trust, on camera
          </p>
          <p className="av5-hero-lede av4-hero-in" style={{ '--d': '0.22s' }}>
            The trust score for everyday products — so green claims meet real evidence.
          </p>
          <div className="av4-cta-row av4-hero-in" style={{ '--d': '0.38s' }}>
            <MagneticLink to="/" className="av4-cta av4-cta-primary" strength={0.42}>
              Try a scan
            </MagneticLink>
            <MagneticLink href="#story" className="av4-cta av4-cta-ghost" strength={0.22}>
              Enter the brief
            </MagneticLink>
          </div>
        </div>
      </section>

      <TruthSwap />
      <HorizontalRail />
      <PinStory />
      <ScoreMoment />

      <section className="av4-split">
        <article className="av4-split-card av4-reveal">
          <p className="av4-eyebrow">Shoppers</p>
          <h3>Cut through the green fog at the shelf.</h3>
          <p>Know what holds up — and what is marketing vapor.</p>
          <MagneticLink to="/" className="av4-cta av4-cta-primary">
            Start a scan
          </MagneticLink>
        </article>
        <article className="av4-split-card av4-reveal">
          <p className="av4-eyebrow">Brands</p>
          <h3>See claims the way critical buyers do.</h3>
          <p>Strengthen evidence before the aisle calls you out.</p>
          <MagneticLink to="/BrandDashboard" className="av4-cta av4-cta-ghost">
            Brand dashboard
          </MagneticLink>
        </article>
      </section>

      <section className="av5-finale">
        <div className="av5-finale-video" aria-hidden>
          <AutoVideo src={VIDEO.canopy} />
          <div className="av5-finale-veil" />
        </div>
        <div className="av5-finale-copy">
          <h2 className="av5-finale-title av4-reveal">EcoVerify</h2>
          <p className="av4-lede av4-center av4-reveal">Trust scores for the products you already buy.</p>
          <div className="av4-cta-row av4-center-row av4-reveal">
            <MagneticLink to="/" className="av4-cta av4-cta-primary" strength={0.4}>
              Scan something
            </MagneticLink>
            <MagneticLink to="/Alternatives" className="av4-cta av4-cta-ghost" strength={0.2}>
              Better picks
            </MagneticLink>
          </div>
        </div>
      </section>
    </div>
  )
}
