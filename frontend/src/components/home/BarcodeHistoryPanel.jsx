import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, History } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { listBarcodeHistory, deleteBarcodeHistory } from '@/lib/barcodeHistory'
import { getTrustLabel } from '@/components/data/productData'

export default function BarcodeHistoryPanel() {
  const { user, signInWithGoogle } = useAuth()
  const [rows, setRows] = useState([])

  const refresh = () => {
    if (user) setRows(listBarcodeHistory(user.email, 20))
  }

  useEffect(() => {
    refresh()
  }, [user])

  if (!user) {
    return (
      <SectionCard icon={History} title="Barcode History" description="Save scans to your account" accentColor="border-sky-400">
        <p className="text-sm text-gray-600 mb-3">Sign in with Google to save barcode scan history across sessions.</p>
        <Button onClick={signInWithGoogle} className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50">
          <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" />
          Sign in with Google
        </Button>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      icon={History}
      title="Barcode History"
      description={`${user.name} · ${user.email}`}
      accentColor="border-sky-400"
    >
      <div className="flex items-center gap-3 mb-3 -ml-8 pl-8">
        <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No barcode scans yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const trust = getTrustLabel(row.trust_score || 0)
            return (
              <li key={row.id} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-gray-700 truncate">{row.barcode}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge variant="secondary">{row.barcode_format || 'Unknown'}</Badge>
                    <span className="truncate text-gray-800">{row.product_name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(row.created_date), { addSuffix: true })} · {row.validation_confidence}% conf.
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                  {row.trust_score}
                </span>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  onClick={() => {
                    deleteBarcodeHistory(row.id)
                    refresh()
                  }}
                  aria-label="Delete scan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
