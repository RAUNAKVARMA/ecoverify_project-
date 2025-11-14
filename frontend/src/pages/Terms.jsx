import { FileText } from 'lucide-react'
import { LegalShell } from '@/pages/Privacy'

const SECTIONS = [
  { title: '1. Acceptance', body: 'By using EcoVerify you agree to these Terms of Service. If you disagree, do not use the app.' },
  { title: '2. Use of Service', body: 'You may scan products, view Trust Scores, explore alternatives, and manage preferences for personal, non-abusive use.' },
  { title: '3. Trust Scores Accuracy', body: 'Trust Scores are informational estimates. They are not legal, scientific, or regulatory certifications and may be incomplete.' },
  { title: '4. User Content', body: 'Uploaded images and reports must be lawful. You grant EcoVerify a license to process them for scoring and matching.' },
  { title: '5. Brand Dashboard', body: 'Brand accounts require accurate business details. Pending accounts have limited access until verification completes.' },
  { title: '6. Intellectual Property', body: 'EcoVerify branding, UI, and scoring methodology are owned by EcoVerify or its licensors.' },
  { title: '7. Limitation of Liability', body: 'To the fullest extent permitted by law, EcoVerify is not liable for purchase decisions made using Trust Scores.' },
  { title: '8. Changes to Terms', body: 'We may update these terms. Continued use after changes constitutes acceptance.' },
  { title: '9. Contact', body: 'legal@ecoverify.com · support@ecoverify.com' },
]

export default function Terms() {
  return (
    <LegalShell icon={FileText} title="Terms of Service" gradient="from-blue-500 to-blue-600" updated="Last Updated: January 2025">
      {SECTIONS.map((s) => (
        <div key={s.title} className="mb-4">
          <h3 className="font-semibold text-gray-900">{s.title}</h3>
          <p className="mt-1 text-sm text-gray-700">{s.body}</p>
        </div>
      ))}
    </LegalShell>
  )
}
