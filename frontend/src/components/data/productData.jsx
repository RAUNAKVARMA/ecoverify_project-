const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const products = [
  {
    id: '1',
    barcode: '8901234567890',
    name: 'Organic Milk Tetra Pack',
    brand: "Nature's Promise",
    category: 'Dairy',
    price: 85,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
    trust_score: 72,
    breakdown: {
      certifications: ['FSC (verified)', 'Carbon Neutral (pending)'],
      materials_analysis: '60% recycled, 40% virgin plastic',
      supply_chain_transparency: 'Limited (country origin only)',
      packaging_assessment: 'Fully recyclable',
      carbon_footprint: 'Medium - 2.1kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '2',
    barcode: '8901234567891',
    name: 'Bamboo Toothbrush Set',
    brand: 'EcoSmile',
    category: 'Personal Care',
    price: 249,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200',
    trust_score: 89,
    breakdown: {
      certifications: ['FSC (verified)', 'Plastic-Free (verified)'],
      materials_analysis: '100% bamboo handle, plant-based bristles',
      supply_chain_transparency: 'Full farm-to-shelf traceability',
      packaging_assessment: 'Compostable cardboard',
      carbon_footprint: 'Low - 0.4kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '3',
    barcode: '8901234567892',
    name: 'Green Tea Bottles',
    brand: 'PureBrew',
    category: 'Beverages',
    price: 120,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200',
    trust_score: 45,
    breakdown: {
      certifications: ['Organic (unverified claim)'],
      materials_analysis: 'Single-use PET plastic bottle',
      supply_chain_transparency: 'Opaque — no origin disclosed',
      packaging_assessment: 'Non-recyclable sleeve over PET',
      carbon_footprint: 'High - 3.8kg CO2e per unit',
    },
    greenwashing_risk: 'high',
  },
  {
    id: '4',
    barcode: '8901234567893',
    name: 'Organic Cotton T-Shirt',
    brand: 'FairWear',
    category: 'Fashion',
    price: 899,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    trust_score: 82,
    breakdown: {
      certifications: ['GOTS (verified)', 'Fair Trade (verified)'],
      materials_analysis: '100% organic cotton, low-impact dyes',
      supply_chain_transparency: 'Factory audited, public supplier list',
      packaging_assessment: 'Recycled paper mailer',
      carbon_footprint: 'Low - 1.2kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '5',
    barcode: '8901234567894',
    name: 'Almond Butter Jar',
    brand: 'NutriNuts',
    category: 'Food',
    price: 450,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200',
    trust_score: 68,
    breakdown: {
      certifications: ['Non-GMO (verified)', 'Organic (pending)'],
      materials_analysis: 'Glass jar with plastic lid',
      supply_chain_transparency: 'Partial — farm region disclosed',
      packaging_assessment: 'Glass recyclable; lid is mixed plastic',
      carbon_footprint: 'Medium - 2.5kg CO2e per unit',
    },
    greenwashing_risk: 'medium',
  },
  {
    id: '6',
    barcode: '8901234567895',
    name: 'Reusable Water Bottle',
    brand: 'HydroEco',
    category: 'Accessories',
    price: 699,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200',
    trust_score: 91,
    breakdown: {
      certifications: ['BPA-Free (verified)', 'Climate Neutral (verified)'],
      materials_analysis: 'Food-grade stainless steel, silicone seal',
      supply_chain_transparency: 'Full transparency report published',
      packaging_assessment: 'Minimal recycled cardboard',
      carbon_footprint: 'Very Low - 0.3kg CO2e per unit (lifetime amortized)',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '7',
    barcode: '8901234567896',
    name: 'Dish Soap Liquid',
    brand: 'CleanGreen',
    category: 'Household',
    price: 180,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200',
    trust_score: 35,
    breakdown: {
      certifications: ['Eco-Friendly (marketing only)'],
      materials_analysis: 'Petroleum-based surfactants, microplastics',
      supply_chain_transparency: 'None disclosed',
      packaging_assessment: 'Virgin plastic bottle, non-refillable',
      carbon_footprint: 'High - 4.2kg CO2e per unit',
    },
    greenwashing_risk: 'high',
  },
  {
    id: '8',
    barcode: '8901234567897',
    name: 'Organic Honey',
    brand: 'BeeNatural',
    category: 'Food',
    price: 320,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200',
    trust_score: 78,
    breakdown: {
      certifications: ['Organic (verified)', 'Raw Unfiltered (verified)'],
      materials_analysis: 'Glass jar, aluminum lid',
      supply_chain_transparency: 'Apiary location disclosed',
      packaging_assessment: 'Fully recyclable glass',
      carbon_footprint: 'Low - 0.9kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '9',
    barcode: '8901234567898',
    name: 'Eco Laundry Pods',
    brand: 'WashWise',
    category: 'Household',
    price: 399,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200',
    trust_score: 76,
    breakdown: {
      certifications: ['EPA Safer Choice (verified)', 'Plastic-Free (verified)'],
      materials_analysis: 'Plant-based enzymes, PVA film',
      supply_chain_transparency: 'Ingredient list fully published',
      packaging_assessment: 'Cardboard box, recyclable',
      carbon_footprint: 'Medium - 1.8kg CO2e per pack',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '10',
    barcode: '8901234567899',
    name: 'Coconut Oil (Cold Pressed)',
    brand: 'TropicPure',
    category: 'Food',
    price: 280,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
    trust_score: 84,
    breakdown: {
      certifications: ['Organic (verified)', 'Cold-Pressed (verified)'],
      materials_analysis: 'Glass jar, metal lid',
      supply_chain_transparency: 'Cooperative farms, fair wages',
      packaging_assessment: 'Recyclable glass',
      carbon_footprint: 'Low - 1.1kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
  {
    id: '11',
    barcode: '8901234567800',
    name: 'Energy Drink',
    brand: 'PowerRush',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80',
    trust_score: 28,
    breakdown: {
      certifications: ['Natural Energy (unverified)'],
      materials_analysis: 'Aluminum can with plastic liner',
      supply_chain_transparency: 'None',
      packaging_assessment: 'Single-use aluminum, plastic ring',
      carbon_footprint: 'Very High - 5.1kg CO2e per unit',
    },
    greenwashing_risk: 'high',
  },
  {
    id: '12',
    barcode: '8901234567801',
    name: 'Recycled Paper Notebook',
    brand: 'WriteRight',
    category: 'Stationery',
    price: 150,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    trust_score: 88,
    breakdown: {
      certifications: ['FSC Recycled (verified)', 'Cradle to Cradle (verified)'],
      materials_analysis: '100% post-consumer recycled paper',
      supply_chain_transparency: 'Mill and binder disclosed',
      packaging_assessment: 'No plastic wrap — soy ink label',
      carbon_footprint: 'Very Low - 0.2kg CO2e per unit',
    },
    greenwashing_risk: 'low',
  },
]

export const mockScanHistory = [
  { productId: '6', timestamp: hoursAgo(2), saved: true },
  { productId: '2', timestamp: hoursAgo(8), saved: false },
  { productId: '3', timestamp: hoursAgo(18), saved: true },
  { productId: '1', timestamp: hoursAgo(36), saved: false },
  { productId: '7', timestamp: hoursAgo(60), saved: false },
]

export const ecoTips = [
  'Choose products with verified third-party certifications over vague “eco” marketing claims.',
  'Prefer reusable and refillable packaging — it often cuts lifecycle emissions more than material swaps alone.',
  'Check supply-chain transparency: brands that name farms and factories are harder to greenwash.',
  'Compare Trust Scores within the same category — a 70 in fashion is not the same as a 70 in beverages.',
  'Look for plastic reduction and recyclability together; recyclable virgin plastic still has a high footprint.',
]

export function getProductById(id) {
  return products.find((p) => p.id === String(id)) || null
}

export function getProductByBarcode(barcode) {
  const clean = String(barcode).replace(/\s/g, '')
  return products.find((p) => p.barcode === clean) || null
}

export function searchProducts(query) {
  const q = String(query).toLowerCase().trim()
  if (!q) return []
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  )
}

export function getAlternatives(productId) {
  const product = getProductById(productId)
  if (!product) {
    return products.filter((p) => p.trust_score >= 70).sort((a, b) => b.trust_score - a.trust_score).slice(0, 6)
  }
  return products
    .filter((p) => p.id !== product.id && p.trust_score > product.trust_score)
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 5)
}

export function getProductsByCategory(category) {
  if (!category || category === 'All') return products
  return products.filter((p) => p.category.toLowerCase() === category.toLowerCase())
}

export function getTrustLabel(score) {
  if (score < 40) return { label: 'Low', color: 'text-red-600', bg: 'bg-red-100' }
  if (score < 70) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  return { label: 'High', color: 'text-green-600', bg: 'bg-green-100' }
}

export function getRandomEcoTip() {
  return ecoTips[Math.floor(Math.random() * ecoTips.length)]
}

export function getCategories() {
  return [...new Set(products.map((p) => p.category))]
}

export function matchProductFromAI(classification, ecoRating) {
  // Prefer explicit model pick when confidence is decent
  if (classification?.detected_product_id) {
    const direct = products.find((p) => p.id === String(classification.detected_product_id))
    if (direct && (classification.confidence ?? 0) >= 25) {
      return direct
    }
  }

  if (classification?.candidates?.length) {
    const top = classification.candidates[0]
    const byId = products.find((p) => p.id === String(top.product_id))
    if (byId && (top.confidence ?? 0) >= 25) return byId
  }

  let best = null
  let bestScore = -1

  for (const product of products) {
    let score = 0
    const name = (classification?.product_name || '').toLowerCase()
    const brand = (classification?.brand || '').toLowerCase()
    const category = (classification?.category || '').toLowerCase()
    const materials = (classification?.materials || classification?.primary_materials || '').toString().toLowerCase()
    const certs = (classification?.certifications || []).join(' ').toLowerCase()

    if (name && product.name.toLowerCase().includes(name.split(' ')[0])) score += 30
    if (name && product.name.toLowerCase().includes(name)) score += 20
    if (brand && product.brand.toLowerCase().includes(brand)) score += 25
    if (category && product.category.toLowerCase().includes(category)) score += 15
    if (materials && product.breakdown.materials_analysis.toLowerCase().includes(materials.split(',')[0]?.trim())) score += 10
    if (certs && product.breakdown.certifications.some((c) => certs.includes(c.split(' ')[0].toLowerCase()))) score += 10

    const aiScore = ecoRating?.trust_score
    if (typeof aiScore === 'number') {
      score += Math.max(0, 10 - Math.abs(aiScore - product.trust_score) / 5)
    }

    if (score > bestScore) {
      bestScore = score
      best = product
    }
  }

  return best || products[0]
}
