import { useEffect, useRef, useState } from 'react'

/** Smooth scroll progress 0→1 for an element (or document). */
export function useScrollProgress(targetRef) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onScroll = () => {
      const el = targetRef?.current
      if (!el) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
        return
      }
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const raw = total > 0 ? -rect.top / total : 0
      setProgress(Math.min(1, Math.max(0, raw)))
    }

    onScroll()
    if (reduced) return undefined
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [targetRef])

  return progress
}

/** Pointer-driven magnetic offset for CTAs. */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  const [style, setStyle] = useState({ transform: 'translate3d(0,0,0)' })

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      setStyle({
        transform: `translate3d(${x * strength}px, ${y * strength}px, 0)`,
      })
    }
    const onLeave = () => setStyle({ transform: 'translate3d(0,0,0)' })

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  return { ref, style }
}

/** Count from 0 to `to` when visible. */
export function useCountUp(to, visible, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!visible) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to)
      return undefined
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, visible, duration])

  return value
}
