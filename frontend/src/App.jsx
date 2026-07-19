import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import ProductDetail from '@/pages/ProductDetail'
import Alternatives from '@/pages/Alternatives'
import History from '@/pages/History'
import Profile from '@/pages/Profile'
import BrandDashboard from '@/pages/BrandDashboard'
import FAQ from '@/pages/FAQ'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import DataUsage from '@/pages/DataUsage'
import About from '@/pages/About'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/About" element={<About />} />
              <Route path="/ProductDetail" element={<ProductDetail />} />
              <Route path="/Alternatives" element={<Alternatives />} />
              <Route path="/History" element={<History />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/BrandDashboard" element={<BrandDashboard />} />
              <Route path="/FAQ" element={<FAQ />} />
              <Route path="/Privacy" element={<Privacy />} />
              <Route path="/Terms" element={<Terms />} />
              <Route path="/DataUsage" element={<DataUsage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
