import { useEffect, useRef, useState } from 'react'
import Reveal from '@/components/Reveal'
import MagneticLink from '@/components/MagneticLink'
import StaggerText from '@/components/StaggerText'
import useReveal from '@/hooks/useReveal'
import { useCountUp, useScrollProgress } from '@/hooks/useMotion'
import { usePointerStage } from '@/hooks/usePointerStage'

const BEATS = [
  {
    step: '01',
    title: 'Scan',
    body: 'A glance at packaging. Labels, marks, and material cues become readable signals.',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80',
  },
  {
    step: '02',
    title: 'Trust Score',
    body: 'Evidence distilled into 0–100. Greenwash risk rises when claims outrun proof.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  },
  {
    step: '03',
    title: 'Better picks',
    body: 'Higher-trust alternatives in the same aisle — so the next choice is clearer.',
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
  },
]

const FLOATS = [
  {
    cls: 'af-1',
    depth: 1.2,
    src: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
  },
  {
    cls: 'af-2',
    depth: 0.7,
    src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80',
  },
  {
    cls: 'af-3',
    depth: 1,
    src: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
  },
  {
    cls: 'af-4',
    depth: 0.55,
    src: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
  },
]

const MARQUEE = [
  'certifications',
  'materials',
  'supply chain',
  'packaging',
  'carbon',
  'greenwash risk',
  'trust score',
  'better aisle',
]

function ClaimFlip() {
  const [open, setOpen] = useState(false)

  return (
    <button
      type="button"
      className={`about-claim ${open ? 'is-open' : ''}`}
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
    >
      <span className="about-claim-glow" aria-hidden />
      <span className="about-claim-face about-claim-front">
        <span className="about-tape" aria-hidden />
        <span className="about-hand">100% eco</span>
        <span className="about-claim-hint">{open ? 'fold it back' : 'peel the sticker'}</span>
      </span>
      <span className="about-claim-face about-claim-back">
        <span className="about-hand">weak proof</span>
        <span className="about-claim-hint">no trail · vague certs · vibes only</span>
      </span>
    </button>
  )
}

function ScoreOrb() {
  const { ref, visible } = useReveal({ threshold: 0.4 })
  const score = useCountUp(91, visible, 1600)

  return (
    <div ref={ref} className={`about-orb ${visible ? 'is-in' : ''}`}>
      <div className="about-orb-halo" aria-hidden />
      <svg viewBox="0 0 120 120" className="about-orb-ring" aria-hidden>
        <circle cx="60" cy="60" r="52" className="about-orb-track" />
        <circle
          cx="60"
          cy="60"
          r="52"
          className="about-orb-progress"
          style={{ strokeDashoffset: visible ? 326 - (326 * score) / 100 : 326 }}
        />
      </svg>
      <div className="about-orb-core">
        <span className="about-orb-num">{score}</span>
        <span className="about-orb-label">Trust</span>
      </div>
    </div>
  )
}

function LetterBrand({ text }) {
  return (
    <h1 className="about-brand" aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="about-letter"
          style={{ animationDelay: `${80 + i * 70}ms` }}
        >
          {ch}
        </span>
      ))}
    </h1>
  )
}

function FilmBeats() {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return undefined
    const onScroll = () => {
      const cards = [...el.querySelectorAll('.about-frame')]
      if (!cards.length) return
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      cards.forEach((card, i) => {
        const c = card.offsetLeft + card.offsetWidth / 2
        const d = Math.abs(c - mid)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      setActive(best)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="about-film-track" ref={trackRef}>
        {BEATS.map((beat, i) => (
          <article
            key={beat.step}
            className={`about-frame ${active === i ? 'is-active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            tabIndex={0}
          >
            <div className="about-frame-media">
              <img src={beat.image} alt="" />
              <span className="about-frame-step">{beat.step}</span>
              <span className="about-frame-shine" aria-hidden />
            </div>
            <h3>{beat.title}</h3>
            <p>{beat.body}</p>
          </article>
        ))}
      </div>
      <div className="about-film-dots" aria-hidden>
        {BEATS.map((b, i) => (
          <span key={b.step} className={`about-film-dot ${active === i ? 'is-on' : ''}`} />
        ))}
      </div>
    </>
  )
}

function TiltPanel({ className, children }) {
  const [style, setStyle] = useState({})
  return (
    <div
      className={className}
      style={style}
      onPointerMove={(e) => {
        if (window.matchMedia('(pointer: coarse)').matches) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - r.left) / r.width - 0.5) * 12
        const y = ((e.clientY - r.top) / r.height - 0.5) * -10
        setStyle({ transform: `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)` })
      }}
      onPointerLeave={() => setStyle({ transform: 'none' })}
    >
      {children}
    </div>
  )
}

export default function About() {
  const pageRef = useRef(null)
  const progress = useScrollProgress(pageRef)
  const [heroShift, setHeroShift] = useState(0)
  const { ref: heroPtr, mediaStyle, floatStyle, spotlightStyle, pos } = usePointerStage(0.85)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      if (reduced) return
      setHeroShift(Math.min(140, window.scrollY * 0.32))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="about-page" ref={pageRef}>
      <div className="about-progress" aria-hidden>
        <div className="about-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="about-noise" aria-hidden />

      <section className="about-hero" ref={heroPtr}>
        <div
          className="about-hero-media"
          aria-hidden
          style={{
            ...mediaStyle,
            transform: `${mediaStyle.transform || ''} translate3d(0, ${heroShift}px, 0)`.trim(),
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=82"
            alt=""
          />
          <div className="about-hero-grain" />
          <div className="about-hero-veil" />
          <div className="about-hero-spotlight" style={spotlightStyle} />
        </div>

        <div className="about-hero-floats" aria-hidden>
          {FLOATS.map((f) => (
            <img
              key={f.cls}
              src={f.src}
              alt=""
              className={`about-float ${f.cls}`}
              style={floatStyle(f.depth)}
            />
          ))}
        </div>

        <div
          className="about-hero-copy"
          style={floatStyle(0.35)}
        >
          <p className="about-kicker">Trust, made legible</p>
          <LetterBrand text="EcoVerify" />
          <p className="about-lede">
            The trust score for everyday products — so green claims meet real evidence.
          </p>
          <div className="about-cta-row">
            <MagneticLink to="/" className="about-cta about-cta-primary" strength={0.4}>
              Try a scan
            </MagneticLink>
            <MagneticLink href="#story" className="about-cta about-cta-ghost" strength={0.22}>
              Enter the story
            </MagneticLink>
          </div>
          <p className="about-hero-hint" aria-hidden>
            {pos.active ? 'Keep moving — the forest follows.' : 'Move your pointer across the canopy.'}
          </p>
        </div>

        <a href="#story" className="about-scroll-cue" aria-label="Scroll to story">
          <span />
          <em>scroll</em>
        </a>
      </section>

      <div className="about-marquee" aria-hidden>
        <div className="about-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </div>
      </div>

      <section className="about-chapter" id="story">
        <div className="about-chapter-inner about-problem">
          <Reveal>
            <p className="about-hand about-section-hand">look closer</p>
            <StaggerText
              as="h2"
              className="about-display"
              text="Labels look green."
              mode="words"
              delay={55}
            />
            <h2 className="about-display about-display-em">
              <em>Proof is hard.</em>
            </h2>
            <p className="about-body">
              Packaging shouts sustainability. Marks blur together. Shoppers guess —
              and greenwash wins by default.
            </p>
          </Reveal>
          <Reveal delay={140} className="about-claim-wrap" variant="scale">
            <ClaimFlip />
          </Reveal>
        </div>
      </section>

      <section className="about-film" id="how">
        <div className="about-film-head">
          <Reveal>
            <p className="about-hand about-section-hand">the loop</p>
            <h2 className="about-display">What EcoVerify does</h2>
            <p className="about-body">Drag sideways. Watch the beat that stays in focus.</p>
          </Reveal>
        </div>
        <FilmBeats />
      </section>

      <section className="about-scoreband">
        <div className="about-scoreband-inner">
          <Reveal>
            <p className="about-hand about-section-hand">under the hood</p>
            <h2 className="about-display">
              How a score
              <br />
              is born
            </h2>
            <p className="about-body">Vision reads. Signals weigh. A trust number lands — quietly rigorous.</p>
            <div className="about-pipeline" aria-label="Scoring pipeline">
              <span className="about-pipe-node">Vision</span>
              <span className="about-pipe" aria-hidden />
              <span className="about-pipe-node">Signals</span>
              <span className="about-pipe" aria-hidden />
              <span className="about-pipe-node">Trust Score</span>
            </div>
          </Reveal>
          <Reveal delay={160} variant="scale">
            <ScoreOrb />
          </Reveal>
        </div>
      </section>

      <section className="about-split">
        <Reveal>
          <TiltPanel className="about-split-panel about-split-shop">
            <p className="about-hand">for shoppers</p>
            <h3>Cut through the green fog at the shelf.</h3>
            <p>Know what holds up — and what is marketing vapor.</p>
            <MagneticLink to="/" className="about-cta about-cta-primary">
              Start a scan
            </MagneticLink>
          </TiltPanel>
        </Reveal>
        <Reveal delay={100}>
          <TiltPanel className="about-split-panel about-split-brand">
            <p className="about-hand">for brands</p>
            <h3>See your claims the way critical buyers do.</h3>
            <p>Strengthen evidence before the aisle calls you out.</p>
            <MagneticLink to="/BrandDashboard" className="about-cta about-cta-ghost">
              Brand dashboard
            </MagneticLink>
          </TiltPanel>
        </Reveal>
      </section>

      <section className="about-finale">
        <div className="about-finale-glow" aria-hidden />
        <div className="about-finale-orbit" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>
        <Reveal>
          <p className="about-hand about-section-hand">ready?</p>
          <LetterBrand text="EcoVerify" />
          <p className="about-lede about-lede-center">Trust scores for the products you already buy.</p>
          <div className="about-cta-row about-cta-center">
            <MagneticLink to="/" className="about-cta about-cta-primary" strength={0.42}>
              Scan something
            </MagneticLink>
            <MagneticLink to="/Alternatives" className="about-cta about-cta-ghost" strength={0.24}>
              Browse better picks
            </MagneticLink>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
