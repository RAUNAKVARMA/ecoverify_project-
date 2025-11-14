import { Home as HomeIcon } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import QuickScan from '@/components/home/QuickScan'
import BarcodeHistoryPanel from '@/components/home/BarcodeHistoryPanel'
import EcoImpactWidget from '@/components/home/EcoImpactWidget'
import TrendingProducts from '@/components/home/TrendingProducts'
import CategoryShortcuts from '@/components/home/CategoryShortcuts'
import RecentScans from '@/components/home/RecentScans'
import DailyEcoTip from '@/components/home/DailyEcoTip'

export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={HomeIcon}
        title="HOME / SCAN"
        badges={['Primary', 'Default Landing']}
        description="Scan a product to get an instant Trust Score and spot greenwashing."
        gradient="from-emerald-500 to-emerald-600"
      />
      <QuickScan />
      <BarcodeHistoryPanel />
      <EcoImpactWidget />
      <TrendingProducts />
      <CategoryShortcuts />
      <RecentScans />
      <DailyEcoTip />
    </div>
  )
}
