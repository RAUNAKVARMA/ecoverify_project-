import { useState } from 'react'
import { Building2, Shield, Check, Clock, ChevronRight, Upload } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/context/AuthContext'
import { products, getTrustLabel } from '@/components/data/productData'
import { showToast } from '@/lib/toast'

const brandProducts = products.slice(0, 5).map((p, i) => ({
  ...p,
  sku: `SKU-${1000 + i}`,
  status: i === 2 ? 'Pending' : i === 4 ? 'Flagged' : 'Verified',
}))

export default function BrandDashboard() {
  const { brand, brandLogin, brandRegister, brandSignOut } = useAuth()

  if (!brand) return <BrandAuth onLogin={brandLogin} onRegister={brandRegister} />

  if (brand.status === 'pending') {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        <PageHeader icon={Building2} title="Brand dashboard" gradient="from-teal-600 to-emerald-600" />
        <SectionCard accentColor="border-amber-400">
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
            <h2 className="mt-3 text-lg font-semibold">Thank you for registering, {brand.companyName}!</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              Our verification team is reviewing your business credentials. This typically takes 2-3 business days.
            </p>
            <Button variant="outline" className="mt-4" onClick={brandSignOut}>
              Sign Out
            </Button>
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader
        icon={Building2}
        title="Brand dashboard"
        sticker="for brands"
        badges={['Verified']}
        description="Manage products, claims, and analytics."
        gradient="from-teal-700 to-emerald-800"
      />

      <div className="imm-tilt rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 p-4 text-white md:p-6">
        <p className="text-sm text-white/80">Welcome back</p>
        <h2 className="font-display text-xl font-semibold">{brand.companyName}</h2>
        <p className="mt-1 text-sm text-white/90">Verified brand · {brand.email}</p>
      </div>

      <SectionCard icon={Building2} title="My products" accentColor="border-teal-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Trust Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brandProducts.map((p) => {
              const trust = getTrustLabel(p.trust_score)
              const statusCls =
                p.status === 'Verified'
                  ? 'bg-green-100 text-green-800'
                  : p.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />
                      <span className="text-sm">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                      {p.trust_score}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCls}`}>{p.status}</span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-teal-200 p-6 hover:bg-teal-50/50">
          <Upload className="h-6 w-6 text-teal-600" />
          <span className="text-sm text-teal-800">Upload certification documents (PDF/images)</span>
          <input type="file" accept=".pdf,image/*" className="hidden" onChange={() => showToast('Document uploaded')} />
        </label>
      </SectionCard>

      <SectionCard title="Analytics" accentColor="border-indigo-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Metric title="Consumer Scan Volume" value="1,247" note="↑ 12% from last week" />
          <Metric title="Score Trends" value="76.4" note="↑ 3.2 points this month" />
          <Metric title="Common User Queries" value="Packaging, Materials" note="Top topics this week" />
        </div>
      </SectionCard>

      <SectionCard title="Claims Management" accentColor="border-orange-400">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => showToast('Claim form opened')}>Submit New Claims</Button>
          <Button variant="secondary" onClick={() => showToast('Certification update started')}>
            Update Certifications
          </Button>
          <Button variant="outline" onClick={() => showToast('Opened reports inbox')}>
            Respond to User Reports
            <Badge className="ml-1" variant="warning">
              3 pending
            </Badge>
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Support" accentColor="border-gray-300">
        <p className="text-sm text-gray-600 mb-3">
          brands@ecoverify.com · +91 1800-ECO-VERIFY
        </p>
        <Button className="bg-teal-700 hover:bg-teal-800">Contact Support Team</Button>
      </SectionCard>

      <div className="text-center">
        <Button variant="ghost" onClick={brandSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}

function Metric({ title, value, note }) {
  return (
    <div className="rounded-xl bg-indigo-50 p-4">
      <p className="text-xs text-indigo-700">{title}</p>
      <p className="text-xl font-bold text-indigo-950 mt-1">{value}</p>
      <p className="text-xs text-indigo-600 mt-1">{note}</p>
    </div>
  )
}

function BrandAuth({ onLogin, onRegister }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [reg, setReg] = useState({
    companyName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!signIn.email || !signIn.password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    const res = await onLogin(signIn.email, signIn.password)
    setLoading(false)
    if (!res.ok) setError(res.error)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!reg.companyName || !reg.email || !reg.phone || !reg.registrationNumber || !reg.password) {
      setError('All fields are required.')
      return
    }
    if (reg.password !== reg.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (reg.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    await onRegister(reg)
    setLoading(false)
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader
        icon={Building2}
        title="Brand dashboard"
        description="Sign in or register your verified business."
        gradient="from-teal-600 to-emerald-600"
      />

      <SectionCard title="Brand sign-in" accentColor="border-teal-500">
        <Tabs defaultValue="signin">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" value={signIn.email} onChange={(e) => setSignIn({ ...signIn, email: e.target.value })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input className="mt-1" type="password" value={signIn.password} onChange={(e) => setSignIn({ ...signIn, password: e.target.value })} />
              </div>
              <p className="text-xs text-gray-500">Demo: demo@brand.com / demo123</p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              {[
                ['companyName', 'Company Name'],
                ['email', 'Business Email'],
                ['phone', 'Phone'],
                ['registrationNumber', 'Registration Number (CIN/GST)'],
                ['password', 'Password'],
                ['confirmPassword', 'Confirm Password'],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    className="mt-1"
                    type={key.toLowerCase().includes('password') ? 'password' : key === 'email' ? 'email' : 'text'}
                    value={reg[key]}
                    onChange={(e) => setReg({ ...reg, [key]: e.target.value })}
                  />
                </div>
              ))}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting…' : 'Register Business'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </SectionCard>

      <SectionCard title="Security Info" accentColor="border-blue-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Info icon={Shield} color="text-blue-600" title="Secure Authentication" text="Encrypted brand sessions" />
          <Info icon={Building2} color="text-teal-600" title="Business Verification" text="CIN/GST reviewed by our team" />
          <Info icon={Check} color="text-green-600" title="Trusted Platform" text="Join 500+ verified brands" />
        </div>
      </SectionCard>
    </div>
  )
}

function Info({ icon: Icon, color, title, text }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 text-center">
      <Icon className={`h-6 w-6 mx-auto ${color}`} />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{text}</p>
    </div>
  )
}
