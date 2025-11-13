import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import { getRandomEcoTip } from '@/components/data/productData'

export default function DailyEcoTip() {
  const [tip] = useState(() => getRandomEcoTip())

  return (
    <SectionCard icon={Lightbulb} title="Daily Eco Tip" accentColor="border-amber-400" className="bg-amber-50/80">
      <p className="text-sm text-amber-900">{tip}</p>
    </SectionCard>
  )
}
