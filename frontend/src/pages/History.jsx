import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { BarChart3, Star, ChevronRight, Download } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockScanHistory, getProductById, getTrustLabel, getCategories } from '@/components/data/productData'

export default function History() {
  const [dateRange, setDateRange] = useState('all')
  const [scoreRange, setScoreRange] = useState('all')
  const [category, setCategory] = useState('all')

  const scans = useMemo(() => {
    return mockScanHistory
      .map((s) => ({ ...s, product: getProductById(s.productId), date: new Date(s.timestamp) }))
      .filter((s) => s.product)
      .filter((s) => {
        if (dateRange === 'today' && !isToday(s.date)) return false
        if (dateRange === 'week' && !isThisWeek(s.date)) return false
        if (dateRange === 'month' && !isThisMonth(s.date)) return false

        const score = s.product.trust_score
        if (scoreRange === 'low' && !(score <= 40)) return false
        if (scoreRange === 'medium' && !(score >= 41 && score <= 70)) return false
        if (scoreRange === 'high' && !(score >= 71)) return false

        if (category !== 'all' && s.product.category !== category) return false
        return true
      })
  }, [dateRange, scoreRange, category])

  const saved = mockScanHistory
    .filter((s) => s.saved)
    .map((s) => getProductById(s.productId))
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <PageHeader
        icon={BarChart3}
        title="HISTORY"
        badges={['Timeline']}
        description="Past scans with filters and saved products."
        gradient="from-teal-500 to-cyan-500"
      />

      <SectionCard icon={BarChart3} title="All Scans" accentColor="border-teal-400">
        <ul className="space-y-2">
          {scans.map((s) => {
            const trust = getTrustLabel(s.product.trust_score)
            return (
              <li key={`${s.productId}-${s.timestamp}`}>
                <Link
                  to={`/ProductDetail?id=${s.product.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                >
                  <img src={s.product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.product.name}</p>
                    <p className="text-xs text-gray-500">{format(s.date, 'MMM d, yyyy • h:mm a')}</p>
                  </div>
                  {s.saved && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                    {s.product.trust_score}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </li>
            )
          })}
          {!scans.length && <p className="text-sm text-gray-500">No scans match these filters.</p>}
        </ul>
      </SectionCard>

      <SectionCard icon={Star} title="Saved Products" accentColor="border-amber-400">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {saved.map((p) => (
            <Link
              key={p.id}
              to={`/ProductDetail?id=${p.id}`}
              className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 shrink-0"
            >
              <img src={p.image} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-xs font-medium text-amber-900 whitespace-nowrap">{p.name}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Filters" accentColor="border-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="mb-2 block">Date range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Score range</Label>
            <Select value={scoreRange} onValueChange={setScoreRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low (0-40)</SelectItem>
                <SelectItem value="medium">Medium (41-70)</SelectItem>
                <SelectItem value="high">High (71-100)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {getCategories().map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Download} title="Export Data" accentColor="border-indigo-400">
        <Button
          variant="secondary"
          onClick={() => alert('Scan history CSV export started (demo).')}
        >
          Export Scan History (CSV)
        </Button>
      </SectionCard>
    </div>
  )
}
