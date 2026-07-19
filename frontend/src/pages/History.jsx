import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { BarChart3, Star, ChevronRight, Download } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import Reveal from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProductById, getTrustLabel, getCategories } from '@/components/data/productData'
import { listScans, loadScans, toggleSaved } from '@/lib/scanHistory'
import ProductImage from '@/components/ProductImage'

export default function History() {
  const [dateRange, setDateRange] = useState('all')
  const [scoreRange, setScoreRange] = useState('all')
  const [category, setCategory] = useState('all')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    loadScans().then(() => {
      if (alive) setTick((t) => t + 1)
    })
    return () => {
      alive = false
    }
  }, [])

  const allScans = useMemo(() => listScans(), [tick])

  const scans = useMemo(() => {
    return allScans
      .map((s) => ({
        ...s,
        product: getProductById(s.productId),
        date: new Date(s.timestamp),
        displayScore: s.trustScore ?? getProductById(s.productId)?.trust_score ?? 0,
      }))
      .filter((s) => s.product)
      .filter((s) => {
        if (dateRange === 'today' && !isToday(s.date)) return false
        if (dateRange === 'week' && !isThisWeek(s.date)) return false
        if (dateRange === 'month' && !isThisMonth(s.date)) return false

        const score = s.displayScore
        if (scoreRange === 'low' && !(score <= 40)) return false
        if (scoreRange === 'medium' && !(score >= 41 && score <= 70)) return false
        if (scoreRange === 'high' && !(score >= 71)) return false

        if (category !== 'all' && s.product.category !== category) return false
        return true
      })
  }, [allScans, dateRange, scoreRange, category])

  const saved = useMemo(() => {
    const seen = new Set()
    return allScans
      .filter((s) => s.saved)
      .map((s) => getProductById(s.productId))
      .filter((p) => {
        if (!p || seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
  }, [allScans])

  const exportCsv = () => {
    const rows = [
      ['timestamp', 'product_id', 'name', 'brand', 'category', 'trust_score', 'source', 'saved'],
      ...scans.map((s) => [
        s.timestamp,
        s.product.id,
        s.product.name,
        s.product.brand,
        s.product.category,
        s.displayScore,
        s.source || '',
        s.saved ? 'yes' : 'no',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecoverify-scan-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onToggleStar = (e, scanId) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaved(scanId)
    setTick((t) => t + 1)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={BarChart3}
        title="History"
        sticker="your trail"
        description={`${allScans.length} scans — synced to the EcoVerify API when available.`}
        gradient="from-teal-600 to-emerald-700"
      />

      <Reveal>
        <SectionCard icon={BarChart3} title="All Scans" accentColor="border-teal-400">
          <ul className="space-y-2">
            {scans.map((s) => {
              const trust = getTrustLabel(s.displayScore)
              return (
                <li key={s.id}>
                  <Link
                    to={`/ProductDetail?id=${s.product.id}`}
                    className="immersive-list-item flex items-center gap-3 rounded-lg p-2"
                  >
                    <ProductImage
                      src={s.product.image}
                      alt={s.product.name}
                      category={s.product.category}
                      className="h-12 w-12 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{s.product.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(s.date, 'MMM d, yyyy • h:mm a')}
                        {s.source ? ` · ${s.source}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={s.saved ? 'Unsave' : 'Save'}
                      onClick={(e) => onToggleStar(e, s.id)}
                      className="rounded-full p-1 hover:bg-amber-50"
                    >
                      <Star
                        className={`h-4 w-4 ${s.saved ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
                      />
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                      {Math.round(s.displayScore)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              )
            })}
            {!scans.length && (
              <p className="text-sm text-gray-500">
                No scans match these filters. Try a scan from Home — photo, barcode, or search.
              </p>
            )}
          </ul>
        </SectionCard>
      </Reveal>

      <Reveal delay={80}>
        <SectionCard icon={Star} title="Saved Products" accentColor="border-amber-400">
          {saved.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {saved.map((p) => (
                <Link
                  key={p.id}
                  to={`/ProductDetail?id=${p.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5"
                >
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    category={p.category}
                    className="h-6 w-6 shrink-0 rounded-full"
                    imgClassName="h-full w-full object-cover"
                  />
                  <span className="whitespace-nowrap text-xs font-medium text-amber-900">{p.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Star a scan to pin it here.</p>
          )}
        </SectionCard>
      </Reveal>

      <Reveal delay={120}>
        <SectionCard title="Filters" accentColor="border-gray-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      </Reveal>

      <Reveal delay={160}>
        <SectionCard icon={Download} title="Export Data" accentColor="border-emerald-500">
          <Button variant="secondary" onClick={exportCsv} disabled={!scans.length}>
            Export filtered history (CSV)
          </Button>
        </SectionCard>
      </Reveal>
    </div>
  )
}
