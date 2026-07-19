import { useEffect, useRef, useState } from 'react'
import Reveal from '@/components/Reveal'
import MagneticLink from '@/components/MagneticLink'
import useReveal from '@/hooks/useReveal'
import { useCountUp, useScrollProgress } from '@/hooks/useMotion'

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
    src: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
  },
  {
    cls: 'af-2',
    src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80',
  },
  {
    cls: 'af-3',
    src: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
  },
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
          style={{ animationDelay: `${120 + i * 55}ms` }}
        >
          {ch}
        </span>
      ))}
    </h1>
  )
}

export default function About() {
  const pageRef = useRef(null)
  const heroRef = useRef(null)
  const progress = useScrollProgress(pageRef)
  const [heroShift, setHeroShift] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      if (reduced) return
      const y = window.scrollY
      setHeroShift(Math.min(120, y * 0.28))
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

      <section className="about-hero" ref={heroRef}>
        <div
          className="about-hero-media"
          aria-hidden
          style={{ transform: `translate3d(0, ${heroShift}px, 0) scale(1.08)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=82"
            alt=""
          />
          <div className="about-hero-grain" />
          <div className="about-hero-veil" />
        </div>

        <div className="about-hero-floats" aria-hidden>
          {FLOATS.map((f) => (
            <img key={f.cls} src={f.src} alt="" className={`about-float ${f.cls}`} />
          ))}
        </div>

        <div className="about-hero-copy">
          <p className="about-kicker">Trust, made legible</p>
          <LetterBrand text="EcoVerify" />
          <p className="about-lede">
            The trust score for everyday products — so green claims meet real evidence.
          </p>
          <div className="about-cta-row">
            <MagneticLink to="/" className="about-cta about-cta-primary">
              Try a scan
            </MagneticLink>
            <MagneticLink href="#story" className="about-cta about-cta-ghost" strength={0.18}>
              Enter the story
            </MagneticLink>
          </div>
        </div>

        <a href="#story" className="about-scroll-cue" aria-label="Scroll to story">
          <span />
        </a>
      </section>

      <section className="about-chapter" id="story">
        <div className="about-chapter-inner about-problem">
          <Reveal>
            <p className="about-hand about-section-hand">look closer</p>
            <h2 className="about-display">
              Labels look green.
              <br />
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
            <p className="about-body">Three beats from shelf curiosity to a clearer cart.</p>
          </Reveal>
        </div>
        <div className="about-film-track">
          {BEATS.map((beat, i) => (
            <Reveal as="article" key={beat.step} delay={i * 100} className="about-frame">
              <div className="about-frame-media">
                <img src={beat.image} alt="" />
                <span className="about-frame-step">{beat.step}</span>
              </div>
              <h3>{beat.title}</h3>
              <p>{beat.body}</p>
            </Reveal>
          ))}
        </div>
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
              <span>Vision</span>
              <span className="about-pipe" aria-hidden />
              <span>Signals</span>
              <span className="about-pipe" aria-hidden />
              <span>Trust Score</span>
            </div>
          </Reveal>
          <Reveal delay={160} variant="scale">
            <ScoreOrb />
          </Reveal>
        </div>
      </section>

      <section className="about-split">
        <Reveal className="about-split-panel about-split-shop">
          <p className="about-hand">for shoppers</p>
          <h3>Cut through the green fog at the shelf.</h3>
          <p>Know what holds up — and what is marketing vapor.</p>
          <MagneticLink to="/" className="about-cta about-cta-primary">
            Start a scan
          </MagneticLink>
        </Reveal>
        <Reveal delay={100} className="about-split-panel about-split-brand">
          <p className="about-hand">for brands</p>
          <h3>See your claims the way critical buyers do.</h3>
          <p>Strengthen evidence before the aisle calls you out.</p>
          <MagneticLink to="/BrandDashboard" className="about-cta about-cta-ghost">
            Brand dashboard
          </MagneticLink>
        </Reveal>
      </section>

      <section className="about-finale">
        <div className="about-finale-glow" aria-hidden />
        <Reveal>
          <p className="about-hand about-section-hand">ready?</p>
          <h2 className="about-brand about-brand-sm">EcoVerify</h2>
          <p className="about-lede about-lede-center">Trust scores for the products you already buy.</p>
          <div className="about-cta-row about-cta-center">
            <MagneticLink to="/" className="about-cta about-cta-primary">
              Scan something
            </MagneticLink>
            <MagneticLink to="/Alternatives" className="about-cta about-cta-ghost">
              Browse better picks
            </MagneticLink>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
