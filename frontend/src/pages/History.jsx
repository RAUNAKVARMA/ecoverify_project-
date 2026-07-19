import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { Star, Download } from 'lucide-react'
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
        index="02"
        kicker="Trail"
        title="History"
        sticker="keep receipts"
        description={`${allScans.length} scans logged — synced when the API is awake.`}
        action={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!scans.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Reveal>
        <SectionCard index="Trail" title="All scans" description="Newest first">
          <ol className="history-timeline">
            {scans.map((s) => {
              const trust = getTrustLabel(s.displayScore)
              return (
                <li key={s.id} className="history-timeline-item">
                  <span className="history-timeline-dot" aria-hidden />
                  <Link to={`/ProductDetail?id=${s.product.id}`} className="history-card">
                    <ProductImage
                      src={s.product.image}
                      alt={s.product.name}
                      category={s.product.category}
                      className="history-card-media"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="history-card-name">{s.product.name}</p>
                      <p className="history-card-meta">
                        {format(s.date, 'MMM d · h:mm a')}
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
                    <span className={`history-score ${trust.bg} ${trust.color}`}>
                      {Math.round(s.displayScore)}
                    </span>
                  </Link>
                </li>
              )
            })}
            {!scans.length && (
              <p className="text-sm text-gray-500">
                No scans match these filters. Try a scan from Home.
              </p>
            )}
          </ol>
        </SectionCard>
      </Reveal>

      <Reveal delay={80}>
        <SectionCard index="Pinned" title="Saved products">
          {saved.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {saved.map((p) => (
                <Link
                  key={p.id}
                  to={`/ProductDetail?id=${p.id}`}
                  className="history-saved-chip"
                >
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    category={p.category}
                    className="h-7 w-7 shrink-0 rounded-full"
                    imgClassName="h-full w-full object-cover"
                  />
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Star a scan to pin it here.</p>
          )}
        </SectionCard>
      </Reveal>

      <Reveal delay={120}>
        <SectionCard index="Filter" title="Narrow the trail">
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
    </div>
  )
}
