import { useMagnetic } from '@/hooks/useMotion'

/** Wraps any clickable with magnetic pull on desktop pointers. */
export default function Magnetic({
  as: Comp = 'button',
  children,
  className = '',
  strength = 0.32,
  ...rest
}) {
  const { ref, style } = useMagnetic(strength)
  return (
    <span ref={ref} className="magnetic-wrap">
      <Comp className={className} style={style} {...rest}>
        {children}
      </Comp>
    </span>
  )
}
