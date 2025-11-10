import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USER_KEY = 'ecoverify_user'
const BRAND_KEY = 'ecoverify_brand'
const PREFS_KEY = 'ecoverify_prefs'

const defaultPrefs = {
  sensitivity: 'balanced',
  priorities: [],
  offlineMode: false,
  language: 'English',
  notifications: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [brand, setBrand] = useState(null)
  const [prefs, setPrefs] = useState(defaultPrefs)

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY)
      const b = localStorage.getItem(BRAND_KEY)
      const p = localStorage.getItem(PREFS_KEY)
      if (u) setUser(JSON.parse(u))
      if (b) setBrand(JSON.parse(b))
      if (p) setPrefs({ ...defaultPrefs, ...JSON.parse(p) })
    } catch {
      /* ignore */
    }
  }, [])

  const signInWithGoogle = () => {
    const next = {
      email: 'priya@example.com',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    }
    setUser(next)
    localStorage.setItem(USER_KEY, JSON.stringify(next))
  }

  const signOutUser = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  const brandLogin = async (email, password) => {
    await new Promise((r) => setTimeout(r, 1000))
    if (email === 'demo@brand.com' && password === 'demo123') {
      const next = {
        email,
        companyName: 'EcoBrand Demo',
        verified: true,
        status: 'verified',
      }
      setBrand(next)
      localStorage.setItem(BRAND_KEY, JSON.stringify(next))
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials. Use demo@brand.com / demo123' }
  }

  const brandRegister = async (data) => {
    await new Promise((r) => setTimeout(r, 1000))
    const next = {
      email: data.email,
      companyName: data.companyName,
      phone: data.phone,
      registrationNumber: data.registrationNumber,
      verified: false,
      status: 'pending',
    }
    setBrand(next)
    localStorage.setItem(BRAND_KEY, JSON.stringify(next))
    return { ok: true }
  }

  const brandSignOut = () => {
    setBrand(null)
    localStorage.removeItem(BRAND_KEY)
  }

  const updatePrefs = (partial) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        brand,
        prefs,
        signInWithGoogle,
        signOutUser,
        brandLogin,
        brandRegister,
        brandSignOut,
        updatePrefs,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
