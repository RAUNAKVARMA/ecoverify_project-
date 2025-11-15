import { Database } from 'lucide-react'
import { LegalShell } from '@/pages/Privacy'

const SECTIONS = [
  { title: '1. Product Scanning Data', body: 'Photos, barcodes, search queries, and matched product IDs may be processed to return Trust Scores and alternatives.' },
  { title: '2. Trust Score Calculations', body: 'Scores weight certifications (30), materials (25), reusability (20), supply chain (15), and packaging (10), with greenwashing penalties.' },
  { title: '3. Personalization', body: 'Sensitivity and priority concerns adjust explanations and score offsets (strict −10 / lenient +10).' },
  { title: '4. Aggregated Data', body: 'Community widgets and brand analytics use aggregated counts that do not identify individual consumers.' },
  { title: '5. Brand Analytics', body: 'Verified brands see scan volume, score trends, and common query themes for their catalog.' },
  { title: '6. Data Retention', body: 'Browser-local barcode history persists until deleted. Prototype sessions do not sync to a remote database.' },
  { title: '7. Third-Party Integrations', body: 'Optional LLM APIs (when configured via VITE_OPENAI_API_KEY) process scan inputs solely for classification and scoring.' },
  { title: '8. User Control', body: 'Delete scans, sign out, disable notifications, and clear preferences anytime from Profile / Home history.' },
  { title: '9. Research', body: 'De-identified patterns may inform sustainability research and model improvements.' },
  { title: '10. Contact', body: 'data@ecoverify.com · support@ecoverify.com' },
]

export default function DataUsage() {
  return (
    <LegalShell icon={Database} title="Data Usage Policy" gradient="from-purple-500 to-purple-600" updated="Last Updated: January 2025">
      {SECTIONS.map((s) => (
        <div key={s.title} className="mb-4">
          <h3 className="font-semibold text-gray-900">{s.title}</h3>
          <p className="mt-1 text-sm text-gray-700">{s.body}</p>
        </div>
      ))}
      <div className="mt-6 rounded-lg bg-purple-50 p-3 text-sm text-purple-900">
        <p className="font-semibold">Scoring methodology breakdown</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Certifications — max 30 pts</li>
          <li>Materials sustainability — max 25 pts</li>
          <li>Reusability & lifecycle — max 20 pts</li>
          <li>Supply chain transparency — max 15 pts</li>
          <li>Packaging — max 10 pts</li>
        </ul>
      </div>
    </LegalShell>
  )
}
