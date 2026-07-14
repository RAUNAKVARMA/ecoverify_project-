/**
 * Shared catalog labels for server-side vision matching.
 * Keep in sync with frontend/src/lib/vision/labels.js conceptually.
 */

export const CATALOG = [
  { id: '1', name: 'Organic Milk Tetra Pack', brand: "Nature's Promise", category: 'Dairy', keywords: ['milk', 'carton', 'dairy', 'tetra'] },
  { id: '2', name: 'Bamboo Toothbrush Set', brand: 'EcoSmile', category: 'Personal Care', keywords: ['toothbrush', 'bamboo', 'brush'] },
  { id: '3', name: 'Green Tea Bottles', brand: 'PureBrew', category: 'Beverages', keywords: ['tea', 'green tea', 'bottle drink'] },
  { id: '4', name: 'Organic Cotton T-Shirt', brand: 'FairWear', category: 'Fashion', keywords: ['t-shirt', 'shirt', 'cotton', 'apparel'] },
  { id: '5', name: 'Almond Butter Jar', brand: 'NutriNuts', category: 'Food', keywords: ['almond', 'butter', 'nut butter'] },
  { id: '6', name: 'Reusable Water Bottle', brand: 'HydroEco', category: 'Accessories', keywords: ['water bottle', 'thermos', 'stainless', 'flask'] },
  { id: '7', name: 'Dish Soap Liquid', brand: 'CleanGreen', category: 'Household', keywords: ['dish soap', 'detergent', 'soap'] },
  { id: '8', name: 'Organic Honey', brand: 'BeeNatural', category: 'Food', keywords: ['honey', 'jar of honey'] },
  { id: '9', name: 'Eco Laundry Pods', brand: 'WashWise', category: 'Household', keywords: ['laundry', 'pods', 'washing'] },
  { id: '10', name: 'Coconut Oil (Cold Pressed)', brand: 'TropicPure', category: 'Food', keywords: ['coconut oil', 'coconut'] },
  { id: '11', name: 'Energy Drink', brand: 'PowerRush', category: 'Beverages', keywords: ['energy drink', 'soda can', 'beverage can'] },
  { id: '12', name: 'Recycled Paper Notebook', brand: 'WriteRight', category: 'Stationery', keywords: ['notebook', 'journal', 'paper'] },
]

export function matchCatalogFromText(text) {
  const t = String(text || '').toLowerCase()
  let best = null
  let bestScore = 0
  for (const item of CATALOG) {
    let score = 0
    for (const kw of item.keywords) {
      if (t.includes(kw)) score += kw.length
    }
    if (t.includes(item.name.toLowerCase())) score += 20
    if (t.includes(item.brand.toLowerCase())) score += 10
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return best
}
