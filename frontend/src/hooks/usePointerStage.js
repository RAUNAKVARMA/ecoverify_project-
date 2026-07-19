import { useEffect, useRef, useState } from 'react'

/**
 * Pointer-reactive tilt + parallax layers for immersive media stages.
 * Returns container handlers and style binders for layers.
 */
export function usePointerStage(intensity = 1) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0, px: 0.5, py: 0.5, active: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const x = (px - 0.5) * 2
      const y = (py - 0.5) * 2
      setPos({ x, y, px, py, active: true })
    }
    const onLeave = () => setPos((p) => ({ ...p, x: 0, y: 0, active: false }))

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const mediaStyle = {
    transform: `scale(1.12) translate3d(${pos.x * -14 * intensity}px, ${pos.y * -10 * intensity}px, 0)`,
    transition: pos.active ? 'transform 0.12s linear' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  }

  const floatStyle = (depth = 1) => ({
    transform: `translate3d(${pos.x * 10 * depth * intensity}px, ${pos.y * 8 * depth * intensity}px, 0)`,
    transition: pos.active ? 'transform 0.15s linear' : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
  })

  const spotlightStyle = {
    background: `radial-gradient(480px circle at ${pos.px * 100}% ${pos.py * 100}%, rgba(247,243,240,0.22), transparent 55%)`,
    opacity: pos.active ? 1 : 0.35,
    transition: 'opacity 0.35s ease',
  }

  return { ref, pos, mediaStyle, floatStyle, spotlightStyle }
}
