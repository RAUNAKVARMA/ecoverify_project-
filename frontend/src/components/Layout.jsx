import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/About', label: 'About' },
  { to: '/History', label: 'History' },
  { to: '/Alternatives', label: 'Alternatives' },
  { to: '/Profile', label: 'Profile' },
  { to: '/BrandDashboard', label: 'Brand' },
  { to: '/FAQ', label: 'Help' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isAbout = pathname === '/About'
  const isImmersiveFull = isHome || isAbout
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (isImmersiveFull) return undefined
    const glow = glowRef.current
    if (!glow) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined

    const onMove = (e) => {
      glow.style.setProperty('--gx', `${e.clientX}px`)
      glow.style.setProperty('--gy', `${e.clientY}px`)
      glow.style.opacity = '1'
    }
    const onLeave = () => {
      glow.style.opacity = '0'
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [isImmersiveFull])

  return (
    <div className={`min-h-svh relative ${isHome ? '' : isAbout ? 'immersive-app immersive-app--about' : 'immersive-app'}`}>
      {!isHome && !isAbout && (
        <>
          <div className="immersive-paper" aria-hidden />
          <div className="immersive-dotgrid" aria-hidden />
          <div className="immersive-wash" aria-hidden />
          <div ref={glowRef} className="ix-cursor-glow" aria-hidden />
        </>
      )}

      {!isImmersiveFull && (
        <header className="immersive-header sticky top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
            <NavLink to="/" className="brand-mark group">
              <span className="brand-mark-ev" aria-hidden>
                EV
              </span>
              <span className="brand-mark-word">
                EcoVerify
                <span className="brand-mark-ink" aria-hidden />
              </span>
            </NavLink>
            <nav className="hidden items-center gap-5 lg:flex">
              {navItems.slice(0, 6).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-ink ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main
        key={pathname}
        className={
          isImmersiveFull
            ? 'page-enter relative z-10'
            : 'page-enter relative z-10 mx-auto w-full max-w-6xl p-4 pb-28 md:p-6 md:pb-10'
        }
      >
        <Outlet />
      </main>

      <div className="pointer-events-none fixed inset-0 z-[60]">
        <div
          ref={menuRef}
          className={`menu-pill animate-spring-in pointer-events-auto absolute overflow-hidden ${
            open
              ? 'bottom-8 right-6 w-[min(345px,calc(100vw-2rem))] p-5 pb-14 sm:right-10'
              : 'bottom-8 right-6 h-[50px] w-[120px] sm:right-10'
          }`}
          style={open ? { height: 'auto', minHeight: 360 } : undefined}
        >
          {open && (
            <div className="mb-3 flex flex-col items-end gap-1 pr-1">
              {navItems.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `ix-menu-link px-3 py-0.5 text-[28px] font-medium leading-none tracking-tight transition-opacity hover:opacity-100 sm:text-[30px] ${
                      isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
                    }`
                  }
                  style={{ '--i': i }}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className={`absolute bottom-1 cursor-pointer px-[22px] py-2 text-lg font-normal text-[var(--color-ink)] ${
              open ? 'right-2' : 'inset-x-0 mx-auto'
            }`}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </div>
  )
}
