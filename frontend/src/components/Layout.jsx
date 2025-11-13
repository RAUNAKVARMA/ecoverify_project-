import { NavLink, Outlet } from 'react-router-dom'
import { Leaf, Home, History, Star, User, Building2 } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/History', label: 'History', icon: History },
  { to: '/Alternatives', label: 'Alternatives', icon: Star },
  { to: '/Profile', label: 'Profile', icon: User },
  { to: '/BrandDashboard', label: 'Brand', icon: Building2 },
]

export default function Layout() {
  return (
    <div className="min-h-svh bg-gray-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-bold tracking-wide">
            <Leaf className="h-6 w-6" />
            <span>ECOVERIFY APP</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl p-4 md:p-6 pb-20 md:pb-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
