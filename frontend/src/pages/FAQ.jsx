import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Video, BookOpen, MessageCircle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import { Button } from '@/components/ui/button'

const FAQ_DATA = [
  {
    title: 'Getting Started',
    items: [
      { q: 'How do I scan a product?', a: 'On Home, upload a photo, enter a barcode, or search by name. Photo scans run a dual-model AI pipeline.' },
      { q: 'What is a Trust Score?', a: 'A 0–100 score estimating how genuinely eco-friendly a product is across certifications, materials, lifecycle, supply chain, and packaging.' },
      { q: 'Are scores accurate?', a: 'Scores combine verified claim data with AI analysis. Sensitivity settings let you apply stricter or more lenient weighting.' },
    ],
  },
  {
    title: 'Understanding Scores',
    items: [
      { q: 'What makes a high or low score?', a: 'Verified certifications, sustainable materials, transparency, and recyclable packaging raise scores. Vague claims and virgin plastics lower them.' },
      { q: 'What is greenwashing?', a: 'Marketing that exaggerates environmental benefits without verifiable evidence. EcoVerify flags high/medium/low risk.' },
      { q: 'How often are scores updated?', a: 'Prototype data is static mock data. In production, scores refresh as certifications and supply-chain data change.' },
    ],
  },
  {
    title: 'Using Features',
    items: [
      { q: 'How do I find alternatives?', a: 'Open Alternatives from a product detail page or category shortcuts. Filters let you refine by price and category.' },
      { q: 'How do I save products?', a: 'Saved items appear in History. Sign in to persist barcode scans.' },
      { q: 'Can I export history?', a: 'Yes — use Export Scan History (CSV) on the History page.' },
      { q: 'What are priority concerns?', a: 'Preferences like Plastic Reduction or Climate that tailor EcoExplain text on product pages.' },
    ],
  },
  {
    title: 'Certifications & Data',
    items: [
      { q: 'Which certifications are recognized?', a: 'FSC, GOTS, Fair Trade, EPA Safer Choice, Organic, Climate Neutral, and more when verified.' },
      { q: 'Where does data come from?', a: 'This build uses curated mock products plus optional LLM vision/rating when an API key is configured.' },
      { q: 'How do I report incorrect info?', a: 'Use Report Incorrect Data on the Product Detail page.' },
    ],
  },
  {
    title: 'Privacy & Account',
    items: [
      { q: 'Is my history private?', a: 'Barcode history is stored locally in your browser under your signed-in email.' },
      { q: 'Can I delete my data?', a: 'Delete individual barcode scans from Home, or clear site data in your browser.' },
      { q: 'What is Offline Mode?', a: 'A preference flag for limiting network features; mock data still works fully offline.' },
    ],
  },
  {
    title: 'For Brands',
    items: [
      { q: 'How do I join?', a: 'Register on the Brand Dashboard with company details. Verification takes 2–3 business days.' },
      { q: 'How can I improve my trust score?', a: 'Submit verified certifications, improve packaging, and respond to user reports.' },
      { q: 'Can brands see who scanned?', a: 'No personally identifiable consumer scan lists are shared — only aggregated analytics.' },
    ],
  },
]

export default function FAQ() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={HelpCircle}
        title="FAQs & Tutorials"
        badges={['Help']}
        description="Answers to common EcoVerify questions."
        gradient="from-indigo-500 to-indigo-600"
        action={
          <Button asChild variant="outline" size="sm" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
            <Link to="/Profile">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SectionCard icon={Video} title="Video Tutorials" accentColor="border-red-400">
          <Button variant="destructive" onClick={() => alert('Opening tutorials (demo)')}>Watch Tutorials</Button>
        </SectionCard>
        <SectionCard icon={BookOpen} title="User Guide" accentColor="border-blue-400">
          <Button variant="secondary" onClick={() => alert('PDF download (demo)')}>Download PDF Guide</Button>
        </SectionCard>
        <SectionCard icon={MessageCircle} title="Contact Support" accentColor="border-emerald-500">
          <Button onClick={() => alert('support@ecoverify.com')}>Get Help</Button>
        </SectionCard>
      </div>

      {FAQ_DATA.map((cat) => (
        <SectionCard key={cat.title} title={cat.title} accentColor="border-indigo-400">
          <div className="space-y-2">
            {cat.items.map((item) => (
              <Accordion key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </SectionCard>
      ))}

      <SectionCard title="Still Need Help?" accentColor="border-gray-300">
        <Button onClick={() => alert('Chat support (demo)')}>Chat with Support</Button>
        <p className="mt-2 text-sm text-gray-600">Email: support@ecoverify.com</p>
      </SectionCard>
    </div>
  )
}

function Accordion({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-gray-100">
      <button type="button" className="flex w-full items-center justify-between gap-2 p-3 text-left" onClick={() => setOpen((v) => !v)}>
        <span className="text-sm font-medium text-gray-900">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <p className="px-3 pb-3 text-sm text-gray-600">{answer}</p>}
    </div>
  )
}
