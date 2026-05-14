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
