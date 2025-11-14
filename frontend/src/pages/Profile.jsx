import { Link } from 'react-router-dom'
import { User, BookOpen, MessageCircle, Video } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockScanHistory } from '@/components/data/productData'
import { useAuth } from '@/context/AuthContext'

const PRIORITIES = [
  { id: 'Climate', label: 'Climate 🌍' },
  { id: 'Plastic Reduction', label: 'Plastic ♻️' },
  { id: 'Fair Trade', label: 'Fair Trade 🤝' },
  { id: 'Animal Welfare', label: 'Animal Welfare 🐾' },
]

export default function Profile() {
  const { prefs, updatePrefs, user, signInWithGoogle, signOutUser } = useAuth()

  const totalScans = mockScanHistory.length + 12
  const greenwashingAvoided = 4
  const ecoImpact = totalScans * 15 + greenwashingAvoided * 25

  const togglePriority = (id) => {
    const set = new Set(prefs.priorities || [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    updatePrefs({ priorities: [...set] })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={User}
        title="PROFILE & SETTINGS"
        badges={['Account']}
        description="Preferences, stats, and support."
        gradient="from-emerald-500 to-teal-500"
      />

      <SectionCard title="Account" accentColor="border-emerald-500">
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button type="button" className="text-sm text-red-600" onClick={signOutUser}>
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium"
          >
            Sign in with Google
          </button>
        )}
      </SectionCard>

      <SectionCard title="Personal Stats" accentColor="border-blue-400">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Products Scanned" value={totalScans} color="bg-blue-50 text-blue-800" />
          <Stat label="Greenwashing Avoided" value={greenwashingAvoided} color="bg-red-50 text-red-800" />
          <Stat label="Eco Impact Score" value={ecoImpact} color="bg-amber-50 text-amber-800" />
          <Stat label="Monthly Insights" value="+12%" color="bg-purple-50 text-purple-800" />
        </div>
      </SectionCard>

      <SectionCard title="Preferences" accentColor="border-emerald-500">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Priority Concerns</Label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const active = (prefs.priorities || []).includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePriority(p.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                      active ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-white border-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Sensitivity Settings</Label>
            <Select value={prefs.sensitivity} onValueChange={(v) => updatePrefs({ sensitivity: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="lenient">Lenient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Offline Mode</Label>
            <Switch checked={prefs.offlineMode} onCheckedChange={(v) => updatePrefs({ offlineMode: v })} />
          </div>
          <div>
            <Label className="mb-2 block">Language</Label>
            <Select value={prefs.language} onValueChange={(v) => updatePrefs({ language: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['English', 'हिंदी', 'मराठी', 'தமிழ்', 'తెలుగు'].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications" accentColor="border-amber-400">
        <div className="flex items-center justify-between">
          <Label>Enable notifications</Label>
          <Switch checked={prefs.notifications} onCheckedChange={(v) => updatePrefs({ notifications: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Help & Support" accentColor="border-blue-400">
        <div className="space-y-2">
          <Link to="/FAQ" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
            <BookOpen className="h-4 w-4" /> 📖 FAQs & Tutorials
          </Link>
          <button type="button" className="flex items-center gap-2 text-sm text-blue-700" onClick={() => alert('support@ecoverify.com')}>
            <MessageCircle className="h-4 w-4" /> 💬 Contact Support
          </button>
          <button type="button" className="flex items-center gap-2 text-sm text-blue-700" onClick={() => alert('Video guides coming soon')}>
            <Video className="h-4 w-4" /> 🎥 Video Guides
          </button>
        </div>
      </SectionCard>

      <SectionCard title="About" accentColor="border-gray-300">
        <p className="text-sm text-gray-700 mb-2">EcoVerify v1.0.0</p>
        <div className="space-y-1 text-sm">
          <Link to="/Terms" className="block text-emerald-700 hover:underline">Terms of Service →</Link>
          <Link to="/Privacy" className="block text-emerald-700 hover:underline">Privacy Policy →</Link>
          <Link to="/DataUsage" className="block text-emerald-700 hover:underline">Data Usage →</Link>
        </div>
      </SectionCard>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  )
}
