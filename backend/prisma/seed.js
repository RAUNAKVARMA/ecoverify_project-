import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PRODUCTS = [
  {
    id: '1',
    barcode: '8901234567890',
    name: 'Organic Milk Tetra Pack',
    brand: "Nature's Promise",
    category: 'Dairy',
    price: 85,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
    trustScore: 72,
    greenwashingRisk: 'low',
    certifications: ['FSC (verified)', 'Carbon Neutral (pending)'],
    materialsAnalysis: '60% recycled, 40% virgin plastic',
    supplyChainTransparency: 'Limited (country origin only)',
    packagingAssessment: 'Fully recyclable',
    carbonFootprint: 'Medium - 2.1kg CO2e per unit',
  },
  {
    id: '2',
    barcode: '8901234567891',
    name: 'Bamboo Toothbrush Set',
    brand: 'EcoSmile',
    category: 'Personal Care',
    price: 249,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200',
    trustScore: 89,
    greenwashingRisk: 'low',
    certifications: ['FSC (verified)', 'Plastic-Free (verified)'],
    materialsAnalysis: '100% bamboo handle, plant-based bristles',
    supplyChainTransparency: 'Full farm-to-shelf traceability',
    packagingAssessment: 'Compostable cardboard',
    carbonFootprint: 'Low - 0.4kg CO2e per unit',
  },
  {
    id: '3',
    barcode: '8901234567892',
    name: 'Green Tea Bottles',
    brand: 'PureBrew',
    category: 'Beverages',
    price: 120,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200',
    trustScore: 45,
    greenwashingRisk: 'high',
    certifications: ['Organic (unverified claim)'],
    materialsAnalysis: 'Single-use PET plastic bottle',
    supplyChainTransparency: 'Opaque — no origin disclosed',
    packagingAssessment: 'Non-recyclable sleeve over PET',
    carbonFootprint: 'High - 3.8kg CO2e per unit',
  },
  {
    id: '4',
    barcode: '8901234567893',
    name: 'Organic Cotton T-Shirt',
    brand: 'FairWear',
    category: 'Fashion',
    price: 899,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    trustScore: 82,
    greenwashingRisk: 'low',
    certifications: ['GOTS (verified)', 'Fair Trade (verified)'],
    materialsAnalysis: '100% organic cotton, low-impact dyes',
    supplyChainTransparency: 'Factory audited, public supplier list',
    packagingAssessment: 'Recycled paper mailer',
    carbonFootprint: 'Low - 1.2kg CO2e per unit',
  },
  {
    id: '5',
    barcode: '8901234567894',
    name: 'Almond Butter Jar',
    brand: 'NutriNuts',
    category: 'Food',
    price: 450,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200',
    trustScore: 68,
    greenwashingRisk: 'medium',
    certifications: ['Non-GMO (verified)', 'Organic (pending)'],
    materialsAnalysis: 'Glass jar with plastic lid',
    supplyChainTransparency: 'Partial — farm region disclosed',
    packagingAssessment: 'Glass recyclable; lid is mixed plastic',
    carbonFootprint: 'Medium - 2.5kg CO2e per unit',
  },
  {
    id: '6',
    barcode: '8901234567895',
    name: 'Reusable Water Bottle',
    brand: 'HydroEco',
    category: 'Accessories',
    price: 699,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200',
    trustScore: 91,
    greenwashingRisk: 'low',
    certifications: ['BPA-Free (verified)', 'Climate Neutral (verified)'],
    materialsAnalysis: 'Food-grade stainless steel, silicone seal',
    supplyChainTransparency: 'Full transparency report published',
    packagingAssessment: 'Minimal recycled cardboard',
    carbonFootprint: 'Very Low - 0.3kg CO2e per unit (lifetime amortized)',
  },
  {
    id: '7',
    barcode: '8901234567896',
    name: 'Dish Soap Liquid',
    brand: 'CleanGreen',
    category: 'Household',
    price: 180,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200',
    trustScore: 35,
    greenwashingRisk: 'high',
    certifications: ['Eco-Friendly (marketing only)'],
    materialsAnalysis: 'Petroleum-based surfactants, microplastics',
    supplyChainTransparency: 'None disclosed',
    packagingAssessment: 'Virgin plastic bottle, non-refillable',
    carbonFootprint: 'High - 4.2kg CO2e per unit',
  },
  {
    id: '8',
    barcode: '8901234567897',
    name: 'Organic Honey',
    brand: 'BeeNatural',
    category: 'Food',
    price: 320,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200',
    trustScore: 78,
    greenwashingRisk: 'low',
    certifications: ['Organic (verified)', 'Raw Unfiltered (verified)'],
    materialsAnalysis: 'Glass jar, aluminum lid',
    supplyChainTransparency: 'Apiary location disclosed',
    packagingAssessment: 'Fully recyclable glass',
    carbonFootprint: 'Low - 0.9kg CO2e per unit',
  },
  {
    id: '9',
    barcode: '8901234567898',
    name: 'Eco Laundry Pods',
    brand: 'WashWise',
    category: 'Household',
    price: 399,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200',
    trustScore: 76,
    greenwashingRisk: 'low',
    certifications: ['EPA Safer Choice (verified)', 'Plastic-Free (verified)'],
    materialsAnalysis: 'Plant-based enzymes, PVA film',
    supplyChainTransparency: 'Ingredient list fully published',
    packagingAssessment: 'Cardboard box, recyclable',
    carbonFootprint: 'Medium - 1.8kg CO2e per pack',
  },
  {
    id: '10',
    barcode: '8901234567899',
    name: 'Coconut Oil (Cold Pressed)',
    brand: 'TropicPure',
    category: 'Food',
    price: 280,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
    trustScore: 84,
    greenwashingRisk: 'low',
    certifications: ['Organic (verified)', 'Cold-Pressed (verified)'],
    materialsAnalysis: 'Glass jar, metal lid',
    supplyChainTransparency: 'Cooperative farms, fair wages',
    packagingAssessment: 'Recyclable glass',
    carbonFootprint: 'Low - 1.1kg CO2e per unit',
  },
  {
    id: '11',
    barcode: '8901234567800',
    name: 'Energy Drink',
    brand: 'PowerRush',
    category: 'Beverages',
    price: 99,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80',
    trustScore: 28,
    greenwashingRisk: 'high',
    certifications: ['Natural Energy (unverified)'],
    materialsAnalysis: 'Aluminum can with plastic liner',
    supplyChainTransparency: 'None',
    packagingAssessment: 'Single-use aluminum, plastic ring',
    carbonFootprint: 'Very High - 5.1kg CO2e per unit',
  },
  {
    id: '12',
    barcode: '8901234567801',
    name: 'Recycled Paper Notebook',
    brand: 'WriteRight',
    category: 'Stationery',
    price: 150,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    trustScore: 88,
    greenwashingRisk: 'low',
    certifications: ['FSC Recycled (verified)', 'Cradle to Cradle (verified)'],
    materialsAnalysis: '100% post-consumer recycled paper',
    supplyChainTransparency: 'Mill and binder disclosed',
    packagingAssessment: 'No plastic wrap — soy ink label',
    carbonFootprint: 'Very Low - 0.2kg CO2e per unit',
  },
]

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: p,
      update: p,
    })
  }

  await prisma.aiProviderStatus.upsert({
    where: { id: 'default' },
    create: { id: 'default', active: process.env.AI_PROVIDER || 'auto' },
    update: { active: process.env.AI_PROVIDER || 'auto' },
  })

  const scanCount = await prisma.scan.count()
  if (scanCount === 0) {
    const seedScans = [
      { productId: '6', source: 'manual', trustScore: 91, saved: true, hoursAgo: 2 },
      { productId: '2', source: 'manual', trustScore: 89, saved: false, hoursAgo: 8 },
      { productId: '3', source: 'manual', trustScore: 45, saved: true, hoursAgo: 18 },
      { productId: '1', source: 'manual', trustScore: 72, saved: false, hoursAgo: 36 },
      { productId: '7', source: 'manual', trustScore: 35, saved: false, hoursAgo: 60 },
    ]
    for (const s of seedScans) {
      await prisma.scan.create({
        data: {
          productId: s.productId,
          source: s.source,
          trustScore: s.trustScore,
          saved: s.saved,
          createdAt: new Date(Date.now() - s.hoursAgo * 60 * 60 * 1000),
        },
      })
    }
  }

  console.log(`Seeded ${PRODUCTS.length} products`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
