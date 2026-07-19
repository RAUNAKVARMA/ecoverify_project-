import { Link } from 'react-router-dom'
import { useMagnetic } from '@/hooks/useMotion'

export default function MagneticLink({
  to,
  href,
  children,
  className = '',
  strength = 0.28,
  ...rest
}) {
  const { ref, style } = useMagnetic(strength)
  const Comp = to ? Link : 'a'
  const props = to ? { to } : { href }

  return (
    <span ref={ref} className="magnetic-wrap">
      <Comp {...props} className={className} style={style} {...rest}>
        {children}
      </Comp>
    </span>
  )
}
