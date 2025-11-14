import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  { title: '1. Information We Collect', body: 'Account details, scan history, barcodes, uploaded product images, preference settings, and device/browser metadata needed to operate EcoVerify.' },
  { title: '2. How We Use Information', body: 'To generate Trust Scores, personalize EcoExplain text, save barcode history, improve product matching, and provide brand analytics in aggregate form.' },
  { title: '3. Data Sharing', body: 'We do not sell personal data. Aggregated, non-identifying insights may be shared with verified brands. Service providers process data only to run the app.' },
  { title: '4. Security', body: 'We use encrypted transport, access controls, and browser-local storage for prototype history. Production deployments add server-side safeguards.' },
  { title: '5. Your Rights', body: 'You may access, correct, export, or delete your scan history and preferences. Contact support@ecoverify.com for account requests.' },
  { title: '6. Cookies', body: 'We use essential cookies/local storage for session preferences. Analytics cookies, if enabled, can be controlled in your browser settings.' },
  { title: '7. Children’s Privacy', body: 'EcoVerify is not directed to children under 13. We do not knowingly collect personal information from children.' },
  { title: '8. International Transfers', body: 'If data is processed outside your country, we apply appropriate safeguards consistent with applicable privacy laws.' },
  { title: '9. Policy Changes', body: 'We may update this policy. Material changes will be noted with a revised “Last Updated” date on this page.' },
  { title: '10. Contact', body: 'Questions: privacy@ecoverify.com or support@ecoverify.com.' },
]

export default function Privacy() {
  return (
    <LegalShell icon={Shield} title="Privacy Policy" gradient="from-emerald-500 to-emerald-600" updated="Last Updated: January 2025">
      {SECTIONS.map((s) => (
        <div key={s.title} className="mb-4">
          <h3 className="font-semibold text-gray-900">{s.title}</h3>
          <p className="mt-1 text-sm text-gray-700">{s.body}</p>
        </div>
      ))}
    </LegalShell>
  )
}

export function LegalShell({ icon, title, gradient, updated, children }) {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={icon}
        title={title}
        description={updated}
        gradient={gradient}
        action={
          <Button asChild variant="outline" size="sm" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
            <Link to="/Profile">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />
      <SectionCard accentColor="border-emerald-500">
        <div className="prose prose-sm max-w-none -ml-0">{children}</div>
      </SectionCard>
    </div>
  )
}
