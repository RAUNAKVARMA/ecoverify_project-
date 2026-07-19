import { useMemo } from 'react'
import useReveal from '@/hooks/useReveal'

/** Staggered letter / word entrance for display titles. */
export default function StaggerText({
  text,
  as: Tag = 'h1',
  className = '',
  mode = 'chars',
  delay = 40,
}) {
  const { ref, visible } = useReveal({ threshold: 0.25 })
  const parts = useMemo(() => {
    if (mode === 'words') return String(text).split(/(\s+)/)
    return Array.from(String(text))
  }, [text, mode])

  return (
    <Tag ref={ref} className={`stagger-text ${visible ? 'is-in' : ''} ${className}`} aria-label={text}>
      {parts.map((part, i) => (
        <span
          key={`${part}-${i}`}
          className={`stagger-unit ${part === ' ' ? 'is-space' : ''}`}
          style={{ '--i': i, '--stagger': `${delay}ms` }}
          aria-hidden
        >
          {part === ' ' ? '\u00A0' : part}
        </span>
      ))}
    </Tag>
  )
}
