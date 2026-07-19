import { useEffect, useRef, useState } from 'react'

export default function useReveal(options = {}) {
  const {
    threshold = 0.18,
    rootMargin = '0px 0px -8% 0px',
    once = true,
  } = options
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        if (once) io.disconnect()
      },
      { threshold, rootMargin }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, visible }
}
