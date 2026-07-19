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

  return (
    <div className={`min-h-svh relative ${isHome ? '' : 'immersive-app'}`}>
      {!isHome && !isAbout && (
        <>
          <div className="immersive-paper" aria-hidden />
          <div className="immersive-dotgrid" aria-hidden />
          <div className="immersive-wash" aria-hidden />
        </>
      )}

      {isAbout && (
        <>
          <div className="immersive-paper" aria-hidden />
          <div className="immersive-dotgrid about-dotgrid" aria-hidden />
        </>
      )}

      {!isImmersiveFull && (
        <header className="immersive-header sticky top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
            <NavLink to="/" className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
              EcoVerify
            </NavLink>
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.slice(0, 6).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-ink)] text-white'
                        : 'text-[var(--color-ink-soft)] hover:bg-black/5'
                    }`
                  }
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
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-0.5 text-[28px] font-medium leading-none tracking-tight transition-opacity hover:opacity-100 sm:text-[30px] ${
                      isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
                    }`
                  }
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
