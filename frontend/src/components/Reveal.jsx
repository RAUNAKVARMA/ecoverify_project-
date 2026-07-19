import useReveal from '@/hooks/useReveal'

export default function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  variant = 'up',
  ...rest
}) {
  const { ref, visible } = useReveal()

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? 'is-in' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
